import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Food {
  id: string;
  name: string;
  name_en: string | null;
  portion: string;
  portion_grams: number | null;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  category: string;
  brand: string | null;
  barcode: string | null;
  is_verified: boolean;
}

export interface UserFood {
  id: string;
  user_id: string;
  food_id: string | null;
  custom_food_data: Food | null;
  usage_count: number;
  is_favorite: boolean;
  last_used_at: string;
  food?: Food;
}

const CATEGORY_ICONS: Record<string, string> = {
  frutas: '🍎',
  verduras: '🥬',
  proteinas: '🍗',
  lacteos: '🥛',
  granos: '🌾',
  bebidas: '☕',
  snacks: '🥜',
  comidas: '🍽️',
};

const CATEGORY_COLORS: Record<string, string> = {
  frutas: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  verduras: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  proteinas: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  lacteos: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  granos: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  bebidas: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  snacks: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  comidas: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

export const getCategoryIcon = (category: string) => CATEGORY_ICONS[category] || '🍽️';
export const getCategoryColor = (category: string) => CATEGORY_COLORS[category] || 'bg-gray-100 text-gray-700';

export const useFoodDatabase = (userId?: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [foods, setFoods] = useState<Food[]>([]);
  const [frequentFoods, setFrequentFoods] = useState<Food[]>([]);
  const [recentFoods, setRecentFoods] = useState<Food[]>([]);
  const [favoriteFoods, setFavoriteFoods] = useState<Food[]>([]);

  const searchFoods = useCallback(async (query: string): Promise<Food[]> => {
    if (!query || query.length < 2) {
      setFoods([]);
      return [];
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('foods')
        .select('*')
        .or(`name.ilike.%${query}%,name_en.ilike.%${query}%`)
        .limit(30);

      if (error) throw error;

      const typedData = (data || []).map(item => ({
        ...item,
        protein: Number(item.protein),
        carbs: Number(item.carbs),
        fats: Number(item.fats),
        fiber: Number(item.fiber),
        is_verified: item.is_verified ?? true,
      })) as Food[];

      setFoods(typedData);
      return typedData;
    } catch (error) {
      console.error('Error searching foods:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAllFoods = useCallback(async (category?: string): Promise<Food[]> => {
    setIsLoading(true);
    try {
      let query = supabase.from('foods').select('*');
      
      if (category) {
        query = query.eq('category', category);
      }
      
      const { data, error } = await query.order('name').limit(100);

      if (error) throw error;

      const typedData = (data || []).map(item => ({
        ...item,
        protein: Number(item.protein),
        carbs: Number(item.carbs),
        fats: Number(item.fats),
        fiber: Number(item.fiber),
        is_verified: item.is_verified ?? true,
      })) as Food[];

      setFoods(typedData);
      return typedData;
    } catch (error) {
      console.error('Error fetching foods:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getFrequentFoods = useCallback(async (): Promise<Food[]> => {
    if (!userId) return [];

    try {
      const { data, error } = await supabase
        .from('user_foods')
        .select('*, food:foods(*)')
        .eq('user_id', userId)
        .order('usage_count', { ascending: false })
        .limit(10);

      if (error) throw error;

      const foods = (data || [])
        .filter(item => item.food)
        .map(item => ({
          ...item.food,
          protein: Number(item.food.protein),
          carbs: Number(item.food.carbs),
          fats: Number(item.food.fats),
          fiber: Number(item.food.fiber),
          is_verified: item.food.is_verified ?? true,
        })) as Food[];

      setFrequentFoods(foods);
      return foods;
    } catch (error) {
      console.error('Error fetching frequent foods:', error);
      return [];
    }
  }, [userId]);

  const getRecentFoods = useCallback(async (): Promise<Food[]> => {
    if (!userId) return [];

    try {
      const { data, error } = await supabase
        .from('user_foods')
        .select('*, food:foods(*)')
        .eq('user_id', userId)
        .order('last_used_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const foods = (data || [])
        .filter(item => item.food)
        .map(item => ({
          ...item.food,
          protein: Number(item.food.protein),
          carbs: Number(item.food.carbs),
          fats: Number(item.food.fats),
          fiber: Number(item.food.fiber),
          is_verified: item.food.is_verified ?? true,
        })) as Food[];

      setRecentFoods(foods);
      return foods;
    } catch (error) {
      console.error('Error fetching recent foods:', error);
      return [];
    }
  }, [userId]);

  const getFavoriteFoods = useCallback(async (): Promise<Food[]> => {
    if (!userId) return [];

    try {
      const { data, error } = await supabase
        .from('user_foods')
        .select('*, food:foods(*)')
        .eq('user_id', userId)
        .eq('is_favorite', true)
        .limit(20);

      if (error) throw error;

      const foods = (data || [])
        .filter(item => item.food)
        .map(item => ({
          ...item.food,
          protein: Number(item.food.protein),
          carbs: Number(item.food.carbs),
          fats: Number(item.food.fats),
          fiber: Number(item.food.fiber),
          is_verified: item.food.is_verified ?? true,
        })) as Food[];

      setFavoriteFoods(foods);
      return foods;
    } catch (error) {
      console.error('Error fetching favorite foods:', error);
      return [];
    }
  }, [userId]);

  const toggleFavorite = useCallback(async (foodId: string): Promise<boolean> => {
    if (!userId) return false;

    try {
      // Check if user_food entry exists
      const { data: existing } = await supabase
        .from('user_foods')
        .select('id, is_favorite')
        .eq('user_id', userId)
        .eq('food_id', foodId)
        .single();

      if (existing) {
        // Toggle favorite
        const { error } = await supabase
          .from('user_foods')
          .update({ is_favorite: !existing.is_favorite })
          .eq('id', existing.id);

        if (error) throw error;
        return !existing.is_favorite;
      } else {
        // Create new entry as favorite
        const { error } = await supabase
          .from('user_foods')
          .insert({
            user_id: userId,
            food_id: foodId,
            is_favorite: true,
            usage_count: 0,
          });

        if (error) throw error;
        return true;
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return false;
    }
  }, [userId]);

  const trackFoodUsage = useCallback(async (foodId: string): Promise<void> => {
    if (!userId) return;

    try {
      // Check if user_food entry exists
      const { data: existing } = await supabase
        .from('user_foods')
        .select('id, usage_count')
        .eq('user_id', userId)
        .eq('food_id', foodId)
        .single();

      if (existing) {
        // Increment usage count
        await supabase
          .from('user_foods')
          .update({ 
            usage_count: existing.usage_count + 1,
            last_used_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
      } else {
        // Create new entry
        await supabase
          .from('user_foods')
          .insert({
            user_id: userId,
            food_id: foodId,
            usage_count: 1,
            is_favorite: false,
          });
      }
    } catch (error) {
      console.error('Error tracking food usage:', error);
    }
  }, [userId]);

  const isFavorite = useCallback(async (foodId: string): Promise<boolean> => {
    if (!userId) return false;

    try {
      const { data } = await supabase
        .from('user_foods')
        .select('is_favorite')
        .eq('user_id', userId)
        .eq('food_id', foodId)
        .single();

      return data?.is_favorite ?? false;
    } catch {
      return false;
    }
  }, [userId]);

  return {
    foods,
    frequentFoods,
    recentFoods,
    favoriteFoods,
    isLoading,
    searchFoods,
    getAllFoods,
    getFrequentFoods,
    getRecentFoods,
    getFavoriteFoods,
    toggleFavorite,
    trackFoodUsage,
    isFavorite,
    getCategoryIcon,
    getCategoryColor,
  };
};
