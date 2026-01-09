import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Flame, Beef, Wheat, Droplet, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { useNutritionGoals } from "@/hooks/useNutritionGoals";
import { InfoTooltip } from "@/components/InfoTooltip";

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
      // Use selected date instead of today
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
      <Card className="border-0 shadow-xl bg-gradient-to-br from-card via-card to-primary/5 overflow-hidden">
        <CardContent className="p-4">
          <div className="flex flex-col items-center justify-center gap-3">
            <Skeleton className="h-28 w-28 rounded-full" />
            <div className="w-full grid grid-cols-3 gap-2">
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
  
  // Check if user has started tracking today
  const hasStartedTracking = caloriesConsumed > 0;
  
  // Smaller circle for compact layout
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (caloriePercentage / 100) * circumference;

  const getProgressColor = () => {
    if (caloriePercentage >= 100) return "#ef4444";
    if (caloriePercentage >= 80) return "#f59e0b";
    return "hsl(var(--primary))";
  };

  const progressColor = getProgressColor();

  // Empty state for new users
  if (!hasStartedTracking) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-0 shadow-xl bg-gradient-to-br from-card via-card to-primary/5 overflow-hidden relative">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Flame className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-foreground text-sm">
                  {language === 'es' ? 'Progreso del Día' : "Day's Progress"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {language === 'es' 
                    ? '¡Registra tu primera comida para ver tu progreso!' 
                    : 'Log your first meal to see your progress!'}
                </p>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground/70 mt-2">
              💡 {language === 'es' 
                ? 'Las calorías mostradas son estimaciones basadas en tus metas' 
                : 'Calories shown are estimates based on your goals'}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-0 shadow-xl bg-gradient-to-br from-card via-card to-primary/5 overflow-hidden relative">
        {/* Decorative gradient orbs */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
        
        <CardContent className="p-4 relative">
          {/* Compact layout: Circle + Macros side by side */}
          <div className="flex items-center gap-4">
            {/* Circular progress */}
            <div className="relative flex-shrink-0">
              <div 
                className="absolute inset-2 rounded-full blur-lg opacity-25"
                style={{ backgroundColor: progressColor }}
              />
              
              <svg className="w-28 h-28 transform -rotate-90 relative">
                <circle
                  cx="56"
                  cy="56"
                  r={radius}
                  className="fill-none stroke-muted/20"
                  strokeWidth="10"
                />
                <motion.circle
                  cx="56"
                  cy="56"
                  r={radius}
                  fill="none"
                  stroke={progressColor}
                  strokeWidth="10"
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  style={{
                    strokeDasharray: circumference,
                    filter: "drop-shadow(0 0 6px " + progressColor + "40)",
                  }}
                />
              </svg>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  className="text-center"
                >
                  <span className="text-2xl font-bold text-foreground">
                    {formatNumber(caloriesRemaining)}
                  </span>
                  <p className="text-[10px] text-muted-foreground font-medium">
                    {language === 'es' ? 'restantes' : 'left'}
                  </p>
                </motion.div>
              </div>
            </div>

            {/* Right side: Title + Macros */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold text-foreground text-sm">
                    {language === 'es' ? 'Progreso del Día' : "Day's Progress"}
                  </h3>
                    {dailyGoals.isPersonalized && (
                      <Sparkles className="h-3 w-3 text-primary" />
                    )}
                    <InfoTooltip 
                      titleKey="tooltip.calories.title"
                      contentKey="tooltip.calories.content"
                      data={{ 
                        calories: dailyGoals.calories,
                        goalNote: language === 'es' 
                          ? (dailyGoals.calories < 2000 ? 'Para bajar de peso, restamos ~500 kcal para un déficit seguro.' : 'Ajustado para ayudarte a alcanzar tu objetivo.')
                          : (dailyGoals.calories < 2000 ? 'For weight loss, we subtract ~500 kcal for a safe deficit.' : 'Adjusted to help you reach your goal.')
                      }}
                      iconSize={12}
                    />
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Flame className="h-3 w-3 text-primary" />
                    <span className="text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">{formatNumber(caloriesConsumed)}</span>
                      {" / "}{formatNumber(dailyGoals.calories)} kcal
                    </span>
                  </div>
                </div>
              </div>

              {/* Macros compact */}
              <div className="space-y-2">
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                    {language === 'es' ? 'Macros' : 'Macros'}
                  </span>
                  <InfoTooltip 
                    titleKey="tooltip.macros.title"
                    contentKey="tooltip.macros.content"
                    iconSize={10}
                  />
                </div>
                {/* Protein */}
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-rose-500/15">
                    <Beef className="h-3 w-3 text-rose-500" />
                  </div>
                  <div className="flex-1">
                    <Progress value={proteinPercentage} className="h-1.5 bg-rose-500/10 [&>div]:bg-rose-500" />
                  </div>
                  <span className="text-xs font-medium text-foreground w-14 text-right">
                    {formatNumber(nutrition?.protein || 0)}/{dailyGoals.protein}g
                  </span>
                </div>

                {/* Carbs */}
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-amber-500/15">
                    <Wheat className="h-3 w-3 text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <Progress value={carbsPercentage} className="h-1.5 bg-amber-500/10 [&>div]:bg-amber-500" />
                  </div>
                  <span className="text-xs font-medium text-foreground w-14 text-right">
                    {formatNumber(nutrition?.carbs || 0)}/{dailyGoals.carbs}g
                  </span>
                </div>

                {/* Fats */}
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-sky-500/15">
                    <Droplet className="h-3 w-3 text-sky-500" />
                  </div>
                  <div className="flex-1">
                    <Progress value={fatsPercentage} className="h-1.5 bg-sky-500/10 [&>div]:bg-sky-500" />
                  </div>
                  <span className="text-xs font-medium text-foreground w-14 text-right">
                    {formatNumber(nutrition?.fats || 0)}/{dailyGoals.fats}g
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
