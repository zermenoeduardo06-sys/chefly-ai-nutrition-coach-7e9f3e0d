import { motion } from 'framer-motion';
import { ReactNode, useRef } from 'react';
import { isInitialLoad, markInitialLoadComplete } from '@/hooks/useInitialAnimation';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

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
  const isFirst = useRef(isInitialLoad());

  if (isFirst.current) {
    markInitialLoadComplete();
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

  return (
    <div className={className} style={{ width: '100%' }}>
      {children}
    </div>
  );
};
