import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

const PROMO_LAST_SHOWN_KEY = 'promo_banner_last_shown';
const PROMO_DISMISS_COUNT_KEY = 'promo_banner_dismiss_count';
const PROMO_PAUSE_UNTIL_KEY = 'promo_banner_pause_until';

// Configuration
const MIN_HOURS_BETWEEN_PROMOS = 24;
const MAX_DISMISSES_BEFORE_PAUSE = 5;
const PAUSE_DAYS_AFTER_MAX_DISMISSES = 7;

interface UseSubscriptionPromoOptions {
  isCheflyPlus: boolean;
  isLoading?: boolean;
}

export const useSubscriptionPromo = ({ isCheflyPlus, isLoading = false }: UseSubscriptionPromoOptions) => {
  const [shouldShowBanner, setShouldShowBanner] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const getLastShownDate = (): Date | null => {
    const stored = localStorage.getItem(PROMO_LAST_SHOWN_KEY);
    return stored ? new Date(stored) : null;
  };

  const getDismissCount = (): number => {
    const count = localStorage.getItem(PROMO_DISMISS_COUNT_KEY);
    return count ? parseInt(count) : 0;
  };

  const getPauseUntilDate = (): Date | null => {
    const stored = localStorage.getItem(PROMO_PAUSE_UNTIL_KEY);
    return stored ? new Date(stored) : null;
  };

  const getHoursSinceLastShown = (): number => {
    const lastShown = getLastShownDate();
    if (!lastShown) return Infinity;
    
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastShown.getTime());
    return diffTime / (1000 * 60 * 60);
  };

  const isPaused = (): boolean => {
    const pauseUntil = getPauseUntilDate();
    if (!pauseUntil) return false;
    return new Date() < pauseUntil;
  };

  const canShowBanner = (): boolean => {
    // Only show on native platforms
    if (!Capacitor.isNativePlatform()) {
      return false;
    }

    // Don't show to subscribers
    if (isCheflyPlus) {
      return false;
    }

    // Check if paused due to too many dismisses
    if (isPaused()) {
      console.log('[SubscriptionPromo] Banner paused due to dismisses');
      return false;
    }

    // Check minimum time between promos
    const hoursSince = getHoursSinceLastShown();
    if (hoursSince < MIN_HOURS_BETWEEN_PROMOS) {
      console.log(`[SubscriptionPromo] Only ${hoursSince.toFixed(1)}h since last shown, need ${MIN_HOURS_BETWEEN_PROMOS}h`);
      return false;
    }

    return true;
  };

  const markAsShown = () => {
    localStorage.setItem(PROMO_LAST_SHOWN_KEY, new Date().toISOString());
  };

  const dismissBanner = () => {
    setIsVisible(false);
    setShouldShowBanner(false);
    
    // Increment dismiss count
    const currentCount = getDismissCount();
    const newCount = currentCount + 1;
    localStorage.setItem(PROMO_DISMISS_COUNT_KEY, newCount.toString());
    
    // If max dismisses reached, set pause
    if (newCount >= MAX_DISMISSES_BEFORE_PAUSE) {
      const pauseUntil = new Date();
      pauseUntil.setDate(pauseUntil.getDate() + PAUSE_DAYS_AFTER_MAX_DISMISSES);
      localStorage.setItem(PROMO_PAUSE_UNTIL_KEY, pauseUntil.toISOString());
      localStorage.setItem(PROMO_DISMISS_COUNT_KEY, '0'); // Reset count after pause
      console.log(`[SubscriptionPromo] Max dismisses reached, pausing until ${pauseUntil.toISOString()}`);
    }
  };

  // Check on mount and when subscription status changes
  useEffect(() => {
    if (isLoading) return;

    // Small delay to not show immediately on page load
    const timer = setTimeout(() => {
      const canShow = canShowBanner();
      setShouldShowBanner(canShow);
      
      if (canShow) {
        markAsShown();
        // Animate in after a brief moment
        setTimeout(() => setIsVisible(true), 100);
      }
    }, 3000); // Show 3 seconds after dashboard loads

    return () => clearTimeout(timer);
  }, [isCheflyPlus, isLoading]);

  return {
    shouldShowBanner,
    isVisible,
    dismissBanner,
    getHoursSinceLastShown,
    getDismissCount,
  };
};
