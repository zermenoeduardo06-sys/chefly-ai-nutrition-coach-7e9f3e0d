import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedProgressProps {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
  size?: 'sm' | 'md' | 'lg';
  showPulse?: boolean;
  variant?: 'default' | 'success' | 'gradient';
}

export function AnimatedProgress({
  value,
  max = 100,
  className,
  barClassName,
  size = 'md',
  showPulse = true,
  variant = 'default',
}: AnimatedProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const isComplete = percentage >= 100;

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  const variantClasses = {
    default: 'bg-primary',
    success: 'bg-emerald-500',
    gradient: 'bg-gradient-to-r from-primary via-primary-hover to-primary',
  };

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-full bg-muted/50',
        sizeClasses[size],
        className
      )}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={cn(
          'h-full rounded-full relative',
          variantClasses[variant],
          barClassName
        )}
      >
        {/* Shimmer effect on the bar */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: 'linear',
            repeatDelay: 1,
          }}
        />
      </motion.div>

      {/* Pulse effect when complete */}
      {isComplete && showPulse && (
        <motion.div
          className="absolute inset-0 rounded-full bg-emerald-400/30"
          initial={{ opacity: 0, scale: 1 }}
          animate={{ 
            opacity: [0, 0.5, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </div>
  );
}

// Circular progress variant
interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showValue?: boolean;
}

export function CircularProgress({
  value,
  max = 100,
  size = 64,
  strokeWidth = 6,
  className,
  showValue = true,
}: CircularProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="fill-none stroke-muted"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="fill-none stroke-primary"
          initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </svg>
      {showValue && (
        <motion.span
          key={Math.round(percentage)}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute text-sm font-bold text-foreground"
        >
          {Math.round(percentage)}%
        </motion.span>
      )}
    </div>
  );
}
