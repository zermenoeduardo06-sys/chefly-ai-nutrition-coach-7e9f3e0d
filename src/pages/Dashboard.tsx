import { useEffect, useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { getLocalDateString } from "@/lib/dateUtils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MealDetailDialog } from "@/components/MealDetailDialog";
import { SwapMealDialog } from "@/components/SwapMealDialog";
import { MascotCompanion } from "@/components/MascotCompanion";
import { DailySummaryDialog } from "@/components/DailySummaryDialog";
import { AchievementUnlockAnimation } from "@/components/AchievementUnlockAnimation";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { useSubscription } from "@/hooks/useSubscription";
import { AiUsageIndicator } from "@/components/AiUsageIndicator";
import { useTrialGuard } from "@/hooks/useTrialGuard";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMascot } from "@/contexts/MascotContext";
import confetti from "canvas-confetti";
import DashboardTutorial from "@/components/DashboardTutorial";
import { InAppTour } from "@/components/InAppTour";
import MobileWelcomeTutorial from "@/components/MobileWelcomeTutorial";
import { clearAllShoppingListCaches } from "@/utils/shoppingListCache";
import { useNotifications } from "@/hooks/useNotifications";
import { useNotificationPrompts } from "@/hooks/useNotificationPrompts";
import { NotificationPermissionPrompt } from "@/components/NotificationPermissionPrompt";
import { useIsMobile } from "@/hooks/use-mobile";
import { useHaptics } from "@/hooks/useHaptics";
import { useOfflineMode } from "@/hooks/useOfflineMode";
import { useDeepLinking } from "@/hooks/useDeepLinking";
import { Capacitor } from "@capacitor/core";
import { FoodScanner } from "@/components/FoodScanner";
import { useStreakSystem } from "@/hooks/useStreakSystem";
import { NutritionSummaryWidget } from "@/components/NutritionSummaryWidget";
import { MealPhotoDialog } from "@/components/MealPhotoDialog";
import { MealModulesSection } from "@/components/diary/MealModulesSection";
import { DiaryDateHeader } from "@/components/diary/DiaryDateHeader";
import { useDailyFoodIntake } from "@/hooks/useDailyFoodIntake";
import { useNutritionGoals } from "@/hooks/useNutritionGoals";
import { WaterTrackerWidget } from "@/components/WaterTrackerWidget";
import { WeightTrackerWidget } from "@/components/WeightTrackerWidget";
import { DailyProgressMilestones } from "@/components/celebrations/DailyProgressMilestones";
import { useCelebrations } from "@/hooks/useCelebrations";
import { useInvalidateProgressData } from "@/hooks/useProgressData";
import { useInvalidateNutritionSummary } from "@/hooks/useNutritionSummary";
import { useAppReview } from "@/hooks/useAppReview";
import { useSubscriptionPromo } from "@/hooks/useSubscriptionPromo";
import { SubscriptionPromoBanner } from "@/components/SubscriptionPromoBanner";
import { DashboardHeader } from "@/components/DashboardHeader";
import { usePrefetch } from "@/hooks/usePrefetch";

interface MealAdaptation {
  id: string;
  member_user_id: string;
  member_name?: string;
  adaptation_score: number;
  adaptation_notes: string;
  variant_instructions: string;
  is_best_match: boolean;
}

interface Meal {
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

interface MealPlan {
  id: string;
  week_start_date: string;
  is_family_plan?: boolean;
  family_id?: string;
  meals: Meal[];
}

interface UserStats {
  total_points: number;
  current_streak: number;
  longest_streak: number;
  meals_completed: number;
  level: number;
}


const Dashboard = () => {
  // Preferences check state - shows loader only during initial check
  const [preferencesChecked, setPreferencesChecked] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const redirectingRef = useRef(false);
  const [generating, setGenerating] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [mealDialogOpen, setMealDialogOpen] = useState(false);
  const [swapDialogOpen, setSwapDialogOpen] = useState(false);
  const [userStats, setUserStats] = useState<UserStats>({
    total_points: 0,
    current_streak: 0,
    longest_streak: 0,
    meals_completed: 0,
    level: 1,
  });
  const [completedMeals, setCompletedMeals] = useState<Set<string>>(new Set());
  const [showCelebration, setShowCelebration] = useState(false);
  const [mascotMessage, setMascotMessage] = useState("");
  const [showDailySummary, setShowDailySummary] = useState(false);
  const [dailySummaryData, setDailySummaryData] = useState({
    dayName: "",
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFats: 0,
  });
  const [showAchievementUnlock, setShowAchievementUnlock] = useState(false);
  const [unlockedAchievement, setUnlockedAchievement] = useState<any>(null);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showInAppTour, setShowInAppTour] = useState(false);
  const [showMobileWelcome, setShowMobileWelcome] = useState(false);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [showFoodScanner, setShowFoodScanner] = useState(false);
  const [showMealPhotoDialog, setShowMealPhotoDialog] = useState(false);
  const [mealToComplete, setMealToComplete] = useState<Meal | null>(null);
  const [currentMobileDay, setCurrentMobileDay] = useState(0);
  // Selected date for diary view - YAZIO style
  const [selectedDate, setSelectedDate] = useState(new Date());
  const isNativePlatform = Capacitor.isNativePlatform();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { limits, refreshLimits } = useSubscriptionLimits(userId);
  const subscription = useSubscription(userId);
  const { isBlocked, isLoading: trialLoading } = useTrialGuard();
  const [searchParams] = useSearchParams();
  const { t, getArray, language, setLanguage } = useLanguage();
  const { triggerCelebration: triggerMascotCelebration } = useMascot();
  const { scheduleMealReminders, scheduleStreakRiskAlert, permissionGranted, isNative, requestPermissions } = useNotifications();
  const { successNotification, celebrationPattern, errorNotification, selectionChanged } = useHaptics();
  const { isOnline, isSyncing, pendingCount, cacheMeals, getCachedMeals, addPendingCompletion } = useOfflineMode(userId);
  
