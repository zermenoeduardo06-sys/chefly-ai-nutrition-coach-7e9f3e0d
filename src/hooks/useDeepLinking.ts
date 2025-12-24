import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LocalNotifications, LocalNotificationSchema } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export interface DeepLinkData {
  type: 'meal' | 'challenge' | 'achievement' | 'streak';
  mealType?: 'breakfast' | 'lunch' | 'dinner';
  mealId?: string;
  dayOfWeek?: number;
}

// Store for pending deep links to be processed after component mount
let pendingDeepLink: DeepLinkData | null = null;

export const setPendingDeepLink = (data: DeepLinkData) => {
  pendingDeepLink = data;
};

export const getPendingDeepLink = (): DeepLinkData | null => {
  const link = pendingDeepLink;
  pendingDeepLink = null;
  return link;
};

export const useDeepLinking = (onMealOpen?: (mealType: string, dayOfWeek: number) => void) => {
  const navigate = useNavigate();

  const handleDeepLink = useCallback((data: DeepLinkData) => {
    console.log('Handling deep link:', data);

    switch (data.type) {
      case 'meal':
        // Navigate to dashboard and open specific meal
        if (data.mealType !== undefined && data.dayOfWeek !== undefined) {
          navigate(`/dashboard?openMeal=${data.mealType}&day=${data.dayOfWeek}`);
          if (onMealOpen) {
            onMealOpen(data.mealType, data.dayOfWeek);
          }
        } else {
          navigate('/dashboard');
        }
        break;
      case 'challenge':
        navigate('/dashboard/challenges');
        break;
      case 'achievement':
        navigate('/dashboard/achievements');
        break;
      case 'streak':
        navigate('/dashboard');
        break;
      default:
        navigate('/dashboard');
    }
  }, [navigate, onMealOpen]);

  // Setup notification click listener
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const setupNotificationListener = async () => {
      try {
        // Listen for notification actions (when user taps notification)
        await LocalNotifications.addListener(
          'localNotificationActionPerformed',
          (notification) => {
            console.log('Notification action performed:', notification);
            
            const data = notification.notification.extra as DeepLinkData | undefined;
            if (data) {
              handleDeepLink(data);
            } else {
              // Fallback based on notification ID
              const notificationId = notification.notification.id;
              let mealType: 'breakfast' | 'lunch' | 'dinner' = 'breakfast';
              
              switch (notificationId) {
                case 1:
                  mealType = 'breakfast';
                  break;
                case 2:
                  mealType = 'lunch';
                  break;
                case 3:
                  mealType = 'dinner';
                  break;
                case 4:
                  // Streak risk - just go to dashboard
                  navigate('/dashboard');
                  return;
              }
              
              // Get current day of week (0 = Sunday, but our system uses 0 = first day of meal plan)
              const today = new Date().getDay();
              // Convert to our day system (0 = Saturday start of week plan)
              const dayOfWeek = today === 0 ? 6 : today - 1;
              
              handleDeepLink({
                type: 'meal',
                mealType,
                dayOfWeek,
              });
            }
          }
        );

        console.log('Deep linking notification listener setup complete');
      } catch (error) {
        console.error('Error setting up notification listener:', error);
      }
    };

    setupNotificationListener();

    return () => {
      LocalNotifications.removeAllListeners();
    };
  }, [handleDeepLink, navigate]);

  // Check for pending deep links on mount
  useEffect(() => {
    const pending = getPendingDeepLink();
    if (pending) {
      handleDeepLink(pending);
    }
  }, [handleDeepLink]);

  return {
    handleDeepLink,
  };
};
