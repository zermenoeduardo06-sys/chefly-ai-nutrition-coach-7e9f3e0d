import { motion } from "framer-motion";
import { Plus, ChevronRight, Coffee, Utensils, Moon, Apple } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

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
}

const mealIcons = {
  breakfast: Coffee,
  lunch: Utensils,
  dinner: Moon,
  snack: Apple,
};

const mealColors = {
  breakfast: "bg-amber-900/50",
  lunch: "bg-orange-900/50",
  dinner: "bg-rose-900/50",
  snack: "bg-red-900/50",
};

export function MealModulesSection({
  consumedCalories,
  targetCalories,
  recentFoods = {},
}: MealModulesSectionProps) {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const texts = {
    es: {
      title: "Alimentación",
      more: "Más",
      breakfast: "Desayuno",
      lunch: "Almuerzo",
      dinner: "Cena",
      snack: "Snacks",
      kcal: "kcal",
    },
    en: {
      title: "Food",
      more: "More",
      breakfast: "Breakfast",
      lunch: "Lunch",
      dinner: "Dinner",
      snack: "Snacks",
      kcal: "kcal",
    },
  };

  const t = texts[language];

  const modules = [
    { id: "breakfast", label: t.breakfast, icon: mealIcons.breakfast, color: mealColors.breakfast },
    { id: "lunch", label: t.lunch, icon: mealIcons.lunch, color: mealColors.lunch },
    { id: "dinner", label: t.dinner, icon: mealIcons.dinner, color: mealColors.dinner },
    { id: "snack", label: t.snack, icon: mealIcons.snack, color: mealColors.snack },
  ];

  const handleModuleClick = (mealType: string) => {
    navigate(`/dashboard/meal/${mealType}`);
  };

  const handleAddClick = (e: React.MouseEvent, mealType: string) => {
    e.stopPropagation();
    navigate(`/dashboard/add-food/${mealType}`);
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-bold">{t.title}</h2>
        <button className="text-primary text-sm font-medium">{t.more}</button>
      </div>

      {/* Modules Container */}
      <Card className="border-border/50 bg-card/50 overflow-hidden">
        <CardContent className="p-0">
          {modules.map((module, index) => {
            const Icon = module.icon;
            const consumed = consumedCalories[module.id as keyof typeof consumedCalories] || 0;
            const target = targetCalories[module.id as keyof typeof targetCalories] || 0;
            const recent = recentFoods[module.id as keyof typeof recentFoods];
            
            return (
              <motion.button
                key={module.id}
                onClick={() => handleModuleClick(module.id)}
                className={cn(
                  "w-full flex items-center p-4 text-left transition-colors hover:bg-muted/50",
                  index !== modules.length - 1 && "border-b border-border/30"
                )}
                whileTap={{ scale: 0.98 }}
              >
                {/* Icon */}
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0",
                  module.color
                )}>
                  <Icon className="h-6 w-6 text-foreground" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-foreground">{module.label}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {consumed} / {target} {t.kcal}
                  </div>
                  {recent && (
                    <div className="text-xs text-muted-foreground/70 truncate mt-0.5">
                      {recent}
                    </div>
                  )}
                </div>

                {/* Add Button */}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-full border-2 flex-shrink-0 ml-2"
                  onClick={(e) => handleAddClick(e, module.id)}
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </motion.button>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
