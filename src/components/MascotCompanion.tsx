import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import mascotDefault from "@/assets/chefly-mascot.png";
import mascotFlexing from "@/assets/mascot-flexing.png";
import mascotFire from "@/assets/mascot-fire.png";
import mascotCooking from "@/assets/mascot-cooking.png";
import mascotGaming from "@/assets/mascot-gaming.png";
import mascotWorking from "@/assets/mascot-working.png";
import mascotMoney from "@/assets/mascot-money.png";
import { Sparkles, Trophy, Flame, Star, Zap } from "lucide-react";

type MascotMood = "default" | "celebrating" | "cooking" | "streak" | "level-up" | "idle";

interface MascotCompanionProps {
  points: number;
  streak: number;
  level: number;
  showCelebration?: boolean;
  message?: string;
  mood?: MascotMood;
}

// Floating particles component
const CelebrationParticles = () => {
  const particles = useMemo(() => 
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100 - 50,
      delay: Math.random() * 0.5,
      duration: 1 + Math.random() * 0.5,
      size: 8 + Math.random() * 8,
      color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#FF9F43', '#A55EEA'][Math.floor(Math.random() * 5)],
    }))
  , []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{ 
            opacity: 0, 
            y: 0, 
            x: particle.x,
            scale: 0 
          }}
          animate={{ 
            opacity: [0, 1, 1, 0], 
            y: -80, 
            scale: [0, 1.2, 1, 0.5],
            rotate: [0, 180, 360],
          }}
          transition={{ 
            duration: particle.duration, 
            delay: particle.delay,
            ease: "easeOut" 
          }}
          style={{
            position: 'absolute',
            left: '50%',
            bottom: '60%',
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            borderRadius: particle.id % 2 === 0 ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  );
};

// Sparkle burst component
const SparkleBurst = () => (
  <div className="absolute inset-0 pointer-events-none">
    {[...Array(6)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: [0, 1.5, 0],
          opacity: [0, 1, 0],
          rotate: i * 60,
        }}
        transition={{ 
          duration: 0.8, 
          delay: i * 0.1,
          ease: "easeOut" 
        }}
        className="absolute top-1/2 left-1/2"
        style={{ transformOrigin: 'center' }}
      >
        <Star 
          className="w-5 h-5 text-yellow-400 fill-yellow-400" 
          style={{ transform: `translateX(${30 + i * 5}px) translateY(-50%)` }}
        />
      </motion.div>
    ))}
  </div>
);

// Glow ring effect
const GlowRing = ({ color = "primary" }: { color?: string }) => (
  <motion.div
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ 
      scale: [0.8, 1.3, 1.5],
      opacity: [0.8, 0.4, 0],
    }}
    transition={{ 
      duration: 1,
      repeat: 2,
      ease: "easeOut" 
    }}
    className={`absolute inset-0 rounded-full border-4 ${
      color === "primary" ? "border-primary" : "border-yellow-400"
    }`}
    style={{ margin: '-10px' }}
  />
);

export function MascotCompanion({ 
  points, 
  streak, 
  level,
  showCelebration = false,
  message,
  mood = "default"
}: MascotCompanionProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentMood, setCurrentMood] = useState<MascotMood>(mood);
  const [showParticles, setShowParticles] = useState(false);

  // Select mascot image based on mood/context
  const getMascotImage = () => {
    if (showCelebration) return mascotFire;
    if (streak >= 7) return mascotFire;
    if (currentMood === "cooking") return mascotCooking;
    if (currentMood === "level-up") return mascotFlexing;
    if (currentMood === "streak") return mascotFire;
    
    // Rotate through idle variations
    const idleVariations = [mascotDefault, mascotCooking, mascotGaming, mascotWorking];
    const hourOfDay = new Date().getHours();
    return idleVariations[hourOfDay % idleVariations.length];
  };

  useEffect(() => {
    if (showCelebration) {
      setIsAnimating(true);
      setShowParticles(true);
      setCurrentMood("celebrating");
      
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setShowParticles(false);
        setCurrentMood(mood);
      }, 2500);
      
      return () => clearTimeout(timer);
    }
  }, [showCelebration, mood]);

  // Idle floating animation
  const idleAnimation = {
    y: [0, -5, 0],
    rotate: [0, 1, -1, 0],
  };

  // Celebration animation - more elaborate
  const celebrationAnimation = {
    y: [0, -30, -15, -25, 0],
    rotate: [0, -10, 10, -5, 5, 0],
    scale: [1, 1.15, 1.1, 1.2, 1],
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Main mascot container */}
      <div className="relative">
        {/* Glow effect during celebration */}
        <AnimatePresence>
          {showCelebration && (
            <>
              <GlowRing color="primary" />
              <SparkleBurst />
            </>
          )}
        </AnimatePresence>

        {/* Celebration particles */}
        <AnimatePresence>
          {showParticles && <CelebrationParticles />}
        </AnimatePresence>

        {/* Mascot image with animation */}
        <motion.div
          animate={isAnimating ? celebrationAnimation : idleAnimation}
          transition={isAnimating ? {
            duration: 1,
            ease: "easeInOut",
          } : {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative z-10"
        >
          <motion.img 
            key={getMascotImage()}
            src={getMascotImage()} 
            alt="Chefly mascot"
            className="w-24 h-24 md:w-32 md:h-32 object-contain drop-shadow-xl"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Celebration sparkles */}
          <AnimatePresence>
            {showCelebration && (
              <>
                <motion.div
                  initial={{ scale: 0, opacity: 0, rotate: 0 }}
                  animate={{ 
                    scale: [0, 1.2, 1],
                    opacity: 1,
                    rotate: [0, 15, -15, 0],
                  }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.5, repeat: 3 }}
                  className="absolute -top-2 -right-2"
                >
                  <Sparkles className="w-8 h-8 text-yellow-400" />
                </motion.div>
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: [0, 1.2, 1],
                    opacity: 1,
                  }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.5, delay: 0.2, repeat: 3 }}
                  className="absolute -top-1 -left-3"
                >
                  <Zap className="w-6 h-6 text-primary fill-primary" />
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1, 0] }}
                  transition={{ duration: 0.8, delay: 0.3, repeat: 2 }}
                  className="absolute bottom-0 -right-4"
                >
                  <Star className="w-5 h-5 text-secondary fill-secondary" />
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Streak fire effect for high streaks */}
        {streak >= 3 && !showCelebration && (
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-2xl"
          >
            🔥
          </motion.div>
        )}
      </div>

      {/* Speech bubble message */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 10 }}
            className="absolute -bottom-14 left-1/2 transform -translate-x-1/2 z-20"
          >
            <div className="bg-gradient-to-r from-primary to-primary-hover text-primary-foreground px-4 py-2 rounded-2xl text-sm font-bold whitespace-nowrap shadow-lg border-2 border-primary-foreground/20">
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {message}
              </motion.span>
            </div>
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-primary" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats badges - Duolingo style */}
      <div className="flex gap-2 mt-4 justify-center">
        <motion.div 
          className="flex items-center gap-1.5 bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 px-3 py-1.5 rounded-xl text-sm font-bold border-2 border-yellow-500/30"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Trophy className="w-4 h-4" />
          <span>{points}</span>
        </motion.div>
        <motion.div 
          className="flex items-center gap-1.5 bg-primary/20 text-primary px-3 py-1.5 rounded-xl text-sm font-bold border-2 border-primary/30"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={streak >= 3 ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <Flame className="w-4 h-4" />
          <span>{streak}</span>
        </motion.div>
      </div>
    </div>
  );
}
