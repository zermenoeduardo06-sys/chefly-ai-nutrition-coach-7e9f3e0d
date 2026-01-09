import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { useMascot, MascotMood, CelebrationType } from '@/contexts/MascotContext';
import { useMascotMessages, PageContext } from '@/hooks/useMascotMessages';
import { useMascotUserData } from '@/hooks/useMascotUserData';
import { useCelebrationSounds } from '@/hooks/useCelebrationSounds';
import { useHaptics } from '@/hooks/useHaptics';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, Target, Flame, GripVertical, Star, Heart, Zap, Trophy, CheckCircle2, ShoppingCart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import mascotLime from '@/assets/mascot-lime.png';
import mascotCelebrating from '@/assets/mascot-celebrating.png';
import mascotHealthy from '@/assets/mascot-healthy.png';
import mascotEnergized from '@/assets/mascot-energized.png';
import mascotPower from '@/assets/mascot-power.png';

// Map moods to images - emotional mascot states
const moodImages: Record<MascotMood, string> = {
  idle: mascotLime,
  happy: mascotCelebrating,
  motivated: mascotPower,
  sleepy: mascotLime,
  hungry: mascotLime,
  proud: mascotPower,
  encouraging: mascotHealthy,
  celebrating: mascotCelebrating,
};

// Celebration configs by type
const celebrationConfigs: Record<CelebrationType, {
  colors: string[];
  icon: React.ReactNode;
  glowColor: string;
  particleCount: { small: number; medium: number; epic: number };
}> = {
  meal_complete: {
    colors: ['text-green-400', 'text-emerald-400', 'text-lime-400'],
    icon: <CheckCircle2 className="w-4 h-4" />,
    glowColor: 'bg-green-400/40',
    particleCount: { small: 6, medium: 10, epic: 16 },
  },
  challenge_complete: {
    colors: ['text-purple-400', 'text-pink-400', 'text-fuchsia-400'],
    icon: <Trophy className="w-4 h-4" />,
    glowColor: 'bg-purple-400/40',
    particleCount: { small: 8, medium: 14, epic: 22 },
  },
  streak_milestone: {
    colors: ['text-orange-400', 'text-amber-400', 'text-yellow-400'],
    icon: <Flame className="w-4 h-4" />,
    glowColor: 'bg-orange-400/40',
    particleCount: { small: 10, medium: 16, epic: 26 },
  },
  daily_goal: {
    colors: ['text-blue-400', 'text-cyan-400', 'text-sky-400'],
    icon: <Target className="w-4 h-4" />,
    glowColor: 'bg-blue-400/40',
    particleCount: { small: 8, medium: 12, epic: 20 },
  },
  achievement: {
    colors: ['text-yellow-400', 'text-amber-300', 'text-orange-300'],
    icon: <Star className="w-4 h-4" />,
    glowColor: 'bg-yellow-400/40',
    particleCount: { small: 12, medium: 20, epic: 30 },
  },
  shopping_complete: {
    colors: ['text-teal-400', 'text-emerald-400', 'text-green-400'],
    icon: <ShoppingCart className="w-4 h-4" />,
    glowColor: 'bg-teal-400/40',
    particleCount: { small: 6, medium: 10, epic: 14 },
  },
  generic: {
    colors: ['text-primary', 'text-accent', 'text-secondary-foreground'],
    icon: <Sparkles className="w-4 h-4" />,
    glowColor: 'bg-primary/40',
    particleCount: { small: 6, medium: 10, epic: 16 },
  },
};

