import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Share2, X, Flame, Target, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useHaptics } from '@/hooks/useHaptics';
import confetti from 'canvas-confetti';
import mascotCelebrating from '@/assets/mascot-celebrating.png';
import mascotPower from '@/assets/mascot-power.png';

interface GoalReachedOverlayProps {
  show: boolean;
  onClose: () => void;
  goalType: 'weight' | 'calories' | 'streak';
  stats?: {
    achieved: number;
    target: number;
    daysToAchieve?: number;
    unit?: string;
  };
}

const AnimatedNumber: React.FC<{ value: number; suffix?: string; delay?: number }> = ({ 
  value, 
  suffix = '', 
  delay = 0 
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const duration = 1500;
      const steps = 30;
      const stepValue = value / steps;
      let current = 0;

      const interval = setInterval(() => {
        current += stepValue;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(interval);
        } else {
          setDisplayValue(Math.round(current));
        }
      }, duration / steps);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <span>
      {displayValue.toLocaleString()}{suffix}
    </span>
  );
};

export const GoalReachedOverlay: React.FC<GoalReachedOverlayProps> = ({
  show,
  onClose,
  goalType,
  stats,
}) => {
  const { language } = useLanguage();
  const { celebrationPattern } = useHaptics();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (show) {
      celebrationPattern();
      
      // Delayed content reveal
      setTimeout(() => setShowContent(true), 300);

      // Epic confetti
      const duration = 5000;
      const animationEnd = Date.now() + duration;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);

        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors: ['#eab308', '#f59e0b', '#fbbf24', '#a855f7', '#22c55e'],
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors: ['#eab308', '#f59e0b', '#fbbf24', '#a855f7', '#22c55e'],
        });
      }, 100);

      return () => {
        clearInterval(interval);
        setShowContent(false);
      };
    }
  }, [show, celebrationPattern]);

  const goalConfig = {
    weight: {
      icon: TrendingDown,
      titleEs: '¡META DE PESO ALCANZADA!',
      titleEn: 'WEIGHT GOAL REACHED!',
      subtitleEs: 'Tu esfuerzo dio resultados',
      subtitleEn: 'Your effort paid off',
      mascot: mascotCelebrating,
      gradient: 'from-emerald-500 to-teal-600',
    },
    calories: {
      icon: Target,
      titleEs: '¡OBJETIVO NUTRICIONAL!',
      titleEn: 'NUTRITION GOAL!',
      subtitleEs: 'Mantuviste tu plan perfecto',
      subtitleEn: 'You kept your plan perfect',
      mascot: mascotPower,
      gradient: 'from-primary to-accent',
    },
    streak: {
      icon: Flame,
      titleEs: '¡RACHA ÉPICA!',
      titleEn: 'EPIC STREAK!',
      subtitleEs: 'Consistencia increíble',
      subtitleEn: 'Incredible consistency',
      mascot: mascotPower,
      gradient: 'from-orange-500 to-amber-600',
    },
  };

  const config = goalConfig[goalType];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        >
          {/* Animated background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`absolute inset-0 bg-gradient-to-b ${config.gradient}/20 to-background/95 backdrop-blur-md`}
          />

          {/* Pulsing glow */}
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.1, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className={`absolute w-64 h-64 rounded-full bg-gradient-to-r ${config.gradient} blur-3xl`}
          />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-card/50 backdrop-blur text-foreground/70 hover:text-foreground transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Main content */}
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 10 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
            className="relative z-10 w-full max-w-sm"
          >
            {/* Trophy animation */}
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="flex justify-center mb-6"
            >
              <motion.div
                animate={{ 
                  rotateY: [0, 360],
                  scale: [1, 1.1, 1],
                }}
                transition={{ 
                  rotateY: { duration: 3, repeat: Infinity, ease: "linear" },
                  scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
                }}
                className={`w-24 h-24 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-2xl`}
              >
                <Trophy className="w-12 h-12 text-white" />
              </motion.div>
            </motion.div>

            {/* Card */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-card/90 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-border"
            >
              {/* Stars */}
              <div className="flex justify-center gap-2 mb-4">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.5 + i * 0.1, type: "spring" }}
                  >
                    <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                  </motion.div>
                ))}
              </div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className={`text-2xl font-bold text-center bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent mb-2`}
              >
                {language === 'es' ? config.titleEs : config.titleEn}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-muted-foreground text-center mb-6"
              >
                {language === 'es' ? config.subtitleEs : config.subtitleEn}
              </motion.p>

              {/* Stats */}
              {stats && showContent && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 }}
                  className="grid grid-cols-2 gap-4 mb-6"
                >
                  <div className="text-center p-4 rounded-xl bg-muted/50">
                    <div className="text-3xl font-bold text-foreground">
                      <AnimatedNumber value={stats.achieved} suffix={stats.unit} delay={900} />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {language === 'es' ? 'Logrado' : 'Achieved'}
                    </div>
                  </div>
                  {stats.daysToAchieve && (
                    <div className="text-center p-4 rounded-xl bg-muted/50">
                      <div className="text-3xl font-bold text-foreground">
                        <AnimatedNumber value={stats.daysToAchieve} delay={1100} />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {language === 'es' ? 'Días' : 'Days'}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Action buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="flex gap-3"
              >
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={onClose}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  {language === 'es' ? 'Compartir' : 'Share'}
                </Button>
                <Button
                  className={`flex-1 bg-gradient-to-r ${config.gradient} text-white`}
                  onClick={onClose}
                >
                  {language === 'es' ? '¡Celebrar!' : 'Celebrate!'}
                </Button>
              </motion.div>
            </motion.div>

            {/* Mascot */}
            <motion.img
              src={config.mascot}
              alt="Mascot celebrating"
              initial={{ scale: 0, x: 100, rotate: 20 }}
              animate={{ scale: 1, x: 0, rotate: 0 }}
              transition={{ delay: 0.6, type: "spring" }}
              className="absolute -right-4 -bottom-16 w-28 h-28 object-contain"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GoalReachedOverlay;
