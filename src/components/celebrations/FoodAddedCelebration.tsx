import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Plus, Sparkles, Star } from 'lucide-react';
import mascotCelebrating from '@/assets/mascot-celebrating.png';

interface FoodAddedCelebrationProps {
  show: boolean;
  foodName?: string;
  calories?: number;
  points?: number;
  onComplete?: () => void;
}

const FloatingPoints: React.FC<{ points: number; index: number }> = ({ points, index }) => {
  const angle = (index * 60) + Math.random() * 30;
  const distance = 30 + Math.random() * 20;
  const x = Math.cos((angle * Math.PI) / 180) * distance;
  const y = Math.sin((angle * Math.PI) / 180) * distance - 30;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, x: 0, y: 0 }}
      animate={{ 
        opacity: [0, 1, 1, 0], 
        scale: [0.5, 1.2, 1, 0.8],
        x,
        y,
      }}
      transition={{ 
        duration: 0.8, 
        delay: 0.1 + index * 0.05,
        times: [0, 0.2, 0.7, 1],
      }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary font-bold text-sm whitespace-nowrap"
    >
      +{points}
    </motion.div>
  );
};

const MiniSparkle: React.FC<{ index: number }> = ({ index }) => {
  const angle = (index * 45) + Math.random() * 20;
  const distance = 25 + Math.random() * 15;
  const x = Math.cos((angle * Math.PI) / 180) * distance;
  const y = Math.sin((angle * Math.PI) / 180) * distance;
  
  const colors = ['text-yellow-400', 'text-emerald-400', 'text-primary'];
  const color = colors[index % colors.length];
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, x: 0, y: 0, rotate: 0 }}
      animate={{ 
        opacity: [0, 1, 0], 
        scale: [0, 1, 0],
        x,
        y,
        rotate: 360,
      }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.03,
      }}
      className={`absolute top-1/2 left-1/2 ${color}`}
    >
      {index % 2 === 0 ? (
        <Star className="w-2 h-2 fill-current" />
      ) : (
        <Sparkles className="w-2 h-2" />
      )}
    </motion.div>
  );
};

export const FoodAddedCelebration: React.FC<FoodAddedCelebrationProps> = ({
  show,
  foodName,
  calories,
  points = 10,
  onComplete,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center"
        >
          {/* Central celebration */}
          <motion.div
            initial={{ scale: 0, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, y: -50 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="relative"
          >
            {/* Glow ring */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [0.8, 1.5, 2], opacity: [0.6, 0.3, 0] }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 -m-8 rounded-full bg-primary/30"
            />
            
            {/* Sparkles */}
            {[...Array(8)].map((_, i) => (
              <MiniSparkle key={i} index={i} />
            ))}
            
            {/* Points floating */}
            {[...Array(3)].map((_, i) => (
              <FloatingPoints key={i} points={points} index={i} />
            ))}
            
            {/* Main icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.4, times: [0, 0.6, 1] }}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/30"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
              >
                <Check className="w-8 h-8 text-primary-foreground" strokeWidth={3} />
              </motion.div>
            </motion.div>
            
            {/* Food name badge */}
            {foodName && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap"
              >
                <div className="bg-card/90 backdrop-blur px-4 py-2 rounded-full shadow-lg border border-border">
                  <span className="text-sm font-medium text-foreground">
                    {foodName}
                  </span>
                  {calories && (
                    <span className="text-xs text-muted-foreground ml-2">
                      {calories} kcal
                    </span>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FoodAddedCelebration;
