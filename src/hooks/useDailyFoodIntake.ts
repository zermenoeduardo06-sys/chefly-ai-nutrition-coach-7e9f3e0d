import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, endOfDay } from "date-fns";
import { syncToWidget, createWidgetData } from "./useWidgetSync";

interface MealCalories {
  breakfast: number;
  lunch: number;
  dinner: number;
  snack: number;
}

interface MealMacros {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface RecentFoods {
  breakfast?: string;
  lunch?: string;
  dinner?: string;
  snack?: string;
}

interface FoodScan {
  id: string;
  dish_name: string;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  meal_type: string | null;
  scanned_at: string;
}

interface DailyIntakeData {
  consumedCalories: MealCalories;
  consumedMacros: MealMacros;
  recentFoods: RecentFoods;
  foodScans: FoodScan[];
}

const DEFAULT_CALORIES: MealCalories = {
  breakfast: 0,
  lunch: 0,
  dinner: 0,
  snack: 0,
};

const DEFAULT_MACROS: MealMacros = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fats: 0,
};

// Pure fetch function for React Query
async function fetchDailyIntakeData(userId: string, dateKey: string): Promise<DailyIntakeData> {
  // Parse as local date (not UTC) to match user's timezone
  const [year, month, day] = dateKey.split('-').map(Number);
  const targetDate = new Date(year, month - 1, day);
  
  // Get local day boundaries
  const dayStart = startOfDay(targetDate);
  const dayEnd = endOfDay(targetDate);
  
  // Convert to ISO strings for Supabase query
  const dayStartISO = dayStart.toISOString();
  const dayEndISO = dayEnd.toISOString();

  const { data, error } = await supabase
    .from("food_scans")
    .select("id, dish_name, calories, protein, carbs, fat, meal_type, scanned_at")
    .eq("user_id", userId)
    .gte("scanned_at", dayStartISO)
    .lte("scanned_at", dayEndISO)
    .order("scanned_at", { ascending: false });

  if (error) {
    console.error("Error fetching food scans:", error);
    return {
      consumedCalories: DEFAULT_CALORIES,
      consumedMacros: DEFAULT_MACROS,
      recentFoods: {},
      foodScans: [],
    };
  }

  if (!data || data.length === 0) {
    return {
      consumedCalories: DEFAULT_CALORIES,
      consumedMacros: DEFAULT_MACROS,
      recentFoods: {},
      foodScans: [],
    };
  }

  // Calculate calories per meal type
  const caloriesByMeal: MealCalories = {
    breakfast: 0,
    lunch: 0,
    dinner: 0,
    snack: 0,
  };

  // Get most recent food per meal type
  const recentByMeal: RecentFoods = {};

  // Track total macros
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFats = 0;

  data.forEach((scan) => {
    const mealType = scan.meal_type as keyof MealCalories | null;
    const calories = scan.calories || 0;
    const protein = scan.protein || 0;
    const carbs = scan.carbs || 0;
    const fat = scan.fat || 0;

    // Add to totals
    totalCalories += calories;
    totalProtein += protein;
    totalCarbs += carbs;
    totalFats += fat;

    // Add to meal-specific calories
    if (mealType && mealType in caloriesByMeal) {
      caloriesByMeal[mealType] += calories;
      
      // Track most recent food for this meal type
      if (!recentByMeal[mealType]) {
        recentByMeal[mealType] = scan.dish_name;
      }
    }
  });

  // Sync to iOS Widget (non-blocking)
  syncToWidget(createWidgetData(
    { calories: totalCalories, protein: totalProtein, carbs: totalCarbs, fats: totalFats },
    { calories: 2000, protein: 120, carbs: 250, fats: 65 } // Placeholder, real goals synced from NutritionSummaryWidget
  ));

  return {
    consumedCalories: caloriesByMeal,
    consumedMacros: {
      calories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fats: totalFats,
    },
    recentFoods: recentByMeal,
    foodScans: data,
  };
}

// Export for prefetching
export { fetchDailyIntakeData };

export function useDailyFoodIntake(userId: string | undefined, date: Date = new Date()) {
  // Convert Date to stable string key to avoid infinite loops
  const dateKey = useMemo(() => date.toISOString().split('T')[0], [date.getTime()]);
  
  const query = useQuery({
    queryKey: ['foodIntake', userId, dateKey],
    queryFn: () => fetchDailyIntakeData(userId!, dateKey),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 min
    gcTime: 5 * 60 * 1000,
  });

  return {
    consumedCalories: query.data?.consumedCalories ?? DEFAULT_CALORIES,
    consumedMacros: query.data?.consumedMacros ?? DEFAULT_MACROS,
    recentFoods: query.data?.recentFoods ?? {},
    foodScans: query.data?.foodScans ?? [],
    isLoading: query.isLoading && !query.isFetched,
    refetch: query.refetch,
  };
}
