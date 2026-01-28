import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Zap, Sparkles } from 'lucide-react';
import { useXPAnimation, XPGain } from '@/contexts/XPAnimationContext';

const typeConfig = {
  food: { icon: Zap, color: 'text-primary', bgColor: 'bg-primary/20' },
  meal: { icon: Star, color: 'text-emerald-400', bgColor: 'bg-emerald-400/20' },
  challenge: { icon: Sparkles, color: 'text-purple-400', bgColor: 'bg-purple-400/20' },
  streak: { icon: Zap, color: 'text-orange-400', bgColor: 'bg-orange-400/20' },
  achievement: { icon: Star, color: 'text-yellow-400', bgColor: 'bg-yellow-400/20' },
};

const XPFloater: React.FC<{ gain: XPGain; onComplete: () => void }> = ({ gain, onComplete }) => {
  const config = typeConfig[gain.type];
  const Icon = config.icon;

  useEffect(() => {
    const timer = setTimeout(onComplete, 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        scale: 0.3, 
        x: gain.x, 
        y: gain.y,
        rotate: -10,
      }}
      animate={{ 
        opacity: [0, 1, 1, 0.8, 0], 
        scale: [0.3, 1.3, 1.1, 1, 0.9],
        y: gain.y - 100,
        x: gain.x + (Math.random() > 0.5 ? 15 : -15), // Slight curve
        rotate: [10, -5, 0],
      }}
      exit={{ opacity: 0 }}
      transition={{ 
        duration: 1.4,
        times: [0, 0.15, 0.4, 0.7, 1],
        ease: "easeOut",
      }}
      className="fixed pointer-events-none z-[9999]"
      style={{ left: 0, top: 0 }}
    >
      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${config.bgColor} backdrop-blur-sm border border-white/20 shadow-lg`}>
        <motion.div
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Icon className={`w-4 h-4 ${config.color}`} />
        </motion.div>
        <motion.span 
          className={`font-bold text-sm ${config.color}`}
          initial={{ scale: 0.8 }}
          animate={{ scale: [0.8, 1.2, 1] }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          +{gain.amount}
        </motion.span>
      </div>
      
      {/* Trailing particles */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0, 0.8, 0],
            scale: [0, 0.6, 0],
            y: [0, -20 - i * 10],
            x: [0, (i - 1) * 8],
          }}
          transition={{ 
            duration: 0.8,
            delay: 0.2 + i * 0.1,
            ease: "easeOut",
          }}
          className={`absolute w-2 h-2 rounded-full ${config.bgColor}`}
          style={{ left: '50%', top: '50%' }}
        />
      ))}
    </motion.div>
  );
};

export const XPGainAnimation: React.FC = () => {
  const { gains, removeGain } = useXPAnimation();

  return (
    <AnimatePresence>
      {gains.map(gain => (
        <XPFloater 
          key={gain.id} 
          gain={gain} 
          onComplete={() => removeGain(gain.id)} 
        />
      ))}
    </AnimatePresence>
  );
};

export default XPGainAnimation;
