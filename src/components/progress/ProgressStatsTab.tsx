import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Trophy, Star, Target, Utensils } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StreakCounter } from "@/components/streaks/StreakCounter";
import { useSubscription } from "@/hooks/useSubscription";

interface UserStats {
  current_streak: number;
  longest_streak: number;
  total_points: number;
  level: number;
  meals_completed: number;
  streak_freeze_available: number;
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
      mealsCompleted: "Comidas completadas",
      days: "días",
      empty: "Aún no hay estadísticas",
    },
    en: {
      stats: "Statistics",
      streak: "Current streak",
      longestStreak: "Best streak",
      points: "Total points",
      level: "Level",
      mealsCompleted: "Meals completed",
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
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {t.empty}
      </div>
    );
  }

  const statItems = [
    {
      icon: Star,
      label: t.points,
      value: stats.total_points.toLocaleString(),
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      icon: Target,
      label: t.level,
      value: stats.level,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: Utensils,
      label: t.mealsCompleted,
      value: stats.meals_completed.toLocaleString(),
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      icon: Trophy,
      label: t.longestStreak,
      value: `${stats.longest_streak} ${t.days}`,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Streak Counter */}
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

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {statItems.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + index * 0.05 }}
          >
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center mb-2`}>
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <p className="text-2xl font-bold text-foreground">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