  // Streak system based on daily calorie intake
  const streakSystem = useStreakSystem(userId, subscription.isCheflyPlus);
  
  // Celebrations hook for enhanced animations
  const { celebrateMealComplete, celebrateDailyGoal } = useCelebrations();
  
  // Progress data invalidation for instant updates
  const invalidateProgressData = useInvalidateProgressData();
  const invalidateNutritionSummary = useInvalidateNutritionSummary();
  
  // App review system for iOS
  const { checkAndRequestReview } = useAppReview();
  
  // Subscription promo banner for free users
  const { shouldShowBanner, isVisible, dismissBanner } = useSubscriptionPromo({
    isCheflyPlus: limits.isCheflyPlus,
    isLoading: limits.isLoading,
  });
  
  // Notification prompt system
  const notificationPrompts = useNotificationPrompts();
  // Daily food intake tracking from food_scans - uses selected date
  const { consumedCalories, consumedMacros, recentFoods, refetch: refetchFoodIntake } = useDailyFoodIntake(userId, selectedDate);
  
  // Nutrition goals from user preferences
  const { goals: nutritionGoals, loading: goalsLoading } = useNutritionGoals(userId || null);
  
  // Calculate target calories per meal (approximate distribution) - memoized
  const targetCalories = useMemo(() => ({
    breakfast: Math.round(nutritionGoals.calories * 0.25), // 25%
    lunch: Math.round(nutritionGoals.calories * 0.35), // 35%
    dinner: Math.round(nutritionGoals.calories * 0.30), // 30%
    snack: Math.round(nutritionGoals.calories * 0.10), // 10%
  }), [nutritionGoals.calories]);

  // Deep linking handler for opening specific meals from notifications
  const handleDeepLinkMealOpen = (mealType: string, dayOfWeek: number) => {
    if (mealPlan) {
      const meal = mealPlan.meals.find(
        m => m.meal_type === mealType && m.day_of_week === dayOfWeek
      );
      if (meal) {
        setSelectedMeal(meal);
        setMealDialogOpen(true);
        // Set mobile day for proper view
        setCurrentMobileDay(dayOfWeek);
      }
    }
  };

  useDeepLinking(handleDeepLinkMealOpen);

  // Handle deep link from URL params after meals load
  useEffect(() => {
    const openMeal = searchParams.get('openMeal');
    const day = searchParams.get('day');
    
    if (openMeal && day !== null && mealPlan) {
      handleDeepLinkMealOpen(openMeal, parseInt(day, 10));
      // Clear URL params after handling
      navigate('/dashboard', { replace: true });
    }
  }, [searchParams, mealPlan]);

  const dayNames = getArray("dashboard.days");
  const mealTypes: { [key: string]: string } = {
    breakfast: t("dashboard.meals.breakfast"),
    lunch: t("dashboard.meals.lunch"),
    dinner: t("dashboard.meals.dinner"),
  };

  // Use AuthContext for immediate user access
  const { user: authUser, isLoading: authLoading, isAuthenticated } = useAuth();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Set userId from auth context immediately - always sync with authUser
  useEffect(() => {
    if (authUser?.id) {
      setUserId(authUser.id);
    } else {
      setUserId(undefined);
    }
  }, [authUser?.id]);

  // Clear all local state when userId changes to prevent flash of previous user's data
  useEffect(() => {
    if (userId === undefined) return; // Skip on initial mount
    
    // Reset all user-specific state to prevent showing previous user's data
    setProfile(null);
    setMealPlan(null);
    setUserStats({
      total_points: 0,
      current_streak: 0,
      longest_streak: 0,
      meals_completed: 0,
      level: 1,
    });
    setCompletedMeals(new Set());
    setPreferencesChecked(false);
    setInitialLoadComplete(false);
    redirectingRef.current = false;
  }, [userId]);

  // Import prefetch hook
  const { prefetchAll } = usePrefetch(userId);

  // Load data when userId is available + prefetch other pages
  useEffect(() => {
    if (userId) {
      checkPreferencesAndLoadData();
      // Prefetch other pages in background for instant navigation
      prefetchAll();
    }
  }, [userId, prefetchAll]);

