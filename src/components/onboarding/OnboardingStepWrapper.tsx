import { motion } from "framer-motion";
import { ReactNode, useEffect, useState, useRef } from "react";
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
  const hasAnimatedRef = useRef(false);
  const previousStepRef = useRef(step);

  // Reset animation flag when step changes
  useEffect(() => {
    if (previousStepRef.current !== step) {
      hasAnimatedRef.current = false;
      previousStepRef.current = step;
    }
  }, [step]);

  // Fire confetti when selection is made
  useEffect(() => {
    if (onSelectionMade && !hasAnimatedRef.current) {
      hasAnimatedRef.current = true;
      
      // Use requestAnimationFrame to ensure DOM is stable
      requestAnimationFrame(() => {
        try {
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
        } catch (e) {
          console.warn('Confetti error:', e);
        }
      });
    }
  }, [onSelectionMade]);

  return (
    <motion.div
      key={`step-${step}`}
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ 
        duration: 0.3,
        ease: "easeOut"
      }}
      className="space-y-6"
    >
      {/* Step header */}
      <div>
        <h2 className="text-xl font-bold text-foreground">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </div>

      {/* Content */}
      <div>
        {children}
      </div>
    </motion.div>
  );
};

export default OnboardingStepWrapper;