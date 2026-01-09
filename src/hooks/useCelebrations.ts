import { useCallback, useRef } from 'react';
import { useMascot, CelebrationType } from '@/contexts/MascotContext';
import { useCelebrationSounds } from '@/hooks/useCelebrationSounds';
import { useHaptics } from '@/hooks/useHaptics';
import confetti from 'canvas-confetti';

export type CelebrationIntensity = 'small' | 'medium' | 'epic';

interface CelebrationOptions {
  message?: string;
  intensity?: CelebrationIntensity;
  skipSound?: boolean;
  skipHaptic?: boolean;
  skipConfetti?: boolean;
  skipMascot?: boolean;
}

const confettiPresets: Record<CelebrationType, Partial<confetti.Options>> = {
  meal_complete: {
    colors: ['#22c55e', '#10b981', '#84cc16'],
    particleCount: 30,
    spread: 60,
  },
  challenge_complete: {
    colors: ['#a855f7', '#ec4899', '#d946ef'],
    particleCount: 60,
    spread: 80,
  },
  streak_milestone: {
    colors: ['#f97316', '#f59e0b', '#eab308'],
    particleCount: 80,
    spread: 100,
  },
  daily_goal: {
    colors: ['#3b82f6', '#06b6d4', '#0ea5e9'],
    particleCount: 100,
    spread: 120,
  },
  achievement: {
    colors: ['#eab308', '#fbbf24', '#f59e0b'],
    particleCount: 120,
    spread: 140,
  },
  shopping_complete: {
    colors: ['#14b8a6', '#10b981', '#22c55e'],
    particleCount: 40,
    spread: 60,
  },
  generic: {
    colors: ['#8b5cf6', '#a78bfa', '#c4b5fd'],
    particleCount: 50,
    spread: 70,
  },
};

