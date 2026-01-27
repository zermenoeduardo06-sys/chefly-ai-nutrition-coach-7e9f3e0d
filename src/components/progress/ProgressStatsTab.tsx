import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Trophy, Star, Target, Utensils, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";
import { StreakCounter } from "@/components/streaks/StreakCounter";
import { Stat3DCard } from "@/components/progress/Stat3DCard";
import { useSubscription } from "@/hooks/useSubscription";
import { Card3D } from "@/components/ui/card-3d";

interface UserStats {
  current_streak: number;
  longest_streak: number;
  total_points: number;
  level: number;
  meals_completed: number;
  streak_freeze_available: number;
  last_activity_date: string | null;
}

interface ProgressStatsTabProps {
  userId: string;
}

export function ProgressStatsTab({ userId }: ProgressStatsTabProps) {
  const { language } = useLanguage();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { subscribed } = useSubscription(userId);

  const texts = {
    es: {
      stats: "Estadísticas",
      streak: "Racha actual",
      longestStreak: "Mejor racha",
      points: "Puntos totales",
      level: "Nivel",
      mealsCompleted: "Comidas",
      daysActive: "Días activos",
      days: "días",
      empty: "Aún no hay estadísticas",
    },
    en: {
      stats: "Statistics",
      streak: "Current streak",
      longestStreak: "Best streak",
      points: "Total points",
      level: "Level",
      mealsCompleted: "Meals",
      daysActive: "Days active",
      days: "days",
      empty: "No stats yet",
    },
  };
  const t = texts[language];

  useEffect(() => {
    if (!userId) return;
    loadStats();
  }, [userId]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (data) {
        setStats(data);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-36 w-full rounded-3xl" />
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <Card3D className="p-8">
        <div className="text-center text-muted-foreground">
          {t.empty}
        </div>
      </Card3D>
    );
  }

  return (
    <div className="space-y-5">
      {/* Streak Counter with 3D styling */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <StreakCounter
          streak={stats.current_streak}
          longestStreak={stats.longest_streak}
          streakFreezeAvailable={stats.streak_freeze_available || 0}
          isPremium={subscribed || false}
        />
      </motion.div>

      {/* Stats Grid with 3D Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Stat3DCard
          icon={Star}
          value={stats.total_points}
          label={t.points}
          color="amber"
          delay={0.1}
        />
        <Stat3DCard
          icon={Target}
          value={stats.level}
          label={t.level}
          color="primary"
          delay={0.15}
        />
        <Stat3DCard
          icon={Utensils}
          value={stats.meals_completed}
          label={t.mealsCompleted}
          color="emerald"
          delay={0.2}
        />
        <Stat3DCard
          icon={Trophy}
          value={`${stats.longest_streak}`}
          label={t.longestStreak}
          color="rose"
          suffix={` ${t.days}`}
          delay={0.25}
        />
      </div>
    </div>
  );
}
