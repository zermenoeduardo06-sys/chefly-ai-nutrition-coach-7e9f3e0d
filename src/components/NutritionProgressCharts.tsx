import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Calendar, Utensils, Target, Flame } from "lucide-react";
import { startOfWeek, format, eachDayOfInterval, endOfWeek, subWeeks, subMonths, startOfMonth, endOfMonth, isSameWeek } from "date-fns";
import { es } from "date-fns/locale";

interface WeekSummary {
  week: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  mealsCompleted: number;
  daysActive: number;
}

interface DaySummary {
  day: string;
  shortDay: string;
  mealsCompleted: number;
  calories: number;
}

export const NutritionProgressCharts = () => {
  const [weeklyData, setWeeklyData] = useState<DaySummary[]>([]);
  const [monthlyData, setMonthlyData] = useState<WeekSummary[]>([]);
  const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fats: 0, meals: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setLoading(true);
    try {
      // Get data for the last 4 weeks
      const fourWeeksAgo = subWeeks(new Date(), 4);
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
        .gte("completed_at", fourWeeksAgo.toISOString())
        .order("completed_at", { ascending: true });

      // Process weekly data (current week by day)
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
      const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
      const dayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
      
      const dailyMap = new Map<string, DaySummary>();
      weekDays.forEach((day, index) => {
        const dateKey = format(day, "yyyy-MM-dd");
        dailyMap.set(dateKey, {
          day: format(day, "EEEE", { locale: es }),
          shortDay: dayNames[index],
          mealsCompleted: 0,
          calories: 0,
        });
      });

      let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFats = 0, totalMeals = 0;

      completions?.forEach((completion: any) => {
        const dateKey = completion.completed_at.split('T')[0];
        const existing = dailyMap.get(dateKey);
        if (existing && completion.meals) {
          existing.mealsCompleted += 1;
          existing.calories += completion.meals.calories || 0;
        }
        
        // Calculate totals for current week
        const completionDate = new Date(completion.completed_at);
        if (isSameWeek(completionDate, new Date(), { weekStartsOn: 1 })) {
          totalCalories += completion.meals?.calories || 0;
          totalProtein += completion.meals?.protein || 0;
          totalCarbs += completion.meals?.carbs || 0;
          totalFats += completion.meals?.fats || 0;
          totalMeals += 1;
        }
      });

      setWeeklyData(Array.from(dailyMap.values()));
      setTotals({ calories: totalCalories, protein: totalProtein, carbs: totalCarbs, fats: totalFats, meals: totalMeals });

      // Process monthly data (group by week)
      const threeMonthsAgo = subMonths(new Date(), 3);
      const { data: monthlyCompletions } = await supabase
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
        .gte("completed_at", threeMonthsAgo.toISOString())
        .order("completed_at", { ascending: true });

      const weeklyMap = new Map<string, WeekSummary>();
      let currentWeekStart = startOfWeek(startOfMonth(threeMonthsAgo), { weekStartsOn: 1 });
      
      while (currentWeekStart <= new Date()) {
        const weekKey = format(currentWeekStart, "yyyy-MM-dd");
        weeklyMap.set(weekKey, {
          week: format(currentWeekStart, "dd MMM", { locale: es }),
          calories: 0,
          protein: 0,
          carbs: 0,
          fats: 0,
          mealsCompleted: 0,
          daysActive: 0,
        });
        currentWeekStart = new Date(currentWeekStart.setDate(currentWeekStart.getDate() + 7));
      }

      const daysPerWeek = new Map<string, Set<string>>();
      monthlyCompletions?.forEach((completion: any) => {
        const completionDate = new Date(completion.completed_at);
        const weekStartDate = startOfWeek(completionDate, { weekStartsOn: 1 });
        const weekKey = format(weekStartDate, "yyyy-MM-dd");
        const dayKey = completion.completed_at.split('T')[0];
        
        const existing = weeklyMap.get(weekKey);
        if (existing && completion.meals) {
          existing.calories += completion.meals.calories || 0;
          existing.protein += completion.meals.protein || 0;
          existing.carbs += completion.meals.carbs || 0;
          existing.fats += completion.meals.fats || 0;
          existing.mealsCompleted += 1;
          
          if (!daysPerWeek.has(weekKey)) {
            daysPerWeek.set(weekKey, new Set());
          }
          daysPerWeek.get(weekKey)?.add(dayKey);
        }
      });

      daysPerWeek.forEach((days, weekKey) => {
        const existing = weeklyMap.get(weekKey);
        if (existing) {
          existing.daysActive = days.size;
        }
      });

      setMonthlyData(Array.from(weeklyMap.values()).slice(-12)); // Last 12 weeks
    } catch (error) {
      console.error("Error loading progress data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Resumen Nutricional
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxMeals = Math.max(...weeklyData.map(d => d.mealsCompleted), 1);
  const maxWeeklyMeals = Math.max(...monthlyData.map(d => d.mealsCompleted), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Resumen Nutricional
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="weekly" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="weekly">Esta Semana</TabsTrigger>
            <TabsTrigger value="monthly">Últimos 3 Meses</TabsTrigger>
          </TabsList>

          <TabsContent value="weekly" className="space-y-6">
            {/* Week totals cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20 rounded-xl p-4 text-center">
                <Flame className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{totals.calories.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Calorías</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 rounded-xl p-4 text-center">
                <Utensils className="h-6 w-6 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{totals.meals}</p>
                <p className="text-xs text-muted-foreground">Comidas</p>
              </div>
            </div>

            {/* Macros row */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{totals.protein}g</p>
                <p className="text-xs text-muted-foreground">Proteína</p>
              </div>
              <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-green-600 dark:text-green-400">{totals.carbs}g</p>
                <p className="text-xs text-muted-foreground">Carbos</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{totals.fats}g</p>
                <p className="text-xs text-muted-foreground">Grasas</p>
              </div>
            </div>

            {/* Daily meals visualization */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Comidas por día
              </div>
              <div className="flex justify-between items-end gap-2 h-32 px-1">
                {weeklyData.map((day, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex flex-col items-center justify-end h-20">
                      <div 
                        className="w-full max-w-[32px] bg-gradient-to-t from-primary to-primary/60 rounded-t-lg transition-all duration-300"
                        style={{ 
                          height: `${Math.max((day.mealsCompleted / maxMeals) * 100, 8)}%`,
                          minHeight: day.mealsCompleted > 0 ? '16px' : '4px',
                          opacity: day.mealsCompleted > 0 ? 1 : 0.3
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground">{day.shortDay}</span>
                    {day.mealsCompleted > 0 && (
                      <span className="text-xs font-bold text-primary">{day.mealsCompleted}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="monthly" className="space-y-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Calendar className="h-4 w-4" />
              Comidas completadas por semana
            </div>

            {/* Weekly bars */}
            <div className="space-y-3">
              {monthlyData.slice(-8).map((week, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-16 shrink-0">{week.week}</span>
                  <div className="flex-1 h-8 bg-muted/50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full flex items-center justify-end px-3 transition-all duration-500"
                      style={{ width: `${Math.max((week.mealsCompleted / maxWeeklyMeals) * 100, 5)}%` }}
                    >
                      {week.mealsCompleted > 0 && (
                        <span className="text-xs font-bold text-primary-foreground">{week.mealsCompleted}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 w-16 shrink-0">
                    <Target className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-muted-foreground">{week.daysActive}d</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Monthly summary */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <p className="text-xl font-bold text-primary">
                  {monthlyData.reduce((sum, w) => sum + w.mealsCompleted, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Total comidas</p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <p className="text-xl font-bold text-primary">
                  {Math.round(monthlyData.reduce((sum, w) => sum + w.calories, 0) / 1000)}k
                </p>
                <p className="text-xs text-muted-foreground">Calorías totales</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
