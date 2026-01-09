import { motion } from 'framer-motion';
import AnimatedNumber from './AnimatedNumber';

interface MacroRevealCardProps {
  label: string;
  value: number;
  unit: string;
  color: string;
  icon: React.ReactNode;
  description: string;
  delay: number;
  maxValue: number;
  onComplete?: () => void;
}

export const MacroRevealCard = ({
  label,
  value,
  unit,
  color,
  icon,
  description,
  delay,
  maxValue,
  onComplete,
}: MacroRevealCardProps) => {
  const percentage = (value / maxValue) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: delay / 1000, duration: 0.5, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 p-4"
    >
      {/* Background glow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ delay: (delay + 300) / 1000, duration: 0.5 }}
        className="absolute inset-0 rounded-2xl"
        style={{ background: `linear-gradient(135deg, ${color}20, transparent)` }}
      />

      <div className="relative z-10 flex items-center gap-4">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: (delay + 200) / 1000, type: 'spring', stiffness: 200 }}
          className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {icon}
        </motion.div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <AnimatedNumber
              value={value}
              delay={delay + 400}
              duration={1500}
              suffix={unit}
              className="text-2xl font-bold text-foreground"
              onComplete={onComplete}
            />
            <span className="text-sm text-muted-foreground">{label}</span>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-muted/50 rounded-full overflow-hidden mb-1">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ delay: (delay + 600) / 1000, duration: 1, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ backgroundColor: color }}
            />
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: (delay + 1000) / 1000 }}
            className="text-xs text-muted-foreground"
          >
            {description}
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
};

export default MacroRevealCard;
