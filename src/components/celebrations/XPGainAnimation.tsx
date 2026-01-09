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
        scale: 0.5, 
        x: gain.x, 
        y: gain.y,
      }}
      animate={{ 
        opacity: [0, 1, 1, 0], 
        scale: [0.5, 1.2, 1, 0.8],
        y: gain.y - 80,
      }}
      exit={{ opacity: 0 }}
      transition={{ 
        duration: 1.2,
        times: [0, 0.2, 0.7, 1],
        ease: "easeOut",
      }}
      className="fixed pointer-events-none z-[9999]"
      style={{ left: 0, top: 0 }}
    >
      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${config.bgColor} backdrop-blur-sm border border-white/10 shadow-lg`}>
        <Icon className={`w-4 h-4 ${config.color}`} />
        <span className={`font-bold text-sm ${config.color}`}>
          +{gain.amount}
        </span>
      </div>
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
