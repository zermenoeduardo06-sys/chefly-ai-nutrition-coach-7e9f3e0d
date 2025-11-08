import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RefreshCw, MessageCircle, Calendar, Settings, TrendingUp, Utensils, Clock, Sparkles, Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { MealDetailDialog } from "@/components/MealDetailDialog";
import { SwapMealDialog } from "@/components/SwapMealDialog";
import { MascotCompanion } from "@/components/MascotCompanion";
import { DailySummaryDialog } from "@/components/DailySummaryDialog";
import { AchievementUnlockAnimation } from "@/components/AchievementUnlockAnimation";
import { SubscriptionBanner } from "@/components/SubscriptionBanner";
import { Checkbox } from "@/components/ui/checkbox";
import confetti from "canvas-confetti";

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
  const [isReplacingMeal, setIsReplacingMeal] = useState(false);
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
  const navigate = useNavigate();
  const { toast } = useToast();

  const dayNames = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const mealTypes: { [key: string]: string } = {
    breakfast: "Desayuno",
    lunch: "Almuerzo",
    dinner: "Cena",
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    await loadProfile(user.id);
    await loadUserStats(user.id);
    await loadMealPlan(user.id);
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
        title: "¡Ya completaste esta comida!",
        description: "Sigue así, vas muy bien 💪",
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
        title: "Error",
        description: "No se pudo marcar la comida como completada",
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
    const messages = [
      "¡Excelente! 🎉",
      "¡Sigue así! 💪",
      "¡Increíble! ⭐",
      "¡Eres el mejor! 🏆",
      "¡Qué pro! 🔥",
    ];
    
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
      setTrialExpired(expired && !data.is_subscribed);
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

      if (planError) throw planError;

      if (plans && plans.length > 0) {
        const planId = plans[0].id;
        
        // Get meals for this plan
        const { data: meals, error: mealsError } = await supabase
          .from("meals")
          .select("*")
          .eq("meal_plan_id", planId)
          .order("day_of_week", { ascending: true });

        if (mealsError) throw mealsError;

        setMealPlan({
          id: planId,
          week_start_date: plans[0].week_start_date,
          meals: meals || [],
        });
        
        // Load completed meals for today
        await loadCompletedMeals(userId);
      } else {
        // Generate first meal plan
        await generateMealPlan();
      }
    } catch (error: any) {
      console.error("Error loading meal plan:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateMealPlan = async () => {
    setGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase.functions.invoke("generate-meal-plan", {
        body: { userId: user.id },
      });

      if (error) throw error;

      toast({
        title: "¡Menú generado!",
        description: "Tu nuevo plan semanal está listo",
      });

      await loadMealPlan(user.id);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleReplaceMeal = async (mealId: string) => {
    if (!mealPlan) return;
    
    setIsReplacingMeal(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const meal = mealPlan.meals.find(m => m.id === mealId);
      if (!meal) throw new Error("Meal not found");

      const { error } = await supabase.functions.invoke("generate-single-meal", {
        body: {
          mealId: meal.id,
          mealType: meal.meal_type,
          dayOfWeek: meal.day_of_week,
          mealPlanId: mealPlan.id,
        },
      });

      if (error) throw error;

      toast({
        title: "¡Comida reemplazada!",
        description: "Se generó una nueva opción para ti",
      });

      setMealDialogOpen(false);
      await loadMealPlan(user.id);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsReplacingMeal(false);
    }
  };

  const handleSwapMeal = (mealId: string) => {
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
        title: "¡Comidas intercambiadas!",
        description: "Las comidas se han movido exitosamente",
      });

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const daysRemaining = profile ? Math.ceil((new Date(profile.trial_expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const trialProgress = profile ? ((4 - daysRemaining) / 4) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Subscription Banner */}
        {profile && (
          <SubscriptionBanner 
            userId={profile.id} 
            trialExpiresAt={profile.trial_expires_at}
          />
        )}

        {/* Mascot and Gamification Section */}
        <Card className="border-border/50 shadow-lg bg-gradient-to-br from-card to-muted/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <MascotCompanion
                  points={userStats.total_points}
                  streak={userStats.current_streak}
                  level={userStats.level}
                  showCelebration={showCelebration}
                  message={mascotMessage}
                />
                <div className="text-center md:text-left">
                  <h3 className="text-2xl font-bold">¡Hola! Soy tu compañero</h3>
                  <p className="text-muted-foreground mb-4">
                    Te ayudaré a lograr tus metas de nutrición 🎯
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    <Badge variant="secondary" className="text-base px-4 py-2">
                      Nivel {userStats.level}
                    </Badge>
                    <Badge variant="outline" className="text-base px-4 py-2">
                      {userStats.meals_completed} comidas completadas
                    </Badge>
                    <Badge variant="outline" className="text-base px-4 py-2">
                      Racha más larga: {userStats.longest_streak} días 🔥
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-2">Progreso al siguiente nivel</div>
                <Progress value={(userStats.total_points % 100)} className="w-48 h-3 mb-2" />
                <div className="text-xs text-muted-foreground">
                  {userStats.total_points % 100}/100 puntos
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-border/50 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <Utensils className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Comidas esta semana</p>
                  <p className="text-2xl font-bold">{mealPlan?.meals.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Planes generados</p>
                  <p className="text-2xl font-bold">1</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Última actualización</p>
                  <p className="text-sm font-semibold">
                    {mealPlan ? new Date(mealPlan.week_start_date).toLocaleDateString('es-ES') : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Button
                onClick={generateMealPlan}
                disabled={generating}
                variant="outline"
                className="h-auto py-4 flex-col gap-2"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm">Generando...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-5 w-5" />
                    <span className="text-sm">Nuevo plan semanal</span>
                  </>
                )}
              </Button>
              
              <Button
                onClick={() => navigate("/chat")}
                variant="outline"
                className="h-auto py-4 flex-col gap-2"
              >
                <MessageCircle className="h-5 w-5" />
                <span className="text-sm">Hablar con coach</span>
              </Button>

              <Button
                onClick={() => navigate("/onboarding")}
                variant="outline"
                className="h-auto py-4 flex-col gap-2"
              >
                <Settings className="h-5 w-5" />
                <span className="text-sm">Ajustar preferencias</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Weekly Meal Plan */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold">Menú Semanal</h2>
            </div>
            {mealPlan && (
              <Badge variant="secondary">
                Semana del {new Date(mealPlan.week_start_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
              </Badge>
            )}
          </div>

          {Object.keys(groupedMeals).length > 0 ? (
            Object.keys(groupedMeals).map((dayIndex) => {
              const day = parseInt(dayIndex);
              const meals = groupedMeals[day];

              return (
                <Card key={day} className="overflow-hidden border-border/50 shadow-lg hover:shadow-xl transition-all">
                  <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                          <span className="text-primary-foreground font-bold text-sm">{day + 1}</span>
                        </div>
                        <span className="text-xl">{dayNames[day]}</span>
                      </CardTitle>
                      <Badge variant="outline">{meals.length} comidas</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid gap-4 md:grid-cols-3">
                      {meals.map((meal) => {
                        const isCompleted = completedMeals.has(meal.id);
                        return (
                          <Card 
                            key={meal.id} 
                            className={`border-border/50 bg-gradient-to-br from-card to-muted/20 hover:shadow-md transition-all overflow-hidden relative ${isCompleted ? 'ring-2 ring-green-500' : ''}`}
                          >
                            {meal.image_url && (
                              <div className="relative h-40 w-full overflow-hidden">
                                <img 
                                  src={meal.image_url} 
                                  alt={meal.name}
                                  className={`w-full h-full object-cover ${isCompleted ? 'opacity-60' : ''}`}
                                />
                                <div className="absolute top-2 right-2">
                                  <Badge variant="secondary" className="backdrop-blur-sm bg-background/80">
                                    {mealTypes[meal.meal_type]}
                                  </Badge>
                                </div>
                                <div 
                                  className="absolute top-2 left-2 bg-background/90 rounded-lg p-2 cursor-pointer hover:scale-110 transition-transform"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    completeMeal(meal.id);
                                  }}
                                >
                                  <Checkbox
                                    checked={isCompleted}
                                    className="pointer-events-none"
                                  />
                                </div>
                              </div>
                            )}
                            <CardContent 
                              className="p-4 space-y-3 cursor-pointer"
                              onClick={() => {
                                setSelectedMeal(meal);
                                setMealDialogOpen(true);
                              }}
                            >
                              {!meal.image_url && (
                                <div className="flex items-start justify-between gap-2">
                                  <Badge variant="secondary" className="shrink-0">
                                    {mealTypes[meal.meal_type]}
                                  </Badge>
                                  <div 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      completeMeal(meal.id);
                                    }}
                                    className="cursor-pointer hover:scale-110 transition-transform"
                                  >
                                    <Checkbox
                                      checked={isCompleted}
                                      className="pointer-events-none"
                                    />
                                  </div>
                                </div>
                              )}
                              <div>
                                <h4 className={`font-semibold text-base mb-1 ${isCompleted ? 'line-through opacity-60' : ''}`}>
                                  {meal.name}
                                </h4>
                                <p className="text-sm text-muted-foreground line-clamp-2">{meal.description}</p>
                              </div>
                              <Separator />
                              <div className="flex items-start gap-2">
                                {isCompleted ? (
                                  <>
                                    <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                    <p className="text-xs text-green-600 font-medium leading-relaxed">¡Completada! +10 pts</p>
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                    <p className="text-xs text-primary font-medium leading-relaxed">{meal.benefits}</p>
                                  </>
                                )}
                              </div>
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
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Utensils className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay plan de comidas</h3>
                <p className="text-muted-foreground text-center mb-6">
                  Genera tu primer plan semanal personalizado
                </p>
                <Button onClick={generateMealPlan} disabled={generating} variant="hero">
                  {generating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generar plan
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      
      <MealDetailDialog 
        meal={selectedMeal}
        open={mealDialogOpen}
        onOpenChange={setMealDialogOpen}
        onReplaceMeal={handleReplaceMeal}
        onSwapMeal={handleSwapMeal}
        isReplacing={isReplacingMeal}
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
    </div>
  );
};

export default Dashboard;
