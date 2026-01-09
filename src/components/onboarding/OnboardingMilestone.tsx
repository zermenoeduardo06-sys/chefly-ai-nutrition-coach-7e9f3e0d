import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { useHaptics } from '@/hooks/useHaptics';
import { useCelebrationSounds } from '@/hooks/useCelebrationSounds';
import { Check, Star, Sparkles, Trophy, Heart, Zap } from 'lucide-react';

interface OnboardingMilestoneProps {
  title: string;
  subtitle: string;
  icon?: 'check' | 'star' | 'sparkles' | 'trophy' | 'heart' | 'zap';
  show: boolean;
  onComplete?: () => void;
  autoAdvanceDelay?: number;
}

const iconMap = {
  check: Check,
  star: Star,
  sparkles: Sparkles,
  trophy: Trophy,
  heart: Heart,
  zap: Zap,
};

export const OnboardingMilestone = ({
  title,
  subtitle,
  icon = 'check',
  show,
  onComplete,
  autoAdvanceDelay = 2500,
}: OnboardingMilestoneProps) => {
  const [visible, setVisible] = useState(false);
  const { successNotification, celebrationPattern } = useHaptics();
  const { playCelebrationSound } = useCelebrationSounds();

  const Icon = iconMap[icon];

  useEffect(() => {
    if (show) {
      setVisible(true);
      
      // Trigger celebrations
      successNotification();
      playCelebrationSound('achievement', 'small');
      
      // Mini confetti burst
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6, x: 0.5 },
        colors: ['#a3e635', '#22d3ee', '#f59e0b'],
        scalar: 0.8,
      });

      // Auto advance
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => {
          onComplete?.();
        }, 300);
      }, autoAdvanceDelay);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete, autoAdvanceDelay, successNotification, playCelebrationSound]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="flex flex-col items-center text-center px-8"
          >
            {/* Animated icon container */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 400 }}
              className="relative mb-6"
            >
              {/* Glow effect */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full bg-primary/30 blur-xl"
              />
              
              {/* Icon circle */}
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-2xl"
              >
                <Icon className="w-12 h-12 text-primary-foreground" />
              </motion.div>

              {/* Floating particles */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0.5, 1, 0.5],
                    x: Math.cos((i * 60 * Math.PI) / 180) * 60,
                    y: Math.sin((i * 60 * Math.PI) / 180) * 60,
                  }}
                  transition={{
                    delay: 0.2 + i * 0.1,
                    duration: 1.5,
                    repeat: Infinity,
                    repeatDelay: 0.5,
                  }}
                  className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-primary"
                />
              ))}
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-foreground mb-2"
            >
              {title}
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-muted-foreground text-lg"
            >
              {subtitle}
            </motion.p>

            {/* Progress dots */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex gap-1 mt-6"
            >
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 1,
                    delay: i * 0.2,
                    repeat: Infinity,
                  }}
                  className="w-2 h-2 rounded-full bg-primary"
                />
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OnboardingMilestone;
