import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
// Main lime mascot - additional emotions will be added later
import mascotLime from "@/assets/mascot-lime.png";
import { Sparkles, Trophy, Flame, Star, Zap, Heart } from "lucide-react";

export type MascotMood = "default" | "happy" | "sad" | "thinking" | "celebrating" | "motivated" | "sleepy" | "streak" | "level-up" | "idle";

interface MascotCompanionProps {
  points?: number;
  streak?: number;
  level?: number;
  showCelebration?: boolean;
  message?: string;
  mood?: MascotMood;
  size?: "sm" | "md" | "lg" | "xl";
  showStats?: boolean;
  className?: string;
}

// For now, all moods use the same mascot image until more are provided
const getMascotForMood = (_mood: MascotMood): string => {
  // TODO: Add more mascot images as user provides them
  return mascotLime;
};

// Size configurations
const sizeConfig = {
  sm: "w-12 h-12",
  md: "w-20 h-20",
  lg: "w-28 h-28",
  xl: "w-36 h-36",
};

// Floating particles component
const CelebrationParticles = () => {
  const particles = useMemo(() => 
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100 - 50,
      delay: Math.random() * 0.5,
      duration: 1 + Math.random() * 0.5,
      size: 8 + Math.random() * 8,
      color: ['#84CC16', '#22D3EE', '#F59E0B', '#10B981', '#A855F7'][Math.floor(Math.random() * 5)],
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
          className="w-5 h-5 text-primary fill-primary" 
          style={{ transform: `translateX(${30 + i * 5}px) translateY(-50%)` }}
        />
      </motion.div>
    ))}
  </div>
);

// Glow ring effect
const GlowRing = () => (
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
    className="absolute inset-0 rounded-full border-4 border-primary"
    style={{ margin: '-10px' }}
  />
);

// Floating hearts for happy mood
const FloatingHearts = () => (
  <div className="absolute -top-2 -right-2 pointer-events-none">
    {[...Array(3)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ y: 0, opacity: 0, scale: 0 }}
        animate={{ 
          y: [-10 - i * 10, -30 - i * 15],
          opacity: [0, 1, 0],
          scale: [0.5, 1, 0.5],
          x: [0, (i - 1) * 15],
        }}
        transition={{ 
          duration: 2,
          delay: i * 0.3,
          repeat: Infinity,
          repeatDelay: 1,
        }}
      >
        <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
      </motion.div>
    ))}
  </div>
);

export function MascotCompanion({ 
  points = 0, 
  streak = 0, 
  level = 1,
  showCelebration = false,
  message,
  mood = "default",
  size = "lg",
  showStats = true,
  className = "",
}: MascotCompanionProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentMood, setCurrentMood] = useState<MascotMood>(mood);
  const [showParticles, setShowParticles] = useState(false);

  // Get mascot image based on mood and context
  // For now uses single image, will be updated when more mascot images are provided
  const getMascotImage = () => {
    return mascotLime;
  };

  useEffect(() => {
    setCurrentMood(mood);
  }, [mood]);

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
    y: [0, -8, 0],
    rotate: [0, 2, -2, 0],
  };

  // Celebration animation
  const celebrationAnimation = {
    y: [0, -30, -15, -25, 0],
    rotate: [0, -10, 10, -5, 5, 0],
    scale: [1, 1.15, 1.1, 1.2, 1],
  };

  // Happy bounce animation
  const happyAnimation = {
    y: [0, -12, 0],
    scale: [1, 1.05, 1],
  };

  const getAnimation = () => {
    if (isAnimating) return celebrationAnimation;
    if (currentMood === "happy" || currentMood === "celebrating") return happyAnimation;
    return idleAnimation;
  };

  const getTransition = (): { duration: number; ease: "easeInOut"; repeat?: number } => {
    if (isAnimating) {
      return { duration: 1, ease: "easeInOut" };
    }
    return { 
      duration: currentMood === "happy" ? 1.5 : 3, 
      repeat: Infinity, 
      ease: "easeInOut" 
    };
  };

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      {/* Main mascot container */}
      <div className="relative">
        {/* Glow effect during celebration */}
        <AnimatePresence>
          {showCelebration && (
            <>
              <GlowRing />
              <SparkleBurst />
            </>
          )}
        </AnimatePresence>

        {/* Celebration particles */}
        <AnimatePresence>
          {showParticles && <CelebrationParticles />}
        </AnimatePresence>

        {/* Floating hearts for happy mood */}
        {(currentMood === "happy" || currentMood === "celebrating") && !showCelebration && (
          <FloatingHearts />
        )}

        {/* Mascot image with animation */}
        <motion.div
          animate={getAnimation()}
          transition={getTransition()}
          className="relative z-10"
        >
          <motion.img 
            key={getMascotImage()}
            src={getMascotImage()} 
            alt="Chefly mascot"
            className={`${sizeConfig[size]} object-contain drop-shadow-xl`}
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
                  <Sparkles className="w-8 h-8 text-accent" />
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
              scale: [1, 1.2, 1],
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

        {/* Z's for sleepy mood */}
        {currentMood === "sleepy" && (
          <motion.div
            className="absolute -top-2 -right-2 text-lg font-bold text-primary/60"
            animate={{ 
              y: [0, -10, -20],
              opacity: [0, 1, 0],
              x: [0, 5, 10],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
            }}
          >
            Z
          </motion.div>
        )}

        {/* Thinking bubbles */}
        {currentMood === "thinking" && (
          <div className="absolute -top-2 -right-2">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute bg-primary/20 rounded-full"
                style={{
                  width: 6 + i * 4,
                  height: 6 + i * 4,
                  top: -i * 8,
                  right: -i * 6,
                }}
                animate={{ 
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.1, 1],
                }}
                transition={{ 
                  duration: 1.5,
                  delay: i * 0.2,
                  repeat: Infinity,
                }}
              />
            ))}
          </div>
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
            <div className="bg-gradient-to-r from-primary to-secondary text-primary-foreground px-4 py-2 rounded-2xl text-sm font-bold whitespace-nowrap shadow-lg border-2 border-primary-foreground/20">
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

      {/* Stats badges */}
      {showStats && (
        <div className="flex gap-2 mt-4 justify-center">
          <motion.div 
            className="flex items-center gap-1.5 bg-accent/20 text-accent px-3 py-1.5 rounded-xl text-sm font-bold border-2 border-accent/30"
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
      )}
    </div>
  );
}

// Export a simpler version for use in various places
export function SimpleMascot({ 
  mood = "default", 
  size = "md",
  className = "",
}: { 
  mood?: MascotMood; 
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  return (
    <MascotCompanion 
      mood={mood} 
      size={size} 
      showStats={false} 
      className={className}
    />
  );
}
