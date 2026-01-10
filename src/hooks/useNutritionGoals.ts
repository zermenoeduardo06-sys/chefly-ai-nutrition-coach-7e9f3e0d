import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  isPersonalized: boolean;
}

interface UserMetrics {
  age: number | null;
  weight: number | null;
  height: number | null;
  gender: string | null;
  activityLevel: string | null;
  goal: string | null;
  targetWeight: number | null;
}

// Default goals if no personalization data
const DEFAULT_GOALS: NutritionGoals = {
  calories: 2000,
  protein: 120,
  carbs: 250,
  fats: 65,
  isPersonalized: false,
};

// Activity multipliers for TDEE calculation
const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

// Calculate BMR using Mifflin-St Jeor equation (more accurate than Harris-Benedict)
const calculateBMR = (weight: number, height: number, age: number, gender: string): number => {
  if (gender === "male") {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    // Female or other
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
};

// Calculate TDEE (Total Daily Energy Expenditure)
const calculateTDEE = (bmr: number, activityLevel: string): number => {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || ACTIVITY_MULTIPLIERS.moderate;
  return bmr * multiplier;
};

// Adjust calories based on goal
const adjustForGoal = (tdee: number, goal: string): number => {
  switch (goal) {
    case "lose_fat":
      return tdee - 500; // ~0.5kg/week deficit
    case "gain_muscle":
      return tdee + 300; // Modest surplus for muscle gain
    case "eat_healthy":
    case "save_money":
    default:
      return tdee; // Maintenance
  }
};

// Calculate macros based on goal and calorie target
const calculateMacros = (
  calories: number,
  weight: number,
  goal: string
): { protein: number; carbs: number; fats: number } => {
  let proteinMultiplier: number;
  let fatPercentage: number;

  switch (goal) {
    case "lose_fat":
      proteinMultiplier = 2.2; // Higher protein for satiety and muscle preservation
      fatPercentage = 0.25;
      break;
    case "gain_muscle":
      proteinMultiplier = 2.0; // High protein for muscle building
      fatPercentage = 0.25;
      break;
    default:
      proteinMultiplier = 1.6; // Moderate protein
      fatPercentage = 0.30;
  }

  const protein = Math.round(weight * proteinMultiplier);
  const proteinCalories = protein * 4;

  const fatCalories = calories * fatPercentage;
  const fats = Math.round(fatCalories / 9);

  const remainingCalories = calories - proteinCalories - fatCalories;
  const carbs = Math.round(remainingCalories / 4);

  return {
    protein: Math.max(protein, 50), // Minimum 50g protein
    carbs: Math.max(carbs, 100), // Minimum 100g carbs
    fats: Math.max(fats, 40), // Minimum 40g fats
  };
};

export const useNutritionGoals = (userId: string | null) => {
  const [goals, setGoals] = useState<NutritionGoals>(DEFAULT_GOALS);
  const [loading, setLoading] = useState(true);
  const [userMetrics, setUserMetrics] = useState<UserMetrics | null>(null);
  
  // Use ref to track if we've already loaded to prevent duplicate calls
  const hasLoadedRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);

  const calculateGoals = useCallback((metrics: UserMetrics): NutritionGoals => {
    const { age, weight, height, gender, activityLevel, goal } = metrics;

    // If we don't have essential data, return defaults
    if (!weight || !height || !age || !gender) {
      return DEFAULT_GOALS;
    }

    const bmr = calculateBMR(weight, height, age, gender);
    const tdee = calculateTDEE(bmr, activityLevel || "moderate");
    const adjustedCalories = adjustForGoal(tdee, goal || "eat_healthy");
    const { protein, carbs, fats } = calculateMacros(adjustedCalories, weight, goal || "eat_healthy");

    return {
      calories: Math.round(adjustedCalories),
      protein,
      carbs,
      fats,
      isPersonalized: true,
    };
  }, []);

  const loadUserData = useCallback(async () => {
    // Prevent duplicate loads for the same userId
    if (userId === lastUserIdRef.current && hasLoadedRef.current) {
      return;
    }
    
    if (!userId) {
      setGoals(DEFAULT_GOALS);
      setLoading(false);
      return;
    }
    
    lastUserIdRef.current = userId;
    hasLoadedRef.current = true;

    try {
      const { data: prefs, error } = await supabase
        .from("user_preferences")
        .select("age, weight, height, gender, activity_level, goal, target_weight, daily_calorie_goal, daily_protein_goal, daily_carbs_goal, daily_fats_goal")
        .eq("user_id", userId)
        .single();

      if (error || !prefs) {
        setGoals(DEFAULT_GOALS);
        setLoading(false);
        return;
      }

      // If we have pre-calculated goals stored in DB, use them
      if (prefs.daily_calorie_goal && prefs.daily_protein_goal) {
        setGoals({
          calories: prefs.daily_calorie_goal,
          protein: prefs.daily_protein_goal,
          carbs: prefs.daily_carbs_goal || DEFAULT_GOALS.carbs,
          fats: prefs.daily_fats_goal || DEFAULT_GOALS.fats,
          isPersonalized: true,
        });
        setUserMetrics({
          age: prefs.age,
          weight: prefs.weight,
          height: prefs.height,
          gender: prefs.gender,
          activityLevel: prefs.activity_level,
          goal: prefs.goal,
          targetWeight: prefs.target_weight,
        });
        setLoading(false);
        return;
      }

      // Calculate goals from user metrics
      const metrics: UserMetrics = {
        age: prefs.age,
        weight: prefs.weight,
        height: prefs.height,
        gender: prefs.gender,
        activityLevel: prefs.activity_level,
        goal: prefs.goal,
        targetWeight: prefs.target_weight,
      };

      setUserMetrics(metrics);
      const calculatedGoals = calculateGoals(metrics);
      setGoals(calculatedGoals);
    } catch (error) {
      console.error("Error loading nutrition goals:", error);
      setGoals(DEFAULT_GOALS);
    } finally {
      setLoading(false);
    }
  }, [userId, calculateGoals]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Function to save calculated goals to DB
  const saveGoalsToDB = useCallback(async (newGoals: NutritionGoals) => {
    if (!userId) return;

    try {
      await supabase
        .from("user_preferences")
        .update({
          daily_calorie_goal: newGoals.calories,
          daily_protein_goal: newGoals.protein,
          daily_carbs_goal: newGoals.carbs,
          daily_fats_goal: newGoals.fats,
        })
        .eq("user_id", userId);
    } catch (error) {
      console.error("Error saving nutrition goals:", error);
    }
  }, [userId]);

  // Function to recalculate goals when weight changes
  const recalculateWithNewWeight = useCallback(async (newWeight: number) => {
    if (!userMetrics) return;

    const updatedMetrics = { ...userMetrics, weight: newWeight };
    const newGoals = calculateGoals(updatedMetrics);
    setGoals(newGoals);
    setUserMetrics(updatedMetrics);
    await saveGoalsToDB(newGoals);
  }, [userMetrics, calculateGoals, saveGoalsToDB]);

  return {
    goals,
    loading,
    userMetrics,
    recalculateWithNewWeight,
    refresh: loadUserData,
  };
};