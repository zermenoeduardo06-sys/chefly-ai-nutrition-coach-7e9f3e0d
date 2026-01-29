import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import { Beef, Wheat, Droplet } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { useNutritionGoals } from "@/hooks/useNutritionGoals";
import { useDailyFoodIntake } from "@/hooks/useDailyFoodIntake";

interface NutritionSummaryWidgetProps {
  userId: string;
  selectedDate?: Date;
}

export const NutritionSummaryWidget = ({ userId, selectedDate = new Date() }: NutritionSummaryWidgetProps) => {
  const { language } = useLanguage();
  const { goals: dailyGoals, loading: goalsLoading } = useNutritionGoals(userId);
  
  // Use the same hook as MealModulesSection for consistent data
  const { consumedMacros, isLoading: intakeLoading } = useDailyFoodIntake(userId, selectedDate);

  const formatNumber = (num: number) => {
    return Math.round(num).toLocaleString();
  };

  if (intakeLoading || goalsLoading) {
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

  const caloriesConsumed = consumedMacros.calories;
  const caloriesRemaining = Math.max(dailyGoals.calories - caloriesConsumed, 0);
  const proteinConsumed = consumedMacros.protein;
  const carbsConsumed = consumedMacros.carbs;
  const fatsConsumed = consumedMacros.fats;

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
          {/* Top Row: Consumed | Remaining | Goal - YAZIO Style */}
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
