import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MoreHorizontal, Carrot, UtensilsCrossed, ChefHat, Barcode, ArrowLeft, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { useFoodDatabase, Food } from "@/hooks/useFoodDatabase";
import { ScannerPromo } from "@/components/food/ScannerPromo";
import { FoodListItem } from "@/components/food/FoodListItem";
import { FoodScanner } from "@/components/FoodScanner";
import ContextualPaywall from "@/components/ContextualPaywall";
import { FoodAddedCelebration } from "@/components/celebrations/FoodAddedCelebration";
import { useCelebrations } from "@/hooks/useCelebrations";
import { useXPAnimation } from "@/contexts/XPAnimationContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";

type Category = "foods" | "meals" | "recipes";
type FilterTab = "frequent" | "recent" | "favorites";

const mealTypeLabels = {
  breakfast: { es: "Desayuno", en: "Breakfast" },
  lunch: { es: "Almuerzo", en: "Lunch" },
  dinner: { es: "Cena", en: "Dinner" },
  snack: { es: "Snack", en: "Snack" },
};

export default function AddFood() {
  const navigate = useNavigate();
  const { mealType } = useParams<{ mealType: string }>();
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const [userId, setUserId] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("foods");
  const [activeFilter, setActiveFilter] = useState<FilterTab>("frequent");
  const [selectedFoods, setSelectedFoods] = useState<Food[]>([]);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState<"scan">("scan");
  const [showScanner, setShowScanner] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showFoodCelebration, setShowFoodCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{ name: string; calories: number; points: number } | null>(null);

  const { celebrateFoodAdded } = useCelebrations();
  const { triggerXP } = useXPAnimation();

  const subscription = useSubscription(userId);
  const { limits } = useSubscriptionLimits(userId);
  const isPremium = subscription.isCheflyPlus;
  
  const {
    foods: dbFoods,
    frequentFoods,
    recentFoods,
    favoriteFoods,
    isLoading,
    searchFoods,
    getAllFoods,
    getFrequentFoods,
    getRecentFoods,
    getFavoriteFoods,
    toggleFavorite,
    trackFoodUsage,
  } = useFoodDatabase(userId);

  const validMealType = (mealType as keyof typeof mealTypeLabels) || "breakfast";
  const selectedDate = searchParams.get('date') || format(new Date(), 'yyyy-MM-dd');

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchFoods(searchQuery);
      } else if (searchQuery.length === 0) {
        getAllFoods();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchFoods, getAllFoods]);

  // Load user data and initial foods
  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUserId(user.id);

      // Load initial foods from database
      getAllFoods();
    };

    loadData();
  }, [navigate, getAllFoods]);

  // Load filtered foods based on active filter
  useEffect(() => {
    if (userId && activeCategory === "foods" && searchQuery.length === 0) {
      if (activeFilter === "frequent") {
        getFrequentFoods();
      } else if (activeFilter === "recent") {
        getRecentFoods();
      } else if (activeFilter === "favorites") {
        getFavoriteFoods();
      }
    }
  }, [userId, activeFilter, activeCategory, searchQuery, getFrequentFoods, getRecentFoods, getFavoriteFoods]);

  const texts = {
    es: {
      whatDidYouEat: `¿Qué has ${validMealType === 'breakfast' ? 'desayunado' : validMealType === 'lunch' ? 'almorzado' : validMealType === 'dinner' ? 'cenado' : 'comido'}?`,
      foods: "Alimentos",
      meals: "Comidas",
      recipes: "Recetas",
      frequent: "Frecuentes",
      recent: "Recientes",
      favorites: "Favoritos",
      done: "Listo",
      noResults: "No se encontraron resultados",
      searchHint: "Busca entre 100+ alimentos",
      kcal: "kcal",
      saving: "Guardando...",
      saved: "Alimentos guardados",
      or: "o busca manualmente",
    },
    en: {
      whatDidYouEat: `What did you have for ${validMealType}?`,
      foods: "Foods",
      meals: "Meals",
      recipes: "Recipes",
      frequent: "Frequent",
      recent: "Recent",
      favorites: "Favorites",
      done: "Done",
      noResults: "No results found",
      searchHint: "Search 100+ foods",
      kcal: "kcal",
      saving: "Saving...",
      saved: "Foods saved",
      or: "or search manually",
    },
  };

  const t = texts[language];
  const mealLabel = mealTypeLabels[validMealType][language];

  const categories = [
    { id: "foods" as Category, label: t.foods, icon: Carrot },
    { id: "meals" as Category, label: t.meals, icon: UtensilsCrossed },
    { id: "recipes" as Category, label: t.recipes, icon: ChefHat },
  ];

  const filterTabs = [
    { id: "frequent" as FilterTab, label: t.frequent },
    { id: "recent" as FilterTab, label: t.recent },
    { id: "favorites" as FilterTab, label: t.favorites },
  ];

  const handleCategoryChange = (category: Category) => {
    setActiveCategory(category);
    setSearchQuery("");
  };

  const handleScanClick = () => {
    // Navigate to AI Camera page (handles premium check internally)
    const dateParam = selectedDate ? `?date=${selectedDate}` : '';
    navigate(`/dashboard/ai-camera/${validMealType}${dateParam}`);
  };

  const handleAddFood = (food: Food) => {
    if (selectedFoods.find(f => f.id === food.id)) {
      setSelectedFoods(selectedFoods.filter(f => f.id !== food.id));
    } else {
      setSelectedFoods([...selectedFoods, food]);
    }
  };

  const handleToggleFavorite = useCallback((foodId: string) => {
    toggleFavorite(foodId);
  }, [toggleFavorite]);

  const getTimeForMeal = (mealType: string): string => {
    switch(mealType) {
      case 'breakfast': return '08:00:00';
      case 'lunch': return '13:00:00';
      case 'dinner': return '20:00:00';
      case 'snack': return '16:00:00';
      default: return '12:00:00';
    }
  };

  const handleDone = async () => {
    console.log('[AddFood] handleDone called', { userId, selectedFoodsCount: selectedFoods.length });
    
    if (!userId || selectedFoods.length === 0) {
      console.log('[AddFood] Early return - no userId or no foods selected');
      navigate(-1);
      return;
    }

    setIsSaving(true);

    try {
      // Track usage for each selected food - non-blocking
      Promise.all(selectedFoods.map(food => trackFoodUsage(food.id)))
        .catch(err => console.warn('[AddFood] trackFoodUsage failed (non-blocking):', err));

      // Calculate the correct timestamp based on selected date and meal type
      const mealTime = getTimeForMeal(validMealType);
      let scannedAtDate = new Date(`${selectedDate}T${mealTime}`);
      
      // Validate the date - use current date as fallback if invalid
      if (isNaN(scannedAtDate.getTime())) {
        console.warn('[AddFood] Invalid date constructed, using current date:', { selectedDate, mealTime });
        scannedAtDate = new Date();
      }
      
      const scannedAt = scannedAtDate.toISOString();

      // Save each selected food to food_scans with the meal_type
      // IMPORTANT: Round ALL numeric values to integers to prevent "22P02" errors
      const foodScansToInsert = selectedFoods.map(food => {
        const calories = Math.round(Number(food.calories) || 0);
        const protein = Math.round(Number(food.protein) || 0);
        const carbs = Math.round(Number(food.carbs) || 0);
        const fat = Math.round(Number(food.fats) || 0);
        const fiber = Math.round(Number(food.fiber) || 0);
        
        console.log('[AddFood] Processing food:', food.name, { calories, protein, carbs, fat, fiber });
        
        return {
          user_id: userId,
          dish_name: food.name || 'Unknown food',
          calories,
          protein,
          carbs,
          fat,
          fiber,
          portion_estimate: food.portion || '1 porción',
          meal_type: validMealType,
          confidence: 'high',
          scanned_at: scannedAt,
        };
      });

      console.log('[AddFood] Inserting food scans:', foodScansToInsert);

      const { data, error } = await supabase
        .from('food_scans')
        .insert(foodScansToInsert)
        .select();

      console.log('[AddFood] Supabase response:', { data, error });

      if (error) {
        console.error('[AddFood] Error saving foods:', error);
        toast.error(language === 'es' ? `Error al guardar: ${error.message}` : `Error saving: ${error.message}`);
        setIsSaving(false);
        return;
      }
      
      // Success! Calculate total calories and points
      const totalCalories = selectedFoods.reduce((sum, f) => sum + f.calories, 0);
      const pointsEarned = selectedFoods.length * 10;
      const firstName = selectedFoods[0]?.name || '';
      const displayName = selectedFoods.length > 1 
        ? `${firstName} +${selectedFoods.length - 1}`
        : firstName;

      console.log('[AddFood] Foods saved successfully:', { totalCalories, pointsEarned, displayName });

      // Set celebration data
      setCelebrationData({
        name: displayName,
        calories: totalCalories,
        points: pointsEarned,
      });

      // Trigger celebration effects
      celebrateFoodAdded(firstName, pointsEarned);
      triggerXP(pointsEarned, 'food');

      // Show celebration overlay
      setShowFoodCelebration(true);

      // Wait for celebration to finish before navigating
      setTimeout(() => {
        setShowFoodCelebration(false);
        navigate(-1);
      }, 1800);
      
      setIsSaving(false);
      return; // Exit early to prevent immediate navigation
      
    } catch (error) {
      console.error('[AddFood] Unexpected error:', error);
      toast.error(language === 'es' ? 'Error inesperado al guardar' : 'Unexpected error saving');
      setIsSaving(false);
    }
  };

  // Get foods to display based on current state
  const getDisplayFoods = (): Food[] => {
    if (searchQuery.length >= 2) {
      return dbFoods;
    }

    if (activeCategory === "foods") {
      switch (activeFilter) {
        case "frequent":
          return frequentFoods.length > 0 ? frequentFoods : dbFoods;
        case "recent":
          return recentFoods.length > 0 ? recentFoods : dbFoods;
        case "favorites":
          return favoriteFoods;
        default:
          return dbFoods;
      }
    }

    return dbFoods;
  };

  const displayFoods = getDisplayFoods();
  const totalSelected = selectedFoods.length;
  const scansRemaining = Math.max(0, limits.dailyFoodScanLimit - limits.foodScansUsed);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="p-1">
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
            <div className="flex items-center gap-2">
              <span className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                {totalSelected}
              </span>
              <span className="font-medium text-foreground">{mealLabel}</span>
            </div>
          </div>
          <button className="p-2">
            <MoreHorizontal className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Scanner Promo Section */}
      <div className="p-4 pb-2">
        <ScannerPromo
          scansRemaining={scansRemaining}
          maxScans={limits.dailyFoodScanLimit}
          isPremium={isPremium}
          onScanClick={handleScanClick}
        />
      </div>

      {/* Divider */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">{t.or}</span>
          <div className="flex-1 h-px bg-border" />
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder={t.searchHint}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 h-12 bg-muted border-0"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2">
            <Barcode className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="px-4 py-2">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-xl min-w-[72px] transition-colors",
                activeCategory === category.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <category.icon className="h-5 w-5" />
              <span className="text-xs font-medium whitespace-nowrap">{category.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      {activeCategory === "foods" && (
        <div className="px-4 py-2 border-b">
          <div className="flex gap-4">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={cn(
                  "pb-2 text-sm font-medium transition-colors border-b-2",
                  activeFilter === tab.id
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Food List */}
      <div className="flex-1 overflow-y-auto pb-32 px-4 pt-2 space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {displayFoods.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Search className="h-12 w-12 mb-4 opacity-50" />
                <p>{t.noResults}</p>
              </div>
            ) : (
              displayFoods.map((food) => (
                <FoodListItem
                  key={food.id}
                  food={food}
                  isSelected={!!selectedFoods.find(f => f.id === food.id)}
                  isFavorite={favoriteFoods.some(f => f.id === food.id)}
                  onSelect={handleAddFood}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Done Button - Floating */}
      {totalSelected > 0 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-6 left-4 right-4 z-40"
        >
          <Button
            onClick={handleDone}
            disabled={isSaving}
            className="w-full h-14 text-lg font-semibold shadow-lg"
            size="lg"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                {t.saving}
              </>
            ) : (
              `${t.done} (${totalSelected})`
            )}
          </Button>
        </motion.div>
      )}

      {/* Food Scanner Dialog */}
      <FoodScanner
        open={showScanner}
        onOpenChange={setShowScanner}
        mealType={validMealType}
        onSaveSuccess={() => {
          setShowScanner(false);
          navigate(-1);
        }}
      />

      {/* Paywall */}
      <ContextualPaywall
        open={showPaywall}
        onOpenChange={setShowPaywall}
        feature={paywallFeature}
        userId={userId}
      />

      {/* Food Added Celebration */}
      <FoodAddedCelebration
        show={showFoodCelebration}
        foodName={celebrationData?.name || ''}
        calories={celebrationData?.calories || 0}
        points={celebrationData?.points || 10}
        onComplete={() => setShowFoodCelebration(false)}
      />
    </div>
  );
}
