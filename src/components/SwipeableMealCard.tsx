import { useState, useRef } from "react";
import { motion, PanInfo, useMotionValue, useTransform, animate } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, ChevronRight, Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { MealImageWithSkeleton } from "@/components/MealImageWithSkeleton";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { useHaptics } from "@/hooks/useHaptics";


interface MealAdaptation {
  id: string;
  member_user_id: string;
  member_name?: string;
  adaptation_score: number;
  adaptation_notes: string;
  variant_instructions: string;
  is_best_match: boolean;
}

interface Meal {
  id: string;
  day_of_week: number;
  meal_type: string;
  name: string;
  description: string;
  benefits: string;
  ingredients?: string[];
  steps?: string[];
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  image_url?: string;
  adaptations?: MealAdaptation[];
}

interface SwipeableMealCardProps {
  meal: Meal;
  isCompleted: boolean;
  mealTypeLabel: string;
  onComplete: (meal: Meal) => void;
  onClick: () => void;
  onAddEntry?: (meal: Meal) => void;
  isFirstMeal?: boolean;
  isFamilyPlan?: boolean;
}

const SWIPE_THRESHOLD = 100;

export const SwipeableMealCard = ({
  meal,
  isCompleted,
  mealTypeLabel,
  onComplete,
  onClick,
  onAddEntry,
  isFirstMeal = false,
  isFamilyPlan = false,
}: SwipeableMealCardProps) => {
  const { t, language } = useLanguage();
  const { mediumImpact } = useHaptics();
  const [isSwipedComplete, setIsSwipedComplete] = useState(false);
  const x = useMotionValue(0);
  const cardRef = useRef<HTMLDivElement>(null);

  // Transform x position to background opacity
  const backgroundOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const checkScale = useTransform(x, [0, SWIPE_THRESHOLD], [0.5, 1]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.x;
    
    if (offset > SWIPE_THRESHOLD && !isCompleted) {
      // Haptic feedback when swipe completes
      mediumImpact();
      // Swipe right to complete - trigger photo dialog
      animate(x, 200, { 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        onComplete: () => {
          setIsSwipedComplete(true);
          onComplete(meal);
          // Reset after a short delay
          setTimeout(() => {
            animate(x, 0, { duration: 0.3 });
            setIsSwipedComplete(false);
          }, 500);
        }
      });
    } else {
      // Snap back
      animate(x, 0, { type: "spring", stiffness: 500, damping: 30 });
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl">
      {/* Background action indicator */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-secondary to-secondary/80 flex items-center pl-5 rounded-3xl"
        style={{ opacity: backgroundOpacity }}
      >
        <motion.div 
          className="flex items-center gap-2 text-secondary-foreground"
          style={{ scale: checkScale }}
        >
          <div className="p-2 rounded-full bg-white/20">
            <Check className="h-6 w-6" />
          </div>
          <span className="font-bold text-sm">{t("dashboard.finishMeal")}</span>
        </motion.div>
      </motion.div>

      {/* Draggable card */}
      <motion.div
        ref={cardRef}
        drag={!isCompleted ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className="relative touch-pan-y"
      >
        <Card 
          className={cn(
            "border-0 bg-card shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden rounded-3xl",
            isCompleted && "ring-2 ring-secondary/50 bg-secondary/5"
          )}
        >
          {meal.image_url && (
            <div className="relative h-36 sm:h-44 w-full overflow-hidden">
              <MealImageWithSkeleton
                src={meal.image_url}
                alt={meal.name}
                containerClassName="h-full w-full"
                className={cn("w-full h-full object-cover", isCompleted && "opacity-50")}
              />
              {/* Gradient overlay for better text contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              
              {/* Top badges */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                {/* Add entry / Complete button */}
                {isCompleted ? (
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-10 w-10 shadow-xl rounded-2xl bg-secondary text-secondary-foreground"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Check className="h-5 w-5 text-secondary-foreground" />
                  </Button>
                ) : (
                  <Button
                    size="icon"
                    variant="default"
                    data-tour={isFirstMeal ? "complete-meal" : undefined}
                    className="h-10 w-10 shadow-xl rounded-2xl bg-white/90 text-primary hover:bg-white hover:scale-105 transition-all duration-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      mediumImpact();
                      if (onAddEntry) {
                        onAddEntry(meal);
                      } else {
                        onComplete(meal);
                      }
                    }}
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                )}
                
                {/* Meal type badge */}
                <Badge 
                  variant="default" 
                  className="backdrop-blur-md bg-primary text-primary-foreground font-semibold px-3 py-1.5 rounded-2xl shadow-lg"
                >
                  {mealTypeLabel}
                </Badge>
              </div>
              
              {/* Bottom info overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h4 className={cn(
                  "font-bold text-lg text-white drop-shadow-lg line-clamp-2",
                  isCompleted && "line-through opacity-70"
                )}>
                  {meal.name}
                </h4>
              </div>
            </div>
          )}
          
          <CardContent 
            className="p-4 space-y-3 cursor-pointer"
            onClick={onClick}
          >
            {!meal.image_url && (
              <div className="flex items-center justify-between gap-2 mb-2">
                <Badge variant="secondary" className="shrink-0 font-semibold rounded-xl px-3">
                  {mealTypeLabel}
                </Badge>
                {isCompleted ? (
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8 rounded-xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    size="icon"
                    variant="default"
                    className="h-8 w-8 rounded-xl"
                    onClick={(e) => {
                      e.stopPropagation();
                      mediumImpact();
                      if (onAddEntry) {
                        onAddEntry(meal);
                      } else {
                        onComplete(meal);
                      }
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
            
            {!meal.image_url && (
              <h4 className={cn(
                "font-bold text-base line-clamp-2",
                isCompleted && "line-through opacity-60"
              )}>
                {meal.name}
              </h4>
            )}
            
            <p className="text-sm text-muted-foreground line-clamp-2">{meal.description}</p>
            


            <div className={cn(
              "flex items-center gap-2 p-3 rounded-2xl",
              isCompleted 
                ? "bg-secondary/10 border border-secondary/20" 
                : "bg-primary/5 border border-primary/10"
            )}>
              {isCompleted ? (
                <>
                  <div className="p-1.5 rounded-full bg-secondary/20">
                    <Check className="w-4 h-4 text-secondary" />
                  </div>
                  <p className="text-sm text-secondary font-medium">
                    {t("dashboard.completed")} · {t("dashboard.pointsEarned")}
                  </p>
                </>
              ) : (
                <>
                  <div className="p-1.5 rounded-full bg-primary/20">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-sm text-primary font-medium line-clamp-1">{meal.benefits}</p>
                </>
              )}
            </div>
            
            {/* Tap to view hint */}
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground pt-1">
              <ChevronRight className="h-3 w-3" />
              <span>{language === 'es' ? 'Toca para ver receta' : 'Tap to view recipe'}</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
