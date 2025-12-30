import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Sparkles, Star } from "lucide-react";
import { useEffect } from "react";
import confetti from "canvas-confetti";
import { useHaptics } from "@/hooks/useHaptics";

interface AchievementUnlockAnimationProps {
  isOpen: boolean;
  achievement: {
    icon: string;
    title: string;
    description: string;
    points_reward: number;
  } | null;
  onClose: () => void;
}

export const AchievementUnlockAnimation = ({ 
  isOpen, 
  achievement, 
  onClose 
}: AchievementUnlockAnimationProps) => {
  const { celebrationPattern, heavyImpact } = useHaptics();

  useEffect(() => {
    if (isOpen && achievement) {
      // Trigger haptic celebration
      heavyImpact();
      setTimeout(() => celebrationPattern(), 300);
      
      // Trigger confetti explosion
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      
      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
          particleCount: particleCount,
          startVelocity: 30,
          spread: 360,
          origin: {
            x: randomInRange(0.1, 0.3),
            y: Math.random() - 0.2
          },
          colors: ['#FFD700', '#FFA500', '#FF6347', '#FFE135', '#FF1744']
        });
        
        confetti({
          particleCount: particleCount,
          startVelocity: 30,
          spread: 360,
          origin: {
            x: randomInRange(0.7, 0.9),
            y: Math.random() - 0.2
          },
          colors: ['#FFD700', '#FFA500', '#FF6347', '#FFE135', '#FF1744']
        });
      }, 250);

      // Auto close after 5 seconds
      const timeout = setTimeout(() => {
        onClose();
      }, 5000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [isOpen, achievement, onClose]);

  if (!achievement) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Full screen overlay with pulse effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          >
            {/* Glowing background effect */}
            <motion.div
              className="absolute inset-0"
              animate={{
                background: [
                  "radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.3) 0%, transparent 70%)",
                  "radial-gradient(circle at 50% 50%, rgba(255, 165, 0, 0.4) 0%, transparent 70%)",
                  "radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.3) 0%, transparent 70%)",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Achievement card */}
            <motion.div
              initial={{ scale: 0, rotateY: -180 }}
              animate={{ scale: 1, rotateY: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
              className="relative z-10 max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Sparkle effects around the card */}
              <motion.div
                className="absolute -top-8 -left-8"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <Sparkles className="w-12 h-12 text-yellow-400" />
              </motion.div>
              
              <motion.div
                className="absolute -top-8 -right-8"
                animate={{
                  scale: [1.2, 1, 1.2],
                  rotate: [360, 180, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <Star className="w-10 h-10 text-orange-400" fill="currentColor" />
              </motion.div>

              <motion.div
                className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 p-1 rounded-2xl shadow-2xl"
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(255, 215, 0, 0.5)",
                    "0 0 60px rgba(255, 165, 0, 0.8)",
                    "0 0 20px rgba(255, 215, 0, 0.5)",
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="bg-card rounded-2xl p-8 text-center space-y-6">
                  {/* Trophy header */}
                  <motion.div
                    className="flex justify-center"
                    animate={{
                      y: [0, -10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <div className="relative">
                      <motion.div
                        className="absolute inset-0 bg-yellow-400/30 rounded-full blur-xl"
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.5, 0.8, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                      <Trophy className="w-20 h-20 text-yellow-500 relative z-10" />
                    </div>
                  </motion.div>

                  {/* Achievement unlocked text */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-2">
                      ¡Logro Desbloqueado!
                    </h2>
                  </motion.div>

                  {/* Achievement icon */}
                  <motion.div
                    className="text-7xl"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                    transition={{ 
                      scale: { delay: 0.5, type: "spring" },
                      rotate: { delay: 0.8, duration: 0.5 }
                    }}
                  >
                    {achievement.icon}
                  </motion.div>

                  {/* Achievement details */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-2"
                  >
                    <h3 className="text-2xl font-bold text-foreground">
                      {achievement.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {achievement.description}
                    </p>
                  </motion.div>

                  {/* Points reward */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.9, type: "spring" }}
                    className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg"
                  >
                    +{achievement.points_reward} Puntos
                  </motion.div>

                  {/* Tap to continue */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="text-sm text-muted-foreground"
                  >
                    Toca para continuar
                  </motion.p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
