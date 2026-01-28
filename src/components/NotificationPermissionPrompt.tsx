import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Calendar, Flame, X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import mascotHappy from '@/assets/mascot-happy.png';

interface NotificationPermissionPromptProps {
  open: boolean;
  onAccept: () => void;
  onDismiss: () => void;
}

export function NotificationPermissionPrompt({
  open,
  onAccept,
  onDismiss,
}: NotificationPermissionPromptProps) {
  const { language } = useLanguage();

  const texts = {
    es: {
      title: '¡No te pierdas nada!',
      subtitle: 'Activa las notificaciones para:',
      benefit1: 'Recordatorios de comidas personalizados',
      benefit2: 'Alertas cuando tu racha está en riesgo',
      benefit3: 'Celebrar tus logros contigo',
      accept: 'Activar Notificaciones',
      dismiss: 'Ahora no',
    },
    en: {
      title: 'Don\'t miss anything!',
      subtitle: 'Enable notifications for:',
      benefit1: 'Personalized meal reminders',
      benefit2: 'Alerts when your streak is at risk',
      benefit3: 'Celebrate your achievements with you',
      accept: 'Enable Notifications',
      dismiss: 'Not now',
    },
  };

  const t = texts[language];

  const benefits = [
    { icon: Calendar, text: t.benefit1, color: 'text-primary' },
    { icon: Flame, text: t.benefit2, color: 'text-orange-500' },
    { icon: Bell, text: t.benefit3, color: 'text-amber-500' },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onDismiss}
        >
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-card rounded-3xl shadow-2xl overflow-hidden border border-border/50"
          >
            {/* Close button */}
            <button
              onClick={onDismiss}
              className="absolute top-4 right-4 p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors z-10"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* Header with mascot */}
            <div className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-transparent pt-8 pb-4 px-6">
              <div className="flex items-center gap-4">
                <motion.img
                  src={mascotHappy}
                  alt="Chefly"
                  className="w-20 h-20 object-contain"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-foreground">{t.title}</h2>
                  <p className="text-muted-foreground text-sm mt-1">{t.subtitle}</p>
                </div>
              </div>

              {/* Bell icon with animation */}
              <motion.div
                className="absolute -top-2 right-16 opacity-20"
                animate={{ 
                  rotate: [-10, 10, -10],
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Bell className="w-16 h-16 text-primary" />
              </motion.div>
            </div>

            {/* Benefits list */}
            <div className="px-6 py-4 space-y-3">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/30"
                >
                  <div className={`p-2 rounded-lg bg-background ${benefit.color}`}>
                    <benefit.icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-foreground flex-1">
                    {benefit.text}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </motion.div>
              ))}
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 pt-2 space-y-3">
              <Button
                onClick={onAccept}
                className="w-full h-14 text-lg font-semibold rounded-2xl bg-gradient-to-r from-primary to-primary-hover hover:opacity-90 shadow-[0_4px_0_hsl(82_80%_35%),0_8px_24px_hsl(82_80%_50%/0.3)]"
              >
                <Bell className="w-5 h-5 mr-2" />
                {t.accept}
              </Button>
              
              <button
                onClick={onDismiss}
                className="w-full py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t.dismiss}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default NotificationPermissionPrompt;
