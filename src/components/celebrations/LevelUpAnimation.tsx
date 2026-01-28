import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Sparkles, Trophy, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useHaptics } from '@/hooks/useHaptics';
import mascotCelebrating from '@/assets/mascot-celebrating.png';

interface LevelUpAnimationProps {
  show: boolean;
  level: number;
  onComplete: () => void;
}

export function LevelUpAnimation({ show, level, onComplete }: LevelUpAnimationProps) {
  const { celebrationPattern } = useHaptics();

  useEffect(() => {
    if (show) {
      // Trigger haptic feedback
      celebrationPattern();
      
      // Fire confetti
      const duration = 3000;
      const end = Date.now() + duration;

      const colors = ['#A3E635', '#22D3EE', '#FBBF24', '#F472B6'];

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();

      // Auto-complete after animation
      const timer = setTimeout(onComplete, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, celebrationPattern, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={onComplete}
        >
          {/* Radial glow background */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 0.4 }}
            transition={{ duration: 0.5 }}
            className="absolute w-96 h-96 rounded-full bg-gradient-radial from-primary/50 via-primary/20 to-transparent"
          />

          {/* Floating particles */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                opacity: 0, 
                scale: 0,
                x: 0,
                y: 0,
              }}
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0, 1, 0.5],
                x: Math.cos((i / 12) * Math.PI * 2) * 150,
                y: Math.sin((i / 12) * Math.PI * 2) * 150,
              }}
              transition={{ 
                duration: 2,
                delay: i * 0.1,
                repeat: Infinity,
                repeatDelay: 1,
              }}
              className="absolute"
            >
              {i % 3 === 0 ? (
                <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
              ) : i % 3 === 1 ? (
                <Sparkles className="w-5 h-5 text-primary" />
              ) : (
                <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
              )}
            </motion.div>
          ))}

          {/* Main content */}
          <motion.div
            initial={{ scale: 0, rotateY: -180 }}
            animate={{ scale: 1, rotateY: 0 }}
            transition={{ 
              type: 'spring',
              stiffness: 200,
              damping: 15,
              delay: 0.2,
            }}
            className="relative flex flex-col items-center gap-4"
          >
            {/* Trophy icon */}
            <motion.div
              animate={{ 
                y: [0, -8, 0],
                rotateZ: [-3, 3, -3],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 flex items-center justify-center shadow-[0_0_40px_rgba(251,191,36,0.5)]">
                <Trophy className="w-12 h-12 text-white" strokeWidth={2.5} />
              </div>
              
              {/* Ring pulse effect */}
              <motion.div
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 1.8, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 rounded-full border-4 border-yellow-400"
              />
            </motion.div>

            {/* Level text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center"
            >
              <p className="text-lg font-medium text-primary mb-1">
                ¡SUBISTE DE NIVEL!
              </p>
              <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: [0.5, 1.2, 1] }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="text-6xl font-black text-white drop-shadow-[0_4px_12px_rgba(163,230,53,0.5)]"
              >
                {level}
              </motion.div>
            </motion.div>

            {/* Mascot */}
            <motion.img
              src={mascotCelebrating}
              alt="Chefly celebrando"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="w-20 h-20 object-contain"
            />

            {/* Tap to continue */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.5, 1] }}
              transition={{ delay: 2, duration: 1.5, repeat: Infinity }}
              className="text-sm text-muted-foreground mt-4"
            >
              Toca para continuar
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default LevelUpAnimation;
