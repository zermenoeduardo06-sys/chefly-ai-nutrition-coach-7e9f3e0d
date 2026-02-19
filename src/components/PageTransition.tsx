import { motion } from 'framer-motion';
import { ReactNode, useRef } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

// Module-level flag: only the very first mount gets an animation
let hasCompletedInitialLoad = false;

const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
};

const pageTransition = {
  type: 'tween' as const,
  ease: 'easeOut' as const,
  duration: 0.25,
};

export const PageTransition = ({ children, className = '' }: PageTransitionProps) => {
  // Capture whether this is the first-ever mount
  const isInitial = useRef(!hasCompletedInitialLoad);

  if (isInitial.current) {
    hasCompletedInitialLoad = true;
    return (
      <motion.div
        initial="initial"
        animate="in"
        variants={pageVariants}
        transition={pageTransition}
        className={className}
        style={{ width: '100%' }}
      >
        {children}
      </motion.div>
    );
  }

  // Subsequent navigations: no animation, instant render
  return (
    <div className={className} style={{ width: '100%' }}>
      {children}
    </div>
  );
};
