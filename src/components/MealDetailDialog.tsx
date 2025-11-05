import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Flame, Apple, Beef, Cookie } from "lucide-react";

interface Meal {
  id: string;
  name: string;
  description: string;
  benefits: string;
  meal_type: string;
  ingredients?: string[];
  steps?: string[];
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  image_url?: string;
}

interface MealDetailDialogProps {
  meal: Meal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MealDetailDialog({ meal, open, onOpenChange }: MealDetailDialogProps) {
  if (!meal) return null;

  const mealTypeLabel = {
    breakfast: "Desayuno",
    lunch: "Almuerzo",
    dinner: "Cena",
  }[meal.meal_type] || meal.meal_type;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {meal.image_url && (
          <div className="relative -mt-6 -mx-6 mb-4 h-64 overflow-hidden rounded-t-lg">
            <img 
              src={meal.image_url} 
              alt={meal.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            <div className="absolute bottom-4 left-6 right-6">
              <Badge variant="secondary" className="mb-2 backdrop-blur-sm bg-background/80">
                {mealTypeLabel}
              </Badge>
              <DialogTitle className="text-3xl text-white drop-shadow-lg">{meal.name}</DialogTitle>
            </div>
          </div>
        )}
        
        {!meal.image_url && (
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{mealTypeLabel}</Badge>
            </div>
            <DialogTitle className="text-2xl">{meal.name}</DialogTitle>
          </DialogHeader>
        )}

        <p className="text-muted-foreground">{meal.description}</p>

        <Separator />

        {/* Información Nutricional */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Flame className="h-5 w-5 text-primary" />
            Información Nutricional
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-secondary/20 rounded-lg p-3 text-center">
              <Flame className="h-5 w-5 mx-auto mb-1 text-orange-500" />
              <p className="text-2xl font-bold">{meal.calories || 0}</p>
              <p className="text-xs text-muted-foreground">Calorías</p>
            </div>
            <div className="bg-secondary/20 rounded-lg p-3 text-center">
              <Beef className="h-5 w-5 mx-auto mb-1 text-red-500" />
              <p className="text-2xl font-bold">{meal.protein || 0}g</p>
              <p className="text-xs text-muted-foreground">Proteína</p>
            </div>
            <div className="bg-secondary/20 rounded-lg p-3 text-center">
              <Cookie className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
              <p className="text-2xl font-bold">{meal.carbs || 0}g</p>
              <p className="text-xs text-muted-foreground">Carbohidratos</p>
            </div>
            <div className="bg-secondary/20 rounded-lg p-3 text-center">
              <Apple className="h-5 w-5 mx-auto mb-1 text-green-500" />
              <p className="text-2xl font-bold">{meal.fats || 0}g</p>
              <p className="text-xs text-muted-foreground">Grasas</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Beneficios */}
        <div>
          <h3 className="font-semibold mb-2">Beneficios</h3>
          <p className="text-sm text-muted-foreground">{meal.benefits}</p>
        </div>

        {/* Ingredientes */}
        {meal.ingredients && meal.ingredients.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="font-semibold mb-3">Ingredientes</h3>
              <ul className="space-y-2">
                {meal.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span className="text-sm">{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {/* Preparación */}
        {meal.steps && meal.steps.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="font-semibold mb-3">Preparación</h3>
              <ol className="space-y-3">
                {meal.steps.map((step, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </span>
                    <span className="text-sm flex-1">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
