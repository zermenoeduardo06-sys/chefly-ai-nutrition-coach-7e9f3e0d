import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, Flame, Drumstick, Wheat, Droplet } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface DailySummaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dayName: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
}

export const DailySummaryDialog = ({
  open,
  onOpenChange,
  dayName,
  totalCalories,
  totalProtein,
  totalCarbs,
  totalFats,
}: DailySummaryDialogProps) => {
  const { t } = useLanguage();
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <TrendingUp className="w-6 h-6 text-primary" />
            {t('dailySummary.title')}
          </DialogTitle>
          <DialogDescription className="text-base">
            {t('dailySummary.subtitle')} {dayName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Celebration Message */}
          <div className="text-center space-y-2">
            <div className="text-6xl">🎉</div>
            <p className="text-lg font-semibold">
              {t('dailySummary.congrats')}
            </p>
          </div>

          <Separator />

          {/* Total Calories Card */}
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-6 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Flame className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('dailySummary.totalCalories')}</p>
                  <p className="text-3xl font-bold">{totalCalories}</p>
                </div>
              </div>
              <Badge variant="secondary" className="text-base px-4 py-2">
                {t('dailySummary.kcal')}
              </Badge>
            </div>
          </div>

          {/* Macronutrients Grid */}
          <div className="grid grid-cols-3 gap-4">
            {/* Protein */}
            <div className="space-y-2 text-center">
              <div className="w-full aspect-square rounded-xl bg-gradient-to-br from-red-500/20 to-red-500/10 flex items-center justify-center">
                <Drumstick className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalProtein}g</p>
                <p className="text-xs text-muted-foreground">{t('dailySummary.proteins')}</p>
              </div>
            </div>

            {/* Carbs */}
            <div className="space-y-2 text-center">
              <div className="w-full aspect-square rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/10 flex items-center justify-center">
                <Wheat className="w-8 h-8 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalCarbs}g</p>
                <p className="text-xs text-muted-foreground">{t('dailySummary.carbohydrates')}</p>
              </div>
            </div>

            {/* Fats */}
            <div className="space-y-2 text-center">
              <div className="w-full aspect-square rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/10 flex items-center justify-center">
                <Droplet className="w-8 h-8 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalFats}g</p>
                <p className="text-xs text-muted-foreground">{t('dailySummary.fats')}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Motivational Message */}
          <div className="text-center space-y-2 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              {t('dailySummary.motivational')}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
