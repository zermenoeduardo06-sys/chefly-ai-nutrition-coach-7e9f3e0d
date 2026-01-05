import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserMascotData {
  streak: number;
  caloriesConsumed: number;
  caloriesGoal: number;
  mealsCompleted: number;
  totalMeals: number;
  pendingChallenges: number;
  userName: string;
  level: number;
  points: number;
}

export const useMascotUserData = (userId: string | undefined) => {
  const [data, setData] = useState<UserMascotData>({
    streak: 0,
    caloriesConsumed: 0,
    caloriesGoal: 2000,
    mealsCompleted: 0,
    totalMeals: 3,
    pendingChallenges: 0,
    userName: '',
    level: 1,
    points: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const loadUserData = async () => {
      try {
        // Parallel data fetching for efficiency
        const [statsResult, profileResult, challengesResult, completionsResult, mealsResult] = await Promise.all([
          // User stats (streak, level, points)
          supabase.from('user_stats').select('*').eq('user_id', userId).single(),
          
          // Profile (name)
          supabase.from('profiles').select('display_name').eq('id', userId).single(),
          
          // Pending challenges for today
          supabase
            .from('daily_challenges')
            .select('id')
            .eq('user_id', userId)
            .gte('expires_at', new Date().toISOString()),
          
          // Today's meal completions
          supabase
            .from('meal_completions')
            .select('meal_id, meals(calories)')
            .eq('user_id', userId)
            .gte('completed_at', new Date().toISOString().split('T')[0]),
          
          // Get user's current meal plan meals count
          supabase
            .from('meal_plans')
            .select('id')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1),
        ]);

        // Get completed challenge count
        let pendingChallenges = 0;
        if (challengesResult.data) {
          const challengeIds = challengesResult.data.map(c => c.id);
          if (challengeIds.length > 0) {
            const { data: completedChallenges } = await supabase
              .from('user_daily_challenges')
              .select('challenge_id')
              .eq('user_id', userId)
              .eq('is_completed', true)
              .in('challenge_id', challengeIds);
            
            pendingChallenges = challengeIds.length - (completedChallenges?.length || 0);
          }
        }

        // Calculate calories consumed today from meal completions
        let caloriesConsumed = 0;
        let mealsCompletedToday = 0;
        if (completionsResult.data) {
          mealsCompletedToday = completionsResult.data.length;
          caloriesConsumed = completionsResult.data.reduce((sum, completion: any) => {
            return sum + (completion.meals?.calories || 0);
          }, 0);
        }

        // Also add food scans to calories consumed
        const { data: foodScans } = await supabase
          .from('food_scans')
          .select('calories')
          .eq('user_id', userId)
          .gte('scanned_at', new Date().toISOString().split('T')[0]);
        
        if (foodScans) {
          caloriesConsumed += foodScans.reduce((sum, scan) => sum + (scan.calories || 0), 0);
        }

        // Get total meals for today from meal plan
        let totalMeals = 3;
        if (mealsResult.data && mealsResult.data.length > 0) {
          const { data: planMeals } = await supabase
            .from('meals')
            .select('id')
            .eq('meal_plan_id', mealsResult.data[0].id)
            .eq('day_of_week', new Date().getDay());
          
          if (planMeals) {
            totalMeals = planMeals.length;
          }
        }

        // Get user preferences for calorie goal
        const { data: preferences } = await supabase
          .from('user_preferences')
          .select('goal, activity_level, weight, gender, age')
          .eq('user_id', userId)
          .single();
        
        // Calculate approximate calorie goal based on preferences
        let caloriesGoal = 2000;
        if (preferences) {
          // Basic estimation based on activity level and goal
          const baseCalories = preferences.gender === 'female' ? 1800 : 2200;
          const activityMultiplier = {
            'sedentary': 1.0,
            'light': 1.1,
            'moderate': 1.2,
            'active': 1.3,
            'very_active': 1.4,
          }[preferences.activity_level || 'moderate'] || 1.2;
          
          const goalAdjustment = {
            'lose_weight': -300,
            'maintain': 0,
            'gain_muscle': 300,
            'gain_weight': 400,
          }[preferences.goal || 'maintain'] || 0;
          
          caloriesGoal = Math.round(baseCalories * activityMultiplier + goalAdjustment);
        }

        setData({
          streak: statsResult.data?.current_streak || 0,
          caloriesConsumed,
          caloriesGoal,
          mealsCompleted: mealsCompletedToday,
          totalMeals,
          pendingChallenges,
          userName: profileResult.data?.display_name || '',
          level: statsResult.data?.level || 1,
          points: statsResult.data?.total_points || 0,
        });
      } catch (error) {
        console.error('Error loading mascot user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();

    // Subscribe to real-time updates for meal completions
    const channel = supabase
      .channel('mascot-data-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'meal_completions',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          loadUserData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_stats',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          loadUserData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { data, loading, refresh: () => {} };
};
