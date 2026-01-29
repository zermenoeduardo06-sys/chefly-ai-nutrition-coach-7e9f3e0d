import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, Flame, Droplets, Beef, Wheat, ChevronLeft, ChevronRight, Target, Check } from "lucide-react";
import { startOfWeek, format, eachDayOfInterval, endOfWeek, isSameDay, addDays, subDays, isToday } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNutritionGoals } from "@/hooks/useNutritionGoals";
import { Card3D, Card3DContent } from "@/components/ui/card-3d";
import { Icon3D } from "@/components/ui/icon-3d";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";

interface DayDetail {
  date: Date;
  dateKey: string;
  dayName: string;
  shortDay: string;
  dayNumber: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  mealsCount: number;
}

interface WeeklyNutritionData {
  completions: any[] | null;
  foodScans: any[] | null;
}

// Fetch function for React Query
async function fetchWeeklyNutrition(userId: string, weekStart: Date, weekEnd: Date): Promise<WeeklyNutritionData> {
  const [completions, foodScans] = await Promise.all([
    supabase
      .from("meal_completions")
      .select(`completed_at, meals (calories, protein, carbs, fats)`)
      .eq("user_id", userId)
      .gte("completed_at", weekStart.toISOString())
      .lte("completed_at", weekEnd.toISOString()),
    supabase
      .from("food_scans")
      .select("scanned_at, calories, protein, carbs, fat")
      .eq("user_id", userId)
      .gte("scanned_at", weekStart.toISOString())
      .lte("scanned_at", weekEnd.toISOString()),
  ]);
  return { completions: completions.data, foodScans: foodScans.data };
}

