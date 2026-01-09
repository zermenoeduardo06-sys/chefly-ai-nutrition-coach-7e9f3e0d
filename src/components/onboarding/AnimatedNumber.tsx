import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  delay?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  onComplete?: () => void;
}

export const AnimatedNumber = ({
  value,
  duration = 2000,
  delay = 0,
  suffix = '',
  prefix = '',
  className = '',
  onComplete,
}: AnimatedNumberProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsAnimating(true);
      const startTime = Date.now();
      const startValue = 0;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth deceleration
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.round(startValue + (value - startValue) * easeOutQuart);
        
        setDisplayValue(currentValue);

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
          onComplete?.();
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration, delay, onComplete]);

  return (
    <motion.span
      className={className}
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ 
        scale: isAnimating ? [1, 1.05, 1] : 1, 
        opacity: 1 
      }}
      transition={{ 
        duration: 0.3,
        delay: delay / 1000,
      }}
    >
      {prefix}{displayValue.toLocaleString()}{suffix}
    </motion.span>
  );
};

export default AnimatedNumber;
