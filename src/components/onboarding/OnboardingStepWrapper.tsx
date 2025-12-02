import { ReactNode, useEffect, useRef } from "react";
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
      
      // Small delay to ensure DOM is stable
      const timer = setTimeout(() => {
        try {
          confetti({
            particleCount: 25,
            spread: 50,
            origin: { y: 0.7, x: 0.5 },
            colors: ['#f97316', '#22c55e', '#f59e0b'],
            ticks: 80,
            gravity: 1.2,
            scalar: 0.7,
          });
        } catch (e) {
          // Silently ignore confetti errors
        }
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [onSelectionMade]);

  return (
    <div className="space-y-6 animate-fade-in">
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
    </div>
  );
};

export default OnboardingStepWrapper;
