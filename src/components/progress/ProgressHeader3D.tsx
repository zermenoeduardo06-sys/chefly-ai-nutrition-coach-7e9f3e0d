import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Star, Trophy, TrendingUp, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Icon3D } from "@/components/ui/icon-3d";
import { Progress } from "@/components/ui/progress";

interface ProgressHeader3DProps {
  userId: string;
}

interface UserStats {
  current_streak: number;
  total_points: number;
  level: number;
}

const getLevelProgress = (points: number, level: number): number => {
  const pointsPerLevel = 500;
  const levelStart = (level - 1) * pointsPerLevel;
  const levelEnd = level * pointsPerLevel;
  const progress = ((points - levelStart) / (levelEnd - levelStart)) * 100;
  return Math.min(Math.max(progress, 0), 100);
};

export function ProgressHeader3D({ userId }: ProgressHeader3DProps) {
  const { language } = useLanguage();
  const [stats, setStats] = useState<UserStats | null>(null);

  const texts = {
    es: {
      title: "Tu Progreso",
      streak: "Racha",
      points: "Puntos",
      level: "Nivel",
      days: "días",
    },
    en: {
      title: "Your Progress",
      streak: "Streak",
      points: "Points",
      level: "Level",
      days: "days",
    },
  };
  const t = texts[language];

  useEffect(() => {
    if (!userId) return;
    loadStats();
  }, [userId]);

  const loadStats = async () => {
    try {
      const { data } = await supabase
        .from("user_stats")
        .select("current_streak, total_points, level")
        .eq("user_id", userId)
        .single();

      if (data) {
        setStats(data);
      }
    } catch (error) {
      console.error("Error loading stats for header:", error);
    }
  };

  if (!stats) {
    return (
      <div className="h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 animate-pulse" />
    );
  }

  const levelProgress = getLevelProgress(stats.total_points, stats.level);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-secondary"
    >
      {/* Decorative particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-4 right-8"
          animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Sparkles className="h-5 w-5 text-white/40" />
        </motion.div>
        <motion.div
          className="absolute bottom-6 left-6"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <Star className="h-4 w-4 text-white/20" />
        </motion.div>
      </div>

      <div className="relative px-5 py-5">
        {/* Title row */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-[0_4px_0_rgba(255,255,255,0.1)]">
            <TrendingUp className="h-6 w-6 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold text-white">{t.title}</h1>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {/* Streak */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 shadow-[0_4px_0_rgba(255,255,255,0.05)]"
          >
            <div className="flex items-center gap-2 mb-1">
              <motion.div
                animate={stats.current_streak > 0 ? { scale: [1, 1.15, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Flame className="h-5 w-5 text-orange-300" />
              </motion.div>
              <span className="text-xs text-white/70 font-medium">{t.streak}</span>
            </div>
            <p className="text-2xl font-black text-white">{stats.current_streak}</p>
            <p className="text-[10px] text-white/60">{t.days}</p>
          </motion.div>

          {/* Points */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 shadow-[0_4px_0_rgba(255,255,255,0.05)]"
          >
            <div className="flex items-center gap-2 mb-1">
              <Star className="h-5 w-5 text-amber-300" />
              <span className="text-xs text-white/70 font-medium">{t.points}</span>
            </div>
            <p className="text-2xl font-black text-white">
              {stats.total_points >= 1000 
                ? `${(stats.total_points / 1000).toFixed(1)}k` 
                : stats.total_points}
            </p>
            <p className="text-[10px] text-white/60">XP</p>
          </motion.div>

          {/* Level */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 shadow-[0_4px_0_rgba(255,255,255,0.05)]"
          >
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-5 w-5 text-purple-300" />
              <span className="text-xs text-white/70 font-medium">{t.level}</span>
            </div>
            <p className="text-2xl font-black text-white">{stats.level}</p>
            <div className="mt-1">
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-300 to-pink-300 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${levelProgress}%` }}
                  transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
