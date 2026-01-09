import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  showBack?: boolean;
  showNext?: boolean;
  nextDisabled?: boolean;
  className?: string;
}

export const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  children,
  currentStep,
  totalSteps,
  onBack,
  onNext,
  nextLabel = "Continuar",
  showBack = true,
  showNext = true,
  nextDisabled = false,
  className = "",
}) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className={`min-h-screen bg-background flex flex-col ${className}`}>
      {/* Header with progress bar */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50 pt-safe-top">
        <div className="flex items-center px-4 py-3 gap-4">
          {showBack && currentStep > 1 ? (
            <button
              onClick={onBack}
              className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
              aria-label="Volver"
            >
              <ChevronLeft className="w-6 h-6 text-muted-foreground" />
            </button>
          ) : (
            <div className="w-10" />
          )}
          
          {/* Progress bar */}
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
          
          <div className="w-10" />
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex-1 flex flex-col"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom action button */}
      {showNext && (
        <div className="sticky bottom-0 p-4 pb-safe bg-background/95 backdrop-blur-sm border-t border-border/50">
          <Button
            onClick={onNext}
            disabled={nextDisabled}
            className="w-full py-6 text-lg font-semibold"
            variant="default"
          >
            {nextLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