  // Safety timeout: show error message if preferences check takes too long (10 seconds)
  useEffect(() => {
    if (preferencesChecked) return; // Already checked, no timeout needed
    
    const timeout = setTimeout(() => {
      if (!preferencesChecked && !initialLoadComplete && userId) {
        setPreferencesChecked(true);
        setInitialLoadComplete(true);
        toast({
          variant: "destructive",
          title: language === 'es' ? "Error de conexión" : "Connection error",
          description: language === 'es' 
            ? "No pudimos cargar tus datos. Intenta recargar la página." 
            : "We couldn't load your data. Try refreshing the page.",
        });
      }
    }, 10000);
    
    return () => clearTimeout(timeout);
  }, [preferencesChecked, initialLoadComplete, userId, language]);

  // Check subscription status on return from Stripe
  useEffect(() => {
    const subscriptionStatus = searchParams.get('subscription');
    if (subscriptionStatus === 'success' && userId) {
      toast({
        title: t("dashboard.subscriptionSuccess"),
        description: t("dashboard.subscriptionSuccessDesc"),
      });
      subscription.checkSubscription();
      refreshLimits();
    }
  }, [searchParams, userId, t]);

  const checkPreferencesAndLoadData = async () => {
    if (!userId || redirectingRef.current) return;

    // CRITICAL: Check preferences FIRST before loading anything else
    const { data: preferences } = await supabase
      .from("user_preferences")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (!preferences) {
      redirectingRef.current = true;
      navigate("/start", { replace: true });
      return;
    }

    // Preferences exist - mark as checked so UI can render immediately
    setPreferencesChecked(true);
    setInitialLoadComplete(true);

    // Load secondary data in background (non-blocking)
    Promise.all([
      loadProfile(userId),
      loadUserStats(userId),
      loadMealPlan(userId),
    ]).catch(error => {
      console.error("Error loading initial data:", error);
    });
    
    // Check if user has seen the welcome tutorial (after initial load)
    const useMobileTutorial = isNativePlatform || isMobile;
    const tutorialKey = useMobileTutorial ? `mobile_welcome_seen_${userId}` : `in_app_tour_seen_${userId}`;
    const tutorialSeen = localStorage.getItem(tutorialKey);
    
    // Check if user was created in the last 24 hours
    const userCreatedAt = new Date(authUser?.created_at || Date.now());
    const now = new Date();
    const hoursSinceCreation = (now.getTime() - userCreatedAt.getTime()) / (1000 * 60 * 60);
    const isNewUser = hoursSinceCreation < 24;
    
    if (!tutorialSeen && isNewUser) {
      setTimeout(() => {
        if (useMobileTutorial) {
          setShowMobileWelcome(true);
        } else {
          setShowInAppTour(true);
        }
      }, 500);
    }
  };
  
  const handleTutorialComplete = () => {
    if (userId) {
      localStorage.setItem(`tutorial_seen_${userId}`, 'true');
    }
  };

  const handleMobileWelcomeComplete = () => {
    if (userId) {
      localStorage.setItem(`mobile_welcome_seen_${userId}`, 'true');
    }
    setShowMobileWelcome(false);
    
    // Show notification prompt after tutorial for new users on native
    if (isNative && !permissionGranted && notificationPrompts.isLoaded) {
      setTimeout(() => {
        if (notificationPrompts.shouldShowPrompt('post_onboarding', { isNative: true, permissionGranted, isNewUser: true })) {
          setShowNotificationPrompt(true);
          notificationPrompts.markPromptShown();
        }
      }, 2000);
    }
  };

  const handleInAppTourComplete = () => {
    if (userId) {
      localStorage.setItem(`in_app_tour_seen_${userId}`, 'true');
    }
    setShowInAppTour(false);
  };

  const handleNotificationPromptAccept = async () => {
    const granted = await requestPermissions();
    if (granted) {
      notificationPrompts.markPromptAccepted();
      scheduleMealReminders(language);
      toast({
        title: language === 'es' ? '¡Notificaciones activadas!' : 'Notifications enabled!',
        description: language === 'es' ? 'Te avisaremos en cada comida' : 'We\'ll remind you at each meal',
      });
    }
    setShowNotificationPrompt(false);
  };

  const handleNotificationPromptDismiss = () => {
    notificationPrompts.markPromptDismissed();
    setShowNotificationPrompt(false);
  };

  // Periodic notification prompt check for returning users
  useEffect(() => {
    if (!isNative || permissionGranted || !notificationPrompts.isLoaded || !initialLoadComplete) return;
    
    // Check if we should show periodic prompt (not for new users who just completed tutorial)
    const shouldShowPeriodic = notificationPrompts.shouldShowPrompt('periodic', { 
      isNative: true, 
      permissionGranted,
      isNewUser: false,
    });
    
    if (shouldShowPeriodic && !showMobileWelcome && !showInAppTour) {
      setTimeout(() => {
        setShowNotificationPrompt(true);
        notificationPrompts.markPromptShown();
      }, 5000);
    }
  }, [isNative, permissionGranted, notificationPrompts.isLoaded, initialLoadComplete]);

