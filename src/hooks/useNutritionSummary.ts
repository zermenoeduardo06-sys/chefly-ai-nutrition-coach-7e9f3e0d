import { useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface NutritionSummaryData {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  mealsCompleted: number;
  totalMeals: number;
}

const DEFAULT_SUMMARY: NutritionSummaryData = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fats: 0,
  mealsCompleted: 0,
  totalMeals: 3,
};

async function fetchNutritionSummary(
  userId: string,
  dateKey: string,
  dayOfWeek: number
): Promise<NutritionSummaryData> {
  const dayStartISO = `${dateKey}T00:00:00.000Z`;
  const dayEndISO = `${dateKey}T23:59:59.999Z`;

  // Execute queries in parallel for speed
  const [completionsResult, scansResult, mealPlanResult] = await Promise.all([
    supabase
      .from("meal_completions")
      .select(`id, meal_id, completed_at, meals (calories, protein, carbs, fats)`)
      .eq("user_id", userId)
      .gte("completed_at", dayStartISO)
      .lt("completed_at", dayEndISO),

    supabase
      .from("food_scans")
      .select("calories, protein, carbs, fat")
      .eq("user_id", userId)
      .gte("scanned_at", dayStartISO)
      .lt("scanned_at", dayEndISO),

    supabase
      .from("meal_plans")
      .select("id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const completions = completionsResult.data || [];
  const scans = scansResult.data || [];
  const mealPlan = mealPlanResult.data;

  // Count meals for the day
  let totalMealsForDate = 3;
  if (mealPlan) {
    const { count } = await supabase
      .from("meals")
      .select("id", { count: "exact" })
      .eq("meal_plan_id", mealPlan.id)
      .eq("day_of_week", dayOfWeek);
    totalMealsForDate = count || 3;
  }

  // Calculate totals
  let totalCalories = 0,
    totalProtein = 0,
    totalCarbs = 0,
    totalFats = 0;

  completions.forEach((completion: any) => {
    if (completion.meals) {
      totalCalories += completion.meals.calories || 0;
      totalProtein += completion.meals.protein || 0;
      totalCarbs += completion.meals.carbs || 0;
      totalFats += completion.meals.fats || 0;
    }
  });

  scans.forEach((scan) => {
    totalCalories += scan.calories || 0;
    totalProtein += scan.protein || 0;
    totalCarbs += scan.carbs || 0;
    totalFats += scan.fat || 0;
  });

  return {
    calories: totalCalories,
    protein: totalProtein,
    carbs: totalCarbs,
    fats: totalFats,
    mealsCompleted: completions.length,
    totalMeals: totalMealsForDate,
  };
}

export function useNutritionSummary(
  userId: string | undefined,
  date: Date = new Date()
) {
  const dateKey = useMemo(() => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, [date.getTime()]);

  const dayOfWeek = date.getDay();

  const query = useQuery({
    queryKey: ["nutritionSummary", userId, dateKey],
    queryFn: () => fetchNutritionSummary(userId!, dateKey, dayOfWeek),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 min
    gcTime: 5 * 60 * 1000,
  });

  return {
    data: query.data ?? DEFAULT_SUMMARY,
    isLoading: query.isLoading && !query.isFetched,
    refetch: query.refetch,
  };
}

// Invalidation hook to call after adding food
export const useInvalidateNutritionSummary = () => {
  const queryClient = useQueryClient();

  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["nutritionSummary"] });
  }, [queryClient]);
};
