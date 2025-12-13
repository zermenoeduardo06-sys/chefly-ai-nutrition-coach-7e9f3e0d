import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Trophy, Flame, Info, MoreHorizontal } from "lucide-react";
import { format, startOfWeek, addDays, isSameDay, isAfter, isBefore } from "date-fns";
import { es } from "date-fns/locale";

interface DayProgress {
  day: string;
  date: Date;
  completed: boolean;
  isToday: boolean;
  isFuture: boolean;
}

interface MacroProgress {
  current: number;
  target: number;
}

interface ProgressData {
  calories: MacroProgress;
  protein: MacroProgress;
  carbs: MacroProgress;
  fats: MacroProgress;
  streak: number;
  weekDays: DayProgress[];
  goal: string;
}

export const CaloriesProgressArc = () => {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setLoading(true);
    try {
      // Get user preferences for targets
      const { data: preferences } = await supabase
        .from("user_preferences")
        .select("goal, weight, activity_level")
        .eq("user_id", user.id)
        .single();

      // Get user stats for streak
      const { data: stats } = await supabase
        .from("user_stats")
        .select("current_streak")
        .eq("user_id", user.id)
        .single();

      // Get this week's completions
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 }); // Sunday
      const { data: completions } = await supabase
        .from("meal_completions")
        .select(`
          completed_at,
          meals (
            calories,
            protein,
            carbs,
            fats
          )
        `)
        .eq("user_id", user.id)
        .gte("completed_at", weekStart.toISOString());

      // Calculate week days progress
      const today = new Date();
      const weekDays: DayProgress[] = [];
      const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
      
      for (let i = 0; i < 7; i++) {
        const date = addDays(weekStart, i);
        const hasCompletion = completions?.some((c: any) => 
          isSameDay(new Date(c.completed_at), date)
        );
        
        weekDays.push({
          day: dayNames[i],
          date,
          completed: hasCompletion || false,
          isToday: isSameDay(date, today),
          isFuture: isAfter(date, today)
        });
      }

      // Calculate today's totals
      const todayCompletions = completions?.filter((c: any) => 
        isSameDay(new Date(c.completed_at), today)
      ) || [];

      const todayCalories = todayCompletions.reduce((sum: number, c: any) => 
        sum + (c.meals?.calories || 0), 0);
      const todayProtein = todayCompletions.reduce((sum: number, c: any) => 
        sum + (c.meals?.protein || 0), 0);
      const todayCarbs = todayCompletions.reduce((sum: number, c: any) => 
        sum + (c.meals?.carbs || 0), 0);
      const todayFats = todayCompletions.reduce((sum: number, c: any) => 
        sum + (c.meals?.fats || 0), 0);

      // Calculate target based on goal (simplified estimation)
      const weight = preferences?.weight || 70;
      const activityMultiplier = preferences?.activity_level === 'high' ? 1.7 : 
                                 preferences?.activity_level === 'moderate' ? 1.5 : 1.3;
      const baseCalories = Math.round(weight * 25 * activityMultiplier);
      
      const goalLabel = preferences?.goal === 'lose_weight' ? 'Déficit (Perder)' :
                       preferences?.goal === 'gain_weight' ? 'Superávit (Ganar)' :
                       'Mantenimiento';

      setData({
        calories: { current: todayCalories, target: baseCalories },
        protein: { current: todayProtein, target: Math.round(weight * 1.6) },
        carbs: { current: todayCarbs, target: Math.round(baseCalories * 0.4 / 4) },
        fats: { current: todayFats, target: Math.round(baseCalories * 0.3 / 9) },
        streak: stats?.current_streak || 0,
        weekDays,
        goal: goalLabel
      });
    } catch (error) {
      console.error("Error loading progress data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  const calorieProgress = Math.min((data.calories.current / data.calories.target) * 100, 100);
  const proteinProgress = Math.min((data.protein.current / data.protein.target) * 100, 100);
  const carbsProgress = Math.min((data.carbs.current / data.carbs.target) * 100, 100);
  const fatsProgress = Math.min((data.fats.current / data.fats.target) * 100, 100);
  const remaining = Math.max(data.calories.target - data.calories.current, 0);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Progreso de calorías</CardTitle>
        <button className="p-2 hover:bg-muted rounded-full transition-colors">
          <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
        </button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Week Days Progress */}
        <div className="flex justify-between items-center px-2">
          {data.weekDays.map((day, index) => (
            <div key={index} className="flex flex-col items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium">{day.day}</span>
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                  day.completed 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : day.isToday
                    ? 'border-green-500 text-green-500 bg-green-50 dark:bg-green-950'
                    : 'border-muted-foreground/30 text-muted-foreground/30'
                }`}
              >
                {day.completed && <Check className="h-4 w-4" />}
              </div>
            </div>
          ))}
        </div>

        {/* Goal Badge */}
        <div className="flex justify-center">
          <Badge variant="secondary" className="px-4 py-1.5 gap-2 text-sm bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400 border-green-200 dark:border-green-800">
            <Info className="h-3.5 w-3.5" />
            {data.goal}
          </Badge>
        </div>

        {/* Rainbow Arc Progress */}
        <div className="relative flex justify-center py-4">
          <svg viewBox="0 0 200 120" className="w-full max-w-[280px]">
            {/* Background arcs */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <path
              d="M 35 100 A 65 65 0 0 1 165 100"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <path
              d="M 50 100 A 50 50 0 0 1 150 100"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <path
              d="M 65 100 A 35 35 0 0 1 135 100"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="12"
              strokeLinecap="round"
            />

            {/* Progress arcs */}
            {/* Outer - Fats (Blue) */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${(fatsProgress / 100) * 251} 251`}
            />
            {/* Second - Carbs (Green) */}
            <path
              d="M 35 100 A 65 65 0 0 1 165 100"
              fill="none"
              stroke="#22c55e"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${(carbsProgress / 100) * 204} 204`}
            />
            {/* Third - Protein (Yellow/Orange) */}
            <path
              d="M 50 100 A 50 50 0 0 1 150 100"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${(proteinProgress / 100) * 157} 157`}
            />
            {/* Inner - Calories (Orange) */}
            <path
              d="M 65 100 A 35 35 0 0 1 135 100"
              fill="none"
              stroke="#f97316"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${(calorieProgress / 100) * 110} 110`}
            />
          </svg>

          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
            <Trophy className="h-6 w-6 text-green-600 mb-1" />
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-green-600">{data.calories.current}</span>
              <span className="text-xl text-muted-foreground">/ {data.calories.target}</span>
            </div>
            <span className="text-sm text-muted-foreground">Para llegar al mínimo: {remaining}</span>
          </div>
        </div>

        {/* Streak */}
        {data.streak > 0 && (
          <div className="flex items-center justify-center gap-2 text-base font-medium">
            <Flame className="h-5 w-5 text-orange-500" />
            <span>Racha de {data.streak} días</span>
          </div>
        )}

        {/* Macros */}
        <div className="grid grid-cols-3 gap-4 pt-2">
          <div className="text-center">
            <p className="text-sm font-medium text-green-500">Carbohidratos</p>
            <p className="text-xl font-bold">
              {data.carbs.current.toFixed(1)}
              <span className="text-sm font-normal text-muted-foreground">/{data.carbs.target}g</span>
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-amber-500">Proteína</p>
            <p className="text-xl font-bold">
              {data.protein.current.toFixed(1)}
              <span className="text-sm font-normal text-muted-foreground">/{data.protein.target}g</span>
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-blue-500">Grasas</p>
            <p className="text-xl font-bold">
              {data.fats.current.toFixed(1)}
              <span className="text-sm font-normal text-muted-foreground">/{data.fats.target}g</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
