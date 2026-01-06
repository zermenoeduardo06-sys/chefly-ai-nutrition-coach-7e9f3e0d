import { motion } from "framer-motion";
import { Flame, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { InfoTooltip } from "@/components/InfoTooltip";

interface DashboardHeaderProps {
  displayName?: string;
  currentStreak: number;
  level: number;
}

export const DashboardHeader = ({ displayName, currentStreak, level }: DashboardHeaderProps) => {
  const { language } = useLanguage();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return language === 'es' ? '¡Buenos días' : 'Good morning';
    if (hour < 18) return language === 'es' ? '¡Buenas tardes' : 'Good afternoon';
    return language === 'es' ? '¡Buenas noches' : 'Good evening';
  };
  
  const name = displayName || (language === 'es' ? 'Chef' : 'Chef');
  const greeting = getGreeting();
  
  const today = new Date();
  const dateStr = today.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {greeting}, <span className="text-primary">{name}</span>! 👋
          </h1>
          <p className="text-sm text-muted-foreground capitalize">{dateStr}</p>
        </div>
        
        {/* Streak & Level badges */}
        <div className="flex items-center gap-2">
          {currentStreak > 0 && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30"
            >
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-bold text-orange-600 dark:text-orange-400">{currentStreak}</span>
              <InfoTooltip 
                titleKey="tooltip.streak.title"
                contentKey="tooltip.streak.content"
                iconSize={12}
                className="ml-0.5"
              />
            </motion.div>
          )}
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold text-primary">Lv.{level}</span>
            <InfoTooltip 
              titleKey="tooltip.level.title"
              contentKey="tooltip.level.content"
              iconSize={12}
              className="ml-0.5"
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
