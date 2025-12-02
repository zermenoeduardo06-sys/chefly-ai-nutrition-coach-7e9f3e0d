import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles } from "lucide-react";

interface OnboardingBadgeSelectorProps {
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
}

const OnboardingBadgeSelector = ({ options, selected, onToggle }: OnboardingBadgeSelectorProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {options.map((option, index) => {
        const isSelected = selected.includes(option.value);
        
        return (
          <motion.div
            key={option.value}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ 
              duration: 0.4, 
              delay: index * 0.06,
              type: "spring",
              stiffness: 400,
              damping: 25
            }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Badge
              variant={isSelected ? "default" : "outline"}
              onClick={() => onToggle(option.value)}
              className={`
                px-4 py-3 text-sm cursor-pointer justify-center w-full
                transition-all duration-300 relative overflow-hidden
                ${isSelected 
                  ? 'bg-primary hover:bg-primary shadow-lg shadow-primary/25' 
                  : 'hover:border-primary/50 hover:bg-primary/5'
                }
              `}
            >
              {/* Sparkle effect */}
              <AnimatePresence>
                {isSelected && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    className="absolute -top-1 -right-1"
                  >
                    <Sparkles className="w-3 h-3 text-secondary" />
                  </motion.span>
                )}
              </AnimatePresence>

              <span className="flex items-center gap-2">
                <AnimatePresence>
                  {isSelected && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      <Check className="w-4 h-4" />
                    </motion.span>
                  )}
                </AnimatePresence>
                {option.label}
              </span>

              {/* Ripple effect on selection */}
              <AnimatePresence>
                {isSelected && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0.5 }}
                    animate={{ scale: 2.5, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0 rounded-full bg-white pointer-events-none"
                  />
                )}
              </AnimatePresence>
            </Badge>
          </motion.div>
        );
      })}
    </div>
  );
};

export default OnboardingBadgeSelector;
