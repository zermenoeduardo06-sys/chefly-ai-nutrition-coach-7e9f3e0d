import React, { useState } from 'react';
import { Heart, Check, BadgeCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Food, getCategoryIcon, getCategoryColor } from '@/hooks/useFoodDatabase';
import { useLanguage } from '@/contexts/LanguageContext';

interface FoodListItemProps {
  food: Food;
  isSelected?: boolean;
  isFavorite?: boolean;
  onSelect: (food: Food) => void;
  onToggleFavorite?: (foodId: string) => void;
  showCategory?: boolean;
}

export const FoodListItem: React.FC<FoodListItemProps> = ({
  food,
  isSelected = false,
  isFavorite: initialFavorite = false,
  onSelect,
  onToggleFavorite,
  showCategory = true,
}) => {
  const { language } = useLanguage();
  const [isFavorite, setIsFavorite] = useState(initialFavorite);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    onToggleFavorite?.(food.id);
  };

  const displayName = language === 'en' && food.name_en ? food.name_en : food.name;

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(food)}
      className={`relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
        isSelected
          ? 'bg-primary/10 border-2 border-primary shadow-sm'
          : 'bg-card hover:bg-accent/50 border border-border'
      }`}
    >
      {/* Category icon */}
      {showCategory && (
        <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${getCategoryColor(food.category)}`}>
          <span className="text-lg">{getCategoryIcon(food.category)}</span>
        </div>
      )}

      {/* Food info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <h4 className="font-medium text-foreground truncate">{displayName}</h4>
          {food.is_verified && (
            <BadgeCheck className="w-4 h-4 text-primary flex-shrink-0" />
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">{food.portion}</p>
        <div className="flex items-center gap-2 mt-1 text-xs">
          <span className="text-blue-600 dark:text-blue-400">P: {food.protein}g</span>
          <span className="text-amber-600 dark:text-amber-400">C: {food.carbs}g</span>
          <span className="text-red-600 dark:text-red-400">G: {food.fats}g</span>
        </div>
      </div>

      {/* Calories */}
      <div className="flex-shrink-0 text-right">
        <p className="text-lg font-bold text-foreground">{food.calories}</p>
        <p className="text-xs text-muted-foreground">kcal</p>
      </div>

      {/* Favorite button */}
      {onToggleFavorite && (
        <button
          onClick={handleFavoriteClick}
          className="flex-shrink-0 p-2 -mr-1 rounded-full hover:bg-accent/50 transition-colors"
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
            }`}
          />
        </button>
      )}

      {/* Selection indicator */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg"
        >
          <Check className="w-4 h-4 text-primary-foreground" />
        </motion.div>
      )}
    </motion.div>
  );
};
