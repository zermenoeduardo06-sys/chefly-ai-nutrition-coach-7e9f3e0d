import { Card3D, Card3DContent } from "@/components/ui/card-3d";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import { Beef, Wheat, Droplet } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { useNutritionGoals } from "@/hooks/useNutritionGoals";
import { useNutritionSummary } from "@/hooks/useNutritionSummary";

interface NutritionSummaryWidgetProps {
  userId: string;
  selectedDate?: Date;
}

export const NutritionSummaryWidget = ({ userId, selectedDate = new Date() }: NutritionSummaryWidgetProps) => {
  const { language } = useLanguage();
  const { data: nutrition, isLoading } = useNutritionSummary(userId, selectedDate);
  const { goals: dailyGoals, loading: goalsLoading } = useNutritionGoals(userId);

  const formatNumber = (num: number) => {
    return Math.round(num).toLocaleString();
  };

  if (isLoading || goalsLoading) {
    return (
      <Card3D variant="default" hover={false}>
        <Card3DContent className="p-4">
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
        </Card3DContent>
      </Card3D>
    );
  }

  const caloriesConsumed = nutrition.calories;
  const caloriesRemaining = Math.max(dailyGoals.calories - caloriesConsumed, 0);
  const proteinConsumed = nutrition.protein;
  const carbsConsumed = nutrition.carbs;
  const fatsConsumed = nutrition.fats;

  const proteinPercentage = Math.min((proteinConsumed / dailyGoals.protein) * 100, 100);
  const carbsPercentage = Math.min((carbsConsumed / dailyGoals.carbs) * 100, 100);
  const fatsPercentage = Math.min((fatsConsumed / dailyGoals.fats) * 100, 100);

  return (
    <Card3D variant="default" hover={false}>
      <Card3DContent className="p-4">
        {/* Top Row: Consumed | Remaining | Goal */}
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

          {/* Remaining - Hero number */}
          <div className="text-center relative">
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <motion.p 
              className="text-4xl font-black text-primary"
              style={{ textShadow: '0 0 20px hsl(var(--primary) / 0.3)' }}
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

        {/* Macros Row - Differentiated colors */}
        <div className="grid grid-cols-3 gap-3">
          {/* Carbs - Primary (lime) */}
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Wheat className="h-3 w-3 text-primary" />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">
                {language === 'es' ? 'Carbos' : 'Carbs'}
              </span>
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

          {/* Protein - Secondary (cyan) */}
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Beef className="h-3 w-3 text-secondary" />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">
                {language === 'es' ? 'Proteína' : 'Protein'}
              </span>
            </div>
            <Progress 
              value={proteinPercentage} 
              className="h-1.5 bg-muted/30 [&>div]:bg-secondary" 
            />
            <p className="text-xs text-center text-muted-foreground">
              <span className="font-medium text-foreground">{formatNumber(proteinConsumed)}</span>
              <span className="text-muted-foreground/70"> / {dailyGoals.protein}g</span>
            </p>
          </div>

          {/* Fats - Amber (accent) */}
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Droplet className="h-3 w-3 text-amber-500" />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">
                {language === 'es' ? 'Grasas' : 'Fats'}
              </span>
            </div>
            <Progress 
              value={fatsPercentage} 
              className="h-1.5 bg-muted/30 [&>div]:bg-amber-500" 
            />
            <p className="text-xs text-center text-muted-foreground">
              <span className="font-medium text-foreground">{formatNumber(fatsConsumed)}</span>
              <span className="text-muted-foreground/70"> / {dailyGoals.fats}g</span>
            </p>
          </div>
        </div>
      </Card3DContent>
    </Card3D>
  );
};
