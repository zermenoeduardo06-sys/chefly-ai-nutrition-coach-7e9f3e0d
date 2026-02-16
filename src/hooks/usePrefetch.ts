import { useCallback, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, subDays, startOfWeek, endOfWeek, format } from "date-fns";
import { fetchDailyIntakeData } from "./useDailyFoodIntake";
import { getLocalDateString } from "@/lib/dateUtils";

/**
 * Selective prefetch hook for high-probability navigation targets.
 * Prefetches data in background so pages load instantly.
 * Only prefetches lightweight data - never AI or heavy queries.
 * 
 * IMPORTANT: Uses "latest ref" pattern to ensure stable callback references
 * and prevent infinite re-render loops when userId changes.
 */
export const usePrefetch = (userId: string | undefined) => {
  const queryClient = useQueryClient();
  
  // Use ref pattern to keep userId current without changing callback references
  const userIdRef = useRef(userId);
  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  // Prefetch Diary/Dashboard data (food intake for today)
  const prefetchDiary = useCallback(() => {
    const currentUserId = userIdRef.current;
    if (!currentUserId) return;
    
    // CRITICAL: Use getLocalDateString() to preserve local date for food queries
    const today = getLocalDateString();
    
    // Today's food intake
    queryClient.prefetchQuery({
      queryKey: ['foodIntake', currentUserId, today],
      queryFn: () => fetchDailyIntakeData(currentUserId, today),
      staleTime: 2 * 60 * 1000,
    });
  }, [queryClient]);

  // Prefetch Progress page data
  const prefetchProgress = useCallback(() => {
    const currentUserId = userIdRef.current;
    if (!currentUserId) return;

    // Latest weight
    queryClient.prefetchQuery({
      queryKey: ['progress', 'latestWeight', currentUserId],
      queryFn: async () => {
        const { data } = await supabase
          .from("body_measurements")
          .select("weight")
          .eq("user_id", currentUserId)
          .order("measurement_date", { ascending: false })
          .limit(1)
          .maybeSingle();
        return data?.weight ?? null;
      },
      staleTime: 5 * 60 * 1000,
    });

    // Body measurements
    queryClient.prefetchQuery({
      queryKey: ['progress', 'measurements', currentUserId],
      queryFn: async () => {
        const { data } = await supabase
          .from("body_measurements")
          .select("id, weight, measurement_date")
          .eq("user_id", currentUserId)
          .order("measurement_date", { ascending: false })
          .limit(30);
        return data || [];
      },
      staleTime: 5 * 60 * 1000,
    });

    // User stats
    queryClient.prefetchQuery({
      queryKey: ['progress', 'stats', currentUserId],
      queryFn: async () => {
        const { data } = await supabase
          .from("user_stats")
          .select("user_id, total_points, current_streak, longest_streak, meals_completed, level")
          .eq("user_id", currentUserId)
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
      queryKey: ['nutritionProgress', 'weekly', currentUserId, format(now, 'yyyy-ww')],
      queryFn: async () => {
        const [completions, foodScans] = await Promise.all([
          supabase
            .from("meal_completions")
            .select(`completed_at, meals (calories, protein, carbs, fats)`)
            .eq("user_id", currentUserId)
            .gte("completed_at", weekStart.toISOString())
            .lte("completed_at", weekEnd.toISOString()),
          supabase
            .from("food_scans")
            .select("scanned_at, calories, protein, carbs, fat")
            .eq("user_id", currentUserId)
            .gte("scanned_at", weekStart.toISOString())
            .lte("scanned_at", weekEnd.toISOString()),
        ]);
        return { completions: completions.data, foodScans: foodScans.data };
      },
      staleTime: 5 * 60 * 1000,
    });
  }, [queryClient]);

  // Prefetch Achievements data
  const prefetchAchievements = useCallback(() => {
    const currentUserId = userIdRef.current;
    if (!currentUserId) return;

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
      queryKey: ['achievements', 'user', currentUserId],
      queryFn: async () => {
        const { data } = await supabase
          .from("user_achievements")
          .select("achievement_id")
          .eq("user_id", currentUserId);
        return data?.map(ua => ua.achievement_id) || [];
      },
      staleTime: 5 * 60 * 1000,
    });
  }, [queryClient]);

  // Prefetch Wellness page data
  const prefetchWellness = useCallback(() => {
    const currentUserId = userIdRef.current;
    if (!currentUserId) return;

    const today = startOfDay(new Date());
    const weekAgo = subDays(today, 7);

    // Today's mood
    queryClient.prefetchQuery({
      queryKey: ['wellness', 'mood', 'today', currentUserId],
      queryFn: async () => {
        const { data } = await supabase
          .from("mood_logs")
          .select("id, mood_score, factors, note, logged_at")
          .eq("user_id", currentUserId)
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
      queryKey: ['wellness', 'mood', 'weekly', currentUserId],
      queryFn: async () => {
        const { data } = await supabase
          .from("mood_logs")
          .select("id, mood_score, factors, note, logged_at")
          .eq("user_id", currentUserId)
          .gte("logged_at", weekAgo.toISOString())
          .order("logged_at", { ascending: true });
        return data || [];
      },
      staleTime: 5 * 60 * 1000,
    });

    // Insights
    queryClient.prefetchQuery({
      queryKey: ['wellness', 'insights', currentUserId],
      queryFn: async () => {
        const { data } = await supabase
          .from("wellness_insights")
          .select("id, insight_type, content, generated_at")
          .eq("user_id", currentUserId)
          .order("generated_at", { ascending: false })
          .limit(10);
        return data || [];
      },
      staleTime: 5 * 60 * 1000,
    });

    // Body scans
    queryClient.prefetchQuery({
      queryKey: ['wellness', 'bodyScans', currentUserId],
      queryFn: async () => {
        const { data } = await supabase
          .from("body_scans")
          .select("id, estimated_body_fat_min, estimated_body_fat_max, body_type, scanned_at, image_url")
          .eq("user_id", currentUserId)
          .order("scanned_at", { ascending: false })
          .limit(12);
        return data || [];
      },
      staleTime: 10 * 60 * 1000,
    });
  }, [queryClient]);

  // Prefetch Recipes page data (just meal plan ID, not full meals)
  const prefetchRecipes = useCallback(() => {
    const currentUserId = userIdRef.current;
    if (!currentUserId) return;

    queryClient.prefetchQuery({
      queryKey: ['recipes', 'mealPlanId', currentUserId],
      queryFn: async () => {
        const { data } = await supabase
          .from("meal_plans")
          .select("id")
          .eq("user_id", currentUserId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        return data?.id ?? null;
      },
      staleTime: 10 * 60 * 1000,
    });
  }, [queryClient]);

  // Prefetch ChefIA chat messages
  const prefetchChat = useCallback(() => {
    const currentUserId = userIdRef.current;
    if (!currentUserId) return;

    queryClient.prefetchQuery({
      queryKey: ['chat', 'messages', currentUserId],
      queryFn: async () => {
        const { data } = await supabase
          .from("chat_messages")
          .select("*")
          .eq("user_id", currentUserId)
          .order("created_at", { ascending: true })
          .limit(50);
        return data || [];
      },
      staleTime: 2 * 60 * 1000,
    });
  }, [queryClient]);

  // Prefetch user profile for instant Dashboard header
  const prefetchProfile = useCallback(() => {
    const currentUserId = userIdRef.current;
    if (!currentUserId) return;

    queryClient.prefetchQuery({
      queryKey: ['profile', currentUserId],
      queryFn: async () => {
        const { data } = await supabase
          .from("profiles")
          .select("id, display_name, avatar_url, avatar_config, avatar_background_color, email")
          .eq("id", currentUserId)
          .single();
        return data;
      },
      staleTime: 10 * 60 * 1000,
    });
  }, [queryClient]);

  // Prefetch all main sections at once (for Dashboard mount)
  // STABLE: Only depends on queryClient which never changes
  const prefetchAll = useCallback(() => {
    const currentUserId = userIdRef.current;
    if (!currentUserId) return;
    prefetchProfile();
    prefetchDiary();
    prefetchProgress();
    prefetchWellness();
    prefetchRecipes();
    prefetchChat();
    prefetchAchievements();
  }, [prefetchProfile, prefetchDiary, prefetchProgress, prefetchWellness, prefetchRecipes, prefetchChat, prefetchAchievements]);

  return {
    prefetchProfile,
    prefetchDiary,
    prefetchProgress,
    prefetchWellness,
    prefetchRecipes,
    prefetchChat,
    prefetchAchievements,
    prefetchAll,
  };
};
