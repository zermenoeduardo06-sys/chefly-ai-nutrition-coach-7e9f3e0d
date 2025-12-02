import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import confetti from "canvas-confetti";
import { PartyPopper, Sparkles, Trophy } from "lucide-react";

interface OnboardingCelebrationProps {
  show: boolean;
  message: string;
  onComplete?: () => void;
}

const OnboardingCelebration = ({ show, message, onComplete }: OnboardingCelebrationProps) => {
  useEffect(() => {
    if (show) {
      // Big celebration confetti
      const duration = 2000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          if (onComplete) {
            setTimeout(onComplete, 500);
          }
          return;
        }

        const particleCount = 50 * (timeLeft / duration);
        
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#f97316', '#22c55e', '#f59e0b', '#3b82f6', '#ec4899'],
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#f97316', '#22c55e', '#f59e0b', '#3b82f6', '#ec4899'],
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 20,
              duration: 0.8
            }}
            className="bg-card border-2 border-primary rounded-3xl p-8 shadow-2xl shadow-primary/20 text-center max-w-md mx-4"
          >
            {/* Animated icons */}
            <div className="flex justify-center gap-4 mb-6">
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, -10, 10, 0]
                }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <PartyPopper className="w-10 h-10 text-primary" />
              </motion.div>
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 360]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Trophy className="w-12 h-12 text-secondary" />
              </motion.div>
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
              >
                <Sparkles className="w-10 h-10 text-primary" />
              </motion.div>
            </div>

            {/* Message */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-foreground mb-2"
            >
              {message}
            </motion.h2>

            {/* Animated dots */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center gap-1"
            >
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  animate={{ y: [0, -8, 0] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.2,
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

export default OnboardingCelebration;