export const useCelebrations = () => {
  const { triggerCelebration: triggerMascotCelebration } = useMascot();
  const { playCelebrationSound } = useCelebrationSounds();
  const { 
    successNotification, 
    celebrationPattern, 
    lightImpact, 
    mediumImpact, 
    heavyImpact 
  } = useHaptics();
  
  // Queue for celebrations to prevent overlap
  const celebrationQueue = useRef<Array<() => void>>([]);
  const isProcessing = useRef(false);

  const processQueue = useCallback(() => {
    if (isProcessing.current || celebrationQueue.current.length === 0) return;
    
    isProcessing.current = true;
    const next = celebrationQueue.current.shift();
    if (next) {
      next();
      // Allow next celebration after delay
      setTimeout(() => {
        isProcessing.current = false;
        processQueue();
      }, 800);
    }
  }, []);

  const fireConfetti = useCallback((type: CelebrationType, intensity: CelebrationIntensity) => {
    const preset = confettiPresets[type];
    const multiplier = intensity === 'epic' ? 2 : intensity === 'medium' ? 1 : 0.5;
    
    const defaults: confetti.Options = {
      origin: { y: 0.7 },
      zIndex: 9999,
      disableForReducedMotion: true,
    };

    if (intensity === 'epic') {
      // Epic celebration: multiple bursts
      const duration = 2000;
      const animationEnd = Date.now() + duration;
      
      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
          return clearInterval(interval);
        }
        
        const particleCount = Math.floor(50 * (timeLeft / duration));
        
        confetti({
          ...defaults,
          ...preset,
          particleCount,
          origin: { x: Math.random(), y: Math.random() * 0.4 },
        });
      }, 250);
    } else {
      // Regular celebration
      confetti({
        ...defaults,
        ...preset,
        particleCount: Math.floor((preset.particleCount || 50) * multiplier),
      });
      
      if (intensity === 'medium') {
        setTimeout(() => {
          confetti({
            ...defaults,
            ...preset,
            particleCount: Math.floor((preset.particleCount || 50) * multiplier * 0.5),
            origin: { x: 0.3, y: 0.7 },
          });
          confetti({
            ...defaults,
            ...preset,
            particleCount: Math.floor((preset.particleCount || 50) * multiplier * 0.5),
            origin: { x: 0.7, y: 0.7 },
          });
        }, 150);
      }
    }
  }, []);

  const triggerHaptic = useCallback((intensity: CelebrationIntensity) => {
    switch (intensity) {
      case 'epic':
        celebrationPattern();
        break;
      case 'medium':
        successNotification();
        break;
      case 'small':
        lightImpact();
        break;
    }
  }, [celebrationPattern, successNotification, lightImpact]);

  const celebrate = useCallback((
    type: CelebrationType,
    options: CelebrationOptions = {}
  ) => {
    const {
      message,
      intensity = 'medium',
      skipSound = false,
      skipHaptic = false,
      skipConfetti = false,
      skipMascot = false,
    } = options;

    const executeCelebration = () => {
      // Sound
      if (!skipSound) {
        playCelebrationSound(type, intensity);
      }
      
      // Haptic
      if (!skipHaptic) {
        triggerHaptic(intensity);
      }
      
      // Confetti
      if (!skipConfetti && intensity !== 'small') {
        fireConfetti(type, intensity);
      }
      
      // Mascot
      if (!skipMascot) {
        triggerMascotCelebration(message, type, intensity);
      }
    };

    celebrationQueue.current.push(executeCelebration);
    processQueue();
  }, [playCelebrationSound, triggerHaptic, fireConfetti, triggerMascotCelebration, processQueue]);

  // Convenience methods for common celebrations
  const celebrateMealComplete = useCallback((mealName?: string) => {
    celebrate('meal_complete', {
      message: mealName ? `¡${mealName} completado! 🍽️` : '¡Comida registrada! 🍽️',
      intensity: 'medium',
    });
  }, [celebrate]);

  const celebrateChallengeComplete = useCallback((challengeName?: string) => {
    celebrate('challenge_complete', {
      message: challengeName ? `¡${challengeName} completado! 🏆` : '¡Reto completado! 🏆',
      intensity: 'epic',
    });
  }, [celebrate]);

  const celebrateStreakMilestone = useCallback((streak: number) => {
    const intensity: CelebrationIntensity = streak >= 30 ? 'epic' : streak >= 7 ? 'medium' : 'small';
    celebrate('streak_milestone', {
      message: `🔥 ¡${streak} días de racha! 🔥`,
      intensity,
    });
  }, [celebrate]);

  const celebrateDailyGoal = useCallback(() => {
    celebrate('daily_goal', {
      message: '🎯 ¡Meta diaria alcanzada! 🎯',
      intensity: 'epic',
    });
  }, [celebrate]);

  const celebrateAchievement = useCallback((achievementName: string) => {
    celebrate('achievement', {
      message: `🏅 ¡Logro desbloqueado: ${achievementName}!`,
      intensity: 'epic',
    });
  }, [celebrate]);

  const celebrateShoppingComplete = useCallback(() => {
    celebrate('shopping_complete', {
      message: '🛒 ¡Lista de compras completada!',
      intensity: 'medium',
    });
  }, [celebrate]);

  const celebrateFoodAdded = useCallback((foodName?: string, points: number = 10) => {
    celebrate('meal_complete', {
      message: foodName ? `+${points}pts • ${foodName}` : `+${points}pts 🥗`,
      intensity: 'small',
      skipConfetti: true,
    });
  }, [celebrate]);

  const celebrateProgressMilestone = useCallback((percentage: number) => {
    let intensity: CelebrationIntensity = 'small';
    let message = '';
    
    if (percentage >= 100) {
      intensity = 'epic';
      message = '🎉 ¡Objetivo diario completado! 🎉';
    } else if (percentage >= 75) {
      intensity = 'medium';
      message = '💪 ¡75% completado! ¡Ya casi! 💪';
    } else if (percentage >= 50) {
      intensity = 'small';
      message = '🌟 ¡Mitad del camino! 🌟';
    } else if (percentage >= 25) {
      intensity = 'small';
      message = '✨ ¡Buen comienzo! ✨';
    }
    
    if (message) {
      celebrate('daily_goal', { message, intensity });
    }
  }, [celebrate]);

  return {
    celebrate,
    celebrateMealComplete,
    celebrateChallengeComplete,
    celebrateStreakMilestone,
    celebrateDailyGoal,
    celebrateAchievement,
    celebrateShoppingComplete,
    celebrateFoodAdded,
    celebrateProgressMilestone,
  };
};
