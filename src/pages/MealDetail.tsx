import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Camera, Lock, Coffee, Salad, Moon, Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";

interface DailyNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

const mealTypeIcons = {
  breakfast: Coffee,
  lunch: Salad,
  dinner: Moon,
  snack: Cookie,
};

const mealTypeLabels = {
  breakfast: { es: "Desayuno", en: "Breakfast" },
  lunch: { es: "Almuerzo", en: "Lunch" },
  dinner: { es: "Cena", en: "Dinner" },
  snack: { es: "Snack", en: "Snack" },
};

export default function MealDetail() {
  const navigate = useNavigate();
  const { mealType } = useParams<{ mealType: string }>();
  const { language } = useLanguage();
  const [userId, setUserId] = useState<string | undefined>();
  const [dailyNutrition, setDailyNutrition] = useState<DailyNutrition>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
  });
  const [goals, setGoals] = useState<NutritionGoals>({
    calories: 2000,
    protein: 100,
    carbs: 250,
    fats: 67,
  });
  const [loading, setLoading] = useState(true);

  const subscription = useSubscription(userId);
  const isPremium = subscription.isCheflyPlus;
  
  const validMealType = (mealType as keyof typeof mealTypeLabels) || "breakfast";
  const MealIcon = mealTypeIcons[validMealType] || Coffee;

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUserId(user.id);

      // Load goals from preferences
      const { data: prefs } = await supabase
        .from("user_preferences")
        .select("daily_calorie_goal, daily_protein_goal, daily_carbs_goal, daily_fats_goal")
        .eq("user_id", user.id)
        .single();

      if (prefs) {
        setGoals({
          calories: prefs.daily_calorie_goal || 2000,
          protein: prefs.daily_protein_goal || 100,
          carbs: prefs.daily_carbs_goal || 250,
          fats: prefs.daily_fats_goal || 67,
        });
      }

      // Load today's consumed nutrition from food_scans
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      const { data: scans } = await supabase
        .from("food_scans")
        .select("calories, protein, carbs, fat")
        .eq("user_id", user.id)
        .gte("scanned_at", startOfDay.toISOString())
        .lt("scanned_at", endOfDay.toISOString());

      if (scans) {
        const totals = scans.reduce(
          (acc, scan) => ({
            calories: acc.calories + (scan.calories || 0),
            protein: acc.protein + (scan.protein || 0),
            carbs: acc.carbs + (scan.carbs || 0),
            fats: acc.fats + (scan.fat || 0),
          }),
          { calories: 0, protein: 0, carbs: 0, fats: 0 }
        );
        setDailyNutrition(totals);
      }

      setLoading(false);
    };

    loadData();
  }, [navigate]);

  const texts = {
    es: {
      nutritionInfo: "Información nutricional",
      calories: "Calorías",
      carbs: "Carbohidratos",
      protein: "Proteínas",
      fats: "Grasas",
      fiber: "Fibra",
      sugar: "Azúcar",
      saturated: "Saturadas",
      registerNow: "Registrar ahora",
      pro: "Pro",
      kcal: "kcal",
      g: "g",
    },
    en: {
      nutritionInfo: "Nutritional information",
      calories: "Calories",
      carbs: "Carbohydrates",
      protein: "Protein",
      fats: "Fats",
      fiber: "Fiber",
      sugar: "Sugar",
      saturated: "Saturated",
      registerNow: "Register now",
      pro: "Pro",
      kcal: "kcal",
      g: "g",
    },
  };

  const t = texts[language];
  const mealLabel = mealTypeLabels[validMealType][language];

  const getProgress = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between p-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold">{mealLabel}</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Meal Icon with Camera */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex justify-center relative"
        >
          <div className="h-28 w-28 rounded-full bg-muted flex items-center justify-center">
            <MealIcon className="h-14 w-14 text-muted-foreground" />
          </div>
          <button className="absolute right-1/4 bottom-0 h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
            <Camera className="h-5 w-5" />
          </button>
        </motion.div>

        {/* Macros Summary */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-4 gap-2 text-center"
        >
          <div>
            <p className="text-2xl font-bold text-foreground">{dailyNutrition.calories}</p>
            <p className="text-xs text-muted-foreground">{t.kcal}</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{dailyNutrition.carbs.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">{t.carbs}</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{dailyNutrition.protein.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">{t.protein}</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{dailyNutrition.fats.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">{t.fats}</p>
          </div>
        </motion.div>

        {/* Nutrition Progress Section */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-xl p-4 space-y-4"
        >
          <h2 className="font-semibold text-foreground">{t.nutritionInfo}</h2>

          {/* Calories */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-foreground">{t.calories}</span>
              <span className="text-muted-foreground">{dailyNutrition.calories}/{goals.calories}</span>
            </div>
            <Progress value={getProgress(dailyNutrition.calories, goals.calories)} className="h-2" />
          </div>

          {/* Carbs - Premium locked */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-foreground flex items-center gap-1">
                {t.carbs}
                {!isPremium && <Lock className="h-3 w-3 text-muted-foreground" />}
              </span>
              {isPremium ? (
                <span className="text-muted-foreground">{dailyNutrition.carbs.toFixed(1)}/{goals.carbs}</span>
              ) : (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{t.pro}</span>
              )}
            </div>
            <Progress 
              value={isPremium ? getProgress(dailyNutrition.carbs, goals.carbs) : 0} 
              className="h-2" 
            />
          </div>

          {/* Protein - Premium locked */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-foreground flex items-center gap-1">
                {t.protein}
                {!isPremium && <Lock className="h-3 w-3 text-muted-foreground" />}
              </span>
              {isPremium ? (
                <span className="text-muted-foreground">{dailyNutrition.protein.toFixed(1)}/{goals.protein}</span>
              ) : (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{t.pro}</span>
              )}
            </div>
            <Progress 
              value={isPremium ? getProgress(dailyNutrition.protein, goals.protein) : 0} 
              className="h-2" 
            />
          </div>

          {/* Fats - Premium locked */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-foreground flex items-center gap-1">
                {t.fats}
                {!isPremium && <Lock className="h-3 w-3 text-muted-foreground" />}
              </span>
              {isPremium ? (
                <span className="text-muted-foreground">{dailyNutrition.fats.toFixed(1)}/{goals.fats}</span>
              ) : (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{t.pro}</span>
              )}
            </div>
            <Progress 
              value={isPremium ? getProgress(dailyNutrition.fats, goals.fats) : 0} 
              className="h-2" 
            />
          </div>
        </motion.div>

        {/* Detailed Nutrition */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-foreground">{t.calories}</span>
            <span className="text-muted-foreground">{dailyNutrition.calories} {t.kcal}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-foreground">{t.protein}</span>
            <span className="text-muted-foreground">{dailyNutrition.protein.toFixed(1)} {t.g}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-foreground">{t.carbs}</span>
            <span className="text-muted-foreground">{dailyNutrition.carbs.toFixed(1)} {t.g}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border pl-4">
            <span className="text-muted-foreground flex items-center gap-1">
              {t.fiber}
              {!isPremium && <Lock className="h-3 w-3" />}
            </span>
            {isPremium ? (
              <span className="text-muted-foreground">-- {t.g}</span>
            ) : (
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{t.pro}</span>
            )}
          </div>
          <div className="flex justify-between py-2 border-b border-border pl-4">
            <span className="text-muted-foreground flex items-center gap-1">
              {t.sugar}
              {!isPremium && <Lock className="h-3 w-3" />}
            </span>
            {isPremium ? (
              <span className="text-muted-foreground">-- {t.g}</span>
            ) : (
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{t.pro}</span>
            )}
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-foreground">{t.fats}</span>
            <span className="text-muted-foreground">{dailyNutrition.fats.toFixed(1)} {t.g}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border pl-4">
            <span className="text-muted-foreground flex items-center gap-1">
              {t.saturated}
              {!isPremium && <Lock className="h-3 w-3" />}
            </span>
            {isPremium ? (
              <span className="text-muted-foreground">-- {t.g}</span>
            ) : (
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{t.pro}</span>
            )}
          </div>
        </motion.div>

        {/* Register Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="pt-4 pb-safe"
        >
          <Button 
            onClick={() => navigate(`/dashboard/ai-camera/${validMealType}`)}
            className="w-full h-14 text-lg font-semibold"
            size="lg"
          >
            {t.registerNow}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
