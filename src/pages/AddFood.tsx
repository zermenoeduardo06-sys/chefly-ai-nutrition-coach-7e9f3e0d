import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Camera, MoreHorizontal, Carrot, UtensilsCrossed, ChefHat, ClipboardList, Crown, Barcode, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import ContextualPaywall from "@/components/ContextualPaywall";
import { cn } from "@/lib/utils";

type Category = "foods" | "meals" | "recipes" | "plan";
type FilterTab = "frequent" | "recent" | "favorites";
type BottomTab = "camera" | "search";

interface FoodItem {
  id: string;
  name: string;
  portion: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fats?: number;
}

const mealTypeLabels = {
  breakfast: { es: "Desayuno", en: "Breakfast" },
  lunch: { es: "Almuerzo", en: "Lunch" },
  dinner: { es: "Cena", en: "Dinner" },
  snack: { es: "Snack", en: "Snack" },
};

// Sample food data - would come from database/API
const sampleFoods: FoodItem[] = [
  { id: "1", name: "Café negro", portion: "1 taza (237 mL)", calories: 2, protein: 0.3, carbs: 0, fats: 0 },
  { id: "2", name: "Plátano", portion: "1 mediano (118 g)", calories: 105, protein: 1.3, carbs: 27, fats: 0.4 },
  { id: "3", name: "Huevo revuelto", portion: "1 grande (50 g)", calories: 91, protein: 6, carbs: 1, fats: 7 },
  { id: "4", name: "Avena con leche", portion: "1 taza (240 g)", calories: 150, protein: 5, carbs: 27, fats: 3 },
  { id: "5", name: "Tostada integral", portion: "1 rebanada (30 g)", calories: 70, protein: 3, carbs: 12, fats: 1 },
  { id: "6", name: "Yogur griego", portion: "170 g", calories: 100, protein: 17, carbs: 6, fats: 0.7 },
];

