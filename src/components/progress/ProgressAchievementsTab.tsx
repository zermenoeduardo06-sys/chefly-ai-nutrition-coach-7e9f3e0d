import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lock, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";

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

interface ProgressAchievementsTabProps {
  userId: string;
}

export function ProgressAchievementsTab({ userId }: ProgressAchievementsTabProps) {
  const { language } = useLanguage();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const texts = {
    es: {
      unlocked: "Desbloqueados",
      total: "Total",
      empty: "Aún no hay logros disponibles",
    },
    en: {
      unlocked: "Unlocked",
      total: "Total",
      empty: "No achievements available yet",
    },
  };
  const t = texts[language];

  useEffect(() => {
    if (!userId) return;
    loadAchievements();
  }, [userId]);

  const loadAchievements = async () => {
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
        .eq("user_id", userId);

      if (userAchievements) {
        setUnlockedAchievements(new Set(userAchievements.map(ua => ua.achievement_id)));
      }
    } catch (error) {
      console.error("Error loading achievements:", error);
    } finally {
      setLoading(false);
    }
  };

  const sortedAchievements = [...achievements].sort((a, b) => {
    const aUnlocked = unlockedAchievements.has(a.id);
    const bUnlocked = unlockedAchievements.has(b.id);
    if (aUnlocked && !bUnlocked) return -1;
    if (!aUnlocked && bUnlocked) return 1;
    return a.requirement_value - b.requirement_value;
  });

  const unlockedCount = unlockedAchievements.size;
  const totalCount = achievements.length;

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress stats */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex justify-center"
      >
        <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl px-6 py-3 flex items-center gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{unlockedCount}</p>
            <p className="text-xs text-muted-foreground">{t.unlocked}</p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{totalCount}</p>
            <p className="text-xs text-muted-foreground">{t.total}</p>
          </div>
        </div>
      </motion.div>

      {/* Achievements Grid */}
      <div className="space-y-3">
        {sortedAchievements.map((achievement, index) => {
          const isUnlocked = unlockedAchievements.has(achievement.id);
          
          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <div className={`
                bg-card border rounded-xl p-3 transition-all
                ${isUnlocked 
                  ? "border-yellow-500/50 bg-gradient-to-r from-yellow-500/10 to-amber-500/10" 
                  : "border-border opacity-60"
                }
              `}>
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <div 
                    className={`
                      w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0
                      ${isUnlocked 
                        ? "bg-gradient-to-br from-yellow-400 to-amber-500 shadow-md" 
                        : "bg-muted"
                      }
                    `}
                  >
                    {isUnlocked ? (
                      <span>{achievement.icon}</span>
                    ) : (
                      <Lock className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-semibold text-sm ${
                      isUnlocked ? "text-foreground" : "text-muted-foreground"
                    }`}>
                      {achievement.title}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {achievement.description}
                    </p>
                  </div>
                  
                  {/* Points */}
                  <span className={`
                    text-xs font-bold px-2 py-1 rounded-full shrink-0
                    ${isUnlocked 
                      ? "bg-yellow-500 text-white" 
                      : "bg-muted text-muted-foreground"
                    }
                  `}>
                    +{achievement.points_reward}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
