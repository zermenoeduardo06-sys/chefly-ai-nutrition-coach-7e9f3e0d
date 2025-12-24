import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Flame, Beef, Wheat, Droplet } from "lucide-react";
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
      <Card className="border-0 shadow-2xl bg-card overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center gap-4">
            <Skeleton className="h-36 w-36 rounded-full" />
            <div className="w-full grid grid-cols-3 gap-4">
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const caloriesConsumed = nutrition?.calories || 0;
  const caloriesRemaining = Math.max(dailyGoals.calories - caloriesConsumed, 0);
  const caloriePercentage = Math.min(caloriesConsumed / dailyGoals.calories * 100, 100);
  const proteinPercentage = Math.min((nutrition?.protein || 0) / dailyGoals.protein * 100, 100);
  const carbsPercentage = Math.min((nutrition?.carbs || 0) / dailyGoals.carbs * 100, 100);
  const fatsPercentage = Math.min((nutrition?.fats || 0) / dailyGoals.fats * 100, 100);
  
  // Calculate stroke dasharray for circular progress
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (caloriePercentage / 100) * circumference;

  // Determine progress color based on percentage
  const getProgressColor = () => {
    if (caloriePercentage >= 100) return "stroke-destructive";
    if (caloriePercentage >= 80) return "stroke-amber-500";
    return "stroke-primary";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-0 shadow-2xl bg-card overflow-hidden">
        <CardContent className="p-6">
          {/* Main circular progress with remaining calories */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <svg className="w-40 h-40 transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  className="fill-none stroke-muted/20"
                  strokeWidth="12"
                />
                {/* Progress circle */}
                <motion.circle
                  cx="80"
                  cy="80"
                  r={radius}
                  className={`fill-none ${getProgressColor()}`}
                  strokeWidth="12"
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  style={{
                    strokeDasharray: circumference,
                  }}
                />
              </svg>
              {/* Center content - Show remaining calories */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span 
                  className="text-4xl font-bold text-foreground"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                >
                  {formatNumber(caloriesRemaining)}
                </motion.span>
                <span className="text-sm text-muted-foreground font-medium">
                  {language === 'es' ? 'Restantes' : 'Remaining'}
                </span>
              </div>
            </div>
            
            {/* Consumed / Goal indicator below circle */}
            <div className="flex items-center gap-2 mt-3">
              <Flame className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{formatNumber(caloriesConsumed)}</span>
                {" / "}
                {formatNumber(dailyGoals.calories)} kcal
              </span>
            </div>
          </div>

          {/* Macros Grid */}
          <div className="grid grid-cols-3 gap-3">
            {/* Protein */}
            <motion.div 
              className="bg-muted/30 rounded-2xl p-4 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <div className="p-1.5 rounded-lg bg-rose-500/15">
                  <Beef className="h-4 w-4 text-rose-500" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {language === 'es' ? 'Proteína' : 'Protein'}
                </span>
              </div>
              <p className="text-lg font-bold text-foreground mb-1">
                {formatNumber(nutrition?.protein || 0)}
                <span className="text-xs font-normal text-muted-foreground ml-0.5">
                  / {dailyGoals.protein}g
                </span>
              </p>
              <Progress value={proteinPercentage} className="h-1.5 bg-rose-500/10 [&>div]:bg-rose-500" />
            </motion.div>

            {/* Carbs */}
            <motion.div 
              className="bg-muted/30 rounded-2xl p-4 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <div className="p-1.5 rounded-lg bg-amber-500/15">
                  <Wheat className="h-4 w-4 text-amber-500" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {language === 'es' ? 'Carbos' : 'Carbs'}
                </span>
              </div>
              <p className="text-lg font-bold text-foreground mb-1">
                {formatNumber(nutrition?.carbs || 0)}
                <span className="text-xs font-normal text-muted-foreground ml-0.5">
                  / {dailyGoals.carbs}g
                </span>
              </p>
              <Progress value={carbsPercentage} className="h-1.5 bg-amber-500/10 [&>div]:bg-amber-500" />
            </motion.div>

            {/* Fats */}
            <motion.div 
              className="bg-muted/30 rounded-2xl p-4 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <div className="p-1.5 rounded-lg bg-sky-500/15">
                  <Droplet className="h-4 w-4 text-sky-500" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {language === 'es' ? 'Grasas' : 'Fats'}
                </span>
              </div>
              <p className="text-lg font-bold text-foreground mb-1">
                {formatNumber(nutrition?.fats || 0)}
                <span className="text-xs font-normal text-muted-foreground ml-0.5">
                  / {dailyGoals.fats}g
                </span>
              </p>
              <Progress value={fatsPercentage} className="h-1.5 bg-sky-500/10 [&>div]:bg-sky-500" />
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
