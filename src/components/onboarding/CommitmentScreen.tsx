import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useHaptics } from '@/hooks/useHaptics';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import mascotStrong from '@/assets/mascot-strong.png';

const HOLD_DURATION_MS = 1500; // 1.5 seconds
const TICK_INTERVAL_MS = 50;
const HAPTIC_INTERVAL_MS = 300;

export const CommitmentScreen: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { lightImpact, mediumImpact, successNotification, celebrationPattern } = useHaptics();
  
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hapticIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastHapticAt = useRef(0);
  
  // Get user name from localStorage
  const userName = (() => {
    try {
      const stored = localStorage.getItem('chefly_pre_onboarding');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.name || 'Usuario';
      }
    } catch {
      return 'Usuario';
    }
    return 'Usuario';
  })();

  const texts = {
    es: {
      title: `${userName}, ¿te comprometes a lograr tu meta?`,
      button: 'Sí, me comprometo',
      holdHint: 'Mantén presionado',
      loading: 'Creando tu plan personalizado con IA...',
    },
    en: {
      title: `${userName}, do you commit to reaching your goal?`,
      button: 'Yes, I commit',
      holdHint: 'Hold to confirm',
      loading: 'Creating your personalized AI plan...',
    },
  };

  const currentTexts = language === 'en' ? texts.en : texts.es;

  // Fire confetti celebration
  const fireConfetti = useCallback(() => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  }, []);

  // Complete the commitment
  const handleComplete = useCallback(async () => {
    setIsCompleted(true);
    
    // Haptic feedback
    await successNotification();
    await celebrationPattern();
    
    // Fire confetti
    fireConfetti();
    
    // Show loader after celebration
    setTimeout(() => {
      setShowLoader(true);
    }, 1000);
    
    // Navigate to trial roulette flow
    setTimeout(() => {
      navigate('/trial-roulette', { replace: true });
    }, 3000);
  }, [navigate, successNotification, celebrationPattern, fireConfetti]);

  // Start holding
  const startHold = useCallback(() => {
    if (isCompleted) return;
    
    setIsHolding(true);
    lastHapticAt.current = Date.now();
    lightImpact();
    
    const progressIncrement = (100 / (HOLD_DURATION_MS / TICK_INTERVAL_MS));
    
    intervalRef.current = setInterval(() => {
      setProgress(prev => {
        const newProgress = Math.min(prev + progressIncrement, 100);
        
        // Haptic feedback at intervals
        const now = Date.now();
        if (now - lastHapticAt.current >= HAPTIC_INTERVAL_MS) {
          if (newProgress >= 50 && prev < 50) {
            mediumImpact();
          } else {
            lightImpact();
          }
          lastHapticAt.current = now;
        }
        
        // Complete when reaching 100%
        if (newProgress >= 100) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          handleComplete();
        }
        
        return newProgress;
      });
    }, TICK_INTERVAL_MS);
  }, [isCompleted, lightImpact, mediumImpact, handleComplete]);

  // Stop holding
  const stopHold = useCallback(() => {
    if (isCompleted) return;
    
    setIsHolding(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Reset progress if not completed
    if (progress < 100) {
      setProgress(0);
    }
  }, [isCompleted, progress]);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (hapticIntervalRef.current) clearInterval(hapticIntervalRef.current);
    };
  }, []);

  // SVG circle calculations
  const size = 200;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-gradient-to-br from-background via-background to-primary/5 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-40 right-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10">
        <AnimatePresence mode="wait">
          {!isCompleted ? (
            <motion.div
              key="commitment"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center text-center"
            >
              {/* Mascot */}
              <motion.img
                src={mascotStrong}
                alt="Chefly mascot"
                className="w-32 h-32 object-contain mb-6"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Title */}
              <motion.h1
                className="text-2xl md:text-3xl font-bold text-foreground mb-2 max-w-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {currentTexts.title}
              </motion.h1>

              <motion.p
                className="text-muted-foreground text-sm mb-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {currentTexts.holdHint}
              </motion.p>

              {/* Long Press Button with Circular Progress */}
              <motion.div
                className="relative cursor-pointer select-none touch-none"
                animate={{
                  scale: isHolding ? 1.05 : 1,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                onMouseDown={startHold}
                onMouseUp={stopHold}
                onMouseLeave={stopHold}
                onTouchStart={startHold}
                onTouchEnd={stopHold}
              >
                {/* Glow effect */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-primary/30 blur-xl"
                  animate={{
                    opacity: isHolding ? 0.8 : 0,
                    scale: isHolding ? 1.3 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                />

                {/* SVG Progress Circle */}
                <svg
                  width={size}
                  height={size}
                  className="transform -rotate-90"
                >
                  {/* Background circle */}
                  <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth={strokeWidth}
                    className="opacity-30"
                  />
                  {/* Progress circle */}
                  <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="url(#progressGradient)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-75"
                  />
                  {/* Gradient definition */}
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="hsl(var(--primary))" />
                      <stop offset="100%" stopColor="hsl(188, 100%, 50%)" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Button content inside circle */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    className={cn(
                      "w-40 h-40 rounded-full flex items-center justify-center",
                      "bg-gradient-to-br from-primary to-primary/80",
                      "shadow-lg shadow-primary/30",
                      "text-primary-foreground font-bold text-center px-4"
                    )}
                    animate={{
                      boxShadow: isHolding 
                        ? "0 0 40px rgba(163, 230, 53, 0.6)" 
                        : "0 10px 25px rgba(163, 230, 53, 0.3)",
                    }}
                  >
                    <span className="text-base leading-tight">
                      {currentTexts.button}
                    </span>
                  </motion.div>
                </div>
              </motion.div>

              {/* Progress percentage */}
              {isHolding && progress > 0 && (
                <motion.p
                  className="mt-6 text-2xl font-bold text-primary"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {Math.round(progress)}%
                </motion.p>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="completed"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center"
            >
              {!showLoader ? (
                <>
                  {/* Success Checkmark */}
                  <motion.div
                    className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-6 shadow-lg shadow-primary/40"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  >
                    <Check className="w-16 h-16 text-primary-foreground" strokeWidth={3} />
                  </motion.div>
                  
                  <motion.h2
                    className="text-2xl font-bold text-foreground"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    ¡Excelente! 🎉
                  </motion.h2>
                </>
              ) : (
                <>
                  {/* Loading state */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center"
                  >
                    <div className="relative mb-6">
                      <Loader2 className="w-16 h-16 text-primary animate-spin" />
                    </div>
                    <p className="text-lg text-foreground font-medium max-w-xs">
                      {currentTexts.loading}
                    </p>
                  </motion.div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Safe area padding for iOS */}
      <div className="h-safe-area-bottom" />
    </div>
  );
};

export default CommitmentScreen;
