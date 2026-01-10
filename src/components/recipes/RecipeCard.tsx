import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MealImageWithSkeleton } from "@/components/MealImageWithSkeleton";
import { cn } from "@/lib/utils";

interface Recipe {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  calories: number | null;
  meal_type: string;
}

interface RecipeCardProps {
  recipe: Recipe;
  onClick: () => void;
  index: number;
  mealTypeColors: Record<string, string>;
  mealTypeLabel: string;
  kcalLabel: string;
}

export function RecipeCard({ 
  recipe, 
  onClick, 
  index, 
  mealTypeColors, 
  mealTypeLabel,
  kcalLabel 
}: RecipeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      layout
    >
      <Card 
        className="overflow-hidden cursor-pointer group active:scale-[0.98] transition-transform duration-200 border-border/50 bg-card"
        onClick={onClick}
      >
        {/* Image Container - Fixed aspect ratio */}
        <div className="aspect-square relative overflow-hidden bg-muted">
          <MealImageWithSkeleton
            src={recipe.image_url}
            alt={recipe.name}
            containerClassName="w-full h-full"
          />
          
          {/* Meal Type Badge */}
          <div className="absolute top-2 left-2 z-10">
            <Badge 
              variant="secondary" 
              className={cn(
                "text-[10px] px-2 py-0.5 backdrop-blur-md bg-black/40 border-0 font-medium",
                mealTypeColors[recipe.meal_type]
              )}
            >
              {mealTypeLabel}
            </Badge>
          </div>
          
          {/* Calories Overlay */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-8 z-10">
            <div className="flex items-center gap-1.5 text-white">
              <div className="w-5 h-5 rounded-full bg-amber-500/30 flex items-center justify-center">
                <Flame className="h-3 w-3 text-amber-400" />
              </div>
              <span className="text-sm font-semibold">{recipe.calories}</span>
              <span className="text-xs text-white/70">{kcalLabel}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 space-y-1">
          <h3 className="font-semibold text-foreground line-clamp-2 text-sm leading-tight">
            {recipe.name}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {recipe.description}
          </p>
        </div>
      </Card>
    </motion.div>
  );
}
