import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";
import { AchievementBadge3D } from "@/components/progress/AchievementBadge3D";
import { Card3D } from "@/components/ui/card-3d";
import { Progress } from "@/components/ui/progress";

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
      progress: "Progreso",
    },
    en: {
      unlocked: "Unlocked",
      total: "Total",
      empty: "No achievements available yet",
      progress: "Progress",
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
  const progressPercentage = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full rounded-3xl" />
        <div className="grid grid-cols-2 gap-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Progress summary card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card3D variant="elevated" className="p-5">
          <div className="flex items-center gap-4">
            {/* Trophy icon */}
            <motion.div
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-[0_4px_0_hsl(30_90%_35%),0_8px_20px_rgba(0,0,0,0.15)]"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Trophy className="w-8 h-8 text-white" />
            </motion.div>

            {/* Stats */}
            <div className="flex-1">
              <div className="flex items-baseline gap-2 mb-2">
                <motion.span
                  className="text-4xl font-black text-foreground"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  {unlockedCount}
                </motion.span>
                <span className="text-lg text-muted-foreground">/ {totalCount}</span>
              </div>
              
              {/* Progress bar */}
              <div className="space-y-1">
                <div className="h-3 bg-muted rounded-full overflow-hidden shadow-inner">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {t.progress}: {Math.round(progressPercentage)}%
                </p>
              </div>
            </div>
          </div>
        </Card3D>
      </motion.div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-2 gap-3">
        {sortedAchievements.map((achievement, index) => (
          <AchievementBadge3D
            key={achievement.id}
            achievement={achievement}
            isUnlocked={unlockedAchievements.has(achievement.id)}
            index={index}
          />
        ))}
      </div>

      {achievements.length === 0 && (
        <Card3D className="p-8">
          <div className="text-center text-muted-foreground">
            {t.empty}
          </div>
        </Card3D>
      )}
    </div>
  );
}
