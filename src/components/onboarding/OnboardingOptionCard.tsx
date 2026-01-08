import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingOptionCardProps {
  label: string;
  description?: string;
  icon?: React.ReactNode;
  selected: boolean;
  onClick: () => void;
  className?: string;
  size?: 'default' | 'large' | 'compact';
}

export const OnboardingOptionCard: React.FC<OnboardingOptionCardProps> = ({
  label,
  description,
  icon,
  selected,
  onClick,
  className = "",
  size = 'default',
}) => {
  const sizeClasses = {
    compact: "p-3",
    default: "p-4",
    large: "p-5",
  };

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "w-full rounded-2xl border-2 transition-all duration-200 text-left relative overflow-hidden",
        sizeClasses[size],
        selected
          ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
          : "border-border/50 bg-card hover:border-muted-foreground/30 hover:bg-muted/30",
        className
      )}
    >
      <div className="flex items-center gap-4">
        {icon && (
          <div className={cn(
            "shrink-0 rounded-xl flex items-center justify-center transition-colors",
            size === 'compact' ? "w-10 h-10" : "w-12 h-12",
            selected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
          )}>
            {icon}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <p className={cn(
            "font-semibold transition-colors",
            size === 'compact' ? "text-base" : "text-lg",
            selected ? "text-primary" : "text-foreground"
          )}>
            {label}
          </p>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
              {description}
            </p>
          )}
        </div>

        {/* Selection indicator */}
        <motion.div
          initial={false}
          animate={{
            scale: selected ? 1 : 0,
            opacity: selected ? 1 : 0,
          }}
          transition={{ duration: 0.2 }}
          className="shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center"
        >
          <Check className="w-4 h-4 text-primary-foreground" />
        </motion.div>
      </div>

      {/* Selection glow effect */}
      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 pointer-events-none"
        />
      )}
    </motion.button>
  );
};
