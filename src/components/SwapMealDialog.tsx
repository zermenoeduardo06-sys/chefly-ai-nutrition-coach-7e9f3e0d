import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";

interface Meal {
  id: string;
  day_of_week: number;
  meal_type: string;
  name: string;
  description: string;
  image_url?: string;
}

interface SwapMealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceMeal: Meal | null;
  allMeals: Meal[];
  onConfirmSwap: (sourceMealId: string, targetMealId: string) => void;
}

export function SwapMealDialog({ 
  open, 
  onOpenChange, 
  sourceMeal, 
  allMeals,
  onConfirmSwap 
}: SwapMealDialogProps) {
  const { t, getArray } = useLanguage();
  if (!sourceMeal) return null;

  const dayNames = getArray('dashboard.days');
  const mealTypes: { [key: string]: string } = {
    breakfast: t('dashboard.meals.breakfast'),
    lunch: t('dashboard.meals.lunch'),
    dinner: t('dashboard.meals.dinner'),
  };

  // Group meals by day, excluding the source meal
  const groupedMeals = allMeals
    .filter(meal => meal.id !== sourceMeal.id)
    .reduce((acc, meal) => {
      if (!acc[meal.day_of_week]) acc[meal.day_of_week] = [];
      acc[meal.day_of_week].push(meal);
      return acc;
    }, {} as { [key: number]: Meal[] });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('swapMeal.title')}</DialogTitle>
          <DialogDescription>
            {t('swapMeal.description')} "{sourceMeal.name}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {Object.keys(groupedMeals).sort((a, b) => parseInt(a) - parseInt(b)).map((dayIndex) => {
            const day = parseInt(dayIndex);
            const meals = groupedMeals[day];

            return (
              <div key={day} className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground">
                  {dayNames[day]}
                </h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {meals.map((meal) => (
                    <Card 
                      key={meal.id} 
                      className="cursor-pointer hover:shadow-md transition-all border-border/50"
                      onClick={() => {
                        onConfirmSwap(sourceMeal.id, meal.id);
                        onOpenChange(false);
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex gap-3">
                          {meal.image_url && (
                            <img 
                              src={meal.image_url} 
                              alt={meal.name}
                              className="w-16 h-16 rounded-md object-cover"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <Badge variant="secondary" className="text-xs mb-1">
                              {mealTypes[meal.meal_type]}
                            </Badge>
                            <h4 className="font-semibold text-sm mb-1 truncate">
                              {meal.name}
                            </h4>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {meal.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <Separator className="mt-4" />
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
