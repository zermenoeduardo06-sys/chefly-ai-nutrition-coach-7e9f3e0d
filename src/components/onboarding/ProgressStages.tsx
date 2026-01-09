import { motion } from 'framer-motion';
import { Target, User, Utensils, ChefHat, Sparkles } from 'lucide-react';

interface ProgressStagesProps {
  currentStage: number;
  totalStages?: number;
}

const stages = [
  { icon: Target, label: 'Objetivo', color: 'hsl(var(--primary))' },
  { icon: User, label: 'Cuerpo', color: 'hsl(var(--secondary))' },
  { icon: Utensils, label: 'Gustos', color: 'hsl(var(--accent))' },
  { icon: ChefHat, label: 'Cocina', color: 'hsl(142, 76%, 36%)' },
  { icon: Sparkles, label: 'Listo', color: 'hsl(45, 93%, 47%)' },
];

export const ProgressStages = ({ currentStage }: ProgressStagesProps) => {
  // Map step to stage (0-5, 6-11, 12-17, 18-22, 23+)
  const getActiveStage = (step: number): number => {
    if (step <= 5) return 0;
    if (step <= 11) return 1;
    if (step <= 17) return 2;
    if (step <= 22) return 3;
    return 4;
  };

  const activeStage = getActiveStage(currentStage);

  return (
    <div className="w-full px-4 py-3">
      {/* Progress line */}
      <div className="relative flex items-center justify-between mb-2">
        {/* Background line */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-muted/30 rounded-full" />
        
        {/* Active line */}
        <motion.div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: `${(activeStage / (stages.length - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />

        {/* Stage icons */}
        {stages.map((stage, index) => {
          const Icon = stage.icon;
          const isActive = index <= activeStage;
          const isCurrent = index === activeStage;

          return (
            <motion.div
              key={stage.label}
              className="relative z-10 flex flex-col items-center"
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ 
                scale: isCurrent ? 1.1 : 1,
                opacity: isActive ? 1 : 0.4,
              }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
                  isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted/50 text-muted-foreground'
                }`}
                animate={isCurrent ? {
                  boxShadow: ['0 0 0 0 hsla(var(--primary), 0.4)', '0 0 0 8px hsla(var(--primary), 0)', '0 0 0 0 hsla(var(--primary), 0.4)'],
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Icon className="w-4 h-4" />
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Stage labels */}
      <div className="flex justify-between px-1">
        {stages.map((stage, index) => {
          const isActive = index <= activeStage;
          
          return (
            <span
              key={`label-${stage.label}`}
              className={`text-[10px] font-medium transition-colors duration-300 ${
                isActive ? 'text-foreground' : 'text-muted-foreground/50'
              }`}
            >
              {stage.label}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressStages;
