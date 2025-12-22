import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  streakFreezeAvailable: number;
  streakFrozenAt: string | null;
  isStreakAtRisk: boolean;
  hoursUntilStreakLoss: number;
  isNewMilestone: boolean;
}

const STREAK_MILESTONES = [7, 14, 30, 50, 100, 365];

export function useStreakSystem(userId: string | undefined, isPremium: boolean) {
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
    streakFreezeAvailable: 0,
    streakFrozenAt: null,
    isStreakAtRisk: false,
    hoursUntilStreakLoss: 24,
    isNewMilestone: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [previousStreak, setPreviousStreak] = useState<number>(0);
  const { toast } = useToast();
  const { language } = useLanguage();

  const texts = {
    es: {
      freezeSuccess: "Racha congelada",
      freezeSuccessDesc: "Tu racha de {streak} días está protegida por hoy",
      freezeError: "Error al congelar racha",
      noFreezeAvailable: "No tienes congelaciones disponibles",
      streakRecovered: "¡Racha recuperada!",
      streakRecoveredDesc: "Tu racha de {streak} días continúa gracias al Streak Freeze",
    },
    en: {
      freezeSuccess: "Streak frozen",
      freezeSuccessDesc: "Your {streak}-day streak is protected for today",
      freezeError: "Error freezing streak",
      noFreezeAvailable: "No freezes available",
      streakRecovered: "Streak recovered!",
      streakRecoveredDesc: "Your {streak}-day streak continues thanks to Streak Freeze",
    },
  };

  const t = texts[language];

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
      const today = now.toISOString().split("T")[0];
      const lastActivity = data.last_activity_date;

      // Calculate hours until streak loss
      let hoursUntilLoss = 24;
      let isAtRisk = false;

      if (lastActivity) {
        const lastActivityDate = new Date(lastActivity + "T23:59:59");
        const timeDiff = lastActivityDate.getTime() - now.getTime() + 24 * 60 * 60 * 1000;
        hoursUntilLoss = Math.max(0, timeDiff / (1000 * 60 * 60));
        
        // Streak is at risk if less than 8 hours remain and there's activity today
        isAtRisk = hoursUntilLoss <= 8 && hoursUntilLoss > 0 && lastActivity !== today && data.current_streak >= 2;
      }

      // Check if this is a new milestone
      const isNewMilestone = STREAK_MILESTONES.includes(data.current_streak) && 
        data.current_streak > previousStreak;

      setStreakData({
        currentStreak: data.current_streak || 0,
        longestStreak: data.longest_streak || 0,
        lastActivityDate: lastActivity,
        streakFreezeAvailable: data.streak_freeze_available || 0,
        streakFrozenAt: data.streak_frozen_at,
        isStreakAtRisk: isAtRisk,
        hoursUntilStreakLoss: hoursUntilLoss,
        isNewMilestone,
      });

      setPreviousStreak(data.current_streak || 0);
    } catch (error) {
      console.error("Error in loadStreakData:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, previousStreak]);

  const useStreakFreeze = useCallback(async () => {
    if (!userId || !isPremium) return false;

    if (streakData.streakFreezeAvailable <= 0) {
      toast({
        variant: "destructive",
        title: t.noFreezeAvailable,
      });
      return false;
    }

    try {
      const today = new Date().toISOString().split("T")[0];
      
      const { error } = await supabase
        .from("user_stats")
        .update({
          streak_freeze_available: streakData.streakFreezeAvailable - 1,
          streak_freeze_used_at: today,
          streak_frozen_at: today,
        })
        .eq("user_id", userId);

      if (error) throw error;

      toast({
        title: t.freezeSuccess,
        description: t.freezeSuccessDesc.replace("{streak}", String(streakData.currentStreak)),
      });

      await loadStreakData();
      return true;
    } catch (error) {
      console.error("Error using streak freeze:", error);
      toast({
        variant: "destructive",
        title: t.freezeError,
      });
      return false;
    }
  }, [userId, isPremium, streakData, t, toast, loadStreakData]);

  const grantMonthlyFreeze = useCallback(async () => {
    if (!userId || !isPremium) return;

    // Check if we're on the first of the month and haven't granted this month's freeze
    const now = new Date();
    const isFirstOfMonth = now.getDate() === 1;
    
    if (!isFirstOfMonth) return;

    // Check last freeze used date to avoid double grants
    if (streakData.streakFrozenAt) {
      const lastFreeze = new Date(streakData.streakFrozenAt);
      if (lastFreeze.getMonth() === now.getMonth() && lastFreeze.getFullYear() === now.getFullYear()) {
        return; // Already granted this month
      }
    }

    try {
      await supabase
        .from("user_stats")
        .update({ streak_freeze_available: 1 })
        .eq("user_id", userId);

      await loadStreakData();
    } catch (error) {
      console.error("Error granting monthly freeze:", error);
    }
  }, [userId, isPremium, streakData.streakFrozenAt, loadStreakData]);

  const clearMilestoneFlag = useCallback(() => {
    setStreakData(prev => ({ ...prev, isNewMilestone: false }));
  }, []);

  // Load data on mount and when userId changes
  useEffect(() => {
    loadStreakData();
  }, [loadStreakData]);

  // Grant monthly freeze for premium users
  useEffect(() => {
    if (isPremium) {
      grantMonthlyFreeze();
    }
  }, [isPremium, grantMonthlyFreeze]);

  return {
    ...streakData,
    isLoading,
    useStreakFreeze,
    refreshStreak: loadStreakData,
    clearMilestoneFlag,
  };
}
