import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface CachedMeal {
  id: string;
  meal_plan_id: string;
  day_of_week: number;
  meal_type: string;
  name: string;
  description: string;
  benefits: string;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fats: number | null;
  image_url: string | null;
  ingredients: string[] | null;
  steps: string[] | null;
}

interface CachedMealPlan {
  id: string;
  week_start_date: string;
  meals: CachedMeal[];
  cachedAt: number;
}

interface PendingCompletion {
  mealId: string;
  oderedAt: number;
  userId: string;
}

const CACHE_KEY = 'chefly_offline_meals';
const PENDING_KEY = 'chefly_pending_completions';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export const useOfflineMode = (userId: string | undefined) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const { toast } = useToast();
  const { language } = useLanguage();

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: language === 'es' ? '¡Conexión restaurada!' : 'Connection restored!',
        description: language === 'es' ? 'Sincronizando datos...' : 'Syncing data...',
      });
      syncPendingCompletions();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: language === 'es' ? 'Sin conexión' : 'Offline',
        description: language === 'es' ? 'Trabajando en modo offline' : 'Working in offline mode',
        variant: 'destructive',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [language, toast]);

  // Load pending count on mount
  useEffect(() => {
    const pending = getPendingCompletions();
    setPendingCount(pending.length);
  }, []);

  // Cache meals
  const cacheMeals = useCallback((mealPlan: { id: string; week_start_date: string }, meals: CachedMeal[]) => {
    const cached: CachedMealPlan = {
      id: mealPlan.id,
      week_start_date: mealPlan.week_start_date,
      meals,
      cachedAt: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
  }, []);

  // Get cached meals
  const getCachedMeals = useCallback((): CachedMealPlan | null => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const parsed: CachedMealPlan = JSON.parse(cached);
    
    // Check if cache is still valid
    if (Date.now() - parsed.cachedAt > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return parsed;
  }, []);

  // Get pending completions
  const getPendingCompletions = (): PendingCompletion[] => {
    const pending = localStorage.getItem(PENDING_KEY);
    return pending ? JSON.parse(pending) : [];
  };

  // Add pending completion
  const addPendingCompletion = useCallback((mealId: string) => {
    if (!userId) return;

    const pending = getPendingCompletions();
    
    // Avoid duplicates
    if (pending.some(p => p.mealId === mealId)) return;

    pending.push({
      mealId,
      oderedAt: Date.now(),
      userId,
    });

    localStorage.setItem(PENDING_KEY, JSON.stringify(pending));
    setPendingCount(pending.length);
  }, [userId]);

  // Sync pending completions
  const syncPendingCompletions = useCallback(async () => {
    if (!userId || isSyncing) return;

    const pending = getPendingCompletions();
    if (pending.length === 0) return;

    setIsSyncing(true);

    const successfulIds: string[] = [];

    for (const completion of pending) {
      if (completion.userId !== userId) continue;

      try {
        // Check if already completed
        const { data: existing } = await supabase
          .from('meal_completions')
          .select('id')
          .eq('meal_id', completion.mealId)
          .eq('user_id', userId)
          .maybeSingle();

        if (!existing) {
          // Insert completion
          await supabase
            .from('meal_completions')
            .insert({
              meal_id: completion.mealId,
              user_id: userId,
              points_earned: 10,
            });
        }

        successfulIds.push(completion.mealId);
      } catch (error) {
        console.error('Failed to sync completion:', error);
      }
    }

    // Remove synced completions
    const remaining = pending.filter(p => !successfulIds.includes(p.mealId));
    localStorage.setItem(PENDING_KEY, JSON.stringify(remaining));
    setPendingCount(remaining.length);

    setIsSyncing(false);

    if (successfulIds.length > 0) {
      toast({
        title: language === 'es' ? '¡Sincronizado!' : 'Synced!',
        description: language === 'es' 
          ? `${successfulIds.length} comida(s) sincronizada(s)` 
          : `${successfulIds.length} meal(s) synced`,
      });
    }
  }, [userId, isSyncing, language, toast]);

  // Sync on mount if online and has pending
  useEffect(() => {
    if (isOnline && userId) {
      syncPendingCompletions();
    }
  }, [isOnline, userId]);

  return {
    isOnline,
    isSyncing,
    pendingCount,
    cacheMeals,
    getCachedMeals,
    addPendingCompletion,
    syncPendingCompletions,
  };
};
