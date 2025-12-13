import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RefreshCw, MessageCircle, Calendar, Settings, TrendingUp, Utensils, Clock, Sparkles, Check, Lock, CreditCard, Languages, HelpCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MealDetailDialog } from "@/components/MealDetailDialog";
import { SwapMealDialog } from "@/components/SwapMealDialog";
import { MascotCompanion } from "@/components/MascotCompanion";
import { DailySummaryDialog } from "@/components/DailySummaryDialog";
import { AchievementUnlockAnimation } from "@/components/AchievementUnlockAnimation";
import { SubscriptionBanner } from "@/components/SubscriptionBanner";
import { Checkbox } from "@/components/ui/checkbox";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { useSubscription } from "@/hooks/useSubscription";
import { useTrialGuard } from "@/hooks/useTrialGuard";
import { useLanguage } from "@/contexts/LanguageContext";
import WeeklyCheckInBanner from "@/components/checkin/WeeklyCheckInBanner";
import confetti from "canvas-confetti";
import DashboardTutorial from "@/components/DashboardTutorial";
import { clearAllShoppingListCaches } from "@/utils/shoppingListCache";

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
}

interface MealPlan {
  id: string;
  week_start_date: string;
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
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [trialExpired, setTrialExpired] = useState(false);
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
  const [portalLoading, setPortalLoading] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { limits, refreshLimits } = useSubscriptionLimits(userId);
  const subscription = useSubscription(userId);
  const { isBlocked, isLoading: trialLoading } = useTrialGuard();
  const [searchParams] = useSearchParams();
  const { t, getArray, language, setLanguage } = useLanguage();

  const dayNames = getArray("dashboard.days");
  const mealTypes: { [key: string]: string } = {
    breakfast: t("dashboard.meals.breakfast"),
    lunch: t("dashboard.meals.lunch"),
    dinner: t("dashboard.meals.dinner"),
  };

  useEffect(() => {
    checkAuth();
  }, []);

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

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    setUserId(user.id);
    await loadProfile(user.id);
    await loadUserStats(user.id);
    await loadMealPlan(user.id);
    
