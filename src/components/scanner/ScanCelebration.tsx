import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useXPAnimation } from '@/contexts/XPAnimationContext';
import { useLanguage } from '@/contexts/LanguageContext';
import mascotCelebrating from '@/assets/mascot-celebrating.png';

interface ScanCelebrationProps {
  show: boolean;
  calories: number;
  dishName: string;
  onComplete: () => void;
}

export function ScanCelebration({ show, calories, dishName, onComplete }: ScanCelebrationProps) {
  const { triggerXP } = useXPAnimation();
  const { language } = useLanguage();

  useEffect(() => {
    if (show) {
      // Trigger confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF6B35', '#FFD23F', '#4ADE80', '#60A5FA'],
      });

      // Trigger XP animation
      triggerXP(15, 'food', { x: window.innerWidth / 2, y: window.innerHeight / 2 });

      // Play celebration sound via haptics
      // celebrate function not needed here as confetti + XP already triggered

      // Auto dismiss after animation
      const timer = setTimeout(onComplete, 2500);
      return () => clearTimeout(timer);
    }
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={onComplete}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-card rounded-3xl p-8 mx-4 max-w-sm w-full text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 400 }}
              className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg"
            >
              <Check className="h-10 w-10 text-white" strokeWidth={3} />
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold mb-2"
            >
              {language === 'es' ? '¡Guardado!' : 'Saved!'}
            </motion.h2>

            {/* Dish info */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-muted-foreground mb-4"
            >
              {dishName}
            </motion.p>

            {/* Calories badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-lg font-bold text-primary">{calories} kcal</span>
            </motion.div>

            {/* XP Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-2"
            >
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="px-4 py-2 bg-gradient-to-r from-primary to-orange-500 rounded-full text-white font-bold text-lg shadow-lg"
              >
                +15 XP
              </motion.div>
            </motion.div>

            {/* Mascot */}
            <motion.img
              src={mascotCelebrating}
              alt="Chefly celebrating"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="absolute -bottom-4 -right-4 w-24 h-24 object-contain"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
