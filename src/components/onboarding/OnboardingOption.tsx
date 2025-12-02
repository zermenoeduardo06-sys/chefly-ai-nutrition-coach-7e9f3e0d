import { motion, AnimatePresence } from "framer-motion";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Check, Sparkles } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface OnboardingOptionProps {
  value: string;
  label: string;
  description?: string;
  isSelected: boolean;
  onSelect: (value: string) => void;
  icon?: LucideIcon;
  index: number;
  useRadio?: boolean;
}

const OnboardingOption = ({
  value,
  label,
  description,
  isSelected,
  onSelect,
  icon: Icon,
  index,
  useRadio = true,
}: OnboardingOptionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.08,
        type: "spring",
        stiffness: 300,
        damping: 25
      }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(value)}
      className={`
        relative flex items-center gap-4 p-4 rounded-xl cursor-pointer
        transition-all duration-300 overflow-hidden group
        ${isSelected 
          ? 'bg-primary/10 border-2 border-primary shadow-lg shadow-primary/10' 
          : 'bg-card border-2 border-border hover:border-primary/30 hover:bg-muted/50'
        }
      `}
    >
      {/* Background glow effect when selected */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5"
          />
        )}
      </AnimatePresence>

      {/* Sparkle effect on selection */}
      <AnimatePresence>
        {isSelected && (
          <>
            <motion.div
              initial={{ opacity: 0, scale: 0, rotate: -180 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="absolute top-2 right-2"
            >
              <Sparkles className="w-4 h-4 text-primary" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
              transition={{ duration: 1, repeat: 0 }}
              className="absolute top-4 right-8"
            >
              <Sparkles className="w-3 h-3 text-secondary" />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Icon */}
      {Icon && (
        <motion.div
          animate={isSelected ? { 
            scale: [1, 1.2, 1],
            rotate: [0, 5, -5, 0]
          } : {}}
          transition={{ duration: 0.5 }}
          className={`
            flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center
            transition-all duration-300
            ${isSelected 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary'
            }
          `}
        >
          <Icon className="w-6 h-6" />
        </motion.div>
      )}

      {/* Radio button */}
      {useRadio && !Icon && (
        <div className="relative z-10">
          <RadioGroupItem value={value} id={value} className="sr-only" />
          <motion.div
            animate={isSelected ? { scale: [1, 1.2, 1] } : { scale: 1 }}
            transition={{ duration: 0.3 }}
            className={`
              w-6 h-6 rounded-full border-2 flex items-center justify-center
              transition-all duration-300
              ${isSelected 
                ? 'border-primary bg-primary' 
                : 'border-muted-foreground'
              }
            `}
          >
            <AnimatePresence>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <Check className="w-4 h-4 text-primary-foreground" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 relative z-10">
        <Label 
          htmlFor={value} 
          className={`
            cursor-pointer font-medium text-base block
            transition-colors duration-300
            ${isSelected ? 'text-primary' : 'text-foreground'}
          `}
        >
          {label}
        </Label>
        {description && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-muted-foreground mt-1"
          >
            {description}
          </motion.p>
        )}
      </div>

      {/* Check mark for non-radio options */}
      {!useRadio && (
        <motion.div
          animate={isSelected ? { scale: [1, 1.3, 1] } : { scale: 1 }}
          className={`
            w-6 h-6 rounded-full flex items-center justify-center
            transition-all duration-300
            ${isSelected 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted'
            }
          `}
        >
          <AnimatePresence>
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Check className="w-4 h-4" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
};

export default OnboardingOption;
