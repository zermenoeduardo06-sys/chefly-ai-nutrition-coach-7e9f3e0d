import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCallback } from "react";

export interface BodyMeasurement {
  id: string;
  user_id: string;
  measurement_date: string;
  weight: number | null;
  waist: number | null;
  hips: number | null;
  chest: number | null;
  arms: number | null;
  thighs: number | null;
  neck: number | null;
  notes: string | null;
  created_at: string;
}

export interface UserStats {
  current_streak: number;
  longest_streak: number;
  total_points: number;
  level: number;
  meals_completed: number;
  streak_freeze_available: number;
  last_activity_date: string | null;
}

// Query functions
const fetchLatestWeight = async (userId: string): Promise<number | null> => {
  const { data } = await supabase
    .from("body_measurements")
    .select("weight")
    .eq("user_id", userId)
    .order("measurement_date", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.weight ?? null;
};

const fetchMeasurements = async (userId: string): Promise<BodyMeasurement[]> => {
  const { data } = await supabase
    .from("body_measurements")
    .select("*")
    .eq("user_id", userId)
    .order("measurement_date", { ascending: false })
    .limit(30);
  return (data || []) as BodyMeasurement[];
};

const fetchUserStats = async (userId: string): Promise<UserStats | null> => {
  const { data } = await supabase
    .from("user_stats")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return data as UserStats | null;
};

/**
 * Hook for Progress page data with React Query caching
 * Enables instant navigation when data is already cached
 */
export const useProgressData = (userId: string | undefined) => {
  // Latest weight
  const latestWeightQuery = useQuery({
    queryKey: ['progress', 'latestWeight', userId],
    queryFn: () => fetchLatestWeight(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 min
    gcTime: 10 * 60 * 1000,
  });

  // Body measurements history
  const measurementsQuery = useQuery({
    queryKey: ['progress', 'measurements', userId],
    queryFn: () => fetchMeasurements(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // User stats (streak, points, level)
  const statsQuery = useQuery({
    queryKey: ['progress', 'stats', userId],
    queryFn: () => fetchUserStats(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Combined loading only on initial fetch
  const isLoading = !userId || (
    latestWeightQuery.isLoading && 
    !latestWeightQuery.isFetched
  );

  return {
    latestWeight: latestWeightQuery.data ?? undefined,
    measurements: measurementsQuery.data ?? [],
    stats: statsQuery.data ?? null,
    isLoading,
    refetchWeight: latestWeightQuery.refetch,
    refetchMeasurements: measurementsQuery.refetch,
    refetchStats: statsQuery.refetch,
  };
};

/**
 * Hook to invalidate all progress-related caches
 * Call this after any weight, measurement, or stats update
 */
export const useInvalidateProgressData = () => {
  const queryClient = useQueryClient();
  
  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['progress'] });
  }, [queryClient]);
};
