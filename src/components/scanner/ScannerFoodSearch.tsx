import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, Clock, TrendingUp, Plus, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFoodDatabase, Food } from '@/hooks/useFoodDatabase';
import { useXPAnimation } from '@/contexts/XPAnimationContext';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

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
      cal: 'kcal'
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
      cal: 'kcal'
    }
  };

  const t = texts[language];

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
          // Track favorites from this list
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
      // Save to food_scans table (same as scanner)
      const { error } = await supabase
        .from('food_scans')
        .insert({
          user_id: userId,
          dish_name: food.name,
          calories: food.calories,
          protein: food.protein || 0,
          carbs: food.carbs || 0,
          fat: food.fats || 0,
          fiber: food.fiber || 0,
          meal_type: mealType,
          portion_estimate: food.portion,
          confidence: 'high',
          foods_identified: [food.name],
          notes: `${language === 'es' ? 'Añadido manualmente' : 'Added manually'}`,
        });

      if (error) throw error;

      // Track usage for frequent foods
      await trackFoodUsage(food.id);

      // Trigger XP animation
      triggerXP(10, 'food', { x: window.innerWidth / 2, y: window.innerHeight / 2 });

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
      {/* Search Input */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t.searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-card border-border"
        />
      </div>

      {/* Filter Tabs */}
      {!searchQuery && (
        <Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v as typeof activeFilter)} className="mb-4">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50">
            <TabsTrigger value="frequent" className="text-xs gap-1">
              <TrendingUp className="h-3 w-3" />
              {t.frequent}
            </TabsTrigger>
            <TabsTrigger value="recent" className="text-xs gap-1">
              <Clock className="h-3 w-3" />
              {t.recent}
            </TabsTrigger>
            <TabsTrigger value="favorites" className="text-xs gap-1">
              <Star className="h-3 w-3" />
              {t.favorites}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* Food List */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : displayFoods.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>{t.noResults}</p>
            <p className="text-sm">{t.trySearch}</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {displayFoods.map((food, index) => (
              <motion.div
                key={food.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.03 }}
                className="bg-card rounded-xl p-3 border border-border flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground truncate">
                      {language === 'en' && food.name_en ? food.name_en : food.name}
                    </p>
                    <button
                      onClick={() => handleToggleFavorite(food.id)}
                      className="flex-shrink-0"
                    >
                      <Star 
                        className={`h-4 w-4 ${favorites.has(food.id) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`} 
                      />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {food.portion} · {food.calories} {t.cal}
                  </p>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 rounded-full bg-primary/10 hover:bg-primary/20 text-primary"
                  onClick={() => handleAddFood(food)}
                  disabled={addingFoodId === food.id}
                >
                  {addingFoodId === food.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default ScannerFoodSearch;
