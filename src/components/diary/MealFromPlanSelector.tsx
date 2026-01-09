import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MealImageWithSkeleton } from "@/components/MealImageWithSkeleton";

interface Meal {
  id: string;
  name: string;
  image_url: string | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fats: number | null;
  meal_type: string;
}

interface MealFromPlanSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  userId: string | undefined;
  dayOfWeek: number;
  onMealLogged: () => void;
}

const mealTypeMap = {
  breakfast: "desayuno",
  lunch: "almuerzo",
  dinner: "cena",
  snack: "snack",
};

const mealTypeLabels = {
  breakfast: { es: "Desayuno", en: "Breakfast" },
  lunch: { es: "Almuerzo", en: "Lunch" },
  dinner: { es: "Cena", en: "Dinner" },
  snack: { es: "Snack", en: "Snack" },
};

export default function MealFromPlanSelector({
  open,
  onOpenChange,
  mealType,
  userId,
  dayOfWeek,
  onMealLogged,
}: MealFromPlanSelectorProps) {
  const { language } = useLanguage();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [logging, setLogging] = useState<string | null>(null);

  useEffect(() => {
    if (open && userId) {
      fetchMealsForDay();
    }
  }, [open, userId, dayOfWeek]);

  const fetchMealsForDay = async () => {
    if (!userId) return;
    setLoading(true);

    try {
      // Get the current week's meal plan
      const today = new Date();
      const dayOfWeekToday = today.getDay();
      const monday = new Date(today);
      monday.setDate(today.getDate() - (dayOfWeekToday === 0 ? 6 : dayOfWeekToday - 1));
      const weekStart = monday.toISOString().split("T")[0];

      const { data: mealPlan } = await supabase
        .from("meal_plans")
        .select("id")
        .eq("user_id", userId)
        .eq("week_start_date", weekStart)
        .single();

      if (!mealPlan) {
        setMeals([]);
        setLoading(false);
        return;
      }

      // Get meals for the specific day and meal type
      const { data: mealsData } = await supabase
        .from("meals")
        .select("*")
        .eq("meal_plan_id", mealPlan.id)
        .eq("day_of_week", dayOfWeek)
        .eq("meal_type", mealTypeMap[mealType]);

      setMeals(mealsData || []);
    } catch (error) {
      console.error("Error fetching meals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogMeal = async (meal: Meal) => {
    if (!userId) return;
    setLogging(meal.id);

    try {
      // Log the meal as a food scan entry
      const { error } = await supabase.from("food_scans").insert({
        user_id: userId,
        dish_name: meal.name,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fats,
        image_url: meal.image_url,
        confidence: "high",
        portion_estimate: "1 porción",
        notes: `Registrado del plan semanal - ${mealTypeLabels[mealType][language]}`,
      });

      if (error) throw error;

      toast.success(
        language === "es" 
          ? "¡Comida registrada!" 
          : "Meal logged!"
      );
      
      onMealLogged();
      onOpenChange(false);
    } catch (error) {
      console.error("Error logging meal:", error);
      toast.error(
        language === "es" 
          ? "Error al registrar" 
          : "Error logging meal"
      );
    } finally {
      setLogging(null);
    }
  };

  const texts = {
    es: {
      title: `Selecciona tu ${mealTypeLabels[mealType].es.toLowerCase()}`,
      subtitle: "Del plan semanal de hoy",
      noMeals: "No hay comidas planificadas para este momento",
      log: "Registrar",
      kcal: "kcal",
    },
    en: {
      title: `Select your ${mealTypeLabels[mealType].en.toLowerCase()}`,
      subtitle: "From today's weekly plan",
      noMeals: "No meals planned for this time",
      log: "Log",
      kcal: "kcal",
    },
  };

  const t = texts[language];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md mx-4">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{t.title}</DialogTitle>
          <p className="text-muted-foreground text-sm">{t.subtitle}</p>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : meals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t.noMeals}
            </div>
          ) : (
            meals.map((meal) => (
              <motion.div
                key={meal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 p-3 rounded-xl border border-border bg-card hover:bg-accent/5 transition-colors"
              >
                <div className="h-16 w-16 rounded-lg overflow-hidden flex-shrink-0">
                  <MealImageWithSkeleton
                    src={meal.image_url}
                    alt={meal.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground truncate">
                    {meal.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{meal.calories} {t.kcal}</span>
                    <span>•</span>
                    <span>P: {meal.protein}g</span>
                    <span>C: {meal.carbs}g</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleLogMeal(meal)}
                  disabled={logging === meal.id}
                  className="flex-shrink-0"
                >
                  {logging === meal.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      {t.log}
                    </>
                  )}
                </Button>
              </motion.div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