export const NutritionProgressCharts = () => {
  const { language } = useLanguage();
  const locale = language === "es" ? es : enUS;
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Get userId from AuthContext
  const { user } = useAuth();
  const userId = user?.id || null;
  
  const { goals: nutritionGoals } = useNutritionGoals(userId);

  const texts = {
    es: {
      todayProgress: "Tu progreso de hoy",
      weeklyView: "Vista semanal",
      calories: "Calorías",
      protein: "Proteína",
      carbs: "Carbos",
      fats: "Grasas",
      of: "de",
      kcal: "kcal",
      g: "g",
      meals: "comidas",
      noData: "Sin datos",
      awesome: "¡Excelente!",
      keepGoing: "¡Sigue así!",
      almostThere: "¡Casi llegas!",
      startDay: "¡Empieza tu día!",
      thisWeek: "Esta semana",
      dailyAvg: "Promedio diario",
    },
    en: {
      todayProgress: "Today's progress",
      weeklyView: "Weekly view",
      calories: "Calories",
      protein: "Protein",
      carbs: "Carbs",
      fats: "Fats",
      of: "of",
      kcal: "kcal",
      g: "g",
      meals: "meals",
      noData: "No data",
      awesome: "Awesome!",
      keepGoing: "Keep going!",
      almostThere: "Almost there!",
      startDay: "Start your day!",
      thisWeek: "This week",
      dailyAvg: "Daily average",
    },
  };
  const t = texts[language];

  // Calculate week boundaries
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekKey = format(selectedDate, 'yyyy-ww');

  // React Query for weekly data
  const { data: weeklyRawData, isLoading } = useQuery({
    queryKey: ['nutritionProgress', 'weekly', userId, weekKey],
    queryFn: () => fetchWeeklyNutrition(userId!, weekStart, weekEnd),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Process weekly data into daily details
  const weeklyData = useMemo(() => {
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
    const dayNames = language === "es" 
      ? ["L", "M", "X", "J", "V", "S", "D"]
      : ["M", "T", "W", "T", "F", "S", "S"];
    
    const dailyMap = new Map<string, DayDetail>();
    weekDays.forEach((day, index) => {
      const dateKey = format(day, "yyyy-MM-dd");
      dailyMap.set(dateKey, {
        date: day,
        dateKey,
        dayName: format(day, "EEEE", { locale }),
        shortDay: dayNames[index],
        dayNumber: format(day, "d"),
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        mealsCount: 0,
      });
    });

    const toLocalDateKey = (utcTimestamp: string) => format(new Date(utcTimestamp), "yyyy-MM-dd");

    weeklyRawData?.completions?.forEach((completion: any) => {
      const dateKey = toLocalDateKey(completion.completed_at);
      const existing = dailyMap.get(dateKey);
      if (existing && completion.meals) {
        existing.calories += completion.meals.calories || 0;
        existing.protein += completion.meals.protein || 0;
        existing.carbs += completion.meals.carbs || 0;
        existing.fats += completion.meals.fats || 0;
        existing.mealsCount += 1;
      }
    });

    weeklyRawData?.foodScans?.forEach((scan: any) => {
      const dateKey = toLocalDateKey(scan.scanned_at);
      const existing = dailyMap.get(dateKey);
      if (existing) {
        existing.calories += scan.calories || 0;
        existing.protein += scan.protein || 0;
        existing.carbs += scan.carbs || 0;
        existing.fats += scan.fat || 0;
        existing.mealsCount += 1;
      }
    });

    return Array.from(dailyMap.values());
  }, [weeklyRawData, weekStart, weekEnd, language, locale]);

  const selectedDayData = weeklyData.find(d => isSameDay(d.date, selectedDate));
  
  const caloriePercentage = useMemo(() => {
    if (!selectedDayData || !nutritionGoals.calories) return 0;
    return Math.min((selectedDayData.calories / nutritionGoals.calories) * 100, 100);
  }, [selectedDayData, nutritionGoals.calories]);

  const getMotivationalMessage = () => {
    if (caloriePercentage >= 90) return t.awesome;
    if (caloriePercentage >= 60) return t.keepGoing;
    if (caloriePercentage >= 30) return t.almostThere;
    return t.startDay;
  };

  const weekTotals = useMemo(() => {
    const daysWithData = weeklyData.filter(d => d.calories > 0);
    const totalCals = weeklyData.reduce((sum, d) => sum + d.calories, 0);
    return {
      totalCalories: totalCals,
      avgCalories: daysWithData.length > 0 ? Math.round(totalCals / daysWithData.length) : 0,
      activeDays: daysWithData.length,
    };
  }, [weeklyData]);

  const navigateWeek = (direction: 'prev' | 'next') => {
    setSelectedDate(prev => direction === 'prev' ? subDays(prev, 7) : addDays(prev, 7));
  };

  // Circular progress component
  const CircularProgress = ({ percentage, size = 180, strokeWidth = 14 }: { percentage: number; size?: number; strokeWidth?: number }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;
    
    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--secondary))" />
            </linearGradient>
          </defs>
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          >
            <Flame className="h-6 w-6 text-primary mb-1" />
          </motion.div>
          <motion.span 
            className="text-3xl font-black text-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {selectedDayData?.calories || 0}
          </motion.span>
          <span className="text-xs text-muted-foreground font-medium">
            {t.of} {nutritionGoals.calories} {t.kcal}
          </span>
        </div>
      </div>
    );
  };

  // Macro bar component
  const MacroBar = ({ 
    icon: Icon, 
    label, 
    value, 
    goal, 
    color, 
    delay 
  }: { 
    icon: any; 
    label: string; 
    value: number; 
    goal: number; 
    color: string;
    delay: number;
  }) => {
    const percentage = Math.min((value / goal) * 100, 100);
    const isComplete = percentage >= 100;
    
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay }}
        className="flex items-center gap-3"
      >
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center",
          isComplete ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-muted"
        )}>
          {isComplete ? (
            <Check className="h-5 w-5 text-emerald-500" />
          ) : (
            <Icon className={cn("h-5 w-5", color)} />
          )}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-semibold">{label}</span>
            <span className="text-sm text-muted-foreground">
              <span className="font-bold text-foreground">{value}</span>/{goal}{t.g}
            </span>
          </div>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className={cn(
                "h-full rounded-full",
                isComplete ? "bg-emerald-500" : "bg-gradient-to-r from-primary to-secondary"
              )}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.8, delay: delay + 0.2, ease: "easeOut" }}
            />
          </div>
        </div>
      </motion.div>
    );
  };

  // Show skeleton only on initial load without cached data
  if (isLoading && weeklyData.length === 0) {
    return (
      <Card3D variant="default" className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="flex justify-center">
            <Skeleton className="h-44 w-44 rounded-full" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </Card3D>
    );
  }

  return (
    <div className="space-y-4">
      {/* Hero Card - Today's Progress */}
      <Card3D variant="elevated">
        <Card3DContent className="p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Icon3D icon={Target} color="primary" size="md" />
              <div>
                <h2 className="text-lg font-bold">{t.todayProgress}</h2>
                <p className="text-xs text-muted-foreground">
                  {selectedDayData?.dayName} {format(selectedDate, "d MMM", { locale })}
                </p>
              </div>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold"
            >
              {getMotivationalMessage()}
            </motion.div>
          </div>

          {/* Circular Progress - Center Stage */}
          <div className="flex justify-center mb-6">
            <CircularProgress percentage={caloriePercentage} />
          </div>

          {/* Macro Bars */}
          <div className="space-y-3">
            <MacroBar 
              icon={Beef} 
              label={t.protein} 
              value={selectedDayData?.protein || 0} 
              goal={nutritionGoals.protein}
              color="text-rose-500"
              delay={0}
            />
            <MacroBar 
              icon={Wheat} 
              label={t.carbs} 
              value={selectedDayData?.carbs || 0} 
              goal={nutritionGoals.carbs}
              color="text-amber-500"
              delay={0.1}
            />
            <MacroBar 
              icon={Droplets} 
              label={t.fats} 
              value={selectedDayData?.fats || 0} 
              goal={nutritionGoals.fats}
              color="text-sky-500"
              delay={0.2}
            />
          </div>
        </Card3DContent>
      </Card3D>

      {/* Weekly Overview */}
      <Card3D variant="default">
        <Card3DContent className="p-4">
          {/* Week Navigation */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Icon3D icon={TrendingUp} color="secondary" size="sm" />
              <span className="font-bold">{t.weeklyView}</span>
            </div>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => navigateWeek('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground px-2">
                {format(weekStart, "d MMM", { locale })} - {format(weekEnd, "d MMM", { locale })}
              </span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => navigateWeek('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Visual Week Bar Chart */}
          <div className="flex items-end justify-between gap-2 h-32 mb-4">
            {weeklyData.map((day, index) => {
              const percentage = nutritionGoals.calories > 0 
                ? Math.min((day.calories / nutritionGoals.calories) * 100, 100) 
                : 0;
              const isSelected = isSameDay(day.date, selectedDate);
              const hasData = day.calories > 0;
              const isTodayDate = isToday(day.date);
              
              return (
                <motion.button
                  key={day.dateKey}
                  onClick={() => setSelectedDate(day.date)}
                  className="flex-1 flex flex-col items-center gap-1"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Bar */}
                  <div className={cn(
                    "w-full rounded-xl transition-all relative overflow-hidden",
                    isSelected ? "bg-primary/20" : "bg-muted/50"
                  )} style={{ height: 80 }}>
                    <motion.div
                      className={cn(
                        "absolute bottom-0 left-0 right-0 rounded-xl",
                        isSelected 
                          ? "bg-gradient-to-t from-primary to-primary/70" 
                          : hasData 
                            ? "bg-gradient-to-t from-muted-foreground/30 to-muted-foreground/10"
                            : "bg-transparent"
                      )}
                      initial={{ height: 0 }}
                      animate={{ height: `${percentage}%` }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                    />
                    {isSelected && hasData && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute -top-6 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap"
                      >
                        {day.calories}
                      </motion.div>
                    )}
                  </div>
                  
                  {/* Day label */}
                  <span className={cn(
                    "text-xs font-medium transition-colors",
                    isSelected ? "text-primary" : "text-muted-foreground"
                  )}>
                    {day.shortDay}
                  </span>
                  
                  {/* Date number */}
                  <span className={cn(
                    "text-[10px] w-6 h-6 rounded-full flex items-center justify-center transition-all",
                    isSelected 
                      ? "bg-primary text-primary-foreground font-bold" 
                      : isTodayDate
                        ? "bg-secondary/20 text-secondary font-semibold"
                        : "text-muted-foreground"
                  )}>
                    {day.dayNumber}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Week Summary */}
          <div className="flex items-center justify-between px-2 pt-3 border-t border-border/50">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">{t.thisWeek}</p>
              <p className="text-lg font-bold">{weekTotals.totalCalories.toLocaleString()} <span className="text-xs text-muted-foreground font-normal">{t.kcal}</span></p>
            </div>
            <div className="h-8 w-px bg-border/50" />
            <div className="text-center">
              <p className="text-xs text-muted-foreground">{t.dailyAvg}</p>
              <p className="text-lg font-bold">{weekTotals.avgCalories.toLocaleString()} <span className="text-xs text-muted-foreground font-normal">{t.kcal}</span></p>
            </div>
            <div className="h-8 w-px bg-border/50" />
            <div className="text-center">
              <p className="text-xs text-muted-foreground">{language === 'es' ? 'Días' : 'Days'}</p>
              <p className="text-lg font-bold">{weekTotals.activeDays}<span className="text-xs text-muted-foreground font-normal">/7</span></p>
            </div>
          </div>
        </Card3DContent>
      </Card3D>
    </div>
  );
};
