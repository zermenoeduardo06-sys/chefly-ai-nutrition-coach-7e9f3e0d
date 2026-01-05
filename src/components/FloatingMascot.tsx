import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { useMascot, MascotMood } from '@/contexts/MascotContext';
import { useMascotMessages } from '@/hooks/useMascotMessages';
import { useLocation } from 'react-router-dom';
import { X, MessageCircle, Sparkles } from 'lucide-react';
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

const FloatingMascot: React.FC = () => {
  const { state, toggleExpanded, recordInteraction, setMood, setMessage } = useMascot();
  const { getContextualMessage, getRandomMessage } = useMascotMessages();
  const location = useLocation();
  const dragControls = useDragControls();
  
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleMessage, setBubbleMessage] = useState<string | null>(null);
  const [isBlinking, setIsBlinking] = useState(false);

  // Hide on certain pages
  const shouldHide = hiddenPages.includes(location.pathname) || !state.isVisible;

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
      if (!showBubble && Math.random() > 0.6) {
        const msg = getContextualMessage();
        setBubbleMessage(msg.text);
        setMood(msg.mood);
        setShowBubble(true);
        
        setTimeout(() => {
          setShowBubble(false);
          setBubbleMessage(null);
        }, 4000);
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(messageInterval);
  }, [shouldHide, showBubble, getContextualMessage, setMood]);

  // Initial greeting on mount
  useEffect(() => {
    if (shouldHide) return;
    
    const timer = setTimeout(() => {
      const msg = getRandomMessage('greetings');
      setBubbleMessage(msg.text);
      setMood(msg.mood);
      setShowBubble(true);
      
      setTimeout(() => {
        setShowBubble(false);
        setBubbleMessage(null);
      }, 3000);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleTap = useCallback(() => {
    recordInteraction();
    
    if (showBubble) {
      setShowBubble(false);
      setBubbleMessage(null);
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
  }, [showBubble, recordInteraction, getRandomMessage, setMood]);

  if (shouldHide) return null;

  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragMomentum={false}
      dragElastic={0.1}
      whileDrag={{ scale: 1.1 }}
      onDragEnd={(_, info) => {
        setPosition(prev => ({
          x: prev.x + info.offset.x,
          y: prev.y + info.offset.y,
        }));
      }}
      style={{ x: position.x, y: position.y }}
      className="fixed bottom-24 right-4 z-50 touch-none md:bottom-8"
    >
      {/* Speech Bubble */}
      <AnimatePresence>
        {showBubble && bubbleMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="absolute bottom-full right-0 mb-2 max-w-[200px] sm:max-w-[240px]"
          >
            <div className="relative rounded-2xl bg-card border border-border p-3 shadow-lg">
              <p className="text-sm text-card-foreground leading-snug">
                {bubbleMessage}
              </p>
              {/* Bubble tail */}
              <div className="absolute -bottom-2 right-6 w-4 h-4 bg-card border-r border-b border-border rotate-45 transform" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mascot Button */}
      <motion.button
        onClick={handleTap}
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
            rotate: state.mood === 'celebrating' ? [0, -5, 5, 0] : 0,
          }}
          transition={{
            duration: state.mood === 'celebrating' ? 0.5 : 0.15,
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

      {/* Notification dot for pending messages/challenges */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full border-2 border-background flex items-center justify-center"
      >
        <MessageCircle className="w-2 h-2 text-accent-foreground" />
      </motion.div>
    </motion.div>
  );
};

export default FloatingMascot;