  const loadUserStats = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_stats")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (data) {
      setUserStats(data);
      // Schedule streak risk alert if on native platform with permissions
      if (isNative && permissionGranted && data.current_streak >= 2) {
        scheduleStreakRiskAlert(data.current_streak, data.last_activity_date, language);
      }
    } else if (!error || error.code === 'PGRST116') {
      // Create initial stats if they don't exist
      const { data: newStats } = await supabase
        .from("user_stats")
        .insert({
          user_id: userId,
          total_points: 0,
          current_streak: 0,
          longest_streak: 0,
          meals_completed: 0,
          level: 1,
        })
        .select()
        .single();
      
      if (newStats) {
        setUserStats(newStats);
      }
    }
  };

  // Schedule meal reminders when dashboard loads on native platform
  useEffect(() => {
    if (isNative && permissionGranted && userId) {
      scheduleMealReminders(language);
    }
  }, [isNative, permissionGranted, userId, language]);


  const loadCompletedMeals = async (userId: string) => {
    // Use getLocalDateString() for consistency with food logging
    const today = getLocalDateString();
    const { data } = await supabase
      .from("meal_completions")
      .select("meal_id")
      .eq("user_id", userId)
      .gte("completed_at", today);

    if (data) {
      setCompletedMeals(new Set(data.map(c => c.meal_id)));
    }
  };

  // Opens photo dialog before completing meal
  const handleMealComplete = (meal: Meal) => {
    if (completedMeals.has(meal.id)) {
      toast({
        title: t("dashboard.mealCompleted"),
        description: t("dashboard.keepStreak"),
      });
      return;
    }
    setMealToComplete(meal);
    setShowMealPhotoDialog(true);
  };

  // Navigate to AI Camera page for this meal type (exposes premium feature first)
  const handleOpenMealEntry = (meal: Meal) => {
    // Use format() to preserve local date, not toISOString() which converts to UTC
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    navigate(`/dashboard/ai-camera/${meal.meal_type}?date=${dateStr}`);
  };

  // Navigate to meal detail page
  const handleMealClick = (meal: Meal) => {
    navigate(`/dashboard/meal/${meal.meal_type}`);
  };

  // Actually completes the meal after photo is taken
  const completeMeal = async (mealId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Check if already completed
    if (completedMeals.has(mealId)) {
      return;
    }

    // If offline, queue for later sync
    if (!isOnline) {
      addPendingCompletion(mealId);
      setCompletedMeals(prev => new Set([...prev, mealId]));
      successNotification();
      triggerCelebration();
      toast({
        title: language === 'es' ? '¡Guardado offline!' : 'Saved offline!',
        description: language === 'es' ? 'Se sincronizará cuando vuelvas a estar online' : 'Will sync when you\'re back online',
      });
      return;
    }

    // Mark as completed
    const { error } = await supabase
      .from("meal_completions")
      .insert({
        user_id: user.id,
        meal_id: mealId,
        points_earned: 10,
      });

    if (error) {
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: t("dashboard.errorComplete"),
      });
      return;
    }

    // Update local state
    setCompletedMeals(prev => new Set([...prev, mealId]));

    // Haptic feedback for meal completion
    successNotification();

    // Update stats
    await updateUserStats(user.id);

    // Invalidate nutrition summary to reflect the new meal completion
    invalidateNutritionSummary();

    // Show celebration
    triggerCelebration();

    // Check if all meals for this day are completed
    checkDayCompletion(mealId);
    
    // Check if we should request an iOS app review (based on engagement)
    if (userStats.meals_completed >= 4 && userStats.current_streak >= 2) {
      // +1 because we just completed one more
      checkAndRequestReview({
        meals_completed: userStats.meals_completed + 1,
        current_streak: userStats.current_streak,
      });
    }
  };

  const updateUserStats = async (userId: string) => {
    // Use getLocalDateString() for consistency
    const today = getLocalDateString();
    
    // Calculate new streak
    const { data: stats } = await supabase
      .from("user_stats")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!stats) return;

    const lastActivity = stats.last_activity_date;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    // Also use getLocalDateString for yesterday
    const yesterdayStr = getLocalDateString(yesterday);

    let newStreak = stats.current_streak;
    if (!lastActivity || lastActivity === yesterdayStr) {
      newStreak = stats.current_streak + 1;
    } else if (lastActivity !== today) {
      newStreak = 1;
    }

    const newPoints = stats.total_points + 10;
    const newMealsCompleted = stats.meals_completed + 1;
    const newLevel = Math.floor(newPoints / 100) + 1;
    const newLongestStreak = Math.max(newStreak, stats.longest_streak);

    // Update stats in database
    const { data: updatedStats } = await supabase
      .from("user_stats")
      .update({
        total_points: newPoints,
        current_streak: newStreak,
        longest_streak: newLongestStreak,
        meals_completed: newMealsCompleted,
        level: newLevel,
        last_activity_date: today,
      })
      .eq("user_id", userId)
      .select()
      .single();

    if (updatedStats) {
      setUserStats(updatedStats);
      
      // Invalidate progress data cache for instant updates on Progress page
      invalidateProgressData();
      
      // Check for achievement unlocks
      await checkAchievementUnlocks(userId, updatedStats);
    }
  };

  const checkAchievementUnlocks = async (userId: string, stats: UserStats) => {
    try {
      // Get all achievements
      const { data: achievements } = await supabase
        .from("achievements")
        .select("*");

      if (!achievements) return;

      // Get user's already unlocked achievements
      const { data: userAchievements } = await supabase
        .from("user_achievements")
        .select("achievement_id")
        .eq("user_id", userId);

      const unlockedIds = new Set(userAchievements?.map(ua => ua.achievement_id) || []);

      // Check each achievement
      for (const achievement of achievements) {
        // Skip if already unlocked
        if (unlockedIds.has(achievement.id)) continue;

        let shouldUnlock = false;

        // Check if requirements are met
        switch (achievement.requirement_type) {
          case "meals_completed":
            shouldUnlock = stats.meals_completed >= achievement.requirement_value;
            break;
          case "streak":
            shouldUnlock = stats.current_streak >= achievement.requirement_value;
            break;
          case "points":
            shouldUnlock = stats.total_points >= achievement.requirement_value;
            break;
          case "level":
            shouldUnlock = stats.level >= achievement.requirement_value;
            break;
        }

        if (shouldUnlock) {
          // Unlock the achievement
          const { error } = await supabase
            .from("user_achievements")
            .insert({
              user_id: userId,
              achievement_id: achievement.id,
            });

          if (!error) {
            // Calculate new points
            const newTotalPoints = stats.total_points + achievement.points_reward;
            const newLevel = Math.floor(newTotalPoints / 100) + 1;
            
            // Award achievement points and update level
            const { data: updatedStats } = await supabase
              .from("user_stats")
              .update({
                total_points: newTotalPoints,
                level: newLevel,
              })
              .eq("user_id", userId)
              .select()
              .single();

            // Update local state immediately
            if (updatedStats) {
              setUserStats(updatedStats);
            }

            // Show unlock animation
            setUnlockedAchievement(achievement);
            setShowAchievementUnlock(true);
            
            // Trigger mascot celebration for achievement with epic intensity
            const achievementMessage = language === 'es' 
              ? `¡Logro desbloqueado: ${achievement.title}! 🏅`
              : `Achievement unlocked: ${achievement.title}! 🏅`;
            
            // Determine if it's a streak achievement for special celebration
            const isStreakAchievement = achievement.requirement_type === 'streak';
            triggerMascotCelebration(
              achievementMessage, 
              isStreakAchievement ? 'streak_milestone' : 'achievement', 
              'epic'
            );
            
            // Haptic celebration for achievement unlock
            celebrationPattern();

            // Only show one achievement at a time
            break;
          }
        }
      }
    } catch (error) {
      console.error("Error checking achievements:", error);
    }
  };

  const checkDayCompletion = (completedMealId: string) => {
    if (!mealPlan) return;

    // Find the day of the completed meal
    const completedMeal = mealPlan.meals.find(m => m.id === completedMealId);
    if (!completedMeal) return;

    const dayOfWeek = completedMeal.day_of_week;
    
    // Get all meals for this day
    const dayMeals = mealPlan.meals.filter(m => m.day_of_week === dayOfWeek);
    
    // Check if all meals for this day are completed
    const newCompletedSet = new Set([...completedMeals, completedMealId]);
    const allDayMealsCompleted = dayMeals.every(meal => newCompletedSet.has(meal.id));

    if (allDayMealsCompleted) {
      // Calculate totals
      const totalCalories = dayMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
      const totalProtein = dayMeals.reduce((sum, meal) => sum + (meal.protein || 0), 0);
      const totalCarbs = dayMeals.reduce((sum, meal) => sum + (meal.carbs || 0), 0);
      const totalFats = dayMeals.reduce((sum, meal) => sum + (meal.fats || 0), 0);

      // Show summary dialog
      setDailySummaryData({
        dayName: dayNames[dayOfWeek],
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFats,
      });
      setShowDailySummary(true);

      // Extra epic celebration for completing the whole day
      triggerCelebration('daily_goal');
      
      confetti({
        particleCount: 200,
        spread: 120,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF6347', '#00FF00'],
      });
    }
  };

  const triggerCelebration = (celebrationType: 'meal_complete' | 'daily_goal' | 'generic' = 'meal_complete') => {
    const messages = getArray("dashboard.celebrationMessages");
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setMascotMessage(randomMessage);
    setShowCelebration(true);

    // Determine intensity based on type
    const intensity = celebrationType === 'daily_goal' ? 'epic' : 'medium';

    // Use new celebration system for enhanced effects
    if (celebrationType === 'daily_goal') {
      celebrateDailyGoal();
    } else if (celebrationType === 'meal_complete') {
      celebrateMealComplete();
    }

    // Trigger floating mascot celebration with type and intensity
    triggerMascotCelebration(randomMessage, celebrationType, intensity);

    const duration = intensity === 'epic' ? 5000 : 3000;
    setTimeout(() => {
      setShowCelebration(false);
      setMascotMessage("");
    }, duration);
  };

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (data) {
      setProfile(data);
      // Freemium model: all users have access, no trial blocking
    }
  };

  const loadMealPlan = async (userId: string) => {
    // Prevent execution if redirecting
    if (redirectingRef.current) return;
    
    // Removed: setLoading(true) - we don't want to block UI for meal plan loading
    try {
      // Note: preferences check already done in checkAuth()
      
      // Try to load from network first, fall back to cache if offline
      if (!isOnline) {
        const cached = getCachedMeals();
        if (cached) {
          setMealPlan({
            id: cached.id,
            week_start_date: cached.week_start_date,
            meals: cached.meals,
          });
          toast({
            title: language === 'es' ? 'Modo offline' : 'Offline mode',
            description: language === 'es' ? 'Mostrando comidas guardadas' : 'Showing cached meals',
          });
          // Removed: setLoading(false) - not blocking anymore
          return;
        }
      }

      // Get personal meal plan
      const { data: plans, error: planError } = await supabase
        .from("meal_plans")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1);

      if (planError) {
        console.error("Error loading meal plans:", planError);
        // Try cache on error
        const cached = getCachedMeals();
        if (cached) {
          setMealPlan({
            id: cached.id,
            week_start_date: cached.week_start_date,
            meals: cached.meals,
          });
          // Removed: setLoading(false) - not blocking anymore
          return;
        }
        throw planError;
      }

      if (plans && plans.length > 0) {
        const plan = plans[0];
        const planId = plan.id;
        const isFamilyPlan = plan.is_family_plan === true;
        
        // Get meals for this plan
        const { data: meals, error: mealsError } = await supabase
          .from("meals")
          .select("*")
          .eq("meal_plan_id", planId)
          .order("day_of_week", { ascending: true });

        if (mealsError) {
          console.error("Error loading meals:", mealsError);
          throw mealsError;
        }

        // Verify meals exist and are valid
        if (!meals || meals.length === 0) {
          console.warn("Meal plan exists but has no meals, regenerating...");
          // Delete the empty plan
          await supabase.from("meal_plans").delete().eq("id", planId);
          // Generate new plan
          await generateMealPlan();
          return;
        }

        // Load adaptations if family plan
        let mealsWithAdaptations = meals;
        if (isFamilyPlan) {
          const mealIds = meals.map(m => m.id);
          const { data: adaptationsData } = await supabase
            .from("meal_member_adaptations")
            .select("*")
            .in("meal_id", mealIds);

          if (adaptationsData && adaptationsData.length > 0) {
            // Get member profiles to get names
            const memberIds = [...new Set(adaptationsData.map(a => a.member_user_id))];
            const { data: profiles } = await supabase
              .from("profiles")
              .select("id, display_name, email")
              .in("id", memberIds);

            const profileMap = new Map<string, string>();
            profiles?.forEach(p => {
              profileMap.set(p.id, p.display_name || p.email?.split('@')[0] || 'Miembro');
            });

            const adaptationsMap = new Map<string, MealAdaptation[]>();
            for (const adaptation of adaptationsData) {
              const mealAdaptations = adaptationsMap.get(adaptation.meal_id) || [];
              mealAdaptations.push({
                id: adaptation.id,
                member_user_id: adaptation.member_user_id,
                member_name: profileMap.get(adaptation.member_user_id) || 'Miembro',
                adaptation_score: adaptation.adaptation_score,
                adaptation_notes: adaptation.adaptation_notes || '',
                variant_instructions: adaptation.variant_instructions || '',
                is_best_match: adaptation.is_best_match || false,
              });
              adaptationsMap.set(adaptation.meal_id, mealAdaptations);
            }

            mealsWithAdaptations = meals.map(meal => ({
              ...meal,
              adaptations: adaptationsMap.get(meal.id) || [],
            }));
          }
        }

        const mealPlanData = {
          id: planId,
          week_start_date: plan.week_start_date,
          is_family_plan: isFamilyPlan,
          family_id: plan.family_id,
          meals: mealsWithAdaptations,
        };

        setMealPlan(mealPlanData);
        
        // Cache meals for offline use
        cacheMeals({ id: planId, week_start_date: plan.week_start_date }, mealsWithAdaptations);
        
        // Load completed meals for today
        await loadCompletedMeals(userId);
      } else {
        // No meal plan exists, generate first one
        console.log("No meal plan found, generating first plan...");
        await generateMealPlan();
      }
    } catch (error: any) {
      console.error("Error loading meal plan:", error);
      toast({
        variant: "destructive",
        title: t("dashboard.errorGenerate"),
        description: t("dashboard.tryAgain"),
      });
    } finally {
      // Removed: setLoading(false) - meal plan loading is non-blocking
    }
  };

  const checkCanGenerateNewPlan = async (): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Get the most recent meal plan
      const { data: plans } = await supabase
        .from("meal_plans")
        .select("created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (!plans || plans.length === 0) {
        return true; // No plans yet, allow generation
      }

      const lastPlanDate = new Date(plans[0].created_at);
      const now = new Date();
      const hoursSinceLastPlan = (now.getTime() - lastPlanDate.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastPlan < 24) {
        const hoursRemaining = Math.ceil(24 - hoursSinceLastPlan);
        toast({
          variant: "destructive",
          title: t("dashboard.tooSoon"),
          description: t("dashboard.waitHours", { hours: hoursRemaining.toString(), plural: hoursRemaining !== 1 ? 's' : '' }),
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error checking plan generation limit:", error);
      return true; // Allow on error
    }
  };

  const initiateGenerateMealPlan = async () => {
    // Check if user has permission
    if (!limits.canGeneratePlans) {
      toast({
        variant: "destructive",
        title: t("dashboard.featureUnavailable"),
        description: t("dashboard.needIntermediate"),
      });
      navigate("/pricing");
      return;
    }

    // Check 24-hour limit
    const canGenerate = await checkCanGenerateNewPlan();
    if (!canGenerate) {
      return;
    }

    // Generate new unique plan automatically
    await generateMealPlan(true);
  };

  const generateMealPlan = async (forceNew: boolean = false, retryCount: number = 0) => {
    const maxRetries = 2;
    setGenerating(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No se encontró usuario autenticado");

      console.log("Generating meal plan...", { userId: user.id, forceNew, retryCount, language });

      const { data, error } = await supabase.functions.invoke("generate-meal-plan", {
        body: { userId: user.id, forceNew, language },
      });

      if (error) {
        console.error("Edge function error:", error);
        throw new Error(error.message || "Error al generar el plan de comidas");
      }

      if (!data || !data.mealPlanId) {
        console.error("Invalid response from edge function:", data);
        throw new Error("Respuesta inválida del servidor");
      }

      const isCached = data?.cached === true;
      
      // Clear shopping list cache when new plan is generated
      clearAllShoppingListCaches();
      
      toast({
        title: isCached ? t("dashboard.planCached") : t("dashboard.planGenerated"),
        description: isCached 
          ? t("dashboard.planCachedDesc") 
          : t("dashboard.planReady"),
      });

      // Reload meal plan to get fresh data
      await loadMealPlan(user.id);
      
    } catch (error: any) {
      console.error("Error generating meal plan:", error, { retryCount });
      
      // Retry logic
      if (retryCount < maxRetries) {
        console.log(`Retrying meal plan generation... (attempt ${retryCount + 1}/${maxRetries})`);
        toast({
          title: t("dashboard.retrying"),
          description: t("dashboard.attempt", { current: (retryCount + 1).toString(), total: (maxRetries + 1).toString() }),
        });
        setTimeout(() => generateMealPlan(forceNew, retryCount + 1), 2000);
        return;
      }
      
      // Final error after all retries
      toast({
        variant: "destructive",
        title: t("dashboard.errorGenerate"),
        description: error.message || t("dashboard.tryAgain"),
      });
      
      // Set meal plan to null so the UI shows the generate button
      setMealPlan(null);
    } finally {
      setGenerating(false);
    }
  };

  const handleSwapMeal = (mealId: string) => {
    // Check if user has permission
    if (!limits.canSwapMeals) {
      toast({
        variant: "destructive",
        title: language === 'es' ? "Función exclusiva de Chefly Plus" : "Chefly Plus exclusive feature",
        description: language === 'es' 
          ? "Mejora a Chefly Plus para intercambiar comidas entre días"
          : "Upgrade to Chefly Plus to swap meals between days",
      });
      navigate("/pricing");
      return;
    }
    setSwapDialogOpen(true);
  };

  const handleConfirmSwap = async (sourceMealId: string, targetMealId: string) => {
    if (!mealPlan) return;

    try {
      const sourceMeal = mealPlan.meals.find(m => m.id === sourceMealId);
      const targetMeal = mealPlan.meals.find(m => m.id === targetMealId);

      if (!sourceMeal || !targetMeal) throw new Error("Meals not found");

      // Swap day_of_week values
      await supabase
        .from("meals")
        .update({ day_of_week: targetMeal.day_of_week })
        .eq("id", sourceMeal.id);

      await supabase
        .from("meals")
        .update({ day_of_week: sourceMeal.day_of_week })
        .eq("id", targetMeal.id);

      toast({
        title: t("dashboard.swapped"),
        description: t("dashboard.swappedDesc"),
      });

      // Clear shopping list cache since meals changed
      if (mealPlan?.id) {
        clearAllShoppingListCaches();
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) await loadMealPlan(user.id);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const groupedMeals = mealPlan?.meals.reduce((acc, meal) => {
    if (!acc[meal.day_of_week]) acc[meal.day_of_week] = [];
    acc[meal.day_of_week].push(meal);
    return acc;
  }, {} as { [key: number]: Meal[] }) || {};

  // handleManageSubscription removed - moved to MorePage

  // Show loading only while checking preferences (not for data loading)
  if (!preferencesChecked && !initialLoadComplete) {
    // Show skeleton loader only during initial preferences check
    if (trialLoading || !userId) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">{t("dashboard.loading")}</p>
          </div>
        </div>
      );
    }
  }

  if (isBlocked) {
    return null; // Will redirect to pricing
  }

  // Trial variables removed - freemium model

  return (
    <TooltipProvider delayDuration={300}>
    <div className="min-h-full bg-gradient-to-b from-background to-muted/30 overflow-x-hidden relative">
      <main className="container mx-auto px-4 tablet:px-6 pt-2 pb-28 tablet:pt-4 tablet:pb-8 space-y-5 tablet:space-y-7 max-w-3xl overflow-hidden lg:pb-8">
        
        {/* Offline/Syncing Indicator */}
        {(!isOnline || pendingCount > 0) && (
          <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
            !isOnline 
              ? 'bg-destructive/10 text-destructive border border-destructive/20' 
              : 'bg-primary/10 text-primary border border-primary/20'
          }`}>
            {!isOnline ? (
              <>
                <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                <span>{language === 'es' ? 'Sin conexión - Modo offline activo' : 'No connection - Offline mode active'}</span>
              </>
            ) : isSyncing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{language === 'es' ? 'Sincronizando...' : 'Syncing...'}</span>
              </>
            ) : pendingCount > 0 ? (
              <>
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span>{language === 'es' ? `${pendingCount} comida(s) pendiente(s) de sincronizar` : `${pendingCount} meal(s) pending sync`}</span>
              </>
            ) : null}
          </div>
        )}

        {/* GREETING HEADER - Welcome message with name and profile avatar */}
        <DashboardHeader
          displayName={profile?.display_name}
          currentStreak={userStats.current_streak}
          level={userStats.level}
          avatarUrl={profile?.avatar_url}
          isProfileLoading={!profile && initialLoadComplete}
        />

        {/* SUBSCRIPTION PROMO BANNER - For free users on native platforms */}
        {shouldShowBanner && (
          <SubscriptionPromoBanner 
            visible={isVisible}
            onDismiss={dismissBanner}
          />
        )}

        {/* YAZIO-Style Date Header with swipe - only past and present */}
        <DiaryDateHeader 
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />

        {/* NUTRITION SUMMARY - Below date header, YAZIO style */}
        {userId && <NutritionSummaryWidget userId={userId} selectedDate={selectedDate} />}

        {/* MEAL MODULES - YAZIO Style (Desayuno, Almuerzo, Cena, Snacks) */}
        <MealModulesSection
          consumedCalories={consumedCalories}
          targetCalories={targetCalories}
          recentFoods={recentFoods}
          selectedDate={selectedDate}
        />

        {/* DAILY PROGRESS MILESTONES - Celebrate 25%, 50%, 75%, 100% */}
        <DailyProgressMilestones
          currentCalories={consumedMacros.calories}
          targetCalories={nutritionGoals.calories}
        />

        {/* WATER TRACKER - Daily hydration goal */}
        <WaterTrackerWidget userId={userId} selectedDate={selectedDate} />

        {/* WEIGHT TRACKER - Current weight with +/- controls */}
        <WeightTrackerWidget userId={userId} />

        {/* AI USAGE INDICATOR - Only for Chefly Plus users */}
        {limits.isCheflyPlus && userId && (
          <AiUsageIndicator userId={userId} showDetails />
        )}

        {/* Gamification - Simplified with just mascot + level progress */}
        <Card data-tour="gamification" className="border-border/50 shadow-lg bg-gradient-to-br from-card to-muted/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <MascotCompanion
                points={userStats.total_points}
                streak={userStats.current_streak}
                level={userStats.level}
                showCelebration={showCelebration}
                message={mascotMessage}
                size="md"
                showStats={false}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-sm">{t("dashboard.mascotGreeting")}</h3>
                  <Badge variant="secondary" className="text-xs px-2 py-0.5">
                    {t("dashboard.level")} {userStats.level}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{t("dashboard.mascotHelp")}</p>
                <div className="flex items-center gap-2">
                  <Progress value={(userStats.total_points % 100)} className="flex-1 h-2" />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {userStats.total_points % 100}/100
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </main>
      
      <MealDetailDialog 
        meal={selectedMeal}
        open={mealDialogOpen}
        onOpenChange={setMealDialogOpen}
        onSwapMeal={handleSwapMeal}
        canSwap={limits.canSwapMeals}
      />

      <SwapMealDialog
        open={swapDialogOpen}
        onOpenChange={setSwapDialogOpen}
        sourceMeal={selectedMeal}
        allMeals={mealPlan?.meals || []}
        onConfirmSwap={handleConfirmSwap}
      />

      <DailySummaryDialog
        open={showDailySummary}
        onOpenChange={setShowDailySummary}
        dayName={dailySummaryData.dayName}
        totalCalories={dailySummaryData.totalCalories}
        totalProtein={dailySummaryData.totalProtein}
        totalCarbs={dailySummaryData.totalCarbs}
        totalFats={dailySummaryData.totalFats}
      />

      <AchievementUnlockAnimation
        isOpen={showAchievementUnlock}
        achievement={unlockedAchievement}
        onClose={() => setShowAchievementUnlock(false)}
      />

      <DashboardTutorial
        open={showTutorial}
        onOpenChange={setShowTutorial}
        onComplete={handleTutorialComplete}
      />

      <InAppTour
        open={showInAppTour}
        onComplete={handleInAppTourComplete}
        onSkip={handleInAppTourComplete}
      />

      <MobileWelcomeTutorial
        open={showMobileWelcome}
        onComplete={handleMobileWelcomeComplete}
      />

      <FoodScanner
        open={showFoodScanner}
        onOpenChange={setShowFoodScanner}
        selectedDate={format(selectedDate, 'yyyy-MM-dd')}
      />

      <MealPhotoDialog
        open={showMealPhotoDialog}
        onOpenChange={setShowMealPhotoDialog}
        meal={mealToComplete}
        selectedDate={format(selectedDate, 'yyyy-MM-dd')}
        onPhotoSaved={(mealId) => {
          completeMeal(mealId);
          setMealToComplete(null);
        }}
      />

      {/* Notification Permission Prompt */}
      <NotificationPermissionPrompt
        open={showNotificationPrompt}
        onAccept={handleNotificationPromptAccept}
        onDismiss={handleNotificationPromptDismiss}
      />

      {/* MealEntryOptionsModal removed - using page navigation now */}

    </div>
    </TooltipProvider>
  );
};

export default Dashboard;
