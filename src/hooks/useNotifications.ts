import { useState, useEffect, useCallback } from 'react';
import { LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';

interface NotificationSettings {
  mealReminders: boolean;
  streakAlerts: boolean;
  breakfastTime: string; // "08:00"
  lunchTime: string; // "13:00"
  dinnerTime: string; // "19:00"
}

const DEFAULT_SETTINGS: NotificationSettings = {
  mealReminders: true,
  streakAlerts: true,
  breakfastTime: "08:00",
  lunchTime: "13:00",
  dinnerTime: "19:00",
};

const NOTIFICATION_IDS = {
  BREAKFAST: 1,
  LUNCH: 2,
  DINNER: 3,
  STREAK_RISK: 4,
};

export const useNotifications = () => {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    const native = Capacitor.isNativePlatform();
    setIsNative(native);
    
    if (native) {
      checkPermissions();
      loadSettings();
    }
  }, []);

  const loadSettings = () => {
    const saved = localStorage.getItem('notification_settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  };

  const saveSettings = (newSettings: NotificationSettings) => {
    setSettings(newSettings);
    localStorage.setItem('notification_settings', JSON.stringify(newSettings));
  };

  const checkPermissions = async () => {
    try {
      const result = await LocalNotifications.checkPermissions();
      setPermissionGranted(result.display === 'granted');
    } catch (error) {
      console.log('Notifications not supported:', error);
    }
  };

  const requestPermissions = async (): Promise<boolean> => {
    if (!isNative) return false;
    
    try {
      const result = await LocalNotifications.requestPermissions();
      const granted = result.display === 'granted';
      setPermissionGranted(granted);
      return granted;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  };

  const scheduleNotificationAtTime = async (
    id: number,
    title: string,
    body: string,
    hour: number,
    minute: number
  ) => {
    const now = new Date();
    const scheduledDate = new Date();
    scheduledDate.setHours(hour, minute, 0, 0);
    
    // If time has passed today, schedule for tomorrow
    if (scheduledDate <= now) {
      scheduledDate.setDate(scheduledDate.getDate() + 1);
    }

    await LocalNotifications.schedule({
      notifications: [
        {
          id,
          title,
          body,
          schedule: {
            at: scheduledDate,
            repeats: true,
            every: 'day',
          },
          sound: 'default',
          smallIcon: 'ic_stat_icon_config_sample',
          iconColor: '#F97316',
        },
      ],
    });
  };

  const scheduleMealReminders = async (language: 'es' | 'en' = 'es') => {
    if (!isNative || !permissionGranted || !settings.mealReminders) return;

    try {
      // Cancel existing meal reminders first
      await LocalNotifications.cancel({
        notifications: [
          { id: NOTIFICATION_IDS.BREAKFAST },
          { id: NOTIFICATION_IDS.LUNCH },
          { id: NOTIFICATION_IDS.DINNER },
        ],
      });

      const messages = {
        es: {
          breakfast: { title: '🍳 ¡Hora del desayuno!', body: 'Tu desayuno saludable te espera. ¡Comienza el día con energía!' },
          lunch: { title: '🥗 ¡Hora del almuerzo!', body: 'Es momento de tu almuerzo nutritivo. ¡Mantén tu racha!' },
          dinner: { title: '🍽️ ¡Hora de cenar!', body: 'Tu cena está lista en el menú. ¡No olvides completarla!' },
        },
        en: {
          breakfast: { title: '🍳 Breakfast time!', body: 'Your healthy breakfast awaits. Start the day with energy!' },
          lunch: { title: '🥗 Lunch time!', body: 'Time for your nutritious lunch. Keep your streak!' },
          dinner: { title: '🍽️ Dinner time!', body: 'Your dinner is ready in the menu. Don\'t forget to complete it!' },
        },
      };

      const [breakfastHour, breakfastMin] = settings.breakfastTime.split(':').map(Number);
      const [lunchHour, lunchMin] = settings.lunchTime.split(':').map(Number);
      const [dinnerHour, dinnerMin] = settings.dinnerTime.split(':').map(Number);

      await scheduleNotificationAtTime(
        NOTIFICATION_IDS.BREAKFAST,
        messages[language].breakfast.title,
        messages[language].breakfast.body,
        breakfastHour,
        breakfastMin
      );

      await scheduleNotificationAtTime(
        NOTIFICATION_IDS.LUNCH,
        messages[language].lunch.title,
        messages[language].lunch.body,
        lunchHour,
        lunchMin
      );

      await scheduleNotificationAtTime(
        NOTIFICATION_IDS.DINNER,
        messages[language].dinner.title,
        messages[language].dinner.body,
        dinnerHour,
        dinnerMin
      );

      console.log('Meal reminders scheduled successfully');
    } catch (error) {
      console.error('Error scheduling meal reminders:', error);
    }
  };

  const scheduleStreakRiskAlert = async (
    currentStreak: number,
    lastActivityDate: string | null,
    language: 'es' | 'en' = 'es'
  ) => {
    if (!isNative || !permissionGranted || !settings.streakAlerts || currentStreak < 2) return;

    try {
      await LocalNotifications.cancel({
        notifications: [{ id: NOTIFICATION_IDS.STREAK_RISK }],
      });

      if (!lastActivityDate) return;

      const lastActivity = new Date(lastActivityDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      lastActivity.setHours(0, 0, 0, 0);
      
      const diffDays = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
      
      // Only schedule if user hasn't completed any meal today
      if (diffDays >= 1) {
        const messages = {
          es: {
            title: `🔥 ¡Tu racha de ${currentStreak} días está en riesgo!`,
            body: 'Completa al menos una comida hoy para mantener tu progreso. ¡No la pierdas!',
          },
          en: {
            title: `🔥 Your ${currentStreak}-day streak is at risk!`,
            body: 'Complete at least one meal today to keep your progress. Don\'t lose it!',
          },
        };

        // Schedule for 6 PM if not completed
        const alertTime = new Date();
        alertTime.setHours(18, 0, 0, 0);
        
        if (alertTime > new Date()) {
          await LocalNotifications.schedule({
            notifications: [
              {
                id: NOTIFICATION_IDS.STREAK_RISK,
                title: messages[language].title,
                body: messages[language].body,
                schedule: { at: alertTime },
                sound: 'default',
                smallIcon: 'ic_stat_icon_config_sample',
                iconColor: '#EF4444',
              },
            ],
          });
          console.log('Streak risk alert scheduled');
        }
      }
    } catch (error) {
      console.error('Error scheduling streak alert:', error);
    }
  };

  const cancelAllNotifications = async () => {
    if (!isNative) return;
    
    try {
      await LocalNotifications.cancel({
        notifications: [
          { id: NOTIFICATION_IDS.BREAKFAST },
          { id: NOTIFICATION_IDS.LUNCH },
          { id: NOTIFICATION_IDS.DINNER },
          { id: NOTIFICATION_IDS.STREAK_RISK },
        ],
      });
    } catch (error) {
      console.error('Error canceling notifications:', error);
    }
  };

  const updateSettings = async (newSettings: Partial<NotificationSettings>, language: 'es' | 'en' = 'es') => {
    const updated = { ...settings, ...newSettings };
    saveSettings(updated);
    
    if (updated.mealReminders) {
      await scheduleMealReminders(language);
    } else {
      await LocalNotifications.cancel({
        notifications: [
          { id: NOTIFICATION_IDS.BREAKFAST },
          { id: NOTIFICATION_IDS.LUNCH },
          { id: NOTIFICATION_IDS.DINNER },
        ],
      });
    }
  };

  return {
    isNative,
    permissionGranted,
    settings,
    requestPermissions,
    scheduleMealReminders,
    scheduleStreakRiskAlert,
    cancelAllNotifications,
    updateSettings,
  };
};
