import { motion } from "framer-motion";
import { Plus, Coffee, Utensils, Moon, Apple, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card3D, Card3DContent } from "@/components/ui/card-3d";
import { Button } from "@/components/ui/button";
import { Icon3D } from "@/components/ui/icon-3d";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface MealModulesSectionProps {
  consumedCalories: {
    breakfast: number;
    lunch: number;
    dinner: number;
    snack: number;
  };
  targetCalories: {
    breakfast: number;
    lunch: number;
    dinner: number;
    snack: number;
  };
  recentFoods?: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
    snack?: string;
  };
  selectedDate?: Date;
}

const mealConfig = {
  breakfast: { icon: Coffee, color: "amber" as const },
  lunch: { icon: Utensils, color: "primary" as const },
  dinner: { icon: Moon, color: "rose" as const },
  snack: { icon: Apple, color: "emerald" as const },
};

export function MealModulesSection({
  consumedCalories,
  targetCalories,
  recentFoods = {},
  selectedDate = new Date(),
}: MealModulesSectionProps) {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const texts = {
    es: {
      title: "Alimentación",
      breakfast: "Desayuno",
      lunch: "Almuerzo",
      dinner: "Cena",
      snack: "Snacks",
      kcal: "kcal",
      add: "Añadir",
    },
    en: {
      title: "Meals",
      breakfast: "Breakfast",
      lunch: "Lunch",
      dinner: "Dinner",
      snack: "Snacks",
      kcal: "kcal",
      add: "Add",
    },
  };

  const t = texts[language];

  const modules = [
    { id: "breakfast", label: t.breakfast },
    { id: "lunch", label: t.lunch },
    { id: "dinner", label: t.dinner },
    { id: "snack", label: t.snack },
  ];

  const handleModuleClick = (mealType: string) => {
    const dateParam = format(selectedDate, "yyyy-MM-dd");
    navigate(`/dashboard/meal/${mealType}?date=${dateParam}`);
  };

  const handleAddClick = (e: React.MouseEvent, mealType: string) => {
    e.stopPropagation();
    const dateParam = format(selectedDate, "yyyy-MM-dd");
    navigate(`/dashboard/ai-camera/${mealType}?date=${dateParam}`);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <h2 className="text-xl tablet:text-2xl font-bold px-1">{t.title}</h2>

      {/* Meal Cards Grid */}
      <div className="grid grid-cols-1 gap-3">
        {modules.map((module, index) => {
          const config = mealConfig[module.id as keyof typeof mealConfig];
          const Icon = config.icon;
          const consumed = consumedCalories[module.id as keyof typeof consumedCalories] || 0;
          const target = targetCalories[module.id as keyof typeof targetCalories] || 1;
          const percentage = Math.min(Math.round((consumed / target) * 100), 100);
          const isComplete = percentage >= 100;
          
          return (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card3D 
                variant="default" 
                className="cursor-pointer"
                onClick={() => handleModuleClick(module.id)}
              >
                <Card3DContent className="p-4 tablet:p-5">
                  <div className="flex items-center gap-4">
                    {/* 3D Icon */}
                    <Icon3D 
                      icon={Icon} 
                      color={config.color} 
                      size="lg"
                    />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Title row */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-lg tablet:text-xl text-foreground">
                          {module.label}
                        </span>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                      
                      {/* Progress bar */}
                      <div className="relative h-3 bg-muted/50 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                          className={cn(
                            "absolute inset-y-0 left-0 rounded-full",
                            isComplete 
                              ? "bg-gradient-to-r from-emerald-400 to-emerald-500" 
                              : "bg-gradient-to-r from-primary to-primary-hover"
                          )}
                        />
                      </div>
                      
                      {/* Calories text */}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-muted-foreground">
                          <span className="font-semibold text-foreground">{consumed}</span>
                          {" / "}{target} {t.kcal}
                        </span>
                        {isComplete && (
                          <span className="text-xs font-medium text-emerald-500">✓</span>
                        )}
                      </div>
                    </div>

                    {/* Add Button - 3D style */}
                    <Button
                      variant="modern3dOutline"
                      size="icon"
                      className="h-12 w-12 tablet:h-14 tablet:w-14 rounded-xl flex-shrink-0"
                      onClick={(e) => handleAddClick(e, module.id)}
                    >
                      <Plus className="h-6 w-6 tablet:h-7 tablet:w-7" />
                    </Button>
                  </div>
                </Card3DContent>
              </Card3D>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}