import { motion } from "framer-motion";
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
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.3, 
        delay: index * 0.05,
        ease: "easeOut"
      }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onSelect(value)}
      className={`
        relative flex items-center gap-4 p-4 rounded-xl cursor-pointer
        transition-all duration-200 overflow-hidden group
        ${isSelected 
          ? 'bg-primary/10 border-2 border-primary shadow-lg shadow-primary/10' 
          : 'bg-card border-2 border-border hover:border-primary/30 hover:bg-muted/50'
        }
      `}
    >
      {/* Background glow effect when selected */}
      {isSelected && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 transition-opacity duration-200" />
      )}

      {/* Sparkle effect on selection */}
      {isSelected && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="absolute top-2 right-2"
        >
          <Sparkles className="w-4 h-4 text-primary" />
        </motion.div>
      )}

      {/* Icon */}
      {Icon && (
        <div
          className={`
            flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center
            transition-all duration-200
            ${isSelected 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary'
            }
          `}
        >
          <Icon className="w-6 h-6" />
        </div>
      )}

      {/* Radio indicator */}
      {useRadio && !Icon && (
        <div
          className={`
            w-6 h-6 rounded-full border-2 flex items-center justify-center
            transition-all duration-200
            ${isSelected 
              ? 'border-primary bg-primary' 
              : 'border-muted-foreground'
            }
          `}
        >
          {isSelected && (
            <Check className="w-4 h-4 text-primary-foreground" />
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 relative z-10">
        <Label 
          htmlFor={value} 
          className={`
            cursor-pointer font-medium text-base block
            transition-colors duration-200
            ${isSelected ? 'text-primary' : 'text-foreground'}
          `}
        >
          {label}
        </Label>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </div>

      {/* Check mark for non-radio options */}
      {!useRadio && (
        <div
          className={`
            w-6 h-6 rounded-full flex items-center justify-center
            transition-all duration-200
            ${isSelected 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted'
            }
          `}
        >
          {isSelected && <Check className="w-4 h-4" />}
        </div>
      )}
    </motion.div>
  );
};

export default OnboardingOption;
