import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

const OnboardingProgress = ({ currentStep, totalSteps }: OnboardingProgressProps) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full mb-8">
      {/* Progress bar */}
      <div className="relative h-3 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-primary to-secondary rounded-full"
        />
        
        {/* Shimmer effect */}
        <motion.div
          animate={{ x: ["-100%", "200%"] }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "linear",
            repeatDelay: 1
          }}
          className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          style={{ left: 0 }}
        />
      </div>

      {/* Step indicators */}
      <div className="flex justify-between mt-4">
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepNum = i + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;
          
          return (
            <motion.div
              key={stepNum}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="flex flex-col items-center"
            >
              <motion.div
                animate={isCurrent ? {
                  scale: [1, 1.1, 1],
                  boxShadow: [
                    "0 0 0 0 rgba(var(--primary), 0)",
                    "0 0 0 8px rgba(var(--primary), 0.2)",
                    "0 0 0 0 rgba(var(--primary), 0)"
                  ]
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                  transition-all duration-300
                  ${isCompleted 
                    ? 'bg-primary text-primary-foreground' 
                    : isCurrent 
                      ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' 
                      : 'bg-muted text-muted-foreground'
                  }
                `}
              >
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    <Check className="w-4 h-4" />
                  </motion.div>
                ) : isCurrent ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-4 h-4" />
                  </motion.div>
                ) : (
                  stepNum
                )}
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default OnboardingProgress;
