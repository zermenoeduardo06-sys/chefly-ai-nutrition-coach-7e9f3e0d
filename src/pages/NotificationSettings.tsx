import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Bell, Clock, Flame, Smartphone, Calendar, Trophy, Heart } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNotifications } from "@/hooks/useNotifications";
import { useToast } from "@/hooks/use-toast";

const NotificationSettings = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { toast } = useToast();
  const {
    isNative,
    permissionGranted,
    settings,
    requestPermissions,
    scheduleMealReminders,
    scheduleWeeklyCheckInReminder,
    updateSettings,
  } = useNotifications();

  const [localSettings, setLocalSettings] = useState(settings);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleRequestPermissions = async () => {
    setIsLoading(true);
    const granted = await requestPermissions();
    setIsLoading(false);
    
    if (granted) {
      toast({
        title: language === 'es' ? '✅ Notificaciones activadas' : '✅ Notifications enabled',
        description: language === 'es' 
          ? 'Recibirás recordatorios personalizados' 
          : 'You will receive personalized reminders',
      });
      await scheduleMealReminders(language);
      await scheduleWeeklyCheckInReminder(language);
    } else {
      toast({
        variant: 'destructive',
        title: language === 'es' ? 'Permiso denegado' : 'Permission denied',
        description: language === 'es' 
          ? 'Habilita las notificaciones en la configuración del dispositivo' 
          : 'Enable notifications in device settings',
      });
    }
  };

  const handleToggle = async (key: keyof typeof settings, enabled: boolean) => {
    setLocalSettings(prev => ({ ...prev, [key]: enabled }));
    await updateSettings({ [key]: enabled }, language);
  };

  const handleTimeChange = async (meal: 'breakfastTime' | 'lunchTime' | 'dinnerTime', time: string) => {
    setLocalSettings(prev => ({ ...prev, [meal]: time }));
    await updateSettings({ [meal]: time }, language);
    await scheduleMealReminders(language);
  };

  const texts = {
    es: {
      title: 'Notificaciones',
      mealReminders: 'Recordatorios de comidas',
      mealRemindersDesc: 'Recibe notificaciones a la hora de cada comida',
      streakAlerts: 'Alertas de racha',
      streakAlertsDesc: 'Te avisamos cuando tu racha está en riesgo',
      weeklyCheckIn: 'Recordatorio semanal',
      weeklyCheckInDesc: 'Domingos a las 10 AM para tu check-in',
      streakMilestones: 'Celebrar logros',
      streakMilestonesDesc: 'Notificación al alcanzar hitos de racha',
      reEngagement: 'Recordatorios suaves',
      reEngagementDesc: 'Solo después de 3+ días sin actividad',
      breakfast: 'Desayuno',
      lunch: 'Almuerzo',
      dinner: 'Cena',
      customTimes: 'Horarios personalizados',
      notNativeTitle: 'Disponible en la app móvil',
      notNativeDesc: 'Las notificaciones push están disponibles cuando instalas Chefly como app nativa.',
      enableNotifications: 'Activar notificaciones',
      permissionRequired: 'Se requiere permiso para enviar notificaciones',
      smartNotifications: 'Notificaciones inteligentes',
    },
    en: {
      title: 'Notifications',
      mealReminders: 'Meal reminders',
      mealRemindersDesc: 'Receive notifications at meal times',
      streakAlerts: 'Streak alerts',
      streakAlertsDesc: 'Get notified when your streak is at risk',
      weeklyCheckIn: 'Weekly reminder',
      weeklyCheckInDesc: 'Sundays at 10 AM for your check-in',
      streakMilestones: 'Celebrate milestones',
      streakMilestonesDesc: 'Notification when reaching streak milestones',
      reEngagement: 'Gentle reminders',
      reEngagementDesc: 'Only after 3+ days of inactivity',
      breakfast: 'Breakfast',
      lunch: 'Lunch',
      dinner: 'Dinner',
      customTimes: 'Custom times',
      notNativeTitle: 'Available in mobile app',
      notNativeDesc: 'Push notifications are available when you install Chefly as a native app.',
      enableNotifications: 'Enable notifications',
      permissionRequired: 'Permission required to send notifications',
      smartNotifications: 'Smart notifications',
    },
  };

  const t2 = texts[language];

  const NotificationToggle = ({ 
    icon: Icon, 
    iconColor, 
    title, 
    description, 
    settingKey, 
    delay = 0 
  }: { 
    icon: React.ElementType; 
    iconColor: string; 
    title: string; 
    description: string; 
    settingKey: keyof typeof settings;
    delay?: number;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-card border border-border rounded-2xl p-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${iconColor} rounded-full flex items-center justify-center`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-semibold">{title}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <Switch
          checked={localSettings[settingKey] as boolean}
          onCheckedChange={(enabled) => handleToggle(settingKey, enabled)}
        />
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 bg-background border-b border-border"
      >
        <div className="flex items-center gap-3 px-4 py-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="h-6 w-6 text-muted-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">{t2.title}</h1>
        </div>
      </motion.div>

      <div className="px-4 py-6 space-y-6 pb-24">
        {!isNative ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-6 text-center"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Smartphone className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-lg font-semibold mb-2">{t2.notNativeTitle}</h2>
            <p className="text-muted-foreground text-sm">{t2.notNativeDesc}</p>
          </motion.div>
        ) : !permissionGranted ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-6 text-center"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-lg font-semibold mb-2">{t2.permissionRequired}</h2>
            <Button 
              onClick={handleRequestPermissions}
              disabled={isLoading}
              className="mt-4"
            >
              {isLoading ? '...' : t2.enableNotifications}
            </Button>
          </motion.div>
        ) : (
          <>
            {/* Core notifications */}
            <NotificationToggle
              icon={Bell}
              iconColor="bg-primary/10 text-primary"
              title={t2.mealReminders}
              description={t2.mealRemindersDesc}
              settingKey="mealReminders"
              delay={0}
            />

            <NotificationToggle
              icon={Flame}
              iconColor="bg-orange-500/10 text-orange-500"
              title={t2.streakAlerts}
              description={t2.streakAlertsDesc}
              settingKey="streakAlerts"
              delay={0.05}
            />

            {/* Smart notifications section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="pt-2"
            >
              <p className="text-sm font-medium text-muted-foreground mb-3 px-1">
                {t2.smartNotifications}
              </p>
            </motion.div>

            <NotificationToggle
              icon={Calendar}
              iconColor="bg-violet-500/10 text-violet-500"
              title={t2.weeklyCheckIn}
              description={t2.weeklyCheckInDesc}
              settingKey="weeklyCheckInReminders"
              delay={0.15}
            />

            <NotificationToggle
              icon={Trophy}
              iconColor="bg-yellow-500/10 text-yellow-500"
              title={t2.streakMilestones}
              description={t2.streakMilestonesDesc}
              settingKey="streakMilestones"
              delay={0.2}
            />

            <NotificationToggle
              icon={Heart}
              iconColor="bg-emerald-500/10 text-emerald-500"
              title={t2.reEngagement}
              description={t2.reEngagementDesc}
              settingKey="reEngagement"
              delay={0.25}
            />

            {/* Custom Times */}
            {localSettings.mealReminders && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card border border-border rounded-2xl p-4 space-y-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <p className="font-semibold">{t2.customTimes}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base">🍳 {t2.breakfast}</Label>
                    <Input
                      type="time"
                      value={localSettings.breakfastTime}
                      onChange={(e) => handleTimeChange('breakfastTime', e.target.value)}
                      className="w-28"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-base">🥗 {t2.lunch}</Label>
                    <Input
                      type="time"
                      value={localSettings.lunchTime}
                      onChange={(e) => handleTimeChange('lunchTime', e.target.value)}
                      className="w-28"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-base">🍽️ {t2.dinner}</Label>
                    <Input
                      type="time"
                      value={localSettings.dinnerTime}
                      onChange={(e) => handleTimeChange('dinnerTime', e.target.value)}
                      className="w-28"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationSettings;
