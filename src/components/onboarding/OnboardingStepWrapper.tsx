import { motion, AnimatePresence } from "framer-motion";
import { ReactNode, useEffect, useState } from "react";
import confetti from "canvas-confetti";

interface OnboardingStepWrapperProps {
  children: ReactNode;
  step: number;
  title: string;
  description?: string;
  onSelectionMade?: boolean;
}

const OnboardingStepWrapper = ({ 
  children, 
  step,
  title,
  description,
  onSelectionMade
}: OnboardingStepWrapperProps) => {
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (onSelectionMade && !hasAnimated) {
      setHasAnimated(true);
      
      // Mini confetti burst
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.7, x: 0.5 },
        colors: ['#f97316', '#22c55e', '#f59e0b'],
        ticks: 100,
        gravity: 1.2,
        scalar: 0.8,
        shapes: ['circle', 'square'],
      });
    }
  }, [onSelectionMade, hasAnimated]);

  // Reset animation flag when step changes
  useEffect(() => {
    setHasAnimated(false);
  }, [step]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 50, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: -50, scale: 0.95 }}
        transition={{ 
          duration: 0.4,
          type: "spring",
          stiffness: 300,
          damping: 30
        }}
        className="space-y-6"
      >
        {/* Step header with animation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <motion.h2 
            className="text-xl font-bold text-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {title}
          </motion.h2>
          {description && (
            <motion.p 
              className="text-sm text-muted-foreground mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {description}
            </motion.p>
          )}
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OnboardingStepWrapper;
