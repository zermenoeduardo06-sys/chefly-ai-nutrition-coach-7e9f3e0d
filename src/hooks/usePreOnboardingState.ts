import { useState, useEffect, useCallback } from 'react';

export interface PreOnboardingData {
  // Personal info
  name: string;
  gender: string;
  birthDate: Date | null;
  height: number;
  heightUnit: 'cm' | 'ft';
  weight: number;
  weightUnit: 'kg' | 'lb';
  targetWeight: number;
  activityLevel: string;
  
  // Goals
  goal: string;
  
  // Motivation & Obstacles (NEW)
  motivation: string[];
  previousDiets: string;
  obstacles: string[];
  timeline: string;
  
  // Diet preferences
  dietType: string;
  allergies: string[];
  dislikes: string[];
  cuisines: string[];
  flavors: string[];
  
  // Cooking preferences
  cookingSkill: string;
  cookingTime: number;
  budget: string;
  mealsPerDay: number;
  mealComplexity: string;
}

const STORAGE_KEY = 'chefly_pre_onboarding';
const STEP_STORAGE_KEY = 'chefly_pre_onboarding_step';

const defaultData: PreOnboardingData = {
  name: '',
  gender: '',
  birthDate: null,
  height: 0,
  heightUnit: 'cm',
  weight: 0,
  weightUnit: 'kg',
  targetWeight: 0,
  activityLevel: '',
  goal: '',
  motivation: [],
  previousDiets: '',
  obstacles: [],
  timeline: '',
  dietType: '',
  allergies: [],
  dislikes: [],
  cuisines: [],
  flavors: [],
  cookingSkill: '',
  cookingTime: 30,
  budget: '',
  mealsPerDay: 3,
  mealComplexity: 'moderate',
};

export const usePreOnboardingState = () => {
  const [data, setData] = useState<PreOnboardingData>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert birthDate string back to Date
        if (parsed.birthDate) {
          parsed.birthDate = new Date(parsed.birthDate);
        }
        return { ...defaultData, ...parsed };
      }
    } catch (e) {
      console.error('Error loading pre-onboarding data:', e);
    }
    return defaultData;
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving pre-onboarding data:', e);
    }
  }, [data]);

  const updateField = useCallback(<K extends keyof PreOnboardingData>(
    field: K,
    value: PreOnboardingData[K]
  ) => {
    setData(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateMultipleFields = useCallback((updates: Partial<PreOnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  }, []);

  const toggleArrayItem = useCallback(<K extends keyof PreOnboardingData>(
    field: K,
    item: string
  ) => {
    setData(prev => {
      const currentArray = prev[field] as string[];
      const newArray = currentArray.includes(item)
        ? currentArray.filter(i => i !== item)
        : [...currentArray, item];
      return { ...prev, [field]: newArray };
    });
  }, []);

  const clearData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STEP_STORAGE_KEY);
    setData(defaultData);
  }, []);

  const getSavedStep = useCallback((): number => {
    try {
      const savedStep = localStorage.getItem(STEP_STORAGE_KEY);
      if (savedStep) {
        const step = parseInt(savedStep, 10);
        return isNaN(step) ? 1 : step;
      }
    } catch (e) {
      console.error('Error loading saved step:', e);
    }
    return 1;
  }, []);

  const saveStep = useCallback((step: number) => {
    try {
      localStorage.setItem(STEP_STORAGE_KEY, step.toString());
    } catch (e) {
      console.error('Error saving step:', e);
    }
  }, []);

  const calculateAge = useCallback(() => {
    if (!data.birthDate) return 0;
    const today = new Date();
    const birth = new Date(data.birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }, [data.birthDate]);

  const calculateNutritionGoals = useCallback(() => {
    const age = calculateAge();
    const weight = data.weightUnit === 'lb' ? data.weight * 0.453592 : data.weight;
    const height = data.heightUnit === 'ft' ? data.height * 30.48 : data.height;
    
    // Mifflin-St Jeor equation
    let bmr: number;
    if (data.gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // Activity multipliers
    const activityMultipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };

    const tdee = bmr * (activityMultipliers[data.activityLevel] || 1.55);

    // Goal adjustments
    let targetCalories = tdee;
    if (data.goal === 'lose_weight') {
      targetCalories = tdee - 500;
    } else if (data.goal === 'gain_muscle') {
      targetCalories = tdee + 300;
    }

    // Macro split
    const protein = Math.round((targetCalories * 0.3) / 4);
    const carbs = Math.round((targetCalories * 0.4) / 4);
    const fats = Math.round((targetCalories * 0.3) / 9);

    return {
      calories: Math.round(targetCalories),
      protein,
      carbs,
      fats,
    };
  }, [data, calculateAge]);

  return {
    data,
    updateField,
    updateMultipleFields,
    toggleArrayItem,
    clearData,
    calculateAge,
    calculateNutritionGoals,
    getSavedStep,
    saveStep,
  };
};
