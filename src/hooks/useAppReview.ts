import { Capacitor } from '@capacitor/core';

const REVIEW_LAST_PROMPTED_KEY = 'app_review_last_prompted';
const REVIEW_PROMPT_COUNT_KEY = 'app_review_prompt_count';
const REVIEW_YEAR_KEY = 'app_review_year';

// Apple guidelines: minimum 45 days between prompts, max 3 per year
const MIN_DAYS_BETWEEN_REVIEWS = 45;
const MAX_REVIEW_PROMPTS_PER_YEAR = 3;

// Minimum user engagement before asking for review
const MIN_MEALS_COMPLETED = 5;
const MIN_STREAK_DAYS = 3;

export const useAppReview = () => {
  const getLastPromptedDate = (): Date | null => {
    const stored = localStorage.getItem(REVIEW_LAST_PROMPTED_KEY);
    return stored ? new Date(stored) : null;
  };

  const getPromptCount = (): number => {
    const currentYear = new Date().getFullYear();
    const storedYear = localStorage.getItem(REVIEW_YEAR_KEY);
    
    // Reset count if it's a new year
    if (storedYear && parseInt(storedYear) !== currentYear) {
      localStorage.setItem(REVIEW_PROMPT_COUNT_KEY, '0');
      localStorage.setItem(REVIEW_YEAR_KEY, currentYear.toString());
      return 0;
    }
    
    const count = localStorage.getItem(REVIEW_PROMPT_COUNT_KEY);
    return count ? parseInt(count) : 0;
  };

  const markAsPrompted = () => {
    const currentYear = new Date().getFullYear();
    localStorage.setItem(REVIEW_LAST_PROMPTED_KEY, new Date().toISOString());
    localStorage.setItem(REVIEW_YEAR_KEY, currentYear.toString());
    
    const currentCount = getPromptCount();
    localStorage.setItem(REVIEW_PROMPT_COUNT_KEY, (currentCount + 1).toString());
  };

  const getDaysSinceLastPrompt = (): number => {
    const lastPrompted = getLastPromptedDate();
    if (!lastPrompted) return Infinity;
    
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastPrompted.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const canRequestReview = (): boolean => {
    // Only run on native iOS
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') {
      return false;
    }

    // Check if we've exceeded yearly limit
    if (getPromptCount() >= MAX_REVIEW_PROMPTS_PER_YEAR) {
      console.log('[AppReview] Max yearly prompts reached');
      return false;
    }

    // Check minimum days between prompts
    const daysSince = getDaysSinceLastPrompt();
    if (daysSince < MIN_DAYS_BETWEEN_REVIEWS) {
      console.log(`[AppReview] Only ${daysSince} days since last prompt, need ${MIN_DAYS_BETWEEN_REVIEWS}`);
      return false;
    }

    return true;
  };

  const checkAndRequestReview = async (stats: { meals_completed: number; current_streak: number }) => {
    // Check user engagement thresholds
    if (stats.meals_completed < MIN_MEALS_COMPLETED) {
      console.log(`[AppReview] Not enough meals: ${stats.meals_completed}/${MIN_MEALS_COMPLETED}`);
      return;
    }

    if (stats.current_streak < MIN_STREAK_DAYS) {
      console.log(`[AppReview] Not enough streak: ${stats.current_streak}/${MIN_STREAK_DAYS}`);
      return;
    }

    // Check timing constraints
    if (!canRequestReview()) {
      return;
    }

    try {
      // Dynamically import to avoid issues on web
      const { InAppReview } = await import('@capacitor-community/in-app-review');
      
      // Small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await InAppReview.requestReview();
      markAsPrompted();
      console.log('[AppReview] Review prompt shown successfully');
    } catch (error) {
      console.error('[AppReview] Failed to show review prompt:', error);
    }
  };

  // Legacy function for one-time prompts (e.g., after purchase)
  const requestReviewAfterDelay = async (delayMs: number = 4000) => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') {
      console.log('App review only available on iOS native');
      return;
    }

    await new Promise(resolve => setTimeout(resolve, delayMs));

    try {
      const { InAppReview } = await import('@capacitor-community/in-app-review');
      await InAppReview.requestReview();
      markAsPrompted();
      console.log('App review prompt shown');
    } catch (error) {
      console.error('Failed to show app review prompt:', error);
    }
  };

  return {
    checkAndRequestReview,
    requestReviewAfterDelay,
    canRequestReview,
    getDaysSinceLastPrompt,
    getPromptCount,
  };
};
