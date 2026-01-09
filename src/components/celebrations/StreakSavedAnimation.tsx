import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Flame, Snowflake, Check, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useHaptics } from '@/hooks/useHaptics';
import mascotHealthy from '@/assets/mascot-healthy.png';

type StreakState = 'saved' | 'at_risk' | 'frozen' | 'lost';

interface StreakSavedAnimationProps {
  show: boolean;
  state: StreakState;
  streakCount: number;
  onClose: () => void;
}

const stateConfig: Record<StreakState, {
  icon: React.ReactNode;
  titleEs: string;
  titleEn: string;
  subtitleEs: string;
  subtitleEn: string;
  gradient: string;
  iconBg: string;
}> = {
  saved: {
    icon: <Check className="w-8 h-8" />,
    titleEs: '¡Racha salvada!',
    titleEn: 'Streak saved!',
    subtitleEs: 'Seguiste logrando hoy',
    subtitleEn: 'You kept going today',
    gradient: 'from-emerald-500 to-green-600',
    iconBg: 'bg-emerald-500',
  },
  at_risk: {
    icon: <AlertTriangle className="w-8 h-8" />,
    titleEs: '¡Tu racha está en riesgo!',
    titleEn: 'Your streak is at risk!',
    subtitleEs: 'Registra comida para mantenerla',
    subtitleEn: 'Log food to keep it',
    gradient: 'from-amber-500 to-orange-600',
    iconBg: 'bg-amber-500',
  },
  frozen: {
    icon: <Snowflake className="w-8 h-8" />,
    titleEs: 'Racha congelada',
    titleEn: 'Streak frozen',
    subtitleEs: 'Usaste tu freeze de emergencia',
    subtitleEn: 'You used your emergency freeze',
    gradient: 'from-cyan-500 to-blue-600',
    iconBg: 'bg-cyan-500',
  },
  lost: {
    icon: <Flame className="w-8 h-8" />,
    titleEs: 'Racha perdida',
    titleEn: 'Streak lost',
    subtitleEs: '¡Comienza de nuevo hoy!',
    subtitleEn: 'Start again today!',
    gradient: 'from-red-500 to-rose-600',
    iconBg: 'bg-red-500',
  },
};

export const StreakSavedAnimation: React.FC<StreakSavedAnimationProps> = ({
  show,
  state,
  streakCount,
  onClose,
}) => {
  const { language } = useLanguage();
  const { successNotification, warningNotification } = useHaptics();
  const config = stateConfig[state];

  useEffect(() => {
    if (show) {
      if (state === 'saved' || state === 'frozen') {
        successNotification();
      } else {
        warningNotification();
      }

      // Auto-close after 3 seconds
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, state, successNotification, warningNotification, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed top-20 left-4 right-4 z-[100] pointer-events-auto"
          onClick={onClose}
        >
          <div className={`relative bg-gradient-to-r ${config.gradient} rounded-2xl p-4 shadow-2xl overflow-hidden`}>
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    x: [0, 20, 0],
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 3,
                    delay: i * 0.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute"
                  style={{
                    left: `${i * 20}%`,
                    top: `${(i % 2) * 50}%`,
                  }}
                >
                  <Flame className="w-8 h-8 text-white" />
                </motion.div>
              ))}
            </div>

            <div className="relative flex items-center gap-4">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 400, delay: 0.1 }}
                className={`w-14 h-14 rounded-full ${config.iconBg} flex items-center justify-center text-white shadow-lg`}
              >
                {state === 'saved' || state === 'frozen' ? (
                  <Shield className="w-7 h-7" />
                ) : (
                  config.icon
                )}
              </motion.div>

              {/* Content */}
              <div className="flex-1">
                <motion.h3
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-white font-bold text-lg"
                >
                  {language === 'es' ? config.titleEs : config.titleEn}
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-white/80 text-sm"
                >
                  {language === 'es' ? config.subtitleEs : config.subtitleEn}
                </motion.p>
              </div>

              {/* Streak count */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="flex items-center gap-1 bg-white/20 px-3 py-2 rounded-xl"
              >
                <Flame className="w-5 h-5 text-white" />
                <span className="text-white font-bold text-xl">{streakCount}</span>
              </motion.div>
            </div>

            {/* Mascot peek */}
            <motion.img
              src={mascotHealthy}
              alt="Mascot"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="absolute -right-2 -bottom-4 w-16 h-16 object-contain"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StreakSavedAnimation;
