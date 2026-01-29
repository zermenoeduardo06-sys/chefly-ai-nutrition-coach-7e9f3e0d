import { useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, subDays } from "date-fns";

export interface MoodLog {
  id: string;
  user_id: string;
  logged_at: string;
  mood_score: number;
  factors: string[];
  note: string | null;
  created_at: string;
}

export interface WellnessInsight {
  id: string;
  user_id: string;
  insight_type: string;
  title: string;
  description: string;
  related_data: any;
  is_read: boolean;
  generated_at: string;
}

export interface BodyScan {
  id: string;
  user_id: string;
  image_url: string;
  scan_type: 'front' | 'side' | 'back';
  estimated_body_fat_min: number | null;
  estimated_body_fat_max: number | null;
  body_fat_category: string | null;
  body_type: string | null;
  fat_distribution: string | null;
  ai_notes: string | null;
  recommendations: string[] | null;
  raw_analysis: any;
  confidence: string;
  scanned_at: string;
  created_at: string;
}

// Query functions
const fetchTodaysMood = async (userId: string): Promise<MoodLog | null> => {
  const today = startOfDay(new Date());
  const { data } = await supabase
    .from("mood_logs")
    .select("*")
    .eq("user_id", userId)
    .gte("logged_at", today.toISOString())
    .order("logged_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data as MoodLog | null;
};

const fetchWeeklyMoods = async (userId: string): Promise<MoodLog[]> => {
  const weekAgo = subDays(startOfDay(new Date()), 7);
  const { data } = await supabase
    .from("mood_logs")
    .select("*")
    .eq("user_id", userId)
    .gte("logged_at", weekAgo.toISOString())
    .order("logged_at", { ascending: true });
  return (data || []) as MoodLog[];
};

const fetchMonthlyMoods = async (userId: string): Promise<MoodLog[]> => {
  const monthAgo = subDays(startOfDay(new Date()), 30);
  const { data } = await supabase
    .from("mood_logs")
    .select("*")
    .eq("user_id", userId)
    .gte("logged_at", monthAgo.toISOString())
    .order("logged_at", { ascending: true });
  return (data || []) as MoodLog[];
};

const fetchInsights = async (userId: string): Promise<WellnessInsight[]> => {
  const { data } = await supabase
    .from("wellness_insights")
    .select("*")
    .eq("user_id", userId)
    .order("generated_at", { ascending: false })
    .limit(10);
  return (data || []) as WellnessInsight[];
};

const fetchBodyScans = async (userId: string): Promise<BodyScan[]> => {
  const { data } = await supabase
    .from("body_scans")
    .select("*")
    .eq("user_id", userId)
    .order("scanned_at", { ascending: false })
    .limit(12);
  return (data || []) as BodyScan[];
};

export const useWellness = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  // Today's mood query
  const todaysMoodQuery = useQuery({
    queryKey: ['wellness', 'mood', 'today', userId],
    queryFn: () => fetchTodaysMood(userId!),
    enabled: !!userId,
    staleTime: 60 * 1000, // 1 min - mood changes often
    gcTime: 5 * 60 * 1000,
  });

  // Weekly moods query
  const weeklyMoodsQuery = useQuery({
    queryKey: ['wellness', 'mood', 'weekly', userId],
    queryFn: () => fetchWeeklyMoods(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 min
    gcTime: 10 * 60 * 1000,
  });

  // Monthly moods query
  const monthlyMoodsQuery = useQuery({
    queryKey: ['wellness', 'mood', 'monthly', userId],
    queryFn: () => fetchMonthlyMoods(userId!),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 min
    gcTime: 15 * 60 * 1000,
  });

  // Insights query
  const insightsQuery = useQuery({
    queryKey: ['wellness', 'insights', userId],
    queryFn: () => fetchInsights(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Body scans query
  const bodyScansQuery = useQuery({
    queryKey: ['wellness', 'bodyScans', userId],
    queryFn: () => fetchBodyScans(userId!),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  // Computed values
  const weeklyMoods = weeklyMoodsQuery.data ?? [];
  const monthlyMoods = monthlyMoodsQuery.data ?? [];
  const bodyScans = bodyScansQuery.data ?? [];

  const averageMood = useMemo(() => {
    if (weeklyMoods.length === 0) return 0;
    return weeklyMoods.reduce((sum, m) => sum + m.mood_score, 0) / weeklyMoods.length;
  }, [weeklyMoods]);

  const moodTrend = useMemo((): 'up' | 'down' | 'stable' => {
    if (weeklyMoods.length < 4) return 'stable';
    const midpoint = Math.floor(weeklyMoods.length / 2);
    const firstHalf = weeklyMoods.slice(0, midpoint);
    const secondHalf = weeklyMoods.slice(midpoint);
    const firstAvg = firstHalf.reduce((sum, m) => sum + m.mood_score, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, m) => sum + m.mood_score, 0) / secondHalf.length;
    if (secondAvg > firstAvg + 0.3) return 'up';
    if (secondAvg < firstAvg - 0.3) return 'down';
    return 'stable';
  }, [weeklyMoods]);

  const latestBodyScan = bodyScans[0] ?? null;

  // Mutation functions
  const logMood = useCallback(async (score: number, factors: string[], note?: string): Promise<boolean> => {
    if (!userId) return false;
    try {
      const { data, error } = await supabase
        .from("mood_logs")
        .insert({
          user_id: userId,
          mood_score: score,
          factors,
          note: note || null,
          logged_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Invalidate queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['wellness', 'mood', 'today', userId] });
      queryClient.invalidateQueries({ queryKey: ['wellness', 'mood', 'weekly', userId] });
      queryClient.invalidateQueries({ queryKey: ['wellness', 'mood', 'monthly', userId] });
      
      return true;
    } catch (error) {
      console.error("Error logging mood:", error);
      return false;
    }
  }, [userId, queryClient]);

  const updateMood = useCallback(async (moodId: string, score: number, factors: string[], note?: string): Promise<boolean> => {
    if (!userId) return false;
    try {
      const { error } = await supabase
        .from("mood_logs")
        .update({
          mood_score: score,
          factors,
          note: note || null,
        })
        .eq("id", moodId)
        .eq("user_id", userId);

      if (error) throw error;

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['wellness', 'mood', 'today', userId] });
      queryClient.invalidateQueries({ queryKey: ['wellness', 'mood', 'weekly', userId] });
      
      return true;
    } catch (error) {
      console.error("Error updating mood:", error);
      return false;
    }
  }, [userId, queryClient]);

  const saveBodyScan = useCallback(async (scanData: Omit<Partial<BodyScan>, 'user_id' | 'id' | 'created_at'> & { image_url: string }): Promise<BodyScan | null> => {
    if (!userId) return null;
    try {
      const insertData = {
        user_id: userId,
        image_url: scanData.image_url,
        scan_type: scanData.scan_type || 'front',
        estimated_body_fat_min: scanData.estimated_body_fat_min || null,
        estimated_body_fat_max: scanData.estimated_body_fat_max || null,
        body_fat_category: scanData.body_fat_category || null,
        body_type: scanData.body_type || null,
        fat_distribution: scanData.fat_distribution || null,
        ai_notes: scanData.ai_notes || null,
        recommendations: scanData.recommendations || null,
        raw_analysis: scanData.raw_analysis || null,
        confidence: scanData.confidence || 'medium',
      };

      const { data, error } = await supabase
        .from("body_scans")
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      // Invalidate body scans query
      queryClient.invalidateQueries({ queryKey: ['wellness', 'bodyScans', userId] });

      return data as BodyScan;
    } catch (error) {
      console.error("Error saving body scan:", error);
      return null;
    }
  }, [userId, queryClient]);

  const markInsightAsRead = useCallback(async (insightId: string): Promise<void> => {
    if (!userId) return;
    try {
      await supabase
        .from("wellness_insights")
        .update({ is_read: true })
        .eq("id", insightId)
        .eq("user_id", userId);

      // Invalidate insights query
      queryClient.invalidateQueries({ queryKey: ['wellness', 'insights', userId] });
    } catch (error) {
      console.error("Error marking insight as read:", error);
    }
  }, [userId, queryClient]);

  const hasTodaysMood = useCallback(() => todaysMoodQuery.data !== null, [todaysMoodQuery.data]);

  const getMonthlyBodyScansCount = useCallback((): number => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    return bodyScans.filter(scan => new Date(scan.scanned_at) >= startOfMonth).length;
  }, [bodyScans]);

  const refetch = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['wellness', 'mood', 'today', userId] }),
      queryClient.invalidateQueries({ queryKey: ['wellness', 'mood', 'weekly', userId] }),
      queryClient.invalidateQueries({ queryKey: ['wellness', 'insights', userId] }),
      queryClient.invalidateQueries({ queryKey: ['wellness', 'bodyScans', userId] }),
    ]);
  }, [userId, queryClient]);

  // Combined loading state - only true on initial load
  const isLoading = !userId || (
    todaysMoodQuery.isLoading && 
    weeklyMoodsQuery.isLoading && 
    !todaysMoodQuery.isFetched
  );

  return {
    todaysMood: todaysMoodQuery.data ?? null,
    weeklyMoods,
    monthlyMoods,
    insights: insightsQuery.data ?? [],
    bodyScans,
    latestBodyScan,
    averageMood,
    moodTrend,
    isLoading,
    error: todaysMoodQuery.error?.message ?? null,
    logMood,
    updateMood,
    saveBodyScan,
    markInsightAsRead,
    hasTodaysMood,
    getMonthlyBodyScansCount,
    refetch,
  };
};
