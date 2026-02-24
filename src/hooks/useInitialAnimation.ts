import { useRef } from 'react';

// Module-level flag shared across all consumers
let hasCompletedInitialLoad = false;

/**
 * Returns `true` only on the very first mount after app start.
 * Use to conditionally enable entry animations only on initial load.
 * 
 * Usage:
 *   const shouldAnimate = useInitialAnimation();
 *   <motion.div initial={shouldAnimate ? { opacity: 0 } : false} animate={{ opacity: 1 }} />
 */
export function useInitialAnimation(): boolean {
  const isInitial = useRef(!hasCompletedInitialLoad);
  if (isInitial.current) {
    hasCompletedInitialLoad = true;
  }
  return isInitial.current;
}

/** Mark initial load as complete (called by PageTransition) */
export function markInitialLoadComplete() {
  hasCompletedInitialLoad = true;
}

/** Check without consuming (for conditional rendering) */
export function isInitialLoad(): boolean {
  return !hasCompletedInitialLoad;
}