    // Check if user has seen the tutorial
    const tutorialSeen = localStorage.getItem(`tutorial_seen_${user.id}`);
    if (!tutorialSeen) {
      setShowTutorial(true);
    }
  };
  
  const handleTutorialComplete = () => {
    if (userId) {
      localStorage.setItem(`tutorial_seen_${userId}`, 'true');
    }
  };

  const loadUserStats = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_stats")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (data) {
      setUserStats(data);
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

  const loadCompletedMeals = async (userId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from("meal_completions")
      .select("meal_id")
      .eq("user_id", userId)
      .gte("completed_at", today);

    if (data) {
      setCompletedMeals(new Set(data.map(c => c.meal_id)));
    }
  };

  const completeMeal = async (mealId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Check if already completed
    if (completedMeals.has(mealId)) {
      toast({
        title: t("dashboard.mealCompleted"),
        description: t("dashboard.keepStreak"),
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

    // Update stats
    await updateUserStats(user.id);

    // Show celebration
    triggerCelebration();

    // Check if all meals for this day are completed
    checkDayCompletion(mealId);
  };

  const updateUserStats = async (userId: string) => {
    const today = new Date().toISOString().split('T')[0];
    
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
    const yesterdayStr = yesterday.toISOString().split('T')[0];

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

      // Extra celebration for completing the whole day
      confetti({
        particleCount: 200,
        spread: 120,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF6347', '#00FF00'],
      });
    }
  };

  const triggerCelebration = () => {
    const messages = getArray("dashboard.celebrationMessages");
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setMascotMessage(randomMessage);
    setShowCelebration(true);

    // Confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    setTimeout(() => {
      setShowCelebration(false);
      setMascotMessage("");
    }, 3000);
  };

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (data) {
      setProfile(data);
      const expired = new Date(data.trial_expires_at) < new Date();
      const hasActiveSubscription = data.is_subscribed;
      setTrialExpired(expired && !hasActiveSubscription);
      
      // Block access if trial expired and no active subscription
      // Check subscription status with Stripe
      if (expired && !hasActiveSubscription) {
        // Verify with Stripe before blocking
        const { data: subData } = await supabase.functions.invoke("check-subscription");
        
        if (!subData?.subscribed) {
          toast({
            title: "Trial expirado",
            description: "Tu periodo de prueba ha terminado. Elige un plan para continuar.",
            variant: "destructive",
          });
          navigate("/pricing");
          return;
        }
      }
    }
  };

  const loadMealPlan = async (userId: string) => {
    setLoading(true);
    try {
      // First check if user has preferences
      const { data: preferences } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (!preferences) {
        // Redirect to onboarding if no preferences
        navigate("/onboarding");
        return;
      }

      // Get the most recent meal plan
      const { data: plans, error: planError } = await supabase
        .from("meal_plans")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1);

      if (planError) {
        console.error("Error loading meal plans:", planError);
        throw planError;
      }

      if (plans && plans.length > 0) {
        const planId = plans[0].id;
        
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

        setMealPlan({
          id: planId,
          week_start_date: plans[0].week_start_date,
          meals: meals,
        });
        
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
      setLoading(false);
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
        title: t("dashboard.featureUnavailable"),
        description: t("dashboard.needIntermediateSwap"),
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

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");

      if (error) throw error;

      if (data.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Error opening customer portal:", error);
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: t("dashboard.portalError"),
      });
    } finally {
      setPortalLoading(false);
    }
  };

  if (loading || trialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">{t("dashboard.loading")}</p>
        </div>
      </div>
    );
  }

  if (isBlocked) {
    return null; // Will redirect to pricing
  }

  const daysRemaining = profile ? Math.ceil((new Date(profile.trial_expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const trialProgress = profile ? ((4 - daysRemaining) / 4) * 100 : 0;

  return (
    <TooltipProvider delayDuration={300}>
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 overflow-x-hidden">
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 max-w-full overflow-hidden">
        {/* Subscription Banner */}
        {profile && (
          <SubscriptionBanner 
            userId={profile.id} 
            trialExpiresAt={profile.trial_expires_at}
          />
        )}

        {/* Weekly Check-In Banner (Premium feature) */}
        {userId && (
          <WeeklyCheckInBanner 
            userId={userId} 
            onPlanGenerated={() => loadMealPlan(userId)}
          />
        )}

        {/* Mascot and Gamification Section - Compact on mobile */}
        <Card className="border-border/50 shadow-lg bg-gradient-to-br from-card to-muted/20">
          <CardHeader className="pb-2 p-3 sm:p-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <CardTitle className="text-base sm:text-lg">{t("dashboard.gamificationTitle")}</CardTitle>
            </div>
            <CardDescription className="text-xs sm:text-sm hidden sm:block">{t("dashboard.gamificationDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0 sm:pt-2">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-6">
              {/* Mobile: Compact horizontal layout */}
              <div className="flex items-center gap-3 w-full md:hidden">
                <MascotCompanion
                  points={userStats.total_points}
                  streak={userStats.current_streak}
                  level={userStats.level}
                  showCelebration={showCelebration}
                  message={mascotMessage}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold truncate">{t("dashboard.mascotGreeting")}</h3>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <Badge variant="secondary" className="text-xs px-2 py-0.5">
                      Lv.{userStats.level}
                    </Badge>
                    <Badge variant="outline" className="text-xs px-2 py-0.5">
                      {userStats.current_streak}🔥
                    </Badge>
                    <Badge variant="outline" className="text-xs px-2 py-0.5">
                      {userStats.total_points}pts
                    </Badge>
                  </div>
                </div>
              </div>
              
              {/* Desktop: Full layout */}
              <div className="hidden md:flex flex-col md:flex-row items-center gap-4 sm:gap-6 w-full md:w-auto">
                <MascotCompanion
                  points={userStats.total_points}
                  streak={userStats.current_streak}
                  level={userStats.level}
                  showCelebration={showCelebration}
                  message={mascotMessage}
                />
                <div className="text-center md:text-left w-full md:w-auto min-w-0">
                  <h3 className="text-xl sm:text-2xl font-bold">{t("dashboard.mascotGreeting")}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
                    {t("dashboard.mascotHelp")}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="secondary" className="text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2 cursor-help">
                          {t("dashboard.level")} {userStats.level}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs max-w-[200px]">{t("tooltip.level")}</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2 cursor-help">
                          {userStats.meals_completed} {t("dashboard.mealsCompleted").toLowerCase()}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs max-w-[200px]">{t("tooltip.mealsCompleted")}</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2 whitespace-nowrap cursor-help">
                          {t("dashboard.longestStreak")}: {userStats.longest_streak} 🔥
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs max-w-[200px]">{t("tooltip.longestStreak")}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-center w-full md:w-auto flex-shrink-0 cursor-help hidden md:block">
                    <div className="text-xs sm:text-sm text-muted-foreground mb-2">{t("dashboard.progressToLevel")}</div>
                    <Progress value={(userStats.total_points % 100)} className="w-full max-w-[12rem] mx-auto h-2 sm:h-3 mb-2" />
                    <div className="text-xs text-muted-foreground">
                      {userStats.total_points % 100}/100 {t("dashboard.points")}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-[200px]">{t("tooltip.progressBar")}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            {/* Mobile progress bar */}
            <div className="mt-3 md:hidden">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>{t("dashboard.progressToLevel")}</span>
                <span>{userStats.total_points % 100}/100</span>
              </div>
              <Progress value={(userStats.total_points % 100)} className="h-1.5" />
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview - Compact on mobile */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="pb-2 p-3 sm:p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <CardTitle className="text-base sm:text-lg">{t("dashboard.weeklyStats")}</CardTitle>
            </div>
            <CardDescription className="text-xs sm:text-sm hidden sm:block">{t("dashboard.weeklyStatsDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <div className="p-2 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                <div className="flex flex-col items-center gap-1 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Utensils className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] sm:text-xs text-muted-foreground">{t("dashboard.mealsThisWeek")}</p>
                    <p className="text-lg sm:text-xl font-bold">{mealPlan?.meals.length || 0}</p>
                  </div>
                </div>
              </div>

              <div className="p-2 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20">
                <div className="flex flex-col items-center gap-1 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] sm:text-xs text-muted-foreground">{t("dashboard.currentStreakStat")}</p>
                    <p className="text-lg sm:text-xl font-bold">{userStats.current_streak}🔥</p>
                  </div>
                </div>
              </div>

              <div className="p-2 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50">
                <div className="flex flex-col items-center gap-1 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] sm:text-xs text-muted-foreground">{t("dashboard.lastUpdate")}</p>
                    <p className="text-xs sm:text-sm font-semibold">
                      {mealPlan ? new Date(mealPlan.week_start_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="pb-2 p-3 sm:p-6">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <CardTitle className="text-base sm:text-lg">{t("dashboard.quickActions")}</CardTitle>
            </div>
            <CardDescription className="text-xs sm:text-sm hidden sm:block">{t("dashboard.quickActionsDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            {/* Mobile: Horizontal scroll buttons */}
            <div className="flex gap-2 overflow-x-auto pb-2 sm:hidden -mx-1 px-1">
              <Button
                onClick={() => navigate("/chat")}
                variant="outline"
                size="sm"
                className="flex-shrink-0 gap-1.5 relative"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-xs">{t("dashboard.chatCoach")}</span>
                {limits.isBasicPlan && (
                  <Badge variant="secondary" className="ml-1 text-[10px] px-1">
                    {limits.chatMessagesUsed}/{limits.dailyChatLimit}
                  </Badge>
                )}
              </Button>

              <Button
                onClick={() => navigate("/onboarding")}
                variant="outline"
                size="sm"
                className="flex-shrink-0 gap-1.5"
              >
                <Settings className="h-4 w-4" />
                <span className="text-xs">{t("dashboard.editPreferences")}</span>
              </Button>

              {subscription.subscribed && (
                <Button
                  onClick={handleManageSubscription}
                  disabled={portalLoading}
                  variant="outline"
                  size="sm"
                  className="flex-shrink-0 gap-1.5"
                >
                  {portalLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      <span className="text-xs">{t("dashboard.manageSubscription")}</span>
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Desktop: Grid layout */}
            <div className="hidden sm:grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => navigate("/chat")}
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2 relative"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span className="text-sm">{t("dashboard.chatCoach")}</span>
                    {limits.isBasicPlan && (
                      <Badge variant="secondary" className="absolute -top-2 -right-2 text-xs">
                        {limits.chatMessagesUsed}/{limits.dailyChatLimit}
                      </Badge>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-[200px]">{t("tooltip.chatCoach")}</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => navigate("/onboarding")}
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2"
                  >
                    <Settings className="h-5 w-5" />
                    <span className="text-sm">{t("dashboard.editPreferences")}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-[200px]">{t("tooltip.editPreferences")}</p>
                </TooltipContent>
              </Tooltip>

              {subscription.subscribed && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleManageSubscription}
                      disabled={portalLoading}
                      variant="outline"
                      className="h-auto py-4 flex-col gap-2"
                    >
                      {portalLoading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span className="text-sm">{t("dashboard.opening")}</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-5 w-5" />
                          <span className="text-sm">{t("dashboard.manageSubscription")}</span>
                        </>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-[200px]">{t("tooltip.manageSubscription")}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            
            {/* Generate new plan button */}
            <div className="mt-4 pt-4 border-t border-border/30">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={initiateGenerateMealPlan}
                    disabled={generating || !limits.canGeneratePlans}
                    variant="ghost"
                    size="sm"
                    className="w-full text-muted-foreground hover:text-foreground relative"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span className="text-xs">{t("dashboard.generating")}</span>
                      </>
                    ) : (
                      <>
                        {!limits.canGeneratePlans && <Lock className="h-3 w-3 mr-2" />}
                        <RefreshCw className="h-4 w-4 mr-2" />
                        <span className="text-xs">{t("dashboard.generateNewPlan")}</span>
                        {!limits.canGeneratePlans && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            {t("dashboard.intermediatePlan")}
                          </Badge>
                        )}
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-[200px]">{t("tooltip.generatePlan")}</p>
                </TooltipContent>
              </Tooltip>
              
              {/* Language selector for generation */}
              <div className="flex items-center justify-center gap-2 mt-3 p-2 rounded-lg bg-muted/30 border border-border/30">
                <Languages className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{t("dashboard.planLanguage")}:</span>
                <div className="flex gap-1">
                  <Button
                    variant={language === "es" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLanguage("es")}
                    className="h-6 px-2 text-xs"
                  >
                    ES
                  </Button>
                  <Button
                    variant={language === "en" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLanguage("en")}
                    className="h-6 px-2 text-xs"
                  >
                    EN
                  </Button>
                </div>
              </div>
            </div>

            {/* Plan limitations info for basic users */}
            {limits.isBasicPlan && !subscription.subscribed && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border/50">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold mb-1">{t("dashboard.unlockFeatures")}</h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      {t("dashboard.withIntermediate")}
                    </p>
                    <ul className="space-y-1 text-xs text-muted-foreground mb-3">
                      <li className="flex items-center gap-2">
                        <Check className="h-3 w-3 text-primary" />
                        <span>{t("dashboard.unlimitedPlans")}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-3 w-3 text-primary" />
                        <span>{t("dashboard.swapMeals")}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-3 w-3 text-primary" />
                        <span>{t("dashboard.unlimitedChat")}</span>
                      </li>
                    </ul>
                    <Button 
                      onClick={() => navigate("/pricing")} 
                      size="sm" 
                      className="w-full"
                      variant="default"
                    >
                      {t("dashboard.viewPlans")}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Help Section - Hidden on mobile, inline button on small screens */}
        <div className="hidden sm:block">
          <Card className="border-border/50 shadow-lg bg-gradient-to-br from-muted/30 to-background">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">{t("dashboard.helpSection")}</CardTitle>
              </div>
              <CardDescription>{t("dashboard.helpDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                onClick={() => setShowTutorial(true)}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                {t("dashboard.viewTutorial")}
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Mobile: Compact help button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowTutorial(true)}
          className="sm:hidden w-full text-muted-foreground gap-2"
        >
          <HelpCircle className="h-4 w-4" />
          {t("dashboard.viewTutorial")}
        </Button>

        <Separator />

        {/* Weekly Meal Plan */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                  <CardTitle className="text-base sm:text-xl">{t("dashboard.weeklyPlan")}</CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm hidden sm:block">{t("dashboard.weeklyPlanDesc")}</CardDescription>
              </div>
              {mealPlan && (
                <Badge variant="secondary" className="text-[10px] sm:text-sm w-fit">
                  {t("dashboard.weekOf")} {new Date(mealPlan.week_start_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-4 p-2 sm:p-6 pt-0">

          {Object.keys(groupedMeals).length > 0 ? (
            Object.keys(groupedMeals).map((dayIndex) => {
              const day = parseInt(dayIndex);
              const meals = groupedMeals[day];

              return (
                <Card key={day} className="overflow-hidden border-border/50 shadow-md sm:shadow-lg hover:shadow-xl transition-all">
                  <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b p-2 sm:p-6">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                          <span className="text-primary-foreground font-bold text-[10px] sm:text-sm">{day + 1}</span>
                        </div>
                        <span className="text-sm sm:text-xl font-semibold truncate">{dayNames[day]}</span>
                      </CardTitle>
                      <Badge variant="outline" className="text-[10px] sm:text-xs flex-shrink-0">{meals.length} {t("dashboard.meals")}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-2 sm:p-6">
                    {/* Mobile: Horizontal scroll for meals */}
                    <div className="flex gap-2 overflow-x-auto pb-2 sm:hidden -mx-1 px-1 snap-x snap-mandatory">
                      {meals.map((meal) => {
                        const isCompleted = completedMeals.has(meal.id);
                        return (
                          <div 
                            key={meal.id}
                            className={`flex-shrink-0 w-[200px] snap-start rounded-lg border bg-card overflow-hidden ${isCompleted ? 'ring-2 ring-green-500' : 'border-border/50'}`}
                            onClick={() => {
                              setSelectedMeal(meal);
                              setMealDialogOpen(true);
                            }}
                          >
                            {meal.image_url && (
                              <div className="relative h-24 w-full overflow-hidden">
                                <img 
                                  src={meal.image_url} 
                                  alt={meal.name}
                                  className={`w-full h-full object-cover ${isCompleted ? 'opacity-60' : ''}`}
                                />
                                <Badge variant="secondary" className="absolute top-1.5 right-1.5 text-[10px] backdrop-blur-sm bg-background/80">
                                  {mealTypes[meal.meal_type]}
                                </Badge>
                                <Button
                                  size="icon"
                                  variant="default"
                                  className={`absolute top-1.5 left-1.5 h-6 w-6 ${isCompleted ? 'bg-green-500 hover:bg-green-600' : ''}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    completeMeal(meal.id);
                                  }}
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                            <div className="p-2">
                              <h4 className={`font-semibold text-xs line-clamp-1 ${isCompleted ? 'line-through opacity-60' : ''}`}>
                                {meal.name}
                              </h4>
                              <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{meal.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Desktop: Grid layout */}
                    <div className="hidden sm:grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                      {meals.map((meal) => {
                        const isCompleted = completedMeals.has(meal.id);
                        return (
                          <Card 
                            key={meal.id} 
                            className={`border-border/50 bg-gradient-to-br from-card to-muted/20 hover:shadow-md transition-all overflow-hidden relative ${isCompleted ? 'ring-2 ring-green-500' : ''}`}
                          >
                            {meal.image_url && (
                              <div className="relative h-32 sm:h-40 w-full overflow-hidden">
                                <img 
                                  src={meal.image_url} 
                                  alt={meal.name}
                                  className={`w-full h-full object-cover ${isCompleted ? 'opacity-60' : ''}`}
                                />
                                <div className="absolute top-2 right-2">
                                  <Badge variant="secondary" className="backdrop-blur-sm bg-background/80 text-xs">
                                    {mealTypes[meal.meal_type]}
                                  </Badge>
                                </div>
                                {/* Complete Meal Button - Image version */}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="icon"
                                      variant={isCompleted ? "secondary" : "default"}
                                      className={`absolute top-2 left-2 h-8 w-8 shadow-lg ${isCompleted ? 'bg-green-500/90 hover:bg-green-600/90 text-white' : 'bg-primary/90 hover:bg-primary'}`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        completeMeal(meal.id);
                                      }}
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="right">
                                    <p className="text-xs max-w-[180px]">{t("tooltip.completeMeal")}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            )}
                            <CardContent 
                              className="p-3 sm:p-4 space-y-2 sm:space-y-3 cursor-pointer"
                              onClick={() => {
                                setSelectedMeal(meal);
                                setMealDialogOpen(true);
                              }}
                            >
                              {!meal.image_url && (
                                <div className="flex items-center justify-between gap-2 mb-2">
                                  <Badge variant="secondary" className="shrink-0 text-xs">
                                    {mealTypes[meal.meal_type]}
                                  </Badge>
                                </div>
                              )}
                              <div className="min-w-0">
                                <h4 className={`font-semibold text-sm sm:text-base mb-1 line-clamp-2 ${isCompleted ? 'line-through opacity-60' : ''}`}>
                                  {meal.name}
                                </h4>
                                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{meal.description}</p>
                              </div>
                              <Separator />
                              <div className="flex items-start gap-2 mb-3">
                                {isCompleted ? (
                                  <>
                                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 shrink-0 mt-0.5" />
                                    <p className="text-xs text-green-600 font-medium leading-relaxed line-clamp-2">{t("dashboard.completed")} {t("dashboard.pointsEarned")}</p>
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-primary shrink-0 mt-0.5" />
                                    <p className="text-xs text-primary font-medium leading-relaxed line-clamp-2">{meal.benefits}</p>
                                  </>
                                )}
                              </div>
                              {/* Complete Meal Button - No image version */}
                              {!meal.image_url && (
                                <Button
                                  size="sm"
                                  variant={isCompleted ? "secondary" : "default"}
                                  className={`w-full text-xs gap-1.5 ${isCompleted ? 'bg-green-500/90 hover:bg-green-600/90 text-white' : ''}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    completeMeal(meal.id);
                                  }}
                                >
                                  <Check className="h-3.5 w-3.5" />
                                  {isCompleted ? t("dashboard.alreadyCompleted") : t("dashboard.finishMeal")}
                                </Button>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })
           ) : (
            <Card className="border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center py-8 sm:py-16 px-4 sm:px-6">
                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-4 sm:mb-6">
                  <Utensils className="w-7 h-7 sm:w-10 sm:h-10 text-primary" />
                </div>
                <h3 className="text-lg sm:text-2xl font-bold mb-2 sm:mb-3 text-center">{t("dashboard.noMealPlan")}</h3>
                <p className="text-sm sm:text-base text-muted-foreground text-center mb-6 sm:mb-8 max-w-md">
                  {generating 
                    ? t("dashboard.waitMessage")
                    : t("dashboard.createFirst")
                  }
                </p>
                {generating ? (
                  <div className="flex flex-col items-center gap-3 sm:gap-4">
                    <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
                    <p className="text-xs sm:text-sm text-muted-foreground">{t("dashboard.generatingAI")}</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 sm:gap-3 w-full sm:w-auto">
                    <Button 
                      onClick={initiateGenerateMealPlan} 
                      disabled={generating}
                      size="default"
                      className="w-full sm:min-w-[200px]"
                    >
                      <Sparkles className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      {t("dashboard.generatePlan")}
                    </Button>
                    <Button 
                      onClick={() => navigate("/onboarding")}
                      variant="outline"
                      size="default"
                      className="w-full"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      {t("dashboard.setupPreferences")}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
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

    </div>
    </TooltipProvider>
  );
};

export default Dashboard;
