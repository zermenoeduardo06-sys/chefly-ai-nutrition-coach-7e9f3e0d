import { useState, useEffect, useCallback, useRef } from "react";
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

export function useStreakSystem(userId: string | undefined, isPremium: boolean) {
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
    streakFreezeAvailable: 0,
    streakFrozenAt: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { language } = useLanguage();
  
  // Use refs to avoid including toast/language in callback dependencies
  // This prevents infinite loops from context updates
  const toastRef = useRef(toast);
  const languageRef = useRef(language);
  toastRef.current = toast;
  languageRef.current = language;

  // Check if user has any calories logged for a specific date (using local timezone)
  const checkDailyCalories = useCallback(async (localDate: Date): Promise<number> => {
    if (!userId) return 0;

    let totalCalories = 0;

    // Create start and end of day in local timezone
    const dayStart = new Date(localDate.getFullYear(), localDate.getMonth(), localDate.getDate());
    const dayEnd = new Date(dayStart.getTime() + 86400000);

    // Get meal completions for the date
    const { data: completions } = await supabase
      .from("meal_completions")
      .select(`
        meals (calories)
      `)
      .eq("user_id", userId)
      .gte("completed_at", dayStart.toISOString())
      .lt("completed_at", dayEnd.toISOString());

    completions?.forEach((completion: any) => {
      if (completion.meals?.calories) {
        totalCalories += completion.meals.calories;
      }
    });

    // Get food scans for the date
    const { data: scans } = await supabase
      .from("food_scans")
      .select("calories")
      .eq("user_id", userId)
      .gte("scanned_at", dayStart.toISOString())
      .lt("scanned_at", dayEnd.toISOString());

    scans?.forEach((scan) => {
      totalCalories += scan.calories || 0;
    });

    return totalCalories;
  }, [userId]);

  const loadStreakData = useCallback(async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error loading streak data:", error);
        return;
      }

      if (!data) {
        setIsLoading(false);
        return;
      }

      const now = new Date();
      const todayStr = now.toISOString().split("T")[0];
      const lastActivity = data.last_activity_date;
      
      // Calculate yesterday in local time
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];
      
      let currentStreak = data.current_streak || 0;
      let longestStreak = data.longest_streak || 0;
      
      // If last activity was before yesterday, check if we need to reset streak
      if (lastActivity && lastActivity < yesterdayStr) {
        // Check if yesterday had 0 calories
        const yesterdayCalories = await checkDailyCalories(yesterday);
        
        if (yesterdayCalories === 0 && currentStreak > 0) {
          // Reset streak - no calories logged yesterday
          currentStreak = 0;
          
          await supabase
            .from("user_stats")
            .update({
              current_streak: 0,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId);
          
          if (languageRef.current === 'es') {
            toastRef.current({
              variant: "destructive",
              title: "Racha reiniciada",
              description: "No registraste calorías ayer. ¡Empieza de nuevo hoy!",
            });
          } else {
            toastRef.current({
              variant: "destructive",
              title: "Streak reset",
              description: "You didn't log any calories yesterday. Start fresh today!",
            });
          }
        }
      }

      setStreakData({
        currentStreak,
        longestStreak,
        lastActivityDate: lastActivity,
        streakFreezeAvailable: data.streak_freeze_available || 0,
        streakFrozenAt: data.streak_frozen_at,
      });
    } catch (error) {
      console.error("Error in loadStreakData:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, checkDailyCalories]);

  // Update streak when user logs calories
  const updateStreakOnCalorieLog = useCallback(async () => {
    if (!userId) return;

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const todayCalories = await checkDailyCalories(now);

    if (todayCalories > 0) {
      const { data: stats } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (stats) {
        const lastActivity = stats.last_activity_date;
        let newStreak = stats.current_streak || 0;

        // If this is the first activity today
        if (lastActivity !== todayStr) {
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split("T")[0];

          if (lastActivity === yesterdayStr) {
            // Consecutive day - increment streak
            newStreak += 1;
          } else if (!lastActivity) {
            // First ever activity
            newStreak = 1;
          } else {
            // Gap in days - start new streak
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

          setStreakData(prev => ({
            ...prev,
            currentStreak: newStreak,
            longestStreak: newLongestStreak,
            lastActivityDate: todayStr,
          }));
        }
      }
    }
  }, [userId, checkDailyCalories]);

  // Load data on mount and when userId changes
  useEffect(() => {
    loadStreakData();
  }, [loadStreakData]);

  return {
    ...streakData,
    isLoading,
    refreshStreak: loadStreakData,
    updateStreakOnCalorieLog,
  };
}