// Celebration particle component
const CelebrationParticle: React.FC<{
  index: number;
  type: CelebrationType;
  intensity: 'small' | 'medium' | 'epic';
}> = ({ index, type, intensity }) => {
  const config = celebrationConfigs[type];
  const colorClass = config.colors[index % config.colors.length];
  const angle = (index / config.particleCount[intensity]) * 360;
  const distance = intensity === 'epic' ? 80 + Math.random() * 40 : intensity === 'medium' ? 60 + Math.random() * 30 : 40 + Math.random() * 20;
  const duration = intensity === 'epic' ? 1.2 : intensity === 'medium' ? 0.9 : 0.7;
  
  const x = Math.cos((angle * Math.PI) / 180) * distance;
  const y = Math.sin((angle * Math.PI) / 180) * distance;
  
  const shapes = ['star', 'circle', 'heart', 'sparkle'];
  const shape = shapes[index % shapes.length];

  return (
    <motion.div
      initial={{ opacity: 1, scale: 0, x: 0, y: 0, rotate: 0 }}
      animate={{ 
        opacity: 0, 
        scale: intensity === 'epic' ? 1.5 : 1,
        x, 
        y: y - 20,
        rotate: Math.random() * 360,
      }}
      transition={{ 
        duration, 
        delay: index * 0.03,
        ease: 'easeOut',
      }}
      className={`absolute top-1/2 left-1/2 ${colorClass}`}
    >
      {shape === 'star' && <Star className="w-3 h-3 fill-current" />}
      {shape === 'circle' && <div className="w-2 h-2 rounded-full bg-current" />}
      {shape === 'heart' && <Heart className="w-3 h-3 fill-current" />}
      {shape === 'sparkle' && <Sparkles className="w-3 h-3" />}
    </motion.div>
  );
};

// Ring burst animation
const RingBurst: React.FC<{ intensity: 'small' | 'medium' | 'epic'; glowColor: string }> = ({ intensity, glowColor }) => {
  const rings = intensity === 'epic' ? 3 : intensity === 'medium' ? 2 : 1;
  
  return (
    <>
      {[...Array(rings)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0.5, opacity: 0.8 }}
          animate={{ scale: 3 + i * 0.5, opacity: 0 }}
          transition={{ 
            duration: intensity === 'epic' ? 1 : 0.7, 
            delay: i * 0.15,
            ease: 'easeOut',
          }}
          className={`absolute inset-0 rounded-full border-2 border-current ${glowColor.replace('/40', '/60')}`}
          style={{ borderColor: 'currentColor' }}
        />
      ))}
    </>
  );
};

// Floating emoji burst
const EmojiBurst: React.FC<{ type: CelebrationType; intensity: 'small' | 'medium' | 'epic' }> = ({ type, intensity }) => {
  const emojiMap: Record<CelebrationType, string[]> = {
    meal_complete: ['🍽️', '✅', '🎉', '👏'],
    challenge_complete: ['🏆', '💪', '🎯', '⭐'],
    streak_milestone: ['🔥', '🌟', '💫', '✨'],
    daily_goal: ['🎯', '🎊', '💯', '🙌'],
    achievement: ['🏅', '👑', '🌟', '🎖️'],
    shopping_complete: ['🛒', '✅', '🎉', '👍'],
    generic: ['🎉', '✨', '🎊', '💫'],
  };
  
  const emojis = emojiMap[type];
  const count = intensity === 'epic' ? 6 : intensity === 'medium' ? 4 : 2;
  
  return (
    <>
      {[...Array(count)].map((_, i) => {
        const angle = (i / count) * 360 + Math.random() * 30;
        const distance = 50 + Math.random() * 30;
        const x = Math.cos((angle * Math.PI) / 180) * distance;
        const y = Math.sin((angle * Math.PI) / 180) * distance - 40;
        
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
            animate={{ 
              opacity: [0, 1, 1, 0], 
              scale: [0, 1.2, 1, 0.8],
              x, 
              y,
            }}
            transition={{ 
              duration: 1.2, 
              delay: 0.1 + i * 0.08,
              times: [0, 0.2, 0.7, 1],
            }}
            className="absolute top-1/2 left-1/2 text-lg"
          >
            {emojis[i % emojis.length]}
          </motion.div>
        );
      })}
    </>
  );
};

// Starburst animation for epic celebrations
const Starburst: React.FC<{ show: boolean }> = ({ show }) => {
  if (!show) return null;
  
  return (
    <>
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ scaleY: 0, opacity: 1 }}
          animate={{ scaleY: [0, 1, 0], opacity: [1, 0.8, 0] }}
          transition={{ duration: 0.6, delay: i * 0.02 }}
          className="absolute top-1/2 left-1/2 w-1 h-12 bg-gradient-to-t from-accent to-transparent origin-bottom"
          style={{ 
            transform: `rotate(${i * 45}deg) translateY(-50%)`,
          }}
        />
      ))}
    </>
  );
};

