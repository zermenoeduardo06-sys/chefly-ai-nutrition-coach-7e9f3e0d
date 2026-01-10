import { Capacitor } from '@capacitor/core';

const REVIEW_PROMPTED_KEY = 'app_review_prompted';

export const useAppReview = () => {
  const hasBeenPrompted = (): boolean => {
    return localStorage.getItem(REVIEW_PROMPTED_KEY) === 'true';
  };

  const markAsPrompted = () => {
    localStorage.setItem(REVIEW_PROMPTED_KEY, 'true');
  };

  const requestReviewAfterDelay = async (delayMs: number = 4000) => {
    // Only run on native iOS
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') {
      console.log('App review only available on iOS native');
      return;
    }

    // Check if already prompted
    if (hasBeenPrompted()) {
      console.log('App review already prompted');
      return;
    }

    // Wait for delay
    await new Promise(resolve => setTimeout(resolve, delayMs));

    try {
      // Dynamically import to avoid issues on web
      const { InAppReview } = await import('@capacitor-community/in-app-review');
      
      await InAppReview.requestReview();
      markAsPrompted();
      console.log('App review prompt shown');
    } catch (error) {
      console.error('Failed to show app review prompt:', error);
    }
  };

  return {
    requestReviewAfterDelay,
    hasBeenPrompted,
  };
};
