import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import mascotImage from "@/assets/chefly-mascot.png";
import { Sparkles, Trophy, Flame } from "lucide-react";

interface MascotCompanionProps {
  points: number;
  streak: number;
  level: number;
  showCelebration?: boolean;
  message?: string;
}

export function MascotCompanion({ 
  points, 
  streak, 
  level,
  showCelebration = false,
  message 
}: MascotCompanionProps) {
  const [isJumping, setIsJumping] = useState(false);

  useEffect(() => {
    if (showCelebration) {
      setIsJumping(true);
      setTimeout(() => setIsJumping(false), 1000);
    }
  }, [showCelebration]);

  return (
    <div className="relative">
      <motion.div
        animate={isJumping ? {
          y: [0, -20, 0],
          rotate: [0, 5, -5, 0],
        } : {}}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <img 
          src={mascotImage} 
          alt="Chefly mascot"
          className="w-24 h-24 md:w-32 md:h-32 object-contain drop-shadow-lg"
        />
        
        {showCelebration && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute -top-2 -right-2"
          >
            <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
          </motion.div>
        )}
      </motion.div>

      {message && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg"
        >
          {message}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-primary" />
        </motion.div>
      )}

      <div className="flex gap-2 mt-4 justify-center">
        <div className="flex items-center gap-1 bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 px-3 py-1 rounded-full text-sm font-semibold">
          <Trophy className="w-4 h-4" />
          {points}
        </div>
        <div className="flex items-center gap-1 bg-orange-500/20 text-orange-700 dark:text-orange-400 px-3 py-1 rounded-full text-sm font-semibold">
          <Flame className="w-4 h-4" />
          {streak}
        </div>
      </div>
    </div>
  );
}