export default function AddFood() {
  const navigate = useNavigate();
  const { mealType } = useParams<{ mealType: string }>();
  const { language } = useLanguage();
  const [userId, setUserId] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("foods");
  const [activeFilter, setActiveFilter] = useState<FilterTab>("frequent");
  const [activeBottomTab, setActiveBottomTab] = useState<BottomTab>("search");
  const [selectedFoods, setSelectedFoods] = useState<FoodItem[]>([]);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState<"scan" | "plan">("plan");
  const [planMeals, setPlanMeals] = useState<FoodItem[]>([]);

  const subscription = useSubscription(userId);
  const isPremium = subscription.isCheflyPlus;
  
  const validMealType = (mealType as keyof typeof mealTypeLabels) || "breakfast";

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUserId(user.id);

      // Load meals from weekly plan for this meal type
      const today = new Date().getDay();
      const { data: mealPlan } = await supabase
        .from("meal_plans")
        .select("id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (mealPlan) {
        const { data: meals } = await supabase
          .from("meals")
          .select("*")
          .eq("meal_plan_id", mealPlan.id)
          .eq("meal_type", validMealType)
          .eq("day_of_week", today);

        if (meals) {
          setPlanMeals(meals.map(m => ({
            id: m.id,
            name: m.name,
            portion: "1 porción",
            calories: m.calories || 0,
            protein: m.protein || 0,
            carbs: m.carbs || 0,
            fats: m.fats || 0,
          })));
        }
      }
    };

    loadData();
  }, [navigate, validMealType]);

  const texts = {
    es: {
      whatDidYouEat: `¿Qué has ${validMealType === 'breakfast' ? 'desayunado' : validMealType === 'lunch' ? 'almorzado' : validMealType === 'dinner' ? 'cenado' : 'comido'}?`,
      foods: "Alimentos",
      meals: "Comidas",
      recipes: "Recetas",
      fromPlan: "Del Plan",
      frequent: "Frecuentes",
      recent: "Recientes",
      favorites: "Favoritos",
      cameraAI: "Cámara IA",
      search: "Buscar",
      done: "Listo",
      noResults: "No se encontraron resultados",
      premium: "Premium",
      kcal: "kcal",
    },
    en: {
      whatDidYouEat: `What did you have for ${validMealType}?`,
      foods: "Foods",
      meals: "Meals",
      recipes: "Recipes",
      fromPlan: "From Plan",
      frequent: "Frequent",
      recent: "Recent",
      favorites: "Favorites",
      cameraAI: "AI Camera",
      search: "Search",
      done: "Done",
      noResults: "No results found",
      premium: "Premium",
      kcal: "kcal",
    },
  };

  const t = texts[language];
  const mealLabel = mealTypeLabels[validMealType][language];

  const categories = [
    { id: "foods" as Category, label: t.foods, icon: Carrot, premium: false },
    { id: "meals" as Category, label: t.meals, icon: UtensilsCrossed, premium: false },
    { id: "recipes" as Category, label: t.recipes, icon: ChefHat, premium: false },
    { id: "plan" as Category, label: t.fromPlan, icon: ClipboardList, premium: true },
  ];

  const filterTabs = [
    { id: "frequent" as FilterTab, label: t.frequent },
    { id: "recent" as FilterTab, label: t.recent },
    { id: "favorites" as FilterTab, label: t.favorites },
  ];

  const handleCategoryChange = (category: Category) => {
    if (category === "plan" && !isPremium) {
      setPaywallFeature("plan");
      setShowPaywall(true);
      return;
    }
    setActiveCategory(category);
  };

  const handleBottomTabChange = (tab: BottomTab) => {
    if (tab === "camera") {
      // Navigate to AI Camera page
      navigate(`/dashboard/ai-camera/${validMealType}`);
      return;
    }
    setActiveBottomTab(tab);
  };

  const handleAddFood = (food: FoodItem) => {
    if (selectedFoods.find(f => f.id === food.id)) {
      setSelectedFoods(selectedFoods.filter(f => f.id !== food.id));
    } else {
      setSelectedFoods([...selectedFoods, food]);
    }
  };

  const handleDone = async () => {
    if (!userId || selectedFoods.length === 0) {
      navigate(-1);
      return;
    }

    try {
      // Save each selected food to food_scans with the meal_type
      const foodScansToInsert = selectedFoods.map(food => ({
        user_id: userId,
        dish_name: food.name,
        calories: food.calories,
        protein: food.protein || 0,
        carbs: food.carbs || 0,
        fat: food.fats || 0,
        portion_estimate: food.portion,
        meal_type: validMealType,
        confidence: 'high',
      }));

      const { error } = await supabase
        .from('food_scans')
        .insert(foodScansToInsert);

      if (error) {
        console.error('Error saving foods:', error);
      }
    } catch (error) {
      console.error('Error saving foods:', error);
    }

    navigate(-1);
  };

  const filteredFoods = (activeCategory === "plan" ? planMeals : sampleFoods).filter(food =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalSelected = selectedFoods.length;

  // Remove the scanner view - we use the Dialog directly now
  // The scanner is rendered as a dialog at the bottom of this component
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <span className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
              {totalSelected}
            </span>
            <span className="font-medium text-foreground">{mealLabel}</span>
          </div>
          <button className="p-2">
            <MoreHorizontal className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder={t.whatDidYouEat}
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
              <div className="relative">
                <category.icon className="h-5 w-5" />
                {category.premium && !isPremium && (
                  <Crown className="h-3 w-3 absolute -top-1 -right-2 text-yellow-500" />
                )}
              </div>
              <span className="text-xs font-medium whitespace-nowrap">{category.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
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

      {/* Food List */}
      <div className="flex-1 overflow-y-auto pb-32">
        <AnimatePresence mode="popLayout">
          {filteredFoods.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Search className="h-12 w-12 mb-4 opacity-50" />
              <p>{t.noResults}</p>
            </div>
          ) : (
            filteredFoods.map((food, index) => {
              const isSelected = selectedFoods.find(f => f.id === food.id);
              return (
                <motion.button
                  key={food.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => handleAddFood(food)}
                  className={cn(
                    "w-full flex items-center justify-between p-4 border-b border-border transition-colors",
                    isSelected && "bg-primary/5"
                  )}
                >
                  <div className="text-left">
                    <p className="font-medium text-foreground">{food.name}</p>
                    <p className="text-sm text-muted-foreground">{food.portion}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {food.calories} {t.kcal}
                    </span>
                    <div className={cn(
                      "h-7 w-7 rounded-full border-2 flex items-center justify-center transition-colors",
                      isSelected 
                        ? "bg-primary border-primary" 
                        : "border-muted-foreground/30"
                    )}>
                      {isSelected && <Plus className="h-4 w-4 text-primary-foreground rotate-45" />}
                    </div>
                  </div>
                </motion.button>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Done Button - Floating */}
      {totalSelected > 0 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-20 left-4 right-4 z-40"
        >
          <Button
            onClick={handleDone}
            className="w-full h-14 text-lg font-semibold shadow-lg"
            size="lg"
          >
            {t.done}
          </Button>
        </motion.div>
      )}

      {/* Bottom Tab Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t safe-area-pb z-50">
        <div className="flex">
          <button
            onClick={() => handleBottomTabChange("camera")}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-3 transition-colors",
              activeBottomTab === "camera" ? "text-primary" : "text-muted-foreground"
            )}
          >
            <div className="relative">
              <Camera className="h-6 w-6" />
              {!isPremium && (
                <Crown className="h-3 w-3 absolute -top-1 -right-2 text-yellow-500" />
              )}
            </div>
            <span className="text-xs font-medium">{t.cameraAI}</span>
          </button>
          <button
            onClick={() => handleBottomTabChange("search")}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-3 transition-colors",
              activeBottomTab === "search" ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Search className="h-6 w-6" />
            <span className="text-xs font-medium">{t.search}</span>
          </button>
        </div>
      </div>

      {/* Paywall */}
      <ContextualPaywall
        open={showPaywall}
        onOpenChange={setShowPaywall}
        feature={paywallFeature}
        userId={userId}
      />
    </div>
  );
}
