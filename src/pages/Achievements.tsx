import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useTrialGuard } from "@/hooks/useTrialGuard";
import { useLanguage } from "@/contexts/LanguageContext";
import { Loader2, Trophy, Lock, Star, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import mascotFlexing from "@/assets/mascot-flexing.png";

interface Achievement {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  requirement_type: string;
  requirement_value: number;
  points_reward: number;
}

const Achievements = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { isBlocked, isLoading: trialLoading } = useTrialGuard();

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    setLoading(true);
    try {
      const { data: allAchievements } = await supabase
        .from("achievements")
        .select("*")
        .order("requirement_value", { ascending: true });

      if (allAchievements) {
        setAchievements(allAchievements);
      }

      const { data: userAchievements } = await supabase
        .from("user_achievements")
        .select("achievement_id")
        .eq("user_id", user.id);

      if (userAchievements) {
        setUnlockedAchievements(new Set(userAchievements.map(ua => ua.achievement_id)));
      }
    } catch (error) {
      console.error("Error loading achievements:", error);
    } finally {
      setLoading(false);
    }
  };

  if (trialLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isBlocked) {
    return null;
  }

  const sortedAchievements = [...achievements].sort((a, b) => {
    const aUnlocked = unlockedAchievements.has(a.id);
    const bUnlocked = unlockedAchievements.has(b.id);
    if (aUnlocked && !bUnlocked) return -1;
    if (!aUnlocked && bUnlocked) return 1;
    return a.requirement_value - b.requirement_value;
  });

  const unlockedCount = unlockedAchievements.size;
  const totalCount = achievements.length;

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-6">
      {/* Hero Header with safe area */}
      <div className="relative bg-gradient-to-br from-yellow-500 via-amber-500 to-orange-500 overflow-hidden pt-safe-top">
        {/* Sparkle decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div 
            className="absolute top-8 left-8"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Star className="h-5 w-5 text-white/60" />
          </motion.div>
          <motion.div 
            className="absolute top-12 right-12"
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
          >
            <Sparkles className="h-4 w-4 text-white/50" />
          </motion.div>
        </div>

        <div className="relative px-4 pt-4 pb-8">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex justify-center mb-2">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3">
                <Trophy className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">
              {t('achievements.title')}
            </h1>
            <p className="text-white/80 text-sm">
              {t('achievements.subtitle')}
            </p>
          </motion.div>

          {/* Progress stats */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center mt-4"
          >
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3 flex items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{unlockedCount}</p>
                <p className="text-xs text-white/70">{language === "es" ? "Desbloqueados" : "Unlocked"}</p>
              </div>
              <div className="w-px h-8 bg-white/30" />
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{totalCount}</p>
                <p className="text-xs text-white/70">{language === "es" ? "Total" : "Total"}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="px-4 pt-6 space-y-3 max-w-lg mx-auto">
        {sortedAchievements.map((achievement, index) => {
          const isUnlocked = unlockedAchievements.has(achievement.id);
          
          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <div className={`
                bg-card border-2 rounded-2xl p-4 transition-all
                ${isUnlocked 
                  ? "border-yellow-500/50 bg-gradient-to-r from-yellow-500/10 to-amber-500/10" 
                  : "border-border opacity-60"
                }
              `}>
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <motion.div 
                    className={`
                      w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0
                      ${isUnlocked 
                        ? "bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg" 
                        : "bg-muted"
                      }
                    `}
                    whileHover={isUnlocked ? { scale: 1.1, rotate: 10 } : {}}
                  >
                    {isUnlocked ? (
                      <span>{achievement.icon}</span>
                    ) : (
                      <Lock className="w-6 h-6 text-muted-foreground" />
                    )}
                  </motion.div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-bold text-base mb-0.5 ${
                      isUnlocked ? "text-foreground" : "text-muted-foreground"
                    }`}>
                      {achievement.title}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                      {achievement.description}
                    </p>
                    
                    {/* Points badge */}
                    <div className="flex items-center gap-2">
                      <span className={`
                        text-xs font-bold px-2.5 py-1 rounded-full
                        ${isUnlocked 
                          ? "bg-yellow-500 text-white" 
                          : "bg-muted text-muted-foreground"
                        }
                      `}>
                        +{achievement.points_reward} pts
                      </span>
                      {isUnlocked && (
                        <span className="text-xs text-yellow-600 font-semibold flex items-center gap-1">
                          <Trophy className="h-3 w-3" />
                          {language === "es" ? "¡Desbloqueado!" : "Unlocked!"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Mascot decoration */}
      <motion.div 
        className="fixed bottom-24 right-4 md:bottom-8 md:right-8 pointer-events-none"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 0.3, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <img src={mascotFlexing} alt="" className="h-20 w-20 opacity-50" />
      </motion.div>
    </div>
  );
};

export default Achievements;
