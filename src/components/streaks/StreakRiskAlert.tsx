import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Clock, Flame, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useHaptics } from "@/hooks/useHaptics";
import { useEffect } from "react";

interface StreakRiskAlertProps {
  currentStreak: number;
  hoursRemaining: number;
  isVisible: boolean;
  onDismiss: () => void;
  onTakeAction: () => void;
}

export function StreakRiskAlert({
  currentStreak,
  hoursRemaining,
  isVisible,
  onDismiss,
  onTakeAction,
}: StreakRiskAlertProps) {
  const { language } = useLanguage();
  const { warningNotification } = useHaptics();

  // Trigger warning haptic when alert becomes visible
  useEffect(() => {
    if (isVisible) {
      warningNotification();
    }
  }, [isVisible, warningNotification]);

  const texts = {
    es: {
      title: "¡Tu racha está en riesgo!",
      subtitle: "días de racha podrían perderse",
      hoursLeft: "horas restantes",
      action: "Completar comida",
      dismiss: "Después",
    },
    en: {
      title: "Your streak is at risk!",
      subtitle: "days of streak could be lost",
      hoursLeft: "hours remaining",
      action: "Complete meal",
      dismiss: "Later",
    },
  };

  const t = texts[language];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.9 }}
          className="fixed top-4 left-4 right-4 z-50 md:left-auto md:w-96"
        >
          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-4 shadow-2xl border border-white/20">
            <div className="flex items-start gap-3">
              {/* Alert icon with animation */}
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, -10, 10, 0]
                }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                className="bg-white/20 rounded-full p-2 backdrop-blur-sm"
              >
                <AlertTriangle className="w-6 h-6 text-white" />
              </motion.div>

              <div className="flex-1 text-white">
                <h3 className="font-bold text-lg">{t.title}</h3>
                
                <div className="flex items-center gap-2 mt-1">
                  <Flame className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                  <span className="font-bold text-xl">{currentStreak}</span>
                  <span className="text-sm opacity-90">{t.subtitle}</span>
                </div>

                <div className="flex items-center gap-1 mt-2 text-sm opacity-80">
                  <Clock className="w-4 h-4" />
                  <span>{Math.round(hoursRemaining)} {t.hoursLeft}</span>
                </div>

                <div className="flex gap-2 mt-3">
                  <Button
                    onClick={onTakeAction}
                    className="flex-1 bg-white text-orange-600 hover:bg-white/90 font-bold"
                    size="sm"
                  >
                    {t.action}
                  </Button>
                  <Button
                    onClick={onDismiss}
                    variant="ghost"
                    className="text-white/80 hover:text-white hover:bg-white/10"
                    size="sm"
                  >
                    {t.dismiss}
                  </Button>
                </div>
              </div>

              <button 
                onClick={onDismiss}
                className="text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
