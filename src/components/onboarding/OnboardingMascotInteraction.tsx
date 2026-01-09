import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import mascotHappy from '@/assets/mascot-happy.png';
import mascotHealth from '@/assets/mascot-health.png';
import mascotScience from '@/assets/mascot-science.png';
import mascotStrong from '@/assets/mascot-strong.png';

export type MascotPose = 'default' | 'happy' | 'health' | 'science' | 'strong' | 'celebrating';

interface OnboardingMascotInteractionProps {
  message: string;
  pose?: MascotPose;
  size?: 'small' | 'medium' | 'large';
  showCelebration?: boolean;
  className?: string;
  onContinue?: () => void;
  continueLabel?: string;
}

const mascotImages: Record<MascotPose, string> = {
  default: mascotHappy,
  happy: mascotHappy,
  health: mascotHealth,
  science: mascotScience,
  strong: mascotStrong,
  celebrating: mascotStrong,
};

const sizeConfig = {
  small: { container: "w-24 h-24", image: "w-20 h-20" },
  medium: { container: "w-32 h-32", image: "w-28 h-28" },
  large: { container: "w-40 h-40", image: "w-36 h-36" },
};

export const OnboardingMascotInteraction: React.FC<OnboardingMascotInteractionProps> = ({
  message,
  pose = 'default',
  size = 'medium',
  showCelebration = false,
  className = "",
  onContinue,
  continueLabel = "Siguiente",
}) => {
  const [displayedMessage, setDisplayedMessage] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  // Typewriter effect
  useEffect(() => {
    setDisplayedMessage("");
    setIsTyping(true);
    
    let i = 0;
    const typeInterval = setInterval(() => {
      if (i < message.length) {
        setDisplayedMessage(message.slice(0, i + 1));
        i++;
      } else {
        setIsTyping(false);
        clearInterval(typeInterval);
      }
    }, 25);

    return () => clearInterval(typeInterval);
  }, [message]);

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {/* Speech Bubble */}
      <AnimatePresence mode="wait">
        <motion.div
          key={message}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="relative max-w-xs mx-auto"
        >
          <div className="bg-card border border-border/50 rounded-2xl px-5 py-4 shadow-lg">
            <p className="text-center text-foreground font-medium leading-relaxed">
              {displayedMessage}
              {isTyping && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="inline-block w-0.5 h-4 bg-primary ml-0.5 align-middle"
                />
              )}
            </p>
          </div>
          {/* Speech bubble pointer */}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-4 h-4 bg-card border-r border-b border-border/50 rotate-45" />
        </motion.div>
      </AnimatePresence>

      {/* Mascot */}
      <motion.div
        className={`relative ${sizeConfig[size].container} flex items-center justify-center`}
        animate={showCelebration ? {
          y: [0, -10, 0],
          rotate: [0, -5, 5, 0],
        } : { y: [0, -5, 0] }}
        transition={showCelebration ? {
          duration: 0.5,
          repeat: 2,
        } : {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Glow effect */}
        {showCelebration && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.2, opacity: [0, 0.5, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="absolute inset-0 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-full blur-xl"
          />
        )}
        
        <motion.img
          key={pose}
          src={mascotImages[pose]}
          alt="Chefly mascot"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className={`${sizeConfig[size].image} object-contain drop-shadow-lg`}
        />

        {/* Celebration particles */}
        {showCelebration && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: 0, 
                  y: 0, 
                  opacity: 1, 
                  scale: 0 
                }}
                animate={{ 
                  x: (Math.random() - 0.5) * 100,
                  y: -50 - Math.random() * 50,
                  opacity: 0,
                  scale: 1,
                }}
                transition={{ 
                  duration: 1,
                  delay: i * 0.1,
                  repeat: Infinity,
                  repeatDelay: 0.5,
                }}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  background: i % 2 === 0 
                    ? 'hsl(var(--primary))' 
                    : 'hsl(var(--secondary))',
                }}
              />
            ))}
          </>
        )}
      </motion.div>

      {/* Continue Button */}
      {onContinue && !isTyping && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="mt-6"
        >
          <Button 
            onClick={onContinue}
            size="lg"
            className="gap-2 px-8"
          >
            {continueLabel}
            <ChevronRight className="w-5 h-5" />
          </Button>
        </motion.div>
      )}
    </div>
  );
};
