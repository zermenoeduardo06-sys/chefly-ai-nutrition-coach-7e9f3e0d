import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, subDays, format } from "date-fns";

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

interface WellnessState {
  todaysMood: MoodLog | null;
  weeklyMoods: MoodLog[];
  monthlyMoods: MoodLog[];
  insights: WellnessInsight[];
  bodyScans: BodyScan[];
  latestBodyScan: BodyScan | null;
  averageMood: number;
  moodTrend: 'up' | 'down' | 'stable';
  isLoading: boolean;
  error: string | null;
}

const initialState: WellnessState = {
  todaysMood: null,
  weeklyMoods: [],
  monthlyMoods: [],
  insights: [],
  bodyScans: [],
  latestBodyScan: null,
  averageMood: 0,
  moodTrend: 'stable',
  isLoading: true,
  error: null,
};

export const useWellness = (userId: string | undefined) => {
  const [state, setState] = useState<WellnessState>(initialState);

  const fetchMoodLogs = useCallback(async () => {
    if (!userId) return;

    try {
      const today = startOfDay(new Date());
      const weekAgo = subDays(today, 7);
      const monthAgo = subDays(today, 30);

      // Fetch today's mood
      const { data: todayData } = await supabase
        .from("mood_logs")
        .select("*")
        .eq("user_id", userId)
        .gte("logged_at", today.toISOString())
        .order("logged_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      // Fetch weekly moods
      const { data: weeklyData } = await supabase
        .from("mood_logs")
        .select("*")
        .eq("user_id", userId)
        .gte("logged_at", weekAgo.toISOString())
        .order("logged_at", { ascending: true });

      // Fetch monthly moods
      const { data: monthlyData } = await supabase
        .from("mood_logs")
        .select("*")
        .eq("user_id", userId)
        .gte("logged_at", monthAgo.toISOString())
        .order("logged_at", { ascending: true });

      // Calculate average and trend
      const weeklyMoods = (weeklyData || []) as MoodLog[];
      const monthlyMoods = (monthlyData || []) as MoodLog[];
      
      const avgMood = weeklyMoods.length > 0
        ? weeklyMoods.reduce((sum, m) => sum + m.mood_score, 0) / weeklyMoods.length
        : 0;

      // Calculate trend (compare first half of week to second half)
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (weeklyMoods.length >= 4) {
        const midpoint = Math.floor(weeklyMoods.length / 2);
        const firstHalf = weeklyMoods.slice(0, midpoint);
        const secondHalf = weeklyMoods.slice(midpoint);
        
        const firstAvg = firstHalf.reduce((sum, m) => sum + m.mood_score, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, m) => sum + m.mood_score, 0) / secondHalf.length;
        
        if (secondAvg > firstAvg + 0.3) trend = 'up';
        else if (secondAvg < firstAvg - 0.3) trend = 'down';
      }

      setState(prev => ({
        ...prev,
        todaysMood: todayData as MoodLog | null,
        weeklyMoods,
        monthlyMoods,
        averageMood: avgMood,
        moodTrend: trend,
      }));
    } catch (error) {
      console.error("Error fetching mood logs:", error);
      setState(prev => ({ ...prev, error: "Failed to fetch mood data" }));
    }
  }, [userId]);

  const fetchInsights = useCallback(async () => {
    if (!userId) return;

    try {
      const { data } = await supabase
        .from("wellness_insights")
        .select("*")
        .eq("user_id", userId)
        .order("generated_at", { ascending: false })
        .limit(10);

      setState(prev => ({
        ...prev,
        insights: (data || []) as WellnessInsight[],
      }));
    } catch (error) {
      console.error("Error fetching insights:", error);
    }
  }, [userId]);

  const fetchBodyScans = useCallback(async () => {
    if (!userId) return;

    try {
      const { data } = await supabase
        .from("body_scans")
        .select("*")
        .eq("user_id", userId)
        .order("scanned_at", { ascending: false })
        .limit(12);

      const scans = (data || []) as BodyScan[];
      
      setState(prev => ({
        ...prev,
        bodyScans: scans,
        latestBodyScan: scans[0] || null,
      }));
    } catch (error) {
      console.error("Error fetching body scans:", error);
    }
  }, [userId]);

  const loadAllData = useCallback(async () => {
    if (!userId) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    await Promise.all([
      fetchMoodLogs(),
      fetchInsights(),
      fetchBodyScans(),
    ]);
    
    setState(prev => ({ ...prev, isLoading: false }));
  }, [userId, fetchMoodLogs, fetchInsights, fetchBodyScans]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const logMood = async (score: number, factors: string[], note?: string): Promise<boolean> => {
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

      setState(prev => ({
        ...prev,
        todaysMood: data as MoodLog,
        weeklyMoods: [...prev.weeklyMoods, data as MoodLog],
      }));

      return true;
    } catch (error) {
      console.error("Error logging mood:", error);
      return false;
    }
  };

  const updateMood = async (moodId: string, score: number, factors: string[], note?: string): Promise<boolean> => {
    if (!userId) return false;

    try {
      const { data, error } = await supabase
        .from("mood_logs")
        .update({
          mood_score: score,
          factors,
          note: note || null,
        })
        .eq("id", moodId)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;

      setState(prev => ({
        ...prev,
        todaysMood: data as MoodLog,
        weeklyMoods: prev.weeklyMoods.map(m => m.id === moodId ? data as MoodLog : m),
      }));

      return true;
    } catch (error) {
      console.error("Error updating mood:", error);
      return false;
    }
  };

  const saveBodyScan = async (scanData: Omit<Partial<BodyScan>, 'user_id' | 'id' | 'created_at'> & { image_url: string }): Promise<BodyScan | null> => {
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

      const newScan = data as BodyScan;
      
      setState(prev => ({
        ...prev,
        bodyScans: [newScan, ...prev.bodyScans],
        latestBodyScan: newScan,
      }));

      return newScan;
    } catch (error) {
      console.error("Error saving body scan:", error);
      return null;
    }
  };

  const markInsightAsRead = async (insightId: string): Promise<void> => {
    if (!userId) return;

    try {
      await supabase
        .from("wellness_insights")
        .update({ is_read: true })
        .eq("id", insightId)
        .eq("user_id", userId);

      setState(prev => ({
        ...prev,
        insights: prev.insights.map(i => 
          i.id === insightId ? { ...i, is_read: true } : i
        ),
      }));
    } catch (error) {
      console.error("Error marking insight as read:", error);
    }
  };

  const hasTodaysMood = () => state.todaysMood !== null;

  const getMonthlyBodyScansCount = (): number => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    return state.bodyScans.filter(
      scan => new Date(scan.scanned_at) >= startOfMonth
    ).length;
  };

  return {
    ...state,
    logMood,
    updateMood,
    saveBodyScan,
    markInsightAsRead,
    hasTodaysMood,
    getMonthlyBodyScansCount,
    refetch: loadAllData,
  };
};
