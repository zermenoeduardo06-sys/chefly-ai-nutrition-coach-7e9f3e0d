import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronUp, ChevronDown, Flame } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface SelectedFood {
  id: string;
  name: string;
  calories: number;
}

interface SelectionSummaryBarProps {
  selectedFoods: SelectedFood[];
  onClear: () => void;
  onRemoveFood: (foodId: string) => void;
}

export function SelectionSummaryBar({ 
  selectedFoods, 
  onClear, 
  onRemoveFood 
}: SelectionSummaryBarProps) {
  const { language } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const totalCalories = selectedFoods.reduce((sum, f) => sum + f.calories, 0);
  const count = selectedFoods.length;
  
  if (count === 0) return null;
  
  const texts = {
    es: {
      items: count === 1 ? "alimento" : "alimentos",
      clear: "Limpiar",
      kcal: "kcal",
    },
    en: {
      items: count === 1 ? "food" : "foods",
      clear: "Clear",
      kcal: "kcal",
    },
  };
  
  const t = texts[language];

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
      className="sticky top-0 z-40 bg-primary/10 backdrop-blur-lg border-b border-primary/20"
    >
      {/* Main summary row */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 flex-1"
        >
          <motion.div
            key={count}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            className="flex items-center justify-center h-7 w-7 rounded-full bg-primary text-primary-foreground text-sm font-bold"
          >
            {count}
          </motion.div>
          
          <span className="text-sm font-medium text-foreground">
            {count} {t.items}
          </span>
          
          <div className="flex items-center gap-1 text-sm text-primary font-semibold">
            <Flame className="h-4 w-4" />
            <motion.span
              key={totalCalories}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
            >
              {totalCalories}
            </motion.span>
            <span className="text-muted-foreground font-normal">{t.kcal}</span>
          </div>
          
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground ml-1" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground ml-1" />
          )}
        </button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="text-muted-foreground hover:text-destructive h-8 px-2"
        >
          <X className="h-4 w-4 mr-1" />
          {t.clear}
        </Button>
      </div>
      
      {/* Expanded list of selected foods */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-primary/10"
          >
            <div className="max-h-32 overflow-y-auto px-4 py-2 space-y-1">
              {selectedFoods.map((food) => (
                <motion.div
                  key={food.id}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="flex items-center justify-between py-1"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-sm text-foreground truncate">{food.name}</span>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {food.calories} {t.kcal}
                    </span>
                  </div>
                  <button
                    onClick={() => onRemoveFood(food.id)}
                    className="p-1 hover:bg-destructive/10 rounded-full transition-colors"
                  >
                    <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
