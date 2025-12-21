import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useFamily } from "./useFamily";

interface MealAdaptation {
  id: string;
  member_user_id: string;
  member_name?: string;
  adaptation_score: number;
  adaptation_notes: string;
  variant_instructions: string;
  is_best_match: boolean;
}

interface FamilyMeal {
  id: string;
  day_of_week: number;
  meal_type: string;
  name: string;
  description: string;
  benefits: string;
  ingredients?: string[];
  steps?: string[];
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  image_url?: string;
  adaptations?: MealAdaptation[];
}

interface FamilyMealPlan {
  id: string;
  week_start_date: string;
  is_family_plan: boolean;
  family_id: string;
  meals: FamilyMeal[];
}

export const useFamilyMealPlan = (userId: string | undefined) => {
  const [mealPlan, setMealPlan] = useState<FamilyMealPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { family, members, isLoading: familyLoading } = useFamily(userId);

  // Memoize member name map to prevent infinite re-renders
  const memberNameMap = useMemo(() => new Map(
    members.map(m => [
      m.user_id, 
      m.profile?.display_name || m.profile?.email?.split('@')[0] || 'Miembro'
    ])
  ), [members]);

  const loadFamilyMealPlan = useCallback(async () => {
    if (!userId || !family) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get the latest family meal plan
      const { data: planData, error: planError } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('family_id', family.id)
        .eq('is_family_plan', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (planError || !planData) {
        setMealPlan(null);
        setLoading(false);
        return;
      }

      // Get meals for this plan
      const { data: mealsData, error: mealsError } = await supabase
        .from('meals')
        .select('*')
        .eq('meal_plan_id', planData.id);

      if (mealsError) {
        throw mealsError;
      }

      // Get adaptations for all meals
      const mealIds = mealsData?.map(m => m.id) || [];
      
      let adaptationsMap: Map<string, MealAdaptation[]> = new Map();
      
      if (mealIds.length > 0) {
        const { data: adaptationsData } = await supabase
          .from('meal_member_adaptations')
          .select('*')
          .in('meal_id', mealIds);

        if (adaptationsData) {
          for (const adaptation of adaptationsData) {
            const mealAdaptations = adaptationsMap.get(adaptation.meal_id) || [];
            mealAdaptations.push({
              ...adaptation,
              member_name: memberNameMap.get(adaptation.member_user_id),
            });
            adaptationsMap.set(adaptation.meal_id, mealAdaptations);
          }
        }
      }

      // Combine meals with their adaptations
      const mealsWithAdaptations: FamilyMeal[] = (mealsData || []).map(meal => ({
        ...meal,
        adaptations: adaptationsMap.get(meal.id) || [],
      }));

      setMealPlan({
        ...planData,
        meals: mealsWithAdaptations,
      });
    } catch (err) {
      console.error('Error loading family meal plan:', err);
      setError(err instanceof Error ? err.message : 'Error loading family meal plan');
    } finally {
      setLoading(false);
    }
  }, [userId, family]);

  useEffect(() => {
    if (!familyLoading && family) {
      loadFamilyMealPlan();
    } else if (!familyLoading && !family) {
      setLoading(false);
    }
  }, [family, familyLoading, loadFamilyMealPlan]);

  const generateFamilyMealPlan = async (language: string = 'es') => {
    if (!userId || !family) {
      return { success: false, error: 'No family found' };
    }

    try {
      setGenerating(true);
      setError(null);

      const { data, error } = await supabase.functions.invoke('generate-family-meal-plan', {
        body: { language },
      });

      if (error) {
        throw error;
      }

      await loadFamilyMealPlan();
      
      return { success: true, mealPlanId: data.mealPlanId };
    } catch (err) {
      console.error('Error generating family meal plan:', err);
      const errorMsg = err instanceof Error ? err.message : 'Error generating family meal plan';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setGenerating(false);
    }
  };

  // Get best match member for a meal
  const getBestMatchForMeal = (mealId: string): MealAdaptation | null => {
    const meal = mealPlan?.meals.find(m => m.id === mealId);
    if (!meal?.adaptations) return null;
    
    return meal.adaptations.find(a => a.is_best_match) || null;
  };

  // Get all adaptations for a meal
  const getAdaptationsForMeal = (mealId: string): MealAdaptation[] => {
    const meal = mealPlan?.meals.find(m => m.id === mealId);
    return meal?.adaptations || [];
  };

  // Check if user has a family meal plan
  const hasFamilyMealPlan = !!mealPlan && mealPlan.is_family_plan;

  return {
    mealPlan,
    loading: loading || familyLoading,
    generating,
    error,
    hasFamilyMealPlan,
    hasFamily: !!family,
    membersCount: members.length,
    loadFamilyMealPlan,
    generateFamilyMealPlan,
    getBestMatchForMeal,
    getAdaptationsForMeal,
  };
};
