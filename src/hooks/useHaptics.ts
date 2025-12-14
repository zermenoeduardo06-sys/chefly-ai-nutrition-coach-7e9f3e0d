import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform();

/**
 * Hook for haptic feedback on native platforms
 */
export const useHaptics = () => {
  /**
   * Light impact - for button taps, selections
   */
  const lightImpact = async () => {
    if (!isNative) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (error) {
      console.log('Haptics not available');
    }
  };

  /**
   * Medium impact - for completing actions
   */
  const mediumImpact = async () => {
    if (!isNative) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (error) {
      console.log('Haptics not available');
    }
  };

  /**
   * Heavy impact - for important actions, achievements
   */
  const heavyImpact = async () => {
    if (!isNative) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch (error) {
      console.log('Haptics not available');
    }
  };

  /**
   * Success notification - for meal completed, points earned
   */
  const successNotification = async () => {
    if (!isNative) return;
    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch (error) {
      console.log('Haptics not available');
    }
  };

  /**
   * Warning notification - for streak at risk
   */
  const warningNotification = async () => {
    if (!isNative) return;
    try {
      await Haptics.notification({ type: NotificationType.Warning });
    } catch (error) {
      console.log('Haptics not available');
    }
  };

  /**
   * Error notification - for errors
   */
  const errorNotification = async () => {
    if (!isNative) return;
    try {
      await Haptics.notification({ type: NotificationType.Error });
    } catch (error) {
      console.log('Haptics not available');
    }
  };

  /**
   * Selection changed - for swipe gestures, day changes
   */
  const selectionChanged = async () => {
    if (!isNative) return;
    try {
      await Haptics.selectionChanged();
    } catch (error) {
      console.log('Haptics not available');
    }
  };

  /**
   * Celebration pattern - for achievements, level ups
   */
  const celebrationPattern = async () => {
    if (!isNative) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
      await new Promise(resolve => setTimeout(resolve, 100));
      await Haptics.impact({ style: ImpactStyle.Medium });
      await new Promise(resolve => setTimeout(resolve, 100));
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (error) {
      console.log('Haptics not available');
    }
  };

  return {
    lightImpact,
    mediumImpact,
    heavyImpact,
    successNotification,
    warningNotification,
    errorNotification,
    selectionChanged,
    celebrationPattern,
    isNative,
  };
};
