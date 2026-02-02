import { motion } from "framer-motion";
import { Flame, Sparkles, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { InfoTooltip } from "@/components/InfoTooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DashboardHeaderProps {
  displayName?: string;
  currentStreak: number;
  level: number;
  avatarUrl?: string | null;
  isProfileLoading?: boolean;
}

export const DashboardHeader = ({ 
  displayName, 
  currentStreak, 
  level, 
  avatarUrl,
  isProfileLoading = false 
}: DashboardHeaderProps) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return language === 'es' ? '¡Buenos días' : 'Good morning';
    if (hour < 18) return language === 'es' ? '¡Buenas tardes' : 'Good afternoon';
    return language === 'es' ? '¡Buenas noches' : 'Good evening';
  };
  
  // Show fallback "Chef" while loading to prevent flash of previous user's name
  const name = isProfileLoading 
    ? (language === 'es' ? 'Chef' : 'Chef')
    : (displayName || (language === 'es' ? 'Chef' : 'Chef'));
  const greeting = getGreeting();
  

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="mb-6 min-h-[72px]"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1 min-w-0 flex-1 mr-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">
            {greeting}, <span className="text-primary max-w-[150px] truncate inline-block align-bottom">{name}</span>! 👋
          </h1>
        </div>
        
        {/* Profile avatar & Streak & Level badges */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Profile avatar - navigates to More page */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard/more')}
            className="relative"
            data-tour="user-avatar"
          >
            <Avatar className="h-10 w-10 border-2 border-primary/30 shadow-lg">
              <AvatarImage src={avatarUrl || undefined} alt={displayName || 'Profile'} />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20">
                <User className="h-5 w-5 text-primary" />
              </AvatarFallback>
            </Avatar>
            {/* Small indicator dot */}
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-primary border-2 border-background" />
          </motion.button>
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
