import React from 'react';
import { motion, Variants } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type AnimationType = 'bounce' | 'spin' | 'pulse' | 'wiggle' | 'float' | 'heartbeat' | 'none';

interface AnimatedIconProps {
  icon: LucideIcon;
  animation?: AnimationType;
  className?: string;
  size?: number;
  color?: string;
  delay?: number;
  loop?: boolean;
  onClick?: () => void;
}

const animationVariants: Record<AnimationType, Variants> = {
  bounce: {
    initial: { y: 0 },
    animate: {
      y: [0, -6, 0],
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  },
  spin: {
    initial: { rotate: 0 },
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
      },
    },
  },
  pulse: {
    initial: { scale: 1, opacity: 1 },
    animate: {
      scale: [1, 1.1, 1],
      opacity: [1, 0.8, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  },
  wiggle: {
    initial: { rotate: 0 },
    animate: {
      rotate: [-3, 3, -3],
      transition: {
        duration: 0.4,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  },
  float: {
    initial: { y: 0 },
    animate: {
      y: [0, -4, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  },
  heartbeat: {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.15, 1, 1.15, 1],
      transition: {
        duration: 1.2,
        repeat: Infinity,
        times: [0, 0.14, 0.28, 0.42, 0.7],
      },
    },
  },
  none: {
    initial: {},
    animate: {},
  },
};

export function AnimatedIcon({
  icon: Icon,
  animation = 'none',
  className,
  size = 24,
  color,
  delay = 0,
  loop = true,
  onClick,
}: AnimatedIconProps) {
  const variants = animationVariants[animation];

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ delay }}
      className={cn('inline-flex items-center justify-center', className)}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <Icon
        size={size}
        style={{ color }}
        className={cn(!color && 'text-current')}
      />
    </motion.div>
  );
}

// Wrapper for triggering animation on mount or state change
interface TriggerAnimatedIconProps extends Omit<AnimatedIconProps, 'animation'> {
  trigger?: boolean;
  animation?: 'pop' | 'check' | 'shake';
}

const triggerVariants: Record<string, Variants> = {
  pop: {
    initial: { scale: 0.5, opacity: 0 },
    animate: {
      scale: [0.5, 1.2, 1],
      opacity: 1,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
  },
  check: {
    initial: { scale: 0, rotate: -45 },
    animate: {
      scale: [0, 1.2, 1],
      rotate: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  },
  shake: {
    initial: { x: 0 },
    animate: {
      x: [-4, 4, -4, 4, 0],
      transition: { duration: 0.4 },
    },
  },
};

export function TriggerAnimatedIcon({
  icon: Icon,
  trigger = true,
  animation = 'pop',
  className,
  size = 24,
  color,
  onClick,
}: TriggerAnimatedIconProps) {
  const variants = triggerVariants[animation];

  return (
    <motion.div
      key={trigger ? 'triggered' : 'idle'}
      variants={variants}
      initial="initial"
      animate={trigger ? 'animate' : 'initial'}
      className={cn('inline-flex items-center justify-center', className)}
      onClick={onClick}
    >
      <Icon size={size} style={{ color }} className={cn(!color && 'text-current')} />
    </motion.div>
  );
}
