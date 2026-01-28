import React, { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedNumberProps {
  value: number;
  className?: string;
  duration?: number;
  formatOptions?: Intl.NumberFormatOptions;
  prefix?: string;
  suffix?: string;
  onAnimationComplete?: () => void;
}

export function AnimatedNumber({
  value,
  className,
  duration = 0.8,
  formatOptions,
  prefix = '',
  suffix = '',
  onAnimationComplete,
}: AnimatedNumberProps) {
  const spring = useSpring(0, {
    mass: 0.8,
    stiffness: 75,
    damping: 15,
  });
  
  const display = useTransform(spring, (current) => {
    const formatted = formatOptions 
      ? new Intl.NumberFormat(undefined, formatOptions).format(Math.round(current))
      : Math.round(current).toString();
    return `${prefix}${formatted}${suffix}`;
  });

  const [displayValue, setDisplayValue] = useState(`${prefix}0${suffix}`);
  const previousValue = useRef(0);

  useEffect(() => {
    const unsubscribe = display.on('change', (v) => setDisplayValue(v));
    return () => unsubscribe();
  }, [display]);

  useEffect(() => {
    spring.set(value);
    
    if (onAnimationComplete) {
      const timeout = setTimeout(onAnimationComplete, duration * 1000);
      return () => clearTimeout(timeout);
    }
  }, [value, spring, duration, onAnimationComplete]);

  const isIncreasing = value > previousValue.current;
  previousValue.current = value;

  return (
    <motion.span
      key={value}
      initial={{ scale: 1 }}
      animate={{ 
        scale: [1, isIncreasing ? 1.1 : 0.95, 1],
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn("tabular-nums", className)}
    >
      {displayValue}
    </motion.span>
  );
}

// Lightweight version for simpler counters
export function SimpleAnimatedNumber({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return (
    <motion.span
      key={value}
      initial={{ scale: 1.2, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 25 }}
      className={cn("tabular-nums", className)}
    >
      {value}
    </motion.span>
  );
}
