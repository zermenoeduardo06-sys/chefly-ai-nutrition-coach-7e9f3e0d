import { motion } from "framer-motion";
import { Plus, ChevronRight, Coffee, Utensils, Moon, Apple } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { format, isToday } from "date-fns";

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

const mealIcons = {
  breakfast: Coffee,
  lunch: Utensils,
  dinner: Moon,
  snack: Apple,
};

const mealColors = {
  breakfast: { bg: "bg-amber-900/50", ring: "stroke-amber-400" },
  lunch: { bg: "bg-orange-900/50", ring: "stroke-orange-400" },
  dinner: { bg: "bg-rose-900/50", ring: "stroke-rose-400" },
  snack: { bg: "bg-red-900/50", ring: "stroke-red-400" },
};

// Circular progress component
function CircularProgress({ 
  value, 
  size = 48, 
  strokeWidth = 4,
  colorClass = "stroke-primary"
}: { 
  value: number; 
  size?: number; 
  strokeWidth?: number;
  colorClass?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.min(Math.max(value, 0), 100);
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-muted/30"
      />
      {/* Progress circle */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        className={colorClass}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
          strokeDasharray: circumference,
        }}
      />
    </svg>
  );
}

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
    { id: "breakfast", label: t.breakfast, icon: mealIcons.breakfast, colors: mealColors.breakfast },
    { id: "lunch", label: t.lunch, icon: mealIcons.lunch, colors: mealColors.lunch },
    { id: "dinner", label: t.dinner, icon: mealIcons.dinner, colors: mealColors.dinner },
    { id: "snack", label: t.snack, icon: mealIcons.snack, colors: mealColors.snack },
  ];

  const handleModuleClick = (mealType: string) => {
    // Pass date as query param for the detail page
    const dateParam = format(selectedDate, "yyyy-MM-dd");
    navigate(`/dashboard/meal/${mealType}?date=${dateParam}`);
  };

  const handleAddClick = (e: React.MouseEvent, mealType: string) => {
    e.stopPropagation();
    const dateParam = format(selectedDate, "yyyy-MM-dd");
    navigate(`/dashboard/add-food/${mealType}?date=${dateParam}`);
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
            const target = targetCalories[module.id as keyof typeof targetCalories] || 1;
            const recent = recentFoods[module.id as keyof typeof recentFoods];
            const percentage = Math.round((consumed / target) * 100);
            
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
                {/* Circular Progress with Icon */}
                <div className="relative w-12 h-12 mr-4 flex-shrink-0">
                  <CircularProgress 
                    value={percentage} 
                    size={48} 
                    strokeWidth={4}
                    colorClass={module.colors.ring}
                  />
                  {/* Icon centered inside the ring */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-foreground" />
                  </div>
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