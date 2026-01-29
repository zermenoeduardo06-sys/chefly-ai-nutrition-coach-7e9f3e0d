import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Selective prefetch hook for high-probability navigation targets.
 * Only prefetches lightweight data - never AI or heavy queries.
 */
export const usePrefetch = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  // Prefetch Progress page data (body measurements, latest weight)
  const prefetchProgress = useCallback(() => {
    if (!userId) return;

    // Only prefetch if not already in cache
    queryClient.prefetchQuery({
      queryKey: ["body_measurements", userId],
      queryFn: async () => {
        const { data } = await supabase
          .from("body_measurements")
          .select("*")
          .eq("user_id", userId)
          .order("measurement_date", { ascending: false })
          .limit(10);
        return data;
      },
      staleTime: 5 * 60 * 1000, // 5 min
    });

    queryClient.prefetchQuery({
      queryKey: ["user_stats", userId],
      queryFn: async () => {
        const { data } = await supabase
          .from("user_stats")
          .select("*")
          .eq("user_id", userId)
          .single();
        return data;
      },
      staleTime: 5 * 60 * 1000,
    });
  }, [userId, queryClient]);

  // Prefetch Wellness page data (today's mood)
  const prefetchWellness = useCallback(() => {
    if (!userId) return;

    const today = new Date().toISOString().split("T")[0];

    queryClient.prefetchQuery({
      queryKey: ["mood_logs", userId, today],
      queryFn: async () => {
        const { data } = await supabase
          .from("mood_logs")
          .select("*")
          .eq("user_id", userId)
          .gte("logged_at", today)
          .order("logged_at", { ascending: false })
          .limit(1);
        return data?.[0] ?? null;
      },
      staleTime: 60 * 1000, // 1 min
    });
  }, [userId, queryClient]);

  // Prefetch Recipes page data (meal plan ID only, not full meals)
  const prefetchRecipes = useCallback(() => {
    if (!userId) return;

    queryClient.prefetchQuery({
      queryKey: ["meal_plan_id", userId],
      queryFn: async () => {
        const { data } = await supabase
          .from("meal_plans")
          .select("id")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
        return data?.id ?? null;
      },
      staleTime: 10 * 60 * 1000, // 10 min
    });
  }, [userId, queryClient]);

  return {
    prefetchProgress,
    prefetchWellness,
    prefetchRecipes,
  };
};
