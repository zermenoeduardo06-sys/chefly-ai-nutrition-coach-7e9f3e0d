import { useState, useEffect, useCallback } from 'react';
import { LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';

interface NotificationSettings {
  mealReminders: boolean;
  streakAlerts: boolean;
  weeklyCheckInReminders: boolean;
  streakMilestones: boolean;
  reEngagement: boolean;
  breakfastTime: string;
  lunchTime: string;
  dinnerTime: string;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  mealReminders: true,
  streakAlerts: true,
  weeklyCheckInReminders: true,
  streakMilestones: true,
  reEngagement: true,
  breakfastTime: "08:00",
  lunchTime: "13:00",
  dinnerTime: "19:00",
};

const SCHEDULE_THROTTLE_KEY = 'notifications_last_scheduled';
const DAILY_NOTIF_COUNT_KEY = 'notifications_daily_count';
const DAILY_NOTIF_DATE_KEY = 'notifications_daily_date';
const MAX_DAILY_NOTIFICATIONS = 3;

const canScheduleToday = (): boolean => {
  const lastScheduled = localStorage.getItem(SCHEDULE_THROTTLE_KEY);
  if (!lastScheduled) return true;
  const today = new Date().toDateString();
  return lastScheduled !== today;
};

const markScheduledToday = () => {
  localStorage.setItem(SCHEDULE_THROTTLE_KEY, new Date().toDateString());
};

const getDailyNotifCount = (): number => {
  const savedDate = localStorage.getItem(DAILY_NOTIF_DATE_KEY);
  const today = new Date().toDateString();
  if (savedDate !== today) {
    localStorage.setItem(DAILY_NOTIF_DATE_KEY, today);
    localStorage.setItem(DAILY_NOTIF_COUNT_KEY, '0');
    return 0;
  }
  return parseInt(localStorage.getItem(DAILY_NOTIF_COUNT_KEY) || '0', 10);
};

const incrementDailyNotifCount = () => {
  const count = getDailyNotifCount();
  localStorage.setItem(DAILY_NOTIF_COUNT_KEY, String(count + 1));
};

const canSendNotification = (): boolean => {
  return getDailyNotifCount() < MAX_DAILY_NOTIFICATIONS;
};

const NOTIFICATION_IDS = {
  BREAKFAST: 1,
  LUNCH: 2,
  DINNER: 3,
  STREAK_RISK: 4,
  WEEKLY_CHECKIN: 5,
  STREAK_MILESTONE: 6,
  RE_ENGAGEMENT: 7,
};

// Streak milestones to celebrate (less frequent = less annoying)
const STREAK_MILESTONES = [7, 14, 21, 30, 50, 75, 100, 150, 200, 365];

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
      try {
        const parsed = JSON.parse(saved);
        // Merge with defaults for new settings
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch {
        setSettings(DEFAULT_SETTINGS);
      }
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
    minute: number,
    extra?: Record<string, unknown>
  ) => {
    const now = new Date();
    const scheduledDate = new Date();
    scheduledDate.setHours(hour, minute, 0, 0);
    
    if (scheduledDate <= now) {
      scheduledDate.setDate(scheduledDate.getDate() + 1);
    }

    const dayOfWeek = scheduledDate.getDay() === 0 ? 6 : scheduledDate.getDay() - 1;

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
          extra: extra || { type: 'meal', dayOfWeek },
        },
      ],
    });
  };

  const scheduleMealReminders = async (language: 'es' | 'en' = 'es', force = false) => {
    if (!isNative || !permissionGranted || !settings.mealReminders) return;
    
    // Throttle: only reschedule once per day unless forced (e.g. settings change)
    if (!force && !canScheduleToday()) {
      console.log('Meal reminders already scheduled today, skipping');
      return;
    }

    try {
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
        breakfastMin,
        { type: 'meal', mealType: 'breakfast' }
      );

      await scheduleNotificationAtTime(
        NOTIFICATION_IDS.LUNCH,
        messages[language].lunch.title,
        messages[language].lunch.body,
        lunchHour,
        lunchMin,
        { type: 'meal', mealType: 'lunch' }
      );

      await scheduleNotificationAtTime(
        NOTIFICATION_IDS.DINNER,
        messages[language].dinner.title,
        messages[language].dinner.body,
        dinnerHour,
        dinnerMin,
        { type: 'meal', mealType: 'dinner' }
      );

      markScheduledToday();
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
    if (!isNative || !permissionGranted || !settings.streakAlerts || currentStreak < 2 || !canSendNotification()) return;

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

  // Schedule weekly check-in reminder (Sundays at 10 AM)
  const scheduleWeeklyCheckInReminder = async (language: 'es' | 'en' = 'es') => {
    if (!isNative || !permissionGranted || !settings.weeklyCheckInReminders) return;

    try {
      await LocalNotifications.cancel({
        notifications: [{ id: NOTIFICATION_IDS.WEEKLY_CHECKIN }],
      });

      const messages = {
        es: {
          title: '📊 Check-in semanal disponible',
          body: 'Cuéntanos cómo te fue esta semana. Tu feedback mejora tu plan.',
        },
        en: {
          title: '📊 Weekly check-in available',
          body: 'Tell us how your week went. Your feedback improves your plan.',
        },
      };

      // Schedule for Sunday at 10 AM
      const now = new Date();
      const sunday = new Date();
      const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
      sunday.setDate(now.getDate() + daysUntilSunday);
      sunday.setHours(10, 0, 0, 0);

      await LocalNotifications.schedule({
        notifications: [
          {
            id: NOTIFICATION_IDS.WEEKLY_CHECKIN,
            title: messages[language].title,
            body: messages[language].body,
            schedule: {
              at: sunday,
              repeats: true,
              every: 'week',
            },
            sound: 'default',
            smallIcon: 'ic_stat_icon_config_sample',
            iconColor: '#8B5CF6',
            extra: { type: 'weekly_checkin' },
          },
        ],
      });
      console.log('Weekly check-in reminder scheduled');
    } catch (error) {
      console.error('Error scheduling weekly check-in:', error);
    }
  };

  // Celebrate streak milestones (triggered when milestone is reached)
  const celebrateStreakMilestone = async (
    streak: number,
    language: 'es' | 'en' = 'es'
  ) => {
    if (!isNative || !permissionGranted || !settings.streakMilestones) return;
    if (!STREAK_MILESTONES.includes(streak)) return;

    try {
      const messages = {
        es: {
          title: `🎉 ¡${streak} días de racha!`,
          body: streak >= 30 
            ? `¡Increíble! ${streak} días seguidos. Eres imparable.`
            : `¡Felicidades! Has completado ${streak} días seguidos. ¡Sigue así!`,
        },
        en: {
          title: `🎉 ${streak}-day streak!`,
          body: streak >= 30
            ? `Amazing! ${streak} days in a row. You're unstoppable.`
            : `Congrats! You've completed ${streak} days straight. Keep it up!`,
        },
      };

      // Schedule immediately
      await LocalNotifications.schedule({
        notifications: [
          {
            id: NOTIFICATION_IDS.STREAK_MILESTONE,
            title: messages[language].title,
            body: messages[language].body,
            schedule: { at: new Date(Date.now() + 1000) },
            sound: 'default',
            smallIcon: 'ic_stat_icon_config_sample',
            iconColor: '#F97316',
            extra: { type: 'streak_milestone', streak },
          },
        ],
      });
      console.log(`Streak milestone ${streak} celebrated`);
    } catch (error) {
      console.error('Error celebrating streak milestone:', error);
    }
  };

  // Schedule re-engagement notification (only after 3 days of inactivity)
  const scheduleReEngagement = async (
    lastActivityDate: string | null,
    language: 'es' | 'en' = 'es'
  ) => {
    if (!isNative || !permissionGranted || !settings.reEngagement) return;

    try {
      await LocalNotifications.cancel({
        notifications: [{ id: NOTIFICATION_IDS.RE_ENGAGEMENT }],
      });

      if (!lastActivityDate) return;

      const lastActivity = new Date(lastActivityDate);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

      // Only schedule if inactive for 3+ days
      if (diffDays >= 3) {
        const messages = {
          es: {
            title: '👋 Te extrañamos',
            body: 'Tu plan de comidas te espera. ¡Retoma tu camino hacia una vida más saludable!',
          },
          en: {
            title: '👋 We miss you',
            body: 'Your meal plan is waiting. Get back on track to a healthier life!',
          },
        };

        // Schedule for tomorrow at 11 AM (less intrusive)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(11, 0, 0, 0);

        await LocalNotifications.schedule({
          notifications: [
            {
              id: NOTIFICATION_IDS.RE_ENGAGEMENT,
              title: messages[language].title,
              body: messages[language].body,
              schedule: { at: tomorrow },
              sound: 'default',
              smallIcon: 'ic_stat_icon_config_sample',
              iconColor: '#10B981',
              extra: { type: 're_engagement' },
            },
          ],
        });
        console.log('Re-engagement notification scheduled');
      }
    } catch (error) {
      console.error('Error scheduling re-engagement:', error);
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
          { id: NOTIFICATION_IDS.WEEKLY_CHECKIN },
          { id: NOTIFICATION_IDS.STREAK_MILESTONE },
          { id: NOTIFICATION_IDS.RE_ENGAGEMENT },
        ],
      });
    } catch (error) {
      console.error('Error canceling notifications:', error);
    }
  };

  const updateSettings = async (newSettings: Partial<NotificationSettings>, language: 'es' | 'en' = 'es') => {
    const updated = { ...settings, ...newSettings };
    saveSettings(updated);
    
    // Reschedule based on new settings
    if (updated.mealReminders) {
      await scheduleMealReminders(language, true); // force since user changed settings
    } else {
      await LocalNotifications.cancel({
        notifications: [
          { id: NOTIFICATION_IDS.BREAKFAST },
          { id: NOTIFICATION_IDS.LUNCH },
          { id: NOTIFICATION_IDS.DINNER },
        ],
      });
    }

    if (updated.weeklyCheckInReminders) {
      await scheduleWeeklyCheckInReminder(language);
    } else {
      await LocalNotifications.cancel({
        notifications: [{ id: NOTIFICATION_IDS.WEEKLY_CHECKIN }],
      });
    }

    if (!updated.reEngagement) {
      await LocalNotifications.cancel({
        notifications: [{ id: NOTIFICATION_IDS.RE_ENGAGEMENT }],
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
    scheduleWeeklyCheckInReminder,
    celebrateStreakMilestone,
    scheduleReEngagement,
    cancelAllNotifications,
    updateSettings,
  };
};
