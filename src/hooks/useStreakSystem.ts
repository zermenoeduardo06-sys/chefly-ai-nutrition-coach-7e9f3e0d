import { useCallback, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  streakFreezeAvailable: number;
  streakFrozenAt: string | null;
}

const defaultStreak: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastActivityDate: null,
  streakFreezeAvailable: 0,
  streakFrozenAt: null,
};

/** Check daily calories from completions + scans */
async function checkDailyCalories(userId: string, localDate: Date): Promise<number> {
  let totalCalories = 0;
  const dayStart = new Date(localDate.getFullYear(), localDate.getMonth(), localDate.getDate());
  const dayEnd = new Date(dayStart.getTime() + 86400000);

  const [completions, scans] = await Promise.all([
    supabase
      .from("meal_completions")
      .select(`meals (calories)`)
      .eq("user_id", userId)
      .gte("completed_at", dayStart.toISOString())
      .lt("completed_at", dayEnd.toISOString()),
    supabase
      .from("food_scans")
      .select("calories")
      .eq("user_id", userId)
      .gte("scanned_at", dayStart.toISOString())
      .lt("scanned_at", dayEnd.toISOString()),
  ]);

  completions.data?.forEach((c: any) => {
    if (c.meals?.calories) totalCalories += c.meals.calories;
  });
  scans.data?.forEach((s) => {
    totalCalories += s.calories || 0;
  });

  return totalCalories;
}

/** Fetch streak data + handle reset logic */
async function fetchStreakData(
  userId: string,
  onResetToast?: (lang: string) => void
): Promise<StreakData> {
  const { data, error } = await supabase
    .from("user_stats")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error loading streak data:", error);
    return defaultStreak;
  }
  if (!data) return defaultStreak;

  const now = new Date();
  const yesterdayStr = (() => {
    const y = new Date(now);
    y.setDate(y.getDate() - 1);
    return y.toISOString().split("T")[0];
  })();

  let currentStreak = data.current_streak || 0;
  const lastActivity = data.last_activity_date;

  // Reset streak if last activity was before yesterday and yesterday had 0 calories
  if (lastActivity && lastActivity < yesterdayStr && currentStreak > 0) {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayCalories = await checkDailyCalories(userId, yesterday);

    if (yesterdayCalories === 0) {
      currentStreak = 0;
      await supabase
        .from("user_stats")
        .update({ current_streak: 0, updated_at: new Date().toISOString() })
        .eq("user_id", userId);

      onResetToast?.("reset");
    }
  }

  return {
    currentStreak,
    longestStreak: data.longest_streak || 0,
    lastActivityDate: lastActivity,
    streakFreezeAvailable: data.streak_freeze_available || 0,
    streakFrozenAt: data.streak_frozen_at,
  };
}

export function useStreakSystem(userId: string | undefined, isPremium: boolean) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { language } = useLanguage();

  const toastRef = useRef(toast);
  const languageRef = useRef(language);
  toastRef.current = toast;
  languageRef.current = language;

  const queryKey = ['streak', userId];

  const onResetToast = useCallback(() => {
    const lang = languageRef.current;
    toastRef.current({
      variant: "destructive",
      title: lang === 'es' ? "Racha reiniciada" : "Streak reset",
      description: lang === 'es'
        ? "No registraste calorías ayer. ¡Empieza de nuevo hoy!"
        : "You didn't log any calories yesterday. Start fresh today!",
    });
  }, []);

  const { data: streakData = defaultStreak, isLoading } = useQuery({
    queryKey,
    queryFn: () => fetchStreakData(userId!, onResetToast),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  const updateStreakOnCalorieLog = useCallback(async () => {
    if (!userId) return;

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const todayCalories = await checkDailyCalories(userId, now);

    if (todayCalories > 0) {
      const { data: stats } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (stats) {
        const lastActivity = stats.last_activity_date;
        let newStreak = stats.current_streak || 0;

        if (lastActivity !== todayStr) {
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split("T")[0];

          if (lastActivity === yesterdayStr) {
            newStreak += 1;
          } else if (!lastActivity) {
            newStreak = 1;
          } else {
            newStreak = 1;
          }

          const newLongestStreak = Math.max(newStreak, stats.longest_streak || 0);

          await supabase
            .from("user_stats")
            .update({
              current_streak: newStreak,
              longest_streak: newLongestStreak,
              last_activity_date: todayStr,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId);

          // Invalidate cache to pick up new data
          queryClient.invalidateQueries({ queryKey });
        }
      }
    }
  }, [userId, queryClient, queryKey]);

  const refreshStreak = useCallback(() => {
    queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  return {
    ...streakData,
    isLoading,
    refreshStreak,
    updateStreakOnCalorieLog,
  };
}
