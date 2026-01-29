import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, subDays, startOfWeek, endOfWeek, eachDayOfInterval, format } from "date-fns";
import { fetchDailyIntakeData } from "./useDailyFoodIntake";
import { getLocalDateString } from "@/lib/dateUtils";

/**
 * Selective prefetch hook for high-probability navigation targets.
 * Prefetches data in background so pages load instantly.
 * Only prefetches lightweight data - never AI or heavy queries.
 */
export const usePrefetch = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  // Prefetch Diary/Dashboard data (food intake for today)
  const prefetchDiary = useCallback(() => {
    if (!userId) return;
    
    // CRITICAL: Use getLocalDateString() to preserve local date for food queries
    const today = getLocalDateString();
    
    // Today's food intake
    queryClient.prefetchQuery({
      queryKey: ['foodIntake', userId, today],
      queryFn: () => fetchDailyIntakeData(userId, today),
      staleTime: 2 * 60 * 1000,
    });
  }, [userId, queryClient]);

  // Prefetch Progress page data
  const prefetchProgress = useCallback(() => {
    if (!userId) return;

    // Latest weight
    queryClient.prefetchQuery({
      queryKey: ['progress', 'latestWeight', userId],
      queryFn: async () => {
        const { data } = await supabase
          .from("body_measurements")
          .select("weight")
          .eq("user_id", userId)
          .order("measurement_date", { ascending: false })
          .limit(1)
          .maybeSingle();
        return data?.weight ?? null;
      },
      staleTime: 5 * 60 * 1000,
    });

    // Body measurements
    queryClient.prefetchQuery({
      queryKey: ['progress', 'measurements', userId],
      queryFn: async () => {
        const { data } = await supabase
          .from("body_measurements")
          .select("*")
          .eq("user_id", userId)
          .order("measurement_date", { ascending: false })
          .limit(30);
        return data || [];
      },
      staleTime: 5 * 60 * 1000,
    });

    // User stats
    queryClient.prefetchQuery({
      queryKey: ['progress', 'stats', userId],
      queryFn: async () => {
        const { data } = await supabase
          .from("user_stats")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();
        return data;
      },
      staleTime: 5 * 60 * 1000,
    });

    // Nutrition progress (weekly data for charts)
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    queryClient.prefetchQuery({
      queryKey: ['nutritionProgress', 'weekly', userId, format(now, 'yyyy-ww')],
      queryFn: async () => {
        const [completions, foodScans] = await Promise.all([
          supabase
            .from("meal_completions")
            .select(`completed_at, meals (calories, protein, carbs, fats)`)
            .eq("user_id", userId)
            .gte("completed_at", weekStart.toISOString())
            .lte("completed_at", weekEnd.toISOString()),
          supabase
            .from("food_scans")
            .select("scanned_at, calories, protein, carbs, fat")
            .eq("user_id", userId)
            .gte("scanned_at", weekStart.toISOString())
            .lte("scanned_at", weekEnd.toISOString()),
        ]);
        return { completions: completions.data, foodScans: foodScans.data };
      },
      staleTime: 5 * 60 * 1000,
    });
  }, [userId, queryClient]);

  // Prefetch Achievements data
  const prefetchAchievements = useCallback(() => {
    if (!userId) return;

    // All achievements definition (rarely changes)
    queryClient.prefetchQuery({
      queryKey: ['achievements', 'all'],
      queryFn: async () => {
        const { data } = await supabase
          .from("achievements")
          .select("*")
          .order("requirement_value", { ascending: true });
        return data || [];
      },
      staleTime: 30 * 60 * 1000, // 30 min - achievements rarely change
    });

    // User's unlocked achievements
    queryClient.prefetchQuery({
      queryKey: ['achievements', 'user', userId],
      queryFn: async () => {
        const { data } = await supabase
          .from("user_achievements")
          .select("achievement_id")
          .eq("user_id", userId);
        return data?.map(ua => ua.achievement_id) || [];
      },
      staleTime: 5 * 60 * 1000,
    });
  }, [userId, queryClient]);

  // Prefetch Wellness page data
  const prefetchWellness = useCallback(() => {
    if (!userId) return;

    const today = startOfDay(new Date());
    const weekAgo = subDays(today, 7);

    // Today's mood
    queryClient.prefetchQuery({
      queryKey: ['wellness', 'mood', 'today', userId],
      queryFn: async () => {
        const { data } = await supabase
          .from("mood_logs")
          .select("*")
          .eq("user_id", userId)
          .gte("logged_at", today.toISOString())
          .order("logged_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        return data;
      },
      staleTime: 60 * 1000,
    });

    // Weekly moods
    queryClient.prefetchQuery({
      queryKey: ['wellness', 'mood', 'weekly', userId],
      queryFn: async () => {
        const { data } = await supabase
          .from("mood_logs")
          .select("*")
          .eq("user_id", userId)
          .gte("logged_at", weekAgo.toISOString())
          .order("logged_at", { ascending: true });
        return data || [];
      },
      staleTime: 5 * 60 * 1000,
    });

    // Insights
    queryClient.prefetchQuery({
      queryKey: ['wellness', 'insights', userId],
      queryFn: async () => {
        const { data } = await supabase
          .from("wellness_insights")
          .select("*")
          .eq("user_id", userId)
          .order("generated_at", { ascending: false })
          .limit(10);
        return data || [];
      },
      staleTime: 5 * 60 * 1000,
    });

    // Body scans
    queryClient.prefetchQuery({
      queryKey: ['wellness', 'bodyScans', userId],
      queryFn: async () => {
        const { data } = await supabase
          .from("body_scans")
          .select("*")
          .eq("user_id", userId)
          .order("scanned_at", { ascending: false })
          .limit(12);
        return data || [];
      },
      staleTime: 10 * 60 * 1000,
    });
  }, [userId, queryClient]);

  // Prefetch Recipes page data (just meal plan ID, not full meals)
  const prefetchRecipes = useCallback(() => {
    if (!userId) return;

    queryClient.prefetchQuery({
      queryKey: ['recipes', 'mealPlanId', userId],
      queryFn: async () => {
        const { data } = await supabase
          .from("meal_plans")
          .select("id")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        return data?.id ?? null;
      },
      staleTime: 10 * 60 * 1000,
    });
  }, [userId, queryClient]);

  // Prefetch ChefIA chat messages
  const prefetchChat = useCallback(() => {
    if (!userId) return;

    queryClient.prefetchQuery({
      queryKey: ['chat', 'messages', userId],
      queryFn: async () => {
        const { data } = await supabase
          .from("chat_messages")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: true })
          .limit(50);
        return data || [];
      },
      staleTime: 2 * 60 * 1000,
    });
  }, [userId, queryClient]);

  // Prefetch all main sections at once (for Dashboard mount)
  const prefetchAll = useCallback(() => {
    if (!userId) return;
    prefetchDiary();
    prefetchProgress();
    prefetchWellness();
    prefetchRecipes();
    prefetchChat();
    prefetchAchievements();
  }, [userId, prefetchDiary, prefetchProgress, prefetchWellness, prefetchRecipes, prefetchChat, prefetchAchievements]);

  return {
    prefetchDiary,
    prefetchProgress,
    prefetchWellness,
    prefetchRecipes,
    prefetchChat,
    prefetchAchievements,
    prefetchAll,
  };
};
