import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingValueScreenProps {
  icon: LucideIcon;
  title: string;
  description: string;
  features?: string[];
  image?: string;
  gradient?: 'primary' | 'secondary' | 'accent';
  className?: string;
}

const gradientClasses = {
  primary: "from-primary/20 to-primary/5",
  secondary: "from-secondary/20 to-secondary/5",
  accent: "from-primary/10 via-secondary/10 to-primary/10",
};

export const OnboardingValueScreen: React.FC<OnboardingValueScreenProps> = ({
  icon: Icon,
  title,
  description,
  features = [],
  image,
  gradient = 'primary',
  className = "",
}) => {
  return (
    <div className={cn("flex-1 flex flex-col items-center justify-center px-6 py-8", className)}>
      {/* Icon with glow */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="relative mb-6"
      >
        <div className={cn(
          "w-24 h-24 rounded-3xl flex items-center justify-center",
          "bg-gradient-to-br",
          gradient === 'primary' && "from-primary to-primary/80",
          gradient === 'secondary' && "from-secondary to-secondary/80",
          gradient === 'accent' && "from-primary to-secondary",
        )}>
          <Icon className="w-12 h-12 text-white" />
        </div>
        
        {/* Glow effect */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.2, 0.5],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className={cn(
            "absolute inset-0 rounded-3xl blur-xl -z-10",
            gradient === 'primary' && "bg-primary/40",
            gradient === 'secondary' && "bg-secondary/40",
            gradient === 'accent' && "bg-gradient-to-br from-primary/40 to-secondary/40",
          )}
        />
      </motion.div>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-2xl sm:text-3xl font-bold text-center mb-3"
      >
        {title}
      </motion.h2>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-muted-foreground text-center text-base sm:text-lg max-w-sm mb-6"
      >
        {description}
      </motion.p>

      {/* Features list */}
      {features.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-xs space-y-3"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="flex items-center gap-3 text-foreground"
            >
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <div className="w-2 h-2 rounded-full bg-primary" />
              </div>
              <span className="text-sm">{feature}</span>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Optional preview image */}
      {image && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={cn(
            "mt-8 w-full max-w-sm rounded-2xl overflow-hidden",
            "bg-gradient-to-b",
            gradientClasses[gradient],
            "p-4"
          )}
        >
          <img
            src={image}
            alt={title}
            className="w-full rounded-xl shadow-lg"
          />
        </motion.div>
      )}
    </div>
  );
};
