import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Flame, Beef, Wheat, Droplet, Utensils } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

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
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrowStart = new Date(todayStart.getTime() + 86400000);
      
      const { data: completions } = await supabase
        .from("meal_completions")
        .select(`
          id,
          meal_id,
          completed_at,
          meals (
            calories,
            protein,
            carbs,
            fats
          )
        `)
        .eq("user_id", userId)
        .gte("completed_at", todayStart.toISOString())
        .lt("completed_at", tomorrowStart.toISOString());

      const { data: scans } = await supabase
        .from("food_scans")
        .select("calories, protein, carbs, fat")
        .eq("user_id", userId)
        .gte("scanned_at", todayStart.toISOString())
        .lt("scanned_at", tomorrowStart.toISOString());

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

  const formatNumber = (num: number) => {
    return Math.round(num).toLocaleString();
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-xl bg-gradient-to-br from-card via-card to-muted/30 overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center justify-center h-40">
            <Skeleton className="h-32 w-32 rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const caloriePercentage = Math.min((nutrition?.calories || 0) / dailyGoals.calories * 100, 100);
  const proteinPercentage = Math.min((nutrition?.protein || 0) / dailyGoals.protein * 100, 100);
  const carbsPercentage = Math.min((nutrition?.carbs || 0) / dailyGoals.carbs * 100, 100);
  const fatsPercentage = Math.min((nutrition?.fats || 0) / dailyGoals.fats * 100, 100);
  
  // Calculate stroke dasharray for circular progress
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (caloriePercentage / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-0 shadow-xl bg-gradient-to-br from-card via-card to-primary/5 overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center gap-5">
            {/* Circular Calorie Progress */}
            <div className="relative flex-shrink-0">
              <svg className="w-32 h-32 transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  className="fill-none stroke-muted/30"
                  strokeWidth="10"
                />
                {/* Progress circle */}
                <motion.circle
                  cx="64"
                  cy="64"
                  r={radius}
                  className="fill-none stroke-primary"
                  strokeWidth="10"
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  style={{
                    strokeDasharray: circumference,
                  }}
                />
              </svg>
              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Flame className="h-5 w-5 text-primary mb-1" />
                <motion.span 
                  className="text-2xl font-bold text-foreground"
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                >
                  {formatNumber(nutrition?.calories || 0)}
                </motion.span>
                <span className="text-xs text-muted-foreground">
                  / {dailyGoals.calories}
                </span>
              </div>
            </div>
            
            {/* Macros Stack */}
            <div className="flex-1 space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-foreground">
                  {language === 'es' ? 'Progreso de Hoy' : "Today's Progress"}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                  <Utensils className="h-3 w-3" />
                  <span>{nutrition?.mealsCompleted || 0}/{nutrition?.totalMeals || 3}</span>
                </div>
              </div>
              
              {/* Protein */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-rose-500/15">
                      <Beef className="h-3.5 w-3.5 text-rose-500" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      {language === 'es' ? 'Proteína' : 'Protein'}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-foreground">
                    {formatNumber(nutrition?.protein || 0)}g
                  </span>
                </div>
                <Progress value={proteinPercentage} className="h-2" />
              </div>
              
              {/* Carbs */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-500/15">
                      <Wheat className="h-3.5 w-3.5 text-amber-500" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      {language === 'es' ? 'Carbos' : 'Carbs'}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-foreground">
                    {formatNumber(nutrition?.carbs || 0)}g
                  </span>
                </div>
                <Progress value={carbsPercentage} className="h-2" />
              </div>
              
              {/* Fats */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-sky-500/15">
                      <Droplet className="h-3.5 w-3.5 text-sky-500" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      {language === 'es' ? 'Grasas' : 'Fats'}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-foreground">
                    {formatNumber(nutrition?.fats || 0)}g
                  </span>
                </div>
                <Progress value={fatsPercentage} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
