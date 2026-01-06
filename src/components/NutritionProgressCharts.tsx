import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Calendar, Utensils, Flame, Droplets, Beef, Wheat, Apple, Target, Sparkles, Star, ChevronLeft, ChevronRight, Camera, CheckCircle2 } from "lucide-react";
import { startOfWeek, format, eachDayOfInterval, endOfWeek, subWeeks, subMonths, isSameWeek, isSameDay, addDays, subDays } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Progress } from "@/components/ui/progress";
import { useNutritionGoals } from "@/hooks/useNutritionGoals";

interface MealDetail {
  name: string;
  type: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  isScanned?: boolean;
}

interface DayDetail {
  date: Date;
  dateKey: string;
  dayName: string;
  shortDay: string;
  mealsCompleted: number;
  scansCount: number;
  totalMeals: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  meals: MealDetail[];
}

interface WeekSummary {
  week: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  mealsCompleted: number;
  daysActive: number;
}

export const NutritionProgressCharts = () => {
  const { language } = useLanguage();
  const locale = language === "es" ? es : enUS;
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weeklyData, setWeeklyData] = useState<DayDetail[]>([]);
  const [monthlyData, setMonthlyData] = useState<WeekSummary[]>([]);
  const [weekTotals, setWeekTotals] = useState({ calories: 0, protein: 0, carbs: 0, fats: 0, meals: 0, avgCalories: 0 });
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  
  const { goals: nutritionGoals } = useNutritionGoals(userId);

  // Use personalized goals or fallback to defaults
  const dailyGoals = {
    calories: nutritionGoals.calories,
    protein: nutritionGoals.protein,
    carbs: nutritionGoals.carbs,
    fats: nutritionGoals.fats,
    meals: 3
  };

  useEffect(() => {
    loadProgressData();
  }, [selectedDate]);

  const loadProgressData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    setLoading(true);
    try {
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
      const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
      const dayNames = language === "es" 
        ? ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
        : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      
      // Get meal completions with meal details
      const { data: completions } = await supabase
        .from("meal_completions")
        .select(`
          completed_at,
          meals (
            name,
            meal_type,
            calories,
            protein,
            carbs,
            fats
          )
        `)
        .eq("user_id", user.id)
        .gte("completed_at", weekStart.toISOString())
        .lte("completed_at", weekEnd.toISOString())
        .order("completed_at", { ascending: true });

      // Get food scans
      const { data: foodScans } = await supabase
        .from("food_scans")
        .select("*")
        .eq("user_id", user.id)
        .gte("scanned_at", weekStart.toISOString())
        .lte("scanned_at", weekEnd.toISOString())
        .order("scanned_at", { ascending: true });

      // Process daily data
      const dailyMap = new Map<string, DayDetail>();
      weekDays.forEach((day, index) => {
        const dateKey = format(day, "yyyy-MM-dd");
        dailyMap.set(dateKey, {
          date: day,
          dateKey,
          dayName: format(day, "EEEE", { locale }),
          shortDay: dayNames[index],
          mealsCompleted: 0,
          scansCount: 0,
          totalMeals: 3,
          calories: 0,
          protein: 0,
          carbs: 0,
          fats: 0,
          meals: [],
        });
      });

      let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFats = 0, totalMeals = 0;

      // Helper to convert UTC timestamp to local date key
      const toLocalDateKey = (utcTimestamp: string) => {
        const date = new Date(utcTimestamp);
        return format(date, "yyyy-MM-dd");
      };

      completions?.forEach((completion: any) => {
        const dateKey = toLocalDateKey(completion.completed_at);
        const existing = dailyMap.get(dateKey);
        if (existing && completion.meals) {
          existing.mealsCompleted += 1;
          existing.calories += completion.meals.calories || 0;
          existing.protein += completion.meals.protein || 0;
          existing.carbs += completion.meals.carbs || 0;
          existing.fats += completion.meals.fats || 0;
          existing.meals.push({
            name: completion.meals.name,
            type: completion.meals.meal_type,
            calories: completion.meals.calories || 0,
            protein: completion.meals.protein || 0,
            carbs: completion.meals.carbs || 0,
            fats: completion.meals.fats || 0,
            isScanned: false,
          });
          
          totalCalories += completion.meals.calories || 0;
          totalProtein += completion.meals.protein || 0;
          totalCarbs += completion.meals.carbs || 0;
          totalFats += completion.meals.fats || 0;
          totalMeals += 1;
        }
      });

      // Process food scans
      foodScans?.forEach((scan: any) => {
        const dateKey = toLocalDateKey(scan.scanned_at);
        const existing = dailyMap.get(dateKey);
        if (existing) {
          existing.scansCount += 1;
          existing.calories += scan.calories || 0;
          existing.protein += scan.protein || 0;
          existing.carbs += scan.carbs || 0;
          existing.fats += scan.fat || 0;
          existing.meals.push({
            name: scan.dish_name,
            type: language === "es" ? "Escaneado" : "Scanned",
            calories: scan.calories || 0,
            protein: scan.protein || 0,
            carbs: scan.carbs || 0,
            fats: scan.fat || 0,
            isScanned: true,
          });
          
          totalCalories += scan.calories || 0;
          totalProtein += scan.protein || 0;
          totalCarbs += scan.carbs || 0;
          totalFats += scan.fat || 0;
          totalMeals += 1;
        }
      });

      const daysWithData = Array.from(dailyMap.values()).filter(d => d.mealsCompleted > 0 || d.scansCount > 0).length;
      
      setWeeklyData(Array.from(dailyMap.values()));
      setWeekTotals({ 
        calories: totalCalories, 
        protein: totalProtein, 
        carbs: totalCarbs, 
        fats: totalFats, 
        meals: totalMeals,
        avgCalories: daysWithData > 0 ? Math.round(totalCalories / daysWithData) : 0
      });

      // Load monthly data
      const threeMonthsAgo = subMonths(new Date(), 3);
      const { data: monthlyCompletions } = await supabase
        .from("meal_completions")
        .select(`
          completed_at,
          meals (calories, protein, carbs, fats)
        `)
        .eq("user_id", user.id)
        .gte("completed_at", threeMonthsAgo.toISOString())
        .order("completed_at", { ascending: true });

      // Also get monthly food scans
      const { data: monthlyScans } = await supabase
        .from("food_scans")
        .select("scanned_at, calories, protein, carbs, fat")
        .eq("user_id", user.id)
        .gte("scanned_at", threeMonthsAgo.toISOString())
        .order("scanned_at", { ascending: true });

      const weeklyMap = new Map<string, WeekSummary>();
      let currentWeekStart = startOfWeek(threeMonthsAgo, { weekStartsOn: 1 });
      
      while (currentWeekStart <= new Date()) {
        const weekKey = format(currentWeekStart, "yyyy-MM-dd");
        weeklyMap.set(weekKey, {
          week: format(currentWeekStart, "dd MMM", { locale }),
          calories: 0, protein: 0, carbs: 0, fats: 0, mealsCompleted: 0, daysActive: 0,
        });
        currentWeekStart = addDays(currentWeekStart, 7);
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
          
          if (!daysPerWeek.has(weekKey)) daysPerWeek.set(weekKey, new Set());
          daysPerWeek.get(weekKey)?.add(dayKey);
        }
      });

      // Process monthly food scans
      monthlyScans?.forEach((scan: any) => {
        const scanDate = new Date(scan.scanned_at);
        const weekStartDate = startOfWeek(scanDate, { weekStartsOn: 1 });
        const weekKey = format(weekStartDate, "yyyy-MM-dd");
        const dayKey = scan.scanned_at.split('T')[0];
        
        const existing = weeklyMap.get(weekKey);
        if (existing) {
          existing.calories += scan.calories || 0;
          existing.protein += scan.protein || 0;
          existing.carbs += scan.carbs || 0;
          existing.fats += scan.fat || 0;
          existing.mealsCompleted += 1;
          
          if (!daysPerWeek.has(weekKey)) daysPerWeek.set(weekKey, new Set());
          daysPerWeek.get(weekKey)?.add(dayKey);
        }
      });

      daysPerWeek.forEach((days, weekKey) => {
        const existing = weeklyMap.get(weekKey);
        if (existing) existing.daysActive = days.size;
      });

      setMonthlyData(Array.from(weeklyMap.values()).slice(-12));
    } catch (error) {
      console.error("Error loading progress data:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectedDayData = weeklyData.find(d => isSameDay(d.date, selectedDate));
  const maxMeals = Math.max(...weeklyData.map(d => d.mealsCompleted), 1);

  const navigateWeek = (direction: 'prev' | 'next') => {
    setSelectedDate(prev => direction === 'prev' ? subDays(prev, 7) : addDays(prev, 7));
  };

  if (loading) {
    return (
      <Card className="border-2">
        <CardContent className="p-6">
          <div className="h-[300px] flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-primary via-primary/80 to-secondary overflow-hidden rounded-2xl pt-safe-top">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div 
            className="absolute top-4 left-6"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="h-4 w-4 text-white/60" />
          </motion.div>
          <motion.div 
            className="absolute top-6 right-8"
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
          >
            <Star className="h-3 w-3 text-white/50" />
          </motion.div>
        </div>

        <div className="relative px-4 py-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  {language === "es" ? "Resumen Nutricional" : "Nutrition Summary"}
                </h2>
                <p className="text-white/70 text-xs">
                  {format(startOfWeek(selectedDate, { weekStartsOn: 1 }), "dd MMM", { locale })} - {format(endOfWeek(selectedDate, { weekStartsOn: 1 }), "dd MMM yyyy", { locale })}
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={() => navigateWeek('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={() => navigateWeek('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Week Stats Grid */}
          <div className="grid grid-cols-4 gap-2">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center"
            >
              <Flame className="h-5 w-5 text-orange-300 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{(weekTotals.calories / 1000).toFixed(1)}k</p>
              <p className="text-[10px] text-white/70">{language === "es" ? "Calorías" : "Calories"}</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center"
            >
              <Beef className="h-5 w-5 text-red-300 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{weekTotals.protein}g</p>
              <p className="text-[10px] text-white/70">{language === "es" ? "Proteína" : "Protein"}</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center"
            >
              <Wheat className="h-5 w-5 text-amber-300 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{weekTotals.carbs}g</p>
              <p className="text-[10px] text-white/70">{language === "es" ? "Carbos" : "Carbs"}</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center"
            >
              <Utensils className="h-5 w-5 text-green-300 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{weekTotals.meals}</p>
              <p className="text-[10px] text-white/70">{language === "es" ? "Comidas" : "Meals"}</p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Day Selector */}
      <Card className="border-2">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">{language === "es" ? "Selecciona un día" : "Select a day"}</span>
          </div>
          <div className="flex justify-between gap-1">
            {weeklyData.map((day, index) => {
              const isSelected = isSameDay(day.date, selectedDate);
              const isToday = isSameDay(day.date, new Date());
              const hasData = day.mealsCompleted > 0 || day.scansCount > 0;
              
              return (
                <motion.button
                  key={day.dateKey}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedDate(day.date)}
                  className={`
                    flex-1 flex flex-col items-center py-2 px-1 rounded-xl transition-all
                    ${isSelected 
                      ? 'bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg' 
                      : hasData 
                        ? 'bg-primary/10 hover:bg-primary/20' 
                        : 'bg-muted/50 hover:bg-muted'}
                  `}
                >
                  <span className={`text-[10px] font-medium ${isSelected ? 'text-white/80' : 'text-muted-foreground'}`}>
                    {day.shortDay}
                  </span>
                  <span className={`text-sm font-bold ${isSelected ? 'text-white' : ''}`}>
                    {format(day.date, "d")}
                  </span>
                  {hasData && (
                    <div className={`w-1.5 h-1.5 rounded-full mt-1 ${isSelected ? 'bg-white' : 'bg-primary'}`} />
                  )}
                  {isToday && !isSelected && (
                    <div className="w-1.5 h-1.5 rounded-full mt-1 bg-secondary" />
                  )}
                </motion.button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Daily Detail View */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedDate.toISOString()}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="border-2">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg capitalize">{selectedDayData?.dayName || format(selectedDate, "EEEE", { locale })}</h3>
                  <p className="text-sm text-muted-foreground">{format(selectedDate, "d MMMM yyyy", { locale })}</p>
                </div>
                {selectedDayData && (selectedDayData.mealsCompleted > 0 || selectedDayData.scansCount > 0) && (
                  <div className="flex gap-2">
                    {selectedDayData.mealsCompleted > 0 && (
                      <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold shadow-sm">
                        {selectedDayData.mealsCompleted}/{selectedDayData.totalMeals} {language === "es" ? "comidas" : "meals"}
                      </div>
                    )}
                    {selectedDayData.scansCount > 0 && (
                      <div className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-semibold shadow-sm">
                        {selectedDayData.scansCount} {language === "es" ? "escaneados" : "scanned"}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {selectedDayData && (selectedDayData.mealsCompleted > 0 || selectedDayData.scansCount > 0) ? (
                <div className="space-y-4">
                  {/* Calories Progress */}
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Flame className="h-5 w-5 text-orange-500" />
                        <span className="font-semibold">{language === "es" ? "Calorías" : "Calories"}</span>
                      </div>
                      <span className="text-xl font-bold text-orange-600 dark:text-orange-400">
                        {selectedDayData.calories.toLocaleString()}
                      </span>
                    </div>
                    <Progress 
                      value={Math.min((selectedDayData.calories / dailyGoals.calories) * 100, 100)} 
                      className="h-3"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {Math.round((selectedDayData.calories / dailyGoals.calories) * 100)}% {language === "es" ? "del objetivo diario" : "of daily goal"} ({dailyGoals.calories} cal)
                    </p>
                  </div>

                  {/* Macros Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-red-50 dark:bg-red-950/20 rounded-xl p-3">
                      <div className="flex items-center gap-1 mb-2">
                        <Beef className="h-4 w-4 text-red-500" />
                        <span className="text-xs font-medium text-red-600 dark:text-red-400">{language === "es" ? "Proteína" : "Protein"}</span>
                      </div>
                      <p className="text-xl font-bold text-red-600 dark:text-red-400">{selectedDayData.protein}g</p>
                      <Progress 
                        value={Math.min((selectedDayData.protein / dailyGoals.protein) * 100, 100)} 
                        className="h-1.5 mt-2"
                      />
                      <p className="text-[10px] text-muted-foreground mt-1">{Math.round((selectedDayData.protein / dailyGoals.protein) * 100)}%</p>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-3">
                      <div className="flex items-center gap-1 mb-2">
                        <Wheat className="h-4 w-4 text-amber-500" />
                        <span className="text-xs font-medium text-amber-600 dark:text-amber-400">{language === "es" ? "Carbos" : "Carbs"}</span>
                      </div>
                      <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{selectedDayData.carbs}g</p>
                      <Progress 
                        value={Math.min((selectedDayData.carbs / dailyGoals.carbs) * 100, 100)} 
                        className="h-1.5 mt-2"
                      />
                      <p className="text-[10px] text-muted-foreground mt-1">{Math.round((selectedDayData.carbs / dailyGoals.carbs) * 100)}%</p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-3">
                      <div className="flex items-center gap-1 mb-2">
                        <Droplets className="h-4 w-4 text-blue-500" />
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">{language === "es" ? "Grasas" : "Fats"}</span>
                      </div>
                      <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{selectedDayData.fats}g</p>
                      <Progress 
                        value={Math.min((selectedDayData.fats / dailyGoals.fats) * 100, 100)} 
                        className="h-1.5 mt-2"
                      />
                      <p className="text-[10px] text-muted-foreground mt-1">{Math.round((selectedDayData.fats / dailyGoals.fats) * 100)}%</p>
                    </div>
                  </div>

                  {/* Meals List */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <Apple className="h-4 w-4 text-green-500" />
                      {language === "es" ? "Registro del día" : "Day's log"}
                    </h4>
                    
                    {/* Separate Plan Meals and Scanned Foods */}
                    {selectedDayData.meals.filter(m => !m.isScanned).length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                          <span>{language === "es" ? "Del plan semanal" : "From meal plan"}</span>
                        </div>
                        {selectedDayData.meals.filter(m => !m.isScanned).map((meal, idx) => (
                          <motion.div
                            key={`plan-${idx}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-primary/5 border border-primary/10 rounded-xl p-3 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Utensils className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{meal.name}</p>
                                <p className="text-xs text-muted-foreground capitalize">{meal.type}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-primary">{meal.calories} cal</p>
                              <p className="text-[10px] text-muted-foreground">
                                P:{meal.protein}g C:{meal.carbs}g G:{meal.fats}g
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                    
                    {/* Scanned Foods */}
                    {selectedDayData.meals.filter(m => m.isScanned).length > 0 && (
                      <div className="space-y-2 mt-3">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Camera className="h-3.5 w-3.5 text-secondary" />
                          <span>{language === "es" ? "Comidas escaneadas" : "Scanned foods"}</span>
                        </div>
                        {selectedDayData.meals.filter(m => m.isScanned).map((meal, idx) => (
                          <motion.div
                            key={`scan-${idx}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-secondary/5 border border-secondary/10 rounded-xl p-3 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                                <Camera className="h-4 w-4 text-secondary" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{meal.name}</p>
                                <p className="text-xs text-secondary">{language === "es" ? "Escaneado" : "Scanned"}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-secondary">{meal.calories} cal</p>
                              <p className="text-[10px] text-muted-foreground">
                                P:{meal.protein}g C:{meal.carbs}g G:{meal.fats}g
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="bg-muted/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <Calendar className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">
                    {language === "es" ? "No hay datos para este día" : "No data for this day"}
                  </p>
                  <p className="text-sm text-muted-foreground/70">
                    {language === "es" ? "Completa comidas para ver tu progreso" : "Complete meals to see your progress"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Monthly View */}
      <Card className="border-2">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">{language === "es" ? "Últimas 8 semanas" : "Last 8 weeks"}</span>
          </div>
          
          <div className="space-y-2">
            {monthlyData.slice(-8).map((week, index) => {
              const maxWeeklyMeals = Math.max(...monthlyData.map(d => d.mealsCompleted), 1);
              return (
                <motion.div 
                  key={index} 
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <span className="text-xs text-muted-foreground w-14 shrink-0">{week.week}</span>
                  <div className="flex-1 h-7 bg-muted/30 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-end px-2"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max((week.mealsCompleted / maxWeeklyMeals) * 100, 5)}%` }}
                      transition={{ delay: index * 0.05 + 0.2, duration: 0.5 }}
                    >
                      {week.mealsCompleted > 0 && (
                        <span className="text-xs font-bold text-white">{week.mealsCompleted}</span>
                      )}
                    </motion.div>
                  </div>
                  <div className="flex items-center gap-1 w-12 shrink-0">
                    <div className="w-2 h-2 rounded-full bg-secondary" />
                    <span className="text-xs text-muted-foreground">{week.daysActive}d</span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Summary Footer */}
          <div className="grid grid-cols-3 gap-2 pt-4 mt-4 border-t">
            <div className="text-center p-2 bg-primary/5 rounded-lg">
              <p className="text-lg font-bold text-primary">
                {monthlyData.reduce((sum, w) => sum + w.mealsCompleted, 0)}
              </p>
              <p className="text-[10px] text-muted-foreground">{language === "es" ? "Comidas" : "Meals"}</p>
            </div>
            <div className="text-center p-2 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
              <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                {Math.round(monthlyData.reduce((sum, w) => sum + w.calories, 0) / 1000)}k
              </p>
              <p className="text-[10px] text-muted-foreground">{language === "es" ? "Calorías" : "Calories"}</p>
            </div>
            <div className="text-center p-2 bg-red-50 dark:bg-red-950/20 rounded-lg">
              <p className="text-lg font-bold text-red-600 dark:text-red-400">
                {monthlyData.reduce((sum, w) => sum + w.protein, 0)}g
              </p>
              <p className="text-[10px] text-muted-foreground">{language === "es" ? "Proteína" : "Protein"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
