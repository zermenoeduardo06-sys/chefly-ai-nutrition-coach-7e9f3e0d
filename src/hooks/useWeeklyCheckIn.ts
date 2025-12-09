import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { startOfWeek, format } from "date-fns";
import { useSubscription, SUBSCRIPTION_TIERS } from "./useSubscription";

export interface WeeklyCheckInData {
  weightChange: "up" | "down" | "same" | null;
  energyLevel: "high" | "normal" | "low" | null;
  recipePreferences: string[];
  customRecipePreference: string;
  availableIngredients: string;
  weeklyGoals: string[];
}

interface UseWeeklyCheckInReturn {
  isCheckInDue: boolean;
  isLoading: boolean;
  canAccessCheckIn: boolean;
  checkInData: WeeklyCheckInData;
  setCheckInData: React.Dispatch<React.SetStateAction<WeeklyCheckInData>>;
  submitCheckIn: () => Promise<boolean>;
  lastCheckIn: Date | null;
}

export const useWeeklyCheckIn = (userId: string | undefined): UseWeeklyCheckInReturn => {
  const [isCheckInDue, setIsCheckInDue] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastCheckIn, setLastCheckIn] = useState<Date | null>(null);
  const [checkInData, setCheckInData] = useState<WeeklyCheckInData>({
    weightChange: null,
    energyLevel: null,
    recipePreferences: [],
    customRecipePreference: "",
    availableIngredients: "",
    weeklyGoals: [],
  });

  const { subscribed, product_id, isLoading: subLoading } = useSubscription(userId);

  // Only intermediate plan users can access this feature
  const canAccessCheckIn = subscribed && product_id === SUBSCRIPTION_TIERS.INTERMEDIATE.product_id;

  useEffect(() => {
    const checkIfDue = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
        const weekStartStr = format(currentWeekStart, "yyyy-MM-dd");

        const { data, error } = await supabase
          .from("weekly_checkins")
          .select("*")
          .eq("user_id", userId)
          .eq("week_start_date", weekStartStr)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setIsCheckInDue(false);
          setLastCheckIn(new Date(data.created_at));
        } else {
          // Check if user has any previous check-ins to determine if this is first time
          const { data: anyCheckIn } = await supabase
            .from("weekly_checkins")
            .select("created_at")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          setIsCheckInDue(true);
          setLastCheckIn(anyCheckIn ? new Date(anyCheckIn.created_at) : null);
        }
      } catch (error) {
        console.error("Error checking weekly check-in status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!subLoading) {
      checkIfDue();
    }
  }, [userId, subLoading]);

  const submitCheckIn = async (): Promise<boolean> => {
    if (!userId || !checkInData.weightChange || !checkInData.energyLevel) {
      return false;
    }

    try {
      const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const weekStartStr = format(currentWeekStart, "yyyy-MM-dd");

      const { error } = await supabase.from("weekly_checkins").upsert({
        user_id: userId,
        week_start_date: weekStartStr,
        weight_change: checkInData.weightChange,
        energy_level: checkInData.energyLevel,
        recipe_preferences: checkInData.recipePreferences,
        custom_recipe_preference: checkInData.customRecipePreference || null,
        available_ingredients: checkInData.availableIngredients || null,
        weekly_goals: checkInData.weeklyGoals,
      });

      if (error) throw error;

      setIsCheckInDue(false);
      setLastCheckIn(new Date());
      return true;
    } catch (error) {
      console.error("Error submitting weekly check-in:", error);
      return false;
    }
  };

  return {
    isCheckInDue,
    isLoading: isLoading || subLoading,
    canAccessCheckIn,
    checkInData,
    setCheckInData,
    submitCheckIn,
    lastCheckIn,
  };
};
