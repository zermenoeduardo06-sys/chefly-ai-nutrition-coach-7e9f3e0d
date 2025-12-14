import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Bell, Clock, Flame, Smartphone } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNotifications } from "@/hooks/useNotifications";
import { useToast } from "@/hooks/use-toast";

const NotificationSettings = () => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const {
    isNative,
    permissionGranted,
    settings,
    requestPermissions,
    scheduleMealReminders,
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
          ? 'Recibirás recordatorios de comidas' 
          : 'You will receive meal reminders',
      });
      await scheduleMealReminders(language);
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

  const handleToggleMealReminders = async (enabled: boolean) => {
    setLocalSettings(prev => ({ ...prev, mealReminders: enabled }));
    await updateSettings({ mealReminders: enabled }, language);
    
    toast({
      title: enabled 
        ? (language === 'es' ? '🔔 Recordatorios activados' : '🔔 Reminders enabled')
        : (language === 'es' ? '🔕 Recordatorios desactivados' : '🔕 Reminders disabled'),
    });
  };

  const handleToggleStreakAlerts = async (enabled: boolean) => {
    setLocalSettings(prev => ({ ...prev, streakAlerts: enabled }));
    await updateSettings({ streakAlerts: enabled }, language);
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
      breakfast: 'Desayuno',
      lunch: 'Almuerzo',
      dinner: 'Cena',
      customTimes: 'Horarios personalizados',
      notNativeTitle: 'Disponible en la app móvil',
      notNativeDesc: 'Las notificaciones push están disponibles cuando instalas Chefly como app nativa en tu dispositivo móvil.',
      enableNotifications: 'Activar notificaciones',
      permissionRequired: 'Se requiere permiso para enviar notificaciones',
    },
    en: {
      title: 'Notifications',
      mealReminders: 'Meal reminders',
      mealRemindersDesc: 'Receive notifications at meal times',
      streakAlerts: 'Streak alerts',
      streakAlertsDesc: 'Get notified when your streak is at risk',
      breakfast: 'Breakfast',
      lunch: 'Lunch',
      dinner: 'Dinner',
      customTimes: 'Custom times',
      notNativeTitle: 'Available in mobile app',
      notNativeDesc: 'Push notifications are available when you install Chefly as a native app on your mobile device.',
      enableNotifications: 'Enable notifications',
      permissionRequired: 'Permission required to send notifications',
    },
  };

  const t2 = texts[language];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 bg-background border-b border-border pt-safe-top"
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
          /* Non-native platform message */
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
          /* Permission request */
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
          /* Notification settings */
          <>
            {/* Meal Reminders Toggle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-2xl p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Bell className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{t2.mealReminders}</p>
                    <p className="text-sm text-muted-foreground">{t2.mealRemindersDesc}</p>
                  </div>
                </div>
                <Switch
                  checked={localSettings.mealReminders}
                  onCheckedChange={handleToggleMealReminders}
                />
              </div>
            </motion.div>

            {/* Streak Alerts Toggle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card border border-border rounded-2xl p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500/10 rounded-full flex items-center justify-center">
                    <Flame className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="font-semibold">{t2.streakAlerts}</p>
                    <p className="text-sm text-muted-foreground">{t2.streakAlertsDesc}</p>
                  </div>
                </div>
                <Switch
                  checked={localSettings.streakAlerts}
                  onCheckedChange={handleToggleStreakAlerts}
                />
              </div>
            </motion.div>

            {/* Custom Times */}
            {localSettings.mealReminders && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
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
