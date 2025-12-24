import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Flame, Beef, Wheat, Droplet, Utensils, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface NutritionSummaryWidgetProps {
  userId: string;
}

interface DailyNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  mealsCompleted: number;
  totalMeals: number;
}

const dailyGoals = {
  calories: 2000,
  protein: 120,
  carbs: 250,
  fats: 65,
};

export const NutritionSummaryWidget = ({ userId }: NutritionSummaryWidgetProps) => {
  const { language } = useLanguage();
  const [nutrition, setNutrition] = useState<DailyNutrition | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTodayNutrition();
  }, [userId]);

  const loadTodayNutrition = async () => {
    if (!userId) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get meal completions for today with meal details
      const { data: completions } = await supabase
        .from("meal_completions")
        .select(`
          id,
          meal_id,
          meals (
            calories,
            protein,
            carbs,
            fats
          )
        `)
        .eq("user_id", userId)
        .gte("completed_at", today);

      // Get food scans for today
      const { data: scans } = await supabase
        .from("food_scans")
        .select("calories, protein, carbs, fat")
        .eq("user_id", userId)
        .gte("scanned_at", today);

      // Get total meals for today
      const { data: mealPlan } = await supabase
        .from("meal_plans")
        .select("id")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      let totalMealsToday = 0;
      if (mealPlan) {
        const dayOfWeek = new Date().getDay();
        const { count } = await supabase
          .from("meals")
          .select("id", { count: "exact" })
          .eq("meal_plan_id", mealPlan.id)
          .eq("day_of_week", dayOfWeek);
        totalMealsToday = count || 3;
      }

      // Calculate totals from completed meals
      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFats = 0;

      completions?.forEach((completion: any) => {
        if (completion.meals) {
          totalCalories += completion.meals.calories || 0;
          totalProtein += completion.meals.protein || 0;
          totalCarbs += completion.meals.carbs || 0;
          totalFats += completion.meals.fats || 0;
        }
      });

      // Add food scans nutrition
      scans?.forEach((scan) => {
        totalCalories += scan.calories || 0;
        totalProtein += scan.protein || 0;
        totalCarbs += scan.carbs || 0;
        totalFats += scan.fat || 0;
      });

      setNutrition({
        calories: totalCalories,
        protein: totalProtein,
        carbs: totalCarbs,
        fats: totalFats,
        mealsCompleted: completions?.length || 0,
        totalMeals: totalMealsToday || 3,
      });
    } catch (error) {
      console.error("Error loading nutrition:", error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (current: number, goal: number) => {
    const percentage = (current / goal) * 100;
    if (percentage >= 100) return "bg-green-500";
    if (percentage >= 70) return "bg-primary";
    if (percentage >= 40) return "bg-yellow-500";
    return "bg-muted-foreground/30";
  };

  const formatNumber = (num: number) => {
    return Math.round(num).toLocaleString();
  };

  if (loading) {
    return (
      <Card className="border-border/50 shadow-lg">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-60 mt-1" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const caloriePercentage = Math.min((nutrition?.calories || 0) / dailyGoals.calories * 100, 100);
  const proteinPercentage = Math.min((nutrition?.protein || 0) / dailyGoals.protein * 100, 100);
  const carbsPercentage = Math.min((nutrition?.carbs || 0) / dailyGoals.carbs * 100, 100);
  const fatsPercentage = Math.min((nutrition?.fats || 0) / dailyGoals.fats * 100, 100);

  return (
    <Card className="border-border/50 shadow-lg overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">
              {language === 'es' ? 'Resumen de Hoy' : "Today's Summary"}
            </CardTitle>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Utensils className="h-4 w-4" />
            <span>
              {nutrition?.mealsCompleted || 0}/{nutrition?.totalMeals || 3}
            </span>
          </div>
        </div>
        <CardDescription>
          {language === 'es' 
            ? 'Tu progreso nutricional del día' 
            : 'Your daily nutrition progress'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Calories - Featured */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/20">
                <Flame className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  {language === 'es' ? 'Calorías' : 'Calories'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {language === 'es' ? 'Meta diaria' : 'Daily goal'}: {dailyGoals.calories}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">
                {formatNumber(nutrition?.calories || 0)}
              </p>
              <p className="text-xs text-muted-foreground">
                {Math.round(caloriePercentage)}%
              </p>
            </div>
          </div>
          <Progress 
            value={caloriePercentage} 
            className="h-2"
          />
        </div>

        {/* Macros Grid */}
        <div className="grid grid-cols-3 gap-3">
          {/* Protein */}
          <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
            <div className="flex items-center gap-1.5 mb-2">
              <Beef className="h-4 w-4 text-red-400" />
              <span className="text-xs font-medium text-muted-foreground">
                {language === 'es' ? 'Proteína' : 'Protein'}
              </span>
            </div>
            <p className="text-lg font-bold text-foreground">
              {formatNumber(nutrition?.protein || 0)}g
            </p>
            <Progress 
              value={proteinPercentage} 
              className="h-1.5 mt-2"
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              / {dailyGoals.protein}g
            </p>
          </div>

          {/* Carbs */}
          <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
            <div className="flex items-center gap-1.5 mb-2">
              <Wheat className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-medium text-muted-foreground">
                {language === 'es' ? 'Carbos' : 'Carbs'}
              </span>
            </div>
            <p className="text-lg font-bold text-foreground">
              {formatNumber(nutrition?.carbs || 0)}g
            </p>
            <Progress 
              value={carbsPercentage} 
              className="h-1.5 mt-2"
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              / {dailyGoals.carbs}g
            </p>
          </div>

          {/* Fats */}
          <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
            <div className="flex items-center gap-1.5 mb-2">
              <Droplet className="h-4 w-4 text-blue-400" />
              <span className="text-xs font-medium text-muted-foreground">
                {language === 'es' ? 'Grasas' : 'Fats'}
              </span>
            </div>
            <p className="text-lg font-bold text-foreground">
              {formatNumber(nutrition?.fats || 0)}g
            </p>
            <Progress 
              value={fatsPercentage} 
              className="h-1.5 mt-2"
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              / {dailyGoals.fats}g
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
