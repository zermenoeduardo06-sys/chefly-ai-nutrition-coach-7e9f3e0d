import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { useMascot, MascotMood } from '@/contexts/MascotContext';
import { useMascotMessages, PageContext } from '@/hooks/useMascotMessages';
import { useMascotUserData } from '@/hooks/useMascotUserData';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, Target, Flame, GripVertical } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import mascotLime from '@/assets/mascot-lime.png';

// Map moods to images - ready for future emotional mascot images
const moodImages: Record<MascotMood, string> = {
  idle: mascotLime,
  happy: mascotLime,
  motivated: mascotLime,
  sleepy: mascotLime,
  hungry: mascotLime,
  proud: mascotLime,
  encouraging: mascotLime,
  celebrating: mascotLime,
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
      dragElastic={0.1}
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
        className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary/30 shadow-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        {/* Glow effect */}
        <motion.div
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 rounded-full bg-primary/20 blur-md"
        />

        {/* Mascot Image */}
        <motion.img
          src={moodImages[state.mood]}
          alt="Limey"
          className="relative z-10 w-full h-full object-cover"
          animate={{
            scale: isBlinking ? [1, 0.98, 1] : 1,
            rotate: state.mood === 'celebrating' 
              ? [0, -5, 5, 0] 
              : isWaving 
                ? [0, -10, 10, -10, 10, 0] 
                : 0,
            y: isWaving ? [0, -3, 0, -3, 0] : 0,
          }}
          transition={{
            duration: state.mood === 'celebrating' ? 0.5 : isWaving ? 0.8 : 0.15,
            repeat: state.mood === 'celebrating' ? 3 : 0,
          }}
        />

        {/* Celebration particles */}
        <AnimatePresence>
          {state.mood === 'celebrating' && (
            <>
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    opacity: 1, 
                    scale: 0,
                    x: 0,
                    y: 0,
                  }}
                  animate={{ 
                    opacity: 0, 
                    scale: 1,
                    x: (Math.random() - 0.5) * 60,
                    y: -30 - Math.random() * 40,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                  className="absolute top-1/2 left-1/2"
                >
                  <Sparkles className="w-3 h-3 text-accent" />
                </motion.div>
              ))}
            </>
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

      {/* Notification dot - show when there are pending challenges */}
      {userData.pendingChallenges > 0 && (
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
    </motion.div>
  );
};

export default FloatingMascot;
