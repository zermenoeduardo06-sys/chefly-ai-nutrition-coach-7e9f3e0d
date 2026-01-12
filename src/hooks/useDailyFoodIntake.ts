import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, endOfDay } from "date-fns";

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

export function useDailyFoodIntake(userId: string | undefined, date: Date = new Date()) {
  // Convert Date to stable string key to avoid infinite loops
  // Using date.getTime() as dependency since Date objects have unstable references
  const dateKey = useMemo(() => date.toISOString().split('T')[0], [date.getTime()]);
  
  const [consumedCalories, setConsumedCalories] = useState<MealCalories>({
    breakfast: 0,
    lunch: 0,
    dinner: 0,
    snack: 0,
  });
  
  const [consumedMacros, setConsumedMacros] = useState<MealMacros>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
  });
  
  const [recentFoods, setRecentFoods] = useState<RecentFoods>({});
  const [isLoading, setIsLoading] = useState(true);
  const [foodScans, setFoodScans] = useState<FoodScan[]>([]);

  const fetchDailyIntake = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      // Use the selected date's local boundaries for querying
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
        return;
      }

      if (!data || data.length === 0) {
        setConsumedCalories({ breakfast: 0, lunch: 0, dinner: 0, snack: 0 });
        setConsumedMacros({ calories: 0, protein: 0, carbs: 0, fats: 0 });
        setRecentFoods({});
        setFoodScans([]);
        return;
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

      setConsumedCalories(caloriesByMeal);
      setConsumedMacros({
        calories: totalCalories,
        protein: totalProtein,
        carbs: totalCarbs,
        fats: totalFats,
      });
      setRecentFoods(recentByMeal);
      setFoodScans(data);
    } catch (error) {
      console.error("Error in fetchDailyIntake:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, dateKey]);

  useEffect(() => {
    fetchDailyIntake();
  }, [fetchDailyIntake]);

  return {
    consumedCalories,
    consumedMacros,
    recentFoods,
    foodScans,
    isLoading,
    refetch: fetchDailyIntake,
  };
}
