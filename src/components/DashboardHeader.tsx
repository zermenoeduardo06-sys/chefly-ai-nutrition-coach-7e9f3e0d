import { motion } from "framer-motion";
import { Flame, Sparkles, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
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
    if (hour < 12) return language === 'es' ? 'Buenos días' : 'Good morning';
    if (hour < 18) return language === 'es' ? 'Buenas tardes' : 'Good afternoon';
    return language === 'es' ? 'Buenas noches' : 'Good evening';
  };
  
  const name = isProfileLoading 
    ? 'Chef'
    : (displayName || 'Chef');
  const greeting = getGreeting();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mb-1"
    >
      {/* Row 1: Avatar + badges */}
      <div className="flex items-center justify-between mb-3">
        {/* Profile avatar */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/dashboard/more')}
          className="relative"
          data-tour="user-avatar"
        >
          <Avatar className="h-11 w-11 border-2 border-primary/30 shadow-lg">
            <AvatarImage src={avatarUrl || undefined} alt={displayName || 'Profile'} />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20">
              <User className="h-5 w-5 text-primary" />
            </AvatarFallback>
          </Avatar>
        </motion.button>

        {/* Streak + Level pills */}
        <div className="flex items-center gap-2">
          {currentStreak > 0 && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30"
            >
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-bold text-orange-600 dark:text-orange-400">{currentStreak}</span>
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
          </motion.div>
        </div>
      </div>

      {/* Row 2: Greeting - prominent and clean */}
      <h1 className="text-2xl font-bold text-foreground leading-tight">
        {greeting}, <span className="text-primary">{name}</span> 👋
      </h1>
    </motion.div>
  );
};