// Pages where the floating mascot should be hidden
const hiddenPages = ['/onboarding', '/auth', '/welcome', '/', '/chat'];

// Map routes to page context
const getPageContext = (pathname: string): PageContext => {
  if (pathname.includes('/dashboard')) return 'dashboard';
  if (pathname.includes('/shopping')) return 'shopping';
  if (pathname.includes('/progress')) return 'progress';
  if (pathname.includes('/challenges')) return 'challenges';
  if (pathname.includes('/chat')) return 'chat';
  if (pathname.includes('/profile')) return 'profile';
  return 'other';
};

// Position presets for corners
type Corner = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

const cornerPositions: Record<Corner, { className: string; bubblePosition: string }> = {
  'bottom-right': { className: 'bottom-24 right-4 md:bottom-8', bubblePosition: 'bottom-full right-0 mb-2' },
  'bottom-left': { className: 'bottom-24 left-4 md:bottom-8', bubblePosition: 'bottom-full left-0 mb-2' },
  'top-right': { className: 'top-20 right-4 md:top-4', bubblePosition: 'top-full right-0 mt-2' },
  'top-left': { className: 'top-20 left-4 md:top-4', bubblePosition: 'top-full left-0 mt-2' },
};

const FloatingMascot: React.FC = () => {
  const { state, recordInteraction, setMood, triggerCelebration } = useMascot();
  const location = useLocation();
  const navigate = useNavigate();
  const dragControls = useDragControls();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Celebration sounds and haptics
  const { playCelebrationSound } = useCelebrationSounds();
  const { 
    heavyImpact, 
    mediumImpact, 
    lightImpact, 
    successNotification, 
    celebrationPattern 
  } = useHaptics();
  
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [corner, setCorner] = useState<Corner>(() => {
    const saved = localStorage.getItem('mascot_corner');
    return (saved as Corner) || 'bottom-right';
  });
  const [isDragging, setIsDragging] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleMessage, setBubbleMessage] = useState<string | null>(null);
  const [isBlinking, setIsBlinking] = useState(false);
  const [showQuickStats, setShowQuickStats] = useState(false);
  const [isWaving, setIsWaving] = useState(false);
  const [hasShownPageMessage, setHasShownPageMessage] = useState(false);
  const [dragBounds, setDragBounds] = useState({ top: 0, left: 0, right: 0, bottom: 0 });

  // Calculate drag bounds based on window size - keeps mascot visible
  useEffect(() => {
    const updateBounds = () => {
      const padding = 20;
      const mascotSize = 64;
      const safeAreaTop = 80;
      const safeAreaBottom = 100;
      
      // Calculate bounds relative to the mascot's starting corner position
      setDragBounds({
        top: -(window.innerHeight - safeAreaTop - safeAreaBottom - mascotSize),
        left: -(window.innerWidth - mascotSize - padding * 2),
        right: window.innerWidth - mascotSize - padding * 2,
        bottom: window.innerHeight - safeAreaTop - safeAreaBottom - mascotSize,
      });
    };
    
    updateBounds();
    window.addEventListener('resize', updateBounds);
    return () => window.removeEventListener('resize', updateBounds);
  }, []);

  // Derived celebration state
  const isCelebrating = state.mood === 'celebrating';
  const celebrationType = state.celebrationType;
  
  // Track previous celebration state to trigger sounds/haptics
  const prevCelebratingRef = useRef(false);
  
  // Trigger sounds and haptics when celebration starts
  useEffect(() => {
    if (isCelebrating && !prevCelebratingRef.current && celebrationType) {
      // Play celebration sound
      playCelebrationSound(celebrationType, state.celebrationIntensity);
      
      // Trigger haptics based on intensity
      if (state.celebrationIntensity === 'epic') {
        celebrationPattern();
      } else if (state.celebrationIntensity === 'medium') {
        successNotification();
      } else {
        lightImpact();
      }
    }
    prevCelebratingRef.current = isCelebrating;
  }, [isCelebrating, celebrationType, state.celebrationIntensity, playCelebrationSound, celebrationPattern, successNotification, lightImpact]);

  // Double tap detection
  const lastTapRef = useRef<number>(0);
  const doubleTapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Visibility change detection for welcome back animation
  const lastVisibilityRef = useRef<number>(Date.now());

  // Get user data for contextual messages
  const { data: userData } = useMascotUserData(userId);
  
  // Pass user data to messages hook
  const { getContextualMessage, getRandomMessage, getPageMessage } = useMascotMessages({
    streak: userData.streak,
    caloriesConsumed: userData.caloriesConsumed,
    caloriesGoal: userData.caloriesGoal,
    mealsCompleted: userData.mealsCompleted,
    totalMeals: userData.totalMeals,
    pendingChallenges: userData.pendingChallenges,
    userName: userData.userName,
  });

  // Get user ID on mount
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    getUser();
  }, []);

  // Hide on certain pages
  const shouldHide = hiddenPages.includes(location.pathname) || !state.isVisible;

  // Show page-specific message when navigating
  useEffect(() => {
    if (shouldHide || !userId || hasShownPageMessage) return;
    
    const pageContext = getPageContext(location.pathname);
    if (pageContext === 'other' || pageContext === 'chat') return;
    
    const timer = setTimeout(() => {
      const msg = getPageMessage(pageContext);
      setBubbleMessage(msg.text);
      setMood(msg.mood);
      setShowBubble(true);
      setHasShownPageMessage(true);
      
      setTimeout(() => {
        setShowBubble(false);
        setBubbleMessage(null);
      }, 4000);
    }, 1500);

    return () => clearTimeout(timer);
  }, [location.pathname, userId, shouldHide]);

  // Reset page message flag when route changes
  useEffect(() => {
    setHasShownPageMessage(false);
  }, [location.pathname]);

  // Welcome back animation when user returns to app
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const now = Date.now();
        const timeSinceHidden = now - lastVisibilityRef.current;
        
        // If user was away for more than 30 seconds, show welcome back
        if (timeSinceHidden > 30000 && !shouldHide) {
          setIsWaving(true);
          setBubbleMessage('¡Hola de nuevo! 👋 ¿Listo para continuar?');
          setMood('happy');
          setShowBubble(true);
          
          setTimeout(() => {
            setIsWaving(false);
            setShowBubble(false);
            setBubbleMessage(null);
          }, 3500);
        }
      } else {
        lastVisibilityRef.current = Date.now();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [shouldHide, setMood]);

  // Blink animation
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 150);
      }
    }, 3000);
    return () => clearInterval(blinkInterval);
  }, []);

  // Show contextual message periodically
  useEffect(() => {
    if (shouldHide) return;
    
    const messageInterval = setInterval(() => {
      if (!showBubble && !showQuickStats && Math.random() > 0.6) {
        const msg = getContextualMessage();
        setBubbleMessage(msg.text);
        setMood(msg.mood);
        setShowBubble(true);
        
        setTimeout(() => {
          setShowBubble(false);
          setBubbleMessage(null);
        }, 4000);
      }
    }, 45000); // Every 45 seconds

    return () => clearInterval(messageInterval);
  }, [shouldHide, showBubble, showQuickStats, getContextualMessage, setMood]);

  // Handle drag end - snap to nearest corner
  const handleDragEnd = useCallback((event: any, info: any) => {
    setIsDragging(false);
    
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const element = containerRef.current;
    
    if (!element) return;
    
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Determine nearest corner
    const isRight = centerX > windowWidth / 2;
    const isBottom = centerY > windowHeight / 2;
    
    let newCorner: Corner;
    if (isBottom && isRight) newCorner = 'bottom-right';
    else if (isBottom && !isRight) newCorner = 'bottom-left';
    else if (!isBottom && isRight) newCorner = 'top-right';
    else newCorner = 'top-left';
    
    setCorner(newCorner);
    localStorage.setItem('mascot_corner', newCorner);
  }, []);

  // Handle double tap to navigate to chat
  const handleDoubleTap = useCallback(() => {
    recordInteraction();
    setShowBubble(false);
    setShowQuickStats(false);
    setBubbleMessage('¡Vamos a chatear! 💬');
    setMood('happy');
    setShowBubble(true);
    
    setTimeout(() => {
      navigate('/chat');
    }, 500);
  }, [navigate, recordInteraction, setMood]);

  const handleTap = useCallback(() => {
    if (isDragging) return;
    
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;
    
    // Double tap detection (within 300ms)
    if (timeSinceLastTap < 300) {
      if (doubleTapTimeoutRef.current) {
        clearTimeout(doubleTapTimeoutRef.current);
        doubleTapTimeoutRef.current = null;
      }
      handleDoubleTap();
      lastTapRef.current = 0;
      return;
    }
    
    lastTapRef.current = now;
    
    // Delay single tap action to check for double tap
    doubleTapTimeoutRef.current = setTimeout(() => {
      recordInteraction();
      
      if (showBubble) {
        setShowBubble(false);
        setBubbleMessage(null);
      } else if (showQuickStats) {
        setShowQuickStats(false);
      } else {
        const msg = getRandomMessage();
        setBubbleMessage(msg.text);
        setMood(msg.mood);
        setShowBubble(true);
        
        setTimeout(() => {
          setShowBubble(false);
          setBubbleMessage(null);
        }, 4000);
      }
    }, 300);
  }, [isDragging, showBubble, showQuickStats, recordInteraction, getRandomMessage, setMood, handleDoubleTap]);

  const handleLongPress = useCallback(() => {
    if (doubleTapTimeoutRef.current) {
      clearTimeout(doubleTapTimeoutRef.current);
      doubleTapTimeoutRef.current = null;
    }
    recordInteraction();
    setShowBubble(false);
    setShowQuickStats(true);
  }, [recordInteraction]);

  // Long press detection
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null);

  const handlePressStart = () => {
    const timer = setTimeout(() => {
      handleLongPress();
    }, 500);
    setPressTimer(timer);
  };

  const handlePressEnd = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
  };

  if (shouldHide) return null;

  const caloriesProgress = userData.caloriesGoal > 0 
    ? Math.min(100, (userData.caloriesConsumed / userData.caloriesGoal) * 100) 
    : 0;

  const currentPosition = cornerPositions[corner];
  const isTopPosition = corner.includes('top');
  const isLeftPosition = corner.includes('left');

  return (
    <motion.div
      ref={containerRef}
      drag
      dragControls={dragControls}
      dragMomentum={false}
      dragElastic={0.05}
      dragConstraints={dragBounds}
      whileDrag={{ scale: 1.1, zIndex: 100 }}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      className={`fixed ${currentPosition.className} z-50 touch-none`}
      initial={false}
      animate={{ x: 0, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Speech Bubble */}
      <AnimatePresence>
        {showBubble && bubbleMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: isTopPosition ? -10 : 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: isTopPosition ? -10 : 10 }}
            className={`absolute ${currentPosition.bubblePosition} max-w-[200px] sm:max-w-[240px]`}
          >
            <div className="relative rounded-2xl bg-card border border-border p-3 shadow-lg">
              <p className="text-sm text-card-foreground leading-snug">
                {bubbleMessage}
              </p>
              {/* Bubble tail */}
              <div 
                className={`absolute w-4 h-4 bg-card border-border rotate-45 transform ${
                  isTopPosition 
                    ? `-top-2 ${isLeftPosition ? 'left-6' : 'right-6'} border-l border-t` 
                    : `-bottom-2 ${isLeftPosition ? 'left-6' : 'right-6'} border-r border-b`
                }`} 
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Stats Panel (on long press) */}
      <AnimatePresence>
        {showQuickStats && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: isTopPosition ? -10 : 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: isTopPosition ? -10 : 10 }}
            className={`absolute ${currentPosition.bubblePosition} w-48`}
          >
            <div className="relative rounded-2xl bg-card border border-border p-3 shadow-lg space-y-2">
              {/* Streak */}
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-accent" />
                <span className="text-xs text-muted-foreground">Racha:</span>
                <span className="text-sm font-bold text-card-foreground">{userData.streak} días</span>
              </div>
              
              {/* Calories Progress */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    <span className="text-xs text-muted-foreground">Calorías</span>
                  </div>
                  <span className="text-xs font-medium text-card-foreground">
                    {userData.caloriesConsumed}/{userData.caloriesGoal}
                  </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${caloriesProgress}%` }}
                    className="h-full bg-primary rounded-full"
                  />
                </div>
              </div>

              {/* Meals & Challenges */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Comidas: {userData.mealsCompleted}/{userData.totalMeals}
                </span>
                {userData.pendingChallenges > 0 && (
                  <span className="text-accent font-medium">
                    {userData.pendingChallenges} reto{userData.pendingChallenges > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {/* Bubble tail */}
              <div 
                className={`absolute w-4 h-4 bg-card border-border rotate-45 transform ${
                  isTopPosition 
                    ? `-top-2 ${isLeftPosition ? 'left-6' : 'right-6'} border-l border-t` 
                    : `-bottom-2 ${isLeftPosition ? 'left-6' : 'right-6'} border-r border-b`
                }`} 
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drag indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isDragging ? 1 : 0 }}
        className="absolute -top-6 left-1/2 -translate-x-1/2 bg-muted/80 rounded-full px-2 py-0.5 flex items-center gap-1"
      >
        <GripVertical className="w-3 h-3 text-muted-foreground" />
        <span className="text-[10px] text-muted-foreground">Arrastra</span>
      </motion.div>

      {/* Mascot Button */}
      <motion.button
        onClick={handleTap}
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary/30 shadow-lg overflow-visible focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        {/* Celebration: Ring Burst */}
        <AnimatePresence>
          {isCelebrating && celebrationType && (
            <RingBurst 
              intensity={state.celebrationIntensity} 
              glowColor={celebrationConfigs[celebrationType].glowColor} 
            />
          )}
        </AnimatePresence>

        {/* Celebration: Starburst for epic */}
        <AnimatePresence>
          {isCelebrating && state.celebrationIntensity === 'epic' && (
            <Starburst show={true} />
          )}
        </AnimatePresence>

        {/* Glow effect - enhanced during celebration */}
        <motion.div
          animate={{
            opacity: isCelebrating 
              ? [0.6, 1, 0.6] 
              : [0.3, 0.6, 0.3],
            scale: isCelebrating 
              ? [1, 1.4, 1] 
              : [1, 1.1, 1],
          }}
          transition={{
            duration: isCelebrating ? 0.5 : 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={`absolute inset-0 rounded-full blur-md ${
            isCelebrating && celebrationType
              ? celebrationConfigs[celebrationType].glowColor
              : 'bg-primary/20'
          }`}
        />

        {/* Mascot Image with elaborate celebration animations */}
        <motion.img
          src={moodImages[state.mood]}
          alt="Limey"
          className="relative z-10 w-full h-full object-cover"
          animate={
            isCelebrating 
              ? {
                  scale: state.celebrationIntensity === 'epic' 
                    ? [1, 1.2, 0.9, 1.15, 1] 
                    : state.celebrationIntensity === 'medium'
                      ? [1, 1.15, 0.95, 1.1, 1]
                      : [1, 1.1, 0.98, 1.05, 1],
                  rotate: state.celebrationIntensity === 'epic'
                    ? [0, -15, 15, -12, 12, -8, 8, 0]
                    : state.celebrationIntensity === 'medium'
                      ? [0, -10, 10, -8, 8, 0]
                      : [0, -5, 5, 0],
                  y: state.celebrationIntensity === 'epic'
                    ? [0, -8, 0, -6, 0, -4, 0]
                    : [0, -4, 0, -3, 0],
                }
              : {
                  scale: isBlinking ? [1, 0.98, 1] : 1,
                  rotate: isWaving ? [0, -10, 10, -10, 10, 0] : 0,
                  y: isWaving ? [0, -3, 0, -3, 0] : 0,
                }
          }
          transition={{
            duration: isCelebrating 
              ? (state.celebrationIntensity === 'epic' ? 1.5 : state.celebrationIntensity === 'medium' ? 1 : 0.6)
              : isWaving ? 0.8 : 0.15,
            repeat: isCelebrating ? 2 : 0,
            ease: 'easeInOut',
          }}
        />

        {/* Celebration particles - type specific */}
        <AnimatePresence>
          {isCelebrating && celebrationType && (
            <>
              {[...Array(celebrationConfigs[celebrationType].particleCount[state.celebrationIntensity])].map((_, i) => (
                <CelebrationParticle 
                  key={i}
                  index={i}
                  type={celebrationType}
                  intensity={state.celebrationIntensity}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Celebration: Emoji Burst */}
        <AnimatePresence>
          {isCelebrating && celebrationType && state.celebrationIntensity !== 'small' && (
            <EmojiBurst type={celebrationType} intensity={state.celebrationIntensity} />
          )}
        </AnimatePresence>

        {/* Celebration Badge/Icon overlay */}
        <AnimatePresence>
          {isCelebrating && celebrationType && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.3, 1], opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className={`absolute -bottom-2 -right-2 z-20 w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
                celebrationType === 'meal_complete' ? 'bg-green-500' :
                celebrationType === 'challenge_complete' ? 'bg-purple-500' :
                celebrationType === 'streak_milestone' ? 'bg-orange-500' :
                celebrationType === 'daily_goal' ? 'bg-blue-500' :
                celebrationType === 'achievement' ? 'bg-yellow-500' :
                celebrationType === 'shopping_complete' ? 'bg-teal-500' :
                'bg-primary'
              }`}
            >
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 0.5, repeat: 2 }}
                className="text-white"
              >
                {celebrationConfigs[celebrationType].icon}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Idle breathing animation */}
        <motion.div
          animate={{
            y: [0, -2, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0"
        />
      </motion.button>

      {/* Notification dot - show when there are pending challenges (hide during celebration) */}
      {userData.pendingChallenges > 0 && !isCelebrating && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-full border-2 border-background flex items-center justify-center"
        >
          <span className="text-[10px] font-bold text-accent-foreground">
            {userData.pendingChallenges}
          </span>
        </motion.div>
      )}

      {/* Celebration Message Bubble (special styling) */}
      <AnimatePresence>
        {isCelebrating && state.message && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className={`absolute ${isTopPosition ? 'top-full mt-3' : 'bottom-full mb-3'} ${isLeftPosition ? 'left-0' : 'right-0'} max-w-[220px]`}
          >
            <div className={`relative rounded-2xl p-3 shadow-xl border-2 ${
              celebrationType === 'meal_complete' ? 'bg-gradient-to-br from-green-500/90 to-emerald-600/90 border-green-400/50' :
              celebrationType === 'challenge_complete' ? 'bg-gradient-to-br from-purple-500/90 to-pink-600/90 border-purple-400/50' :
              celebrationType === 'streak_milestone' ? 'bg-gradient-to-br from-orange-500/90 to-amber-600/90 border-orange-400/50' :
              celebrationType === 'daily_goal' ? 'bg-gradient-to-br from-blue-500/90 to-cyan-600/90 border-blue-400/50' :
              celebrationType === 'achievement' ? 'bg-gradient-to-br from-yellow-500/90 to-amber-500/90 border-yellow-400/50' :
              celebrationType === 'shopping_complete' ? 'bg-gradient-to-br from-teal-500/90 to-emerald-600/90 border-teal-400/50' :
              'bg-gradient-to-br from-primary/90 to-accent/90 border-primary/50'
            }`}>
              <motion.p 
                className="text-sm text-white font-medium leading-snug text-center"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 0.5, repeat: 3 }}
              >
                {state.message}
              </motion.p>
              {/* Sparkle decorations */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="absolute -top-2 -right-2"
              >
                <Sparkles className="w-4 h-4 text-white/80" />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FloatingMascot;
