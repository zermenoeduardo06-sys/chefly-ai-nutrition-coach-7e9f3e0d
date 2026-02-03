import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, Clock, TrendingUp, Plus, Loader2, Utensils, Check, CheckCircle2, Crown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useFoodDatabase, Food } from '@/hooks/useFoodDatabase';
import { useXPAnimation } from '@/contexts/XPAnimationContext';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { createMealTimestamp } from '@/lib/dateUtils';
import { useInvalidateFoodIntake } from '@/hooks/useDailyFoodIntake';
import { useInvalidateNutritionSummary } from '@/hooks/useNutritionSummary';
import { Card3D } from '@/components/ui/card-3d';
import { cn } from '@/lib/utils';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';

interface ScannerFoodSearchProps {
  mealType: string;
  selectedDate: string;
  userId: string;
  onFoodAdded: () => void;
}

const ScannerFoodSearch: React.FC<ScannerFoodSearchProps> = ({
  mealType,
  selectedDate,
  userId,
  onFoodAdded
}) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const { triggerXP } = useXPAnimation();
  const invalidateFoodIntake = useInvalidateFoodIntake();
  const invalidateNutritionSummary = useInvalidateNutritionSummary();
  const { limits } = useSubscriptionLimits(userId);
  const {
    searchFoods,
    getRecentFoods,
    getFavoriteFoods,
    getFrequentFoods,
    toggleFavorite,
    trackFoodUsage,
    isLoading
  } = useFoodDatabase(userId);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'frequent' | 'recent' | 'favorites'>('frequent');
  const [searchResults, setSearchResults] = useState<Food[]>([]);
  const [filteredFoods, setFilteredFoods] = useState<Food[]>([]);
  const [addingFoodId, setAddingFoodId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  
  // Multi-select state for premium users
  const [selectedFoods, setSelectedFoods] = useState<Set<string>>(new Set());
  const [isAddingMultiple, setIsAddingMultiple] = useState(false);
  const isMultiSelectEnabled = limits.isCheflyPlus;

  const texts = {
    es: {
      searchPlaceholder: 'Buscar alimento...',
      frequent: 'Frecuentes',
      recent: 'Recientes',
      favorites: 'Favoritos',
      noResults: 'No se encontraron alimentos',
      trySearch: 'Intenta buscar otro término',
      added: 'añadido',
      portion: 'porción',
      cal: 'kcal',
      addSelected: 'Agregar seleccionados',
      selected: 'seleccionados',
      multiSelectHint: 'Toca para seleccionar varios',
    },
    en: {
      searchPlaceholder: 'Search food...',
      frequent: 'Frequent',
      recent: 'Recent',
      favorites: 'Favorites',
      noResults: 'No foods found',
      trySearch: 'Try searching another term',
      added: 'added',
      portion: 'portion',
      cal: 'kcal',
      addSelected: 'Add selected',
      selected: 'selected',
      multiSelectHint: 'Tap to select multiple',
    }
  };

  const t = texts[language];

  const filters = [
    { id: 'frequent', label: t.frequent, icon: TrendingUp },
    { id: 'recent', label: t.recent, icon: Clock },
    { id: 'favorites', label: t.favorites, icon: Star },
  ];

  // Load filtered foods based on active filter
  useEffect(() => {
    const loadFoods = async () => {
      let foods: Food[] = [];
      switch (activeFilter) {
        case 'frequent':
          foods = await getFrequentFoods();
          break;
        case 'recent':
          foods = await getRecentFoods();
          break;
        case 'favorites':
          foods = await getFavoriteFoods();
          const favIds = new Set(foods.map(f => f.id));
          setFavorites(favIds);
          break;
      }
      setFilteredFoods(foods);
    };
    
    if (!searchQuery) {
      loadFoods();
    }
  }, [activeFilter, searchQuery, getFrequentFoods, getRecentFoods, getFavoriteFoods]);

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        const results = await searchFoods(searchQuery);
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchFoods]);

  const handleAddFood = async (food: Food) => {
    setAddingFoodId(food.id);
    
    try {
      const scannedAt = createMealTimestamp(selectedDate, mealType);

      const { error } = await supabase
        .from('food_scans')
        .insert({
          user_id: userId,
          dish_name: food.name || 'Unknown food',
          calories: Math.round(Number(food.calories) || 0),
          protein: Math.round(Number(food.protein) || 0),
          carbs: Math.round(Number(food.carbs) || 0),
          fat: Math.round(Number(food.fats) || 0),
          fiber: Math.round(Number(food.fiber) || 0),
          meal_type: mealType,
          portion_estimate: food.portion || '1 porción',
          confidence: 'high',
          foods_identified: [food.name],
          notes: `${language === 'es' ? 'Añadido manualmente' : 'Added manually'}`,
          scanned_at: scannedAt,
        });

      if (error) throw error;

      await trackFoodUsage(food.id);

      triggerXP(10, 'food', { x: window.innerWidth / 2, y: window.innerHeight / 2 });
      invalidateFoodIntake();
      invalidateNutritionSummary();

      toast({
        title: `${food.name} ${t.added}`,
        description: `+${food.calories} ${t.cal}`,
      });

      onFoodAdded();
    } catch (error) {
      console.error('Error adding food:', error);
    } finally {
      setAddingFoodId(null);
    }
  };

  // Toggle selection for multi-select (premium only)
  const handleToggleSelection = (foodId: string) => {
    setSelectedFoods(prev => {
      const updated = new Set(prev);
      if (updated.has(foodId)) {
        updated.delete(foodId);
      } else {
        updated.add(foodId);
      }
      return updated;
    });
  };

  // Add all selected foods at once (premium only)
  const handleAddSelectedFoods = async () => {
    if (selectedFoods.size === 0) return;
    
    setIsAddingMultiple(true);
    const foodsToAdd = displayFoods.filter(f => selectedFoods.has(f.id));
    const scannedAt = createMealTimestamp(selectedDate, mealType);
    
    try {
      const insertData = foodsToAdd.map(food => ({
        user_id: userId,
        dish_name: food.name || 'Unknown food',
        calories: Math.round(Number(food.calories) || 0),
        protein: Math.round(Number(food.protein) || 0),
        carbs: Math.round(Number(food.carbs) || 0),
        fat: Math.round(Number(food.fats) || 0),
        fiber: Math.round(Number(food.fiber) || 0),
        meal_type: mealType,
        portion_estimate: food.portion || '1 porción',
        confidence: 'high' as const,
        foods_identified: [food.name],
        notes: `${language === 'es' ? 'Añadido manualmente' : 'Added manually'}`,
        scanned_at: scannedAt,
      }));

      const { error } = await supabase
        .from('food_scans')
        .insert(insertData);

      if (error) throw error;

      // Track usage for all foods
      await Promise.all(foodsToAdd.map(f => trackFoodUsage(f.id)));

      const totalCalories = foodsToAdd.reduce((sum, f) => sum + (Number(f.calories) || 0), 0);
      triggerXP(10 * foodsToAdd.length, 'food', { x: window.innerWidth / 2, y: window.innerHeight / 2 });
      invalidateFoodIntake();
      invalidateNutritionSummary();

      toast({
        title: `${foodsToAdd.length} ${language === 'es' ? 'alimentos agregados' : 'foods added'}`,
        description: `+${totalCalories} ${t.cal}`,
      });

      setSelectedFoods(new Set());
      onFoodAdded();
    } catch (error) {
      console.error('Error adding foods:', error);
      toast({
        title: language === 'es' ? 'Error' : 'Error',
        description: language === 'es' ? 'No se pudieron agregar los alimentos' : 'Could not add foods',
        variant: 'destructive',
      });
    } finally {
      setIsAddingMultiple(false);
    }
  };

  const handleToggleFavorite = async (foodId: string) => {
    const newState = await toggleFavorite(foodId);
    setFavorites(prev => {
      const updated = new Set(prev);
      if (newState) {
        updated.add(foodId);
      } else {
        updated.delete(foodId);
      }
      return updated;
    });
  };

  const displayFoods = searchQuery.length >= 2 ? searchResults : filteredFoods;

  return (
    <div className="flex flex-col h-full">
      {/* Search Input - 3D Inset Style */}
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t.searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-11 h-12 bg-muted/50 border-2 border-border/50 rounded-2xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] focus:shadow-[inset_0_2px_4px_rgba(0,0,0,0.06),0_0_0_2px_hsl(var(--primary)/0.2)] transition-shadow"
        />
      </div>

      {/* Multi-select hint for premium users */}
      {isMultiSelectEnabled && displayFoods.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mb-3 px-2"
        >
          <Crown className="h-3.5 w-3.5 text-amber-500" />
          <span className="text-xs text-muted-foreground">{t.multiSelectHint}</span>
        </motion.div>
      )}

      {/* Filter Tabs - 3D Pills */}
      {!searchQuery && (
        <div className="flex gap-2 mb-4">
          {filters.map((filter) => {
            const isActive = activeFilter === filter.id;
            const Icon = filter.icon;
            
            return (
              <motion.button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id as typeof activeFilter)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-[0_3px_0_hsl(var(--primary)/0.4),0_5px_10px_rgba(0,0,0,0.15)]"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted shadow-[0_2px_0_hsl(var(--border)),0_3px_6px_rgba(0,0,0,0.05)]"
                )}
                whileTap={{ y: 1 }}
              >
                <Icon className="h-3.5 w-3.5" />
                {filter.label}
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Food List */}
      <div className="flex-1 overflow-y-auto space-y-2 pb-20">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : displayFoods.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 mx-auto bg-muted rounded-2xl flex items-center justify-center mb-4 shadow-[0_4px_0_hsl(var(--border))]">
              <Utensils className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="font-semibold text-foreground">{t.noResults}</p>
            <p className="text-sm text-muted-foreground mt-1">{t.trySearch}</p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {displayFoods.map((food, index) => {
              const isSelected = selectedFoods.has(food.id);
              
              return (
                <motion.div
                  key={food.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 1 }}
                >
                  <Card3D 
                    variant="default" 
                    hover={false} 
                    className={cn(
                      "p-3 flex items-center justify-between transition-all",
                      isSelected && "ring-2 ring-primary bg-primary/5"
                    )}
                  >
                    {/* Selection checkbox for premium users */}
                    {isMultiSelectEnabled && (
                      <button
                        onClick={() => handleToggleSelection(food.id)}
                        className={cn(
                          "h-6 w-6 rounded-lg mr-3 flex items-center justify-center flex-shrink-0 transition-all",
                          isSelected 
                            ? "bg-primary text-primary-foreground shadow-[0_2px_0_hsl(var(--primary)/0.4)]" 
                            : "bg-muted border-2 border-border"
                        )}
                      >
                        {isSelected && <Check className="h-4 w-4" />}
                      </button>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground truncate">
                          {language === 'en' && food.name_en ? food.name_en : food.name}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(food.id);
                          }}
                          className="flex-shrink-0"
                        >
                          <Star 
                            className={`h-4 w-4 transition-colors ${favorites.has(food.id) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground hover:text-amber-400'}`} 
                          />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {food.portion} · <span className="font-semibold text-primary">{food.calories} {t.cal}</span>
                      </p>
                    </div>

                    {/* Single add button (shown when not in multi-select or as quick-add) */}
                    {!isMultiSelectEnabled && (
                      <Button
                        size="sm"
                        className="h-9 w-9 p-0 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary shadow-[0_2px_0_hsl(var(--primary)/0.2)] active:translate-y-0.5 active:shadow-none transition-all"
                        variant="ghost"
                        onClick={() => handleAddFood(food)}
                        disabled={addingFoodId === food.id}
                      >
                        {addingFoodId === food.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    
                    {/* Quick add for premium when item is not selected */}
                    {isMultiSelectEnabled && !isSelected && (
                      <Button
                        size="sm"
                        className="h-8 w-8 p-0 rounded-lg bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddFood(food);
                        }}
                        disabled={addingFoodId === food.id}
                      >
                        {addingFoodId === food.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Plus className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    )}
                  </Card3D>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Floating Add Selected Button (Premium Only) */}
      <AnimatePresence>
        {isMultiSelectEnabled && selectedFoods.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-4 right-4 max-w-2xl mx-auto z-50"
          >
            <Button
              onClick={handleAddSelectedFoods}
              disabled={isAddingMultiple}
              size="lg"
              className="w-full gap-2 rounded-2xl h-14 font-bold shadow-[0_4px_0_hsl(var(--primary)/0.4),0_8px_20px_rgba(0,0,0,0.25)] active:translate-y-1 active:shadow-[0_2px_0_hsl(var(--primary)/0.4)] transition-all"
            >
              {isAddingMultiple ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  {t.addSelected} ({selectedFoods.size})
                </>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScannerFoodSearch;
