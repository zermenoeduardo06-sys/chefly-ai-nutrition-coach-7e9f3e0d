import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Calendar } from "lucide-react";
import { startOfWeek, startOfMonth, format, eachDayOfInterval, endOfWeek, endOfMonth, subWeeks, subMonths } from "date-fns";
import { es } from "date-fns/locale";

interface NutritionData {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  mealsCompleted: number;
}

export const NutritionProgressCharts = () => {
  const [weeklyData, setWeeklyData] = useState<NutritionData[]>([]);
  const [monthlyData, setMonthlyData] = useState<NutritionData[]>([]);
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
      const { data: weeklyCompletions } = await supabase
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

      // Get data for the last 3 months
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

      // Process weekly data (last 28 days)
      const weekStart = startOfWeek(fourWeeksAgo, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
      const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
      
      const weeklyMap = new Map<string, NutritionData>();
      weekDays.forEach(day => {
        const dateKey = format(day, "yyyy-MM-dd");
        weeklyMap.set(dateKey, {
          date: format(day, "EEE dd", { locale: es }),
          calories: 0,
          protein: 0,
          carbs: 0,
          fats: 0,
          mealsCompleted: 0,
        });
      });

      weeklyCompletions?.forEach((completion: any) => {
        const dateKey = completion.completed_at.split('T')[0];
        const existing = weeklyMap.get(dateKey);
        if (existing && completion.meals) {
          existing.calories += completion.meals.calories || 0;
          existing.protein += completion.meals.protein || 0;
          existing.carbs += completion.meals.carbs || 0;
          existing.fats += completion.meals.fats || 0;
          existing.mealsCompleted += 1;
        }
      });

      setWeeklyData(Array.from(weeklyMap.values()));

      // Process monthly data (group by week)
      const monthStart = startOfMonth(threeMonthsAgo);
      const monthEnd = endOfMonth(new Date());
      
      const monthlyMap = new Map<string, NutritionData>();
      
      let currentWeekStart = startOfWeek(monthStart, { weekStartsOn: 1 });
      while (currentWeekStart <= monthEnd) {
        const weekKey = format(currentWeekStart, "yyyy-MM-dd");
        monthlyMap.set(weekKey, {
          date: format(currentWeekStart, "dd MMM", { locale: es }),
          calories: 0,
          protein: 0,
          carbs: 0,
          fats: 0,
          mealsCompleted: 0,
        });
        currentWeekStart = new Date(currentWeekStart.setDate(currentWeekStart.getDate() + 7));
      }

      monthlyCompletions?.forEach((completion: any) => {
        const completionDate = new Date(completion.completed_at);
        const weekStart = startOfWeek(completionDate, { weekStartsOn: 1 });
        const weekKey = format(weekStart, "yyyy-MM-dd");
        const existing = monthlyMap.get(weekKey);
        if (existing && completion.meals) {
          existing.calories += completion.meals.calories || 0;
          existing.protein += completion.meals.protein || 0;
          existing.carbs += completion.meals.carbs || 0;
          existing.fats += completion.meals.fats || 0;
          existing.mealsCompleted += 1;
        }
      });

      setMonthlyData(Array.from(monthlyMap.values()));
    } catch (error) {
      console.error("Error loading progress data:", error);
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-4">
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(0)}
              {entry.name === "Comidas" ? "" : "g"}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Progreso Nutricional
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">Cargando datos...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Progreso Nutricional
        </CardTitle>
        <CardDescription>
          Visualiza tu avance semanal y mensual
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="weekly" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="weekly">Semanal</TabsTrigger>
            <TabsTrigger value="monthly">Mensual</TabsTrigger>
          </TabsList>

          <TabsContent value="weekly" className="space-y-4">
            <div className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4" />
              Últimos 28 días
            </div>

            {/* Calories and Macros Line Chart */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Calorías y Macronutrientes</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="calories" 
                    name="Calorías" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="protein" 
                    name="Proteína (g)" 
                    stroke="hsl(var(--chart-1))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-1))", r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="carbs" 
                    name="Carbohidratos (g)" 
                    stroke="hsl(var(--chart-2))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-2))", r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="fats" 
                    name="Grasas (g)" 
                    stroke="hsl(var(--chart-3))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-3))", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Meals Completed Bar Chart */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Comidas Completadas</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar 
                    dataKey="mealsCompleted" 
                    name="Comidas" 
                    fill="hsl(var(--chart-4))" 
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="monthly" className="space-y-4">
            <div className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4" />
              Últimos 3 meses (agrupado por semana)
            </div>

            {/* Calories and Macros Line Chart */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Calorías y Macronutrientes</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="calories" 
                    name="Calorías" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="protein" 
                    name="Proteína (g)" 
                    stroke="hsl(var(--chart-1))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-1))", r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="carbs" 
                    name="Carbohidratos (g)" 
                    stroke="hsl(var(--chart-2))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-2))", r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="fats" 
                    name="Grasas (g)" 
                    stroke="hsl(var(--chart-3))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-3))", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Meals Completed Bar Chart */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Comidas Completadas por Semana</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar 
                    dataKey="mealsCompleted" 
                    name="Comidas" 
                    fill="hsl(var(--chart-4))" 
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
