import { useState, useRef } from "react";
import { motion, PanInfo, useMotionValue, useTransform, animate } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, ChevronRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { MealImageWithSkeleton } from "@/components/MealImageWithSkeleton";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { useHaptics } from "@/hooks/useHaptics";

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
}

interface SwipeableMealCardProps {
  meal: Meal;
  isCompleted: boolean;
  mealTypeLabel: string;
  onComplete: (mealId: string) => void;
  onClick: () => void;
  isFirstMeal?: boolean;
}

const SWIPE_THRESHOLD = 100;

export const SwipeableMealCard = ({
  meal,
  isCompleted,
  mealTypeLabel,
  onComplete,
  onClick,
  isFirstMeal = false,
}: SwipeableMealCardProps) => {
  const { t } = useLanguage();
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
      // Swipe right to complete
      animate(x, 200, { 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        onComplete: () => {
          setIsSwipedComplete(true);
          onComplete(meal.id);
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
    <div className="relative overflow-hidden rounded-2xl">
      {/* Background action indicator */}
      <motion.div 
        className="absolute inset-0 bg-secondary flex items-center pl-4 rounded-2xl"
        style={{ opacity: backgroundOpacity }}
      >
        <motion.div 
          className="flex items-center gap-2 text-secondary-foreground"
          style={{ scale: checkScale }}
        >
          <Check className="h-6 w-6" />
          <span className="font-semibold text-sm">{t("dashboard.finishMeal")}</span>
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
            "border-2 border-border/50 bg-gradient-to-br from-card to-muted/20 hover:shadow-md hover:border-primary/30 transition-all overflow-hidden rounded-2xl",
            isCompleted && "ring-2 ring-secondary border-secondary/30"
          )}
        >
          {meal.image_url && (
            <div className="relative h-32 sm:h-40 w-full overflow-hidden">
              <MealImageWithSkeleton
                src={meal.image_url}
                alt={meal.name}
                containerClassName="h-full w-full"
                className={cn("w-full h-full object-cover", isCompleted && "opacity-60")}
              />
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="backdrop-blur-sm bg-background/80 text-xs rounded-xl">
                  {mealTypeLabel}
                </Badge>
              </div>
              {/* Complete indicator on image */}
              <Button
                size="icon"
                variant={isCompleted ? "duolingoSecondary" : "duolingo"}
                data-tour={isFirstMeal ? "complete-meal" : undefined}
                className="absolute top-2 left-2 h-9 w-9 shadow-lg rounded-xl pointer-events-none"
              >
                <Check className="h-5 w-5" />
              </Button>
            </div>
          )}
          <CardContent 
            className="p-3 sm:p-4 space-y-2 sm:space-y-3 cursor-pointer"
            onClick={onClick}
          >
            {!meal.image_url && (
              <div className="flex items-center justify-between gap-2 mb-2">
                <Badge variant="secondary" className="shrink-0 text-xs rounded-xl">
                  {mealTypeLabel}
                </Badge>
              </div>
            )}
            <div className="min-w-0 flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className={cn(
                  "font-semibold text-sm sm:text-base mb-1 line-clamp-2",
                  isCompleted && "line-through opacity-60"
                )}>
                  {meal.name}
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{meal.description}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
            </div>
            <Separator />
            <div className="flex items-start gap-2 mb-3">
              {isCompleted ? (
                <>
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-green-600 font-medium leading-relaxed line-clamp-2">
                    {t("dashboard.completed")} {t("dashboard.pointsEarned")}
                  </p>
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-xs text-primary font-medium leading-relaxed line-clamp-2">{meal.benefits}</p>
                </>
              )}
            </div>
            
            {/* Swipe hint for mobile */}
            {!isCompleted && !meal.image_url && (
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground pt-1 md:hidden">
                <ChevronRight className="h-3 w-3 animate-pulse" />
                <span>{t("dashboard.swipeToComplete")}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
