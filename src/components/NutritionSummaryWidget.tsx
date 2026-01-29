import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Flame, Beef, Wheat, Droplet } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { useNutritionGoals } from "@/hooks/useNutritionGoals";
import { cn } from "@/lib/utils";

interface NutritionSummaryWidgetProps {
  userId: string;
  selectedDate?: Date;
}

interface DailyNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  mealsCompleted: number;
  totalMeals: number;
}

export const NutritionSummaryWidget = ({ userId, selectedDate = new Date() }: NutritionSummaryWidgetProps) => {
  const { language } = useLanguage();
  const [nutrition, setNutrition] = useState<DailyNutrition | null>(null);
  const [loading, setLoading] = useState(true);
  const { goals: dailyGoals, loading: goalsLoading } = useNutritionGoals(userId);

  useEffect(() => {
    loadDateNutrition();
  }, [userId, selectedDate]);

  const loadDateNutrition = async () => {
    if (!userId) return;
    setLoading(true);

    try {
      const dateStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      const dateEnd = new Date(dateStart.getTime() + 86400000);
      
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
        .gte("completed_at", dateStart.toISOString())
        .lt("completed_at", dateEnd.toISOString());

      const { data: scans } = await supabase
        .from("food_scans")
        .select("calories, protein, carbs, fat")
        .eq("user_id", userId)
        .gte("scanned_at", dateStart.toISOString())
        .lt("scanned_at", dateEnd.toISOString());

      const { data: mealPlan } = await supabase
        .from("meal_plans")
        .select("id")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      let totalMealsForDate = 0;
      if (mealPlan) {
        const dayOfWeek = selectedDate.getDay();
        const { count } = await supabase
          .from("meals")
          .select("id", { count: "exact" })
          .eq("meal_plan_id", mealPlan.id)
          .eq("day_of_week", dayOfWeek);
        totalMealsForDate = count || 3;
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
        totalMeals: totalMealsForDate || 3,
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

  if (loading || goalsLoading) {
    return (
      <Card className="border border-border/50 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Skeleton className="h-12 rounded-lg" />
            <Skeleton className="h-12 rounded-lg" />
            <Skeleton className="h-12 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const caloriesConsumed = nutrition?.calories || 0;
  const caloriesRemaining = Math.max(dailyGoals.calories - caloriesConsumed, 0);
  const proteinConsumed = nutrition?.protein || 0;
  const carbsConsumed = nutrition?.carbs || 0;
  const fatsConsumed = nutrition?.fats || 0;

  const proteinPercentage = Math.min((proteinConsumed / dailyGoals.protein) * 100, 100);
  const carbsPercentage = Math.min((carbsConsumed / dailyGoals.carbs) * 100, 100);
  const fatsPercentage = Math.min((fatsConsumed / dailyGoals.fats) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border border-border/50 bg-card/95 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-4">
          {/* Top Row: Consumed | Remaining | Burned - YAZIO Style */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {/* Consumed */}
            <div className="text-center">
              <motion.p 
                className="text-2xl font-bold text-foreground"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                key={caloriesConsumed}
              >
                {formatNumber(caloriesConsumed)}
              </motion.p>
              <p className="text-xs text-muted-foreground">
                {language === 'es' ? 'Consumidas' : 'Consumed'}
              </p>
            </div>

            {/* Remaining - Highlighted with primary accent */}
            <div className="text-center relative">
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <motion.p 
                className="text-3xl font-bold text-primary"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                key={caloriesRemaining}
              >
                {formatNumber(caloriesRemaining)}
              </motion.p>
              <p className="text-xs text-muted-foreground">
                {language === 'es' ? 'Restantes' : 'Remaining'}
              </p>
            </div>

            {/* Goal */}
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">
                {formatNumber(dailyGoals.calories)}
              </p>
              <p className="text-xs text-muted-foreground">
                {language === 'es' ? 'Objetivo' : 'Goal'}
              </p>
            </div>
          </div>

          {/* Macros Row - Horizontal bars like YAZIO */}
          <div className="grid grid-cols-3 gap-3">
            {/* Carbs */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Wheat className="h-3 w-3 text-primary" />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    {language === 'es' ? 'Carbos' : 'Carbs'}
                  </span>
                </div>
              </div>
              <Progress 
                value={carbsPercentage} 
                className="h-1.5 bg-muted/30 [&>div]:bg-primary" 
              />
              <p className="text-xs text-center text-muted-foreground">
                <span className="font-medium text-foreground">{formatNumber(carbsConsumed)}</span>
                <span className="text-muted-foreground/70"> / {dailyGoals.carbs}g</span>
              </p>
            </div>

            {/* Protein */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Beef className="h-3 w-3 text-cyan-400" />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    {language === 'es' ? 'Proteína' : 'Protein'}
                  </span>
                </div>
              </div>
              <Progress 
                value={proteinPercentage} 
                className="h-1.5 bg-muted/30 [&>div]:bg-cyan-400" 
              />
              <p className="text-xs text-center text-muted-foreground">
                <span className="font-medium text-foreground">{formatNumber(proteinConsumed)}</span>
                <span className="text-muted-foreground/70"> / {dailyGoals.protein}g</span>
              </p>
            </div>

            {/* Fats */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Droplet className="h-3 w-3 text-cyan-400" />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    {language === 'es' ? 'Grasas' : 'Fats'}
                  </span>
                </div>
              </div>
              <Progress 
                value={fatsPercentage} 
                className="h-1.5 bg-muted/30 [&>div]:bg-cyan-400" 
              />
              <p className="text-xs text-center text-muted-foreground">
                <span className="font-medium text-foreground">{formatNumber(fatsConsumed)}</span>
                <span className="text-muted-foreground/70"> / {dailyGoals.fats}g</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
