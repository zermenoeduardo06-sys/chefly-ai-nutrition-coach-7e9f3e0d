import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  ChefHat, 
  Clock, 
  Flame, 
  Lock, 
  Crown,
  ArrowLeft,
  Search,
  Loader2,
  UtensilsCrossed
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { MealImageWithSkeleton } from "@/components/MealImageWithSkeleton";
import ContextualPaywall from "@/components/ContextualPaywall";
import { cn } from "@/lib/utils";

interface Recipe {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fats: number | null;
  meal_type: string;
  ingredients: string[] | null;
  steps: string[] | null;
  benefits: string;
}

const mealTypeColors: Record<string, string> = {
  desayuno: "bg-amber-500/20 text-amber-400",
  almuerzo: "bg-emerald-500/20 text-emerald-400",
  cena: "bg-indigo-500/20 text-indigo-400",
  snack: "bg-pink-500/20 text-pink-400",
};

const mealTypeLabels: Record<string, Record<string, string>> = {
  desayuno: { es: "Desayuno", en: "Breakfast" },
  almuerzo: { es: "Almuerzo", en: "Lunch" },
  cena: { es: "Cena", en: "Dinner" },
  snack: { es: "Snack", en: "Snack" },
};

const texts = {
  es: {
    title: "Mis Recetas",
    subtitle: "Recetas personalizadas según tu objetivo",
    search: "Buscar recetas...",
    noRecipes: "Aún no tienes recetas",
    noRecipesDesc: "Genera tu plan semanal para ver tus recetas personalizadas",
    generatePlan: "Generar Plan",
    viewDetails: "Ver receta completa",
    locked: "Solo Chefly Plus",
    lockedDesc: "Accede a ingredientes, pasos y descarga de PDF",
    upgrade: "Mejorar a Plus",
    kcal: "kcal",
    ingredients: "ingredientes",
    steps: "pasos",
    all: "Todas",
    loading: "Cargando recetas...",
  },
  en: {
    title: "My Recipes",
    subtitle: "Personalized recipes for your goal",
    search: "Search recipes...",
    noRecipes: "No recipes yet",
    noRecipesDesc: "Generate your weekly plan to see personalized recipes",
    generatePlan: "Generate Plan",
    viewDetails: "View full recipe",
    locked: "Chefly Plus Only",
    lockedDesc: "Access ingredients, steps and PDF download",
    upgrade: "Upgrade to Plus",
    kcal: "kcal",
    ingredients: "ingredients",
    steps: "steps",
    all: "All",
    loading: "Loading recipes...",
  },
};

export default function Recipes() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [userId, setUserId] = useState<string>();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [showPaywall, setShowPaywall] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const { isCheflyPlus } = useSubscription(userId);
  const t = texts[language];

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUserId(user.id);
    };
    loadUser();
  }, [navigate]);

  useEffect(() => {
    if (!userId) return;
    loadRecipes();
  }, [userId]);

  const loadRecipes = async () => {
    if (!userId) return;
    setIsLoading(true);

    try {
      // Get the most recent meal plan (not necessarily current week)
      const { data: mealPlan } = await supabase
        .from("meal_plans")
        .select("id")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!mealPlan) {
        setRecipes([]);
        setFilteredRecipes([]);
        setIsLoading(false);
        return;
      }

      // Get all meals from the plan
      const { data: meals } = await supabase
        .from("meals")
        .select("*")
        .eq("meal_plan_id", mealPlan.id)
        .order("day_of_week", { ascending: true })
        .order("meal_type", { ascending: true });

      if (meals) {
        // Remove duplicates based on name
        const uniqueRecipes = meals.reduce((acc: Recipe[], meal) => {
          if (!acc.find(r => r.name === meal.name)) {
            acc.push(meal);
          }
          return acc;
        }, []);
        setRecipes(uniqueRecipes);
        setFilteredRecipes(uniqueRecipes);
      }
    } catch (error) {
      console.error("Error loading recipes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePlan = async () => {
    if (!userId || isGenerating) return;
    
    setIsGenerating(true);
    
    try {
      // First check if user has preferences
      const { data: preferences } = await supabase
        .from("user_preferences")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (!preferences) {
        // Redirect to onboarding if no preferences
        navigate("/onboarding");
        return;
      }

      // Generate the meal plan
      const { data, error } = await supabase.functions.invoke("generate-meal-plan", {
        body: { userId, forceNew: false, language },
      });

      if (error) {
        console.error("Error generating meal plan:", error);
        return;
      }

      // Reload recipes after generation
      await loadRecipes();
    } catch (error) {
      console.error("Error generating plan:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Filter recipes based on search and meal type
  useEffect(() => {
    let filtered = recipes;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(query) ||
        r.description?.toLowerCase().includes(query)
      );
    }

    if (activeFilter !== "all") {
      filtered = filtered.filter(r => r.meal_type === activeFilter);
    }

    setFilteredRecipes(filtered);
  }, [searchQuery, activeFilter, recipes]);

  const handleRecipeClick = (recipe: Recipe) => {
    if (isCheflyPlus) {
      navigate(`/dashboard/meal/${recipe.meal_type}`, { 
        state: { mealData: recipe }
      });
    } else {
      setSelectedRecipe(recipe);
      setShowPaywall(true);
    }
  };

  const mealTypes = ["all", "desayuno", "almuerzo", "cena", "snack"];

  if (isLoading) {
    return (
      <div className="min-h-full bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center gap-3 p-4">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">{t.title}</h1>
            <p className="text-sm text-muted-foreground">{t.subtitle}</p>
          </div>
          <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full">
            <ChefHat className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">{filteredRecipes.length}</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder={t.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 bg-muted border-0"
          />
        </div>
      </div>

      {/* Meal Type Filter Pills */}
      <div className="px-4 pb-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {mealTypes.map((type) => (
            <button
              key={type}
              onClick={() => setActiveFilter(type)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                activeFilter === type
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {type === "all" ? t.all : mealTypeLabels[type]?.[language] || type}
            </button>
          ))}
        </div>
      </div>

      {/* Recipes Grid */}
      <div className="px-4 space-y-3">
        {filteredRecipes.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <UtensilsCrossed className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{t.noRecipes}</h3>
            <p className="text-muted-foreground mb-6 max-w-xs">{t.noRecipesDesc}</p>
            <Button onClick={handleGeneratePlan} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {language === 'es' ? 'Generando...' : 'Generating...'}
                </>
              ) : (
                t.generatePlan
              )}
            </Button>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredRecipes.map((recipe, index) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow border-border/50"
                  onClick={() => handleRecipeClick(recipe)}
                >
                  <div className="flex">
                    {/* Image */}
                    <div className="w-28 h-28 flex-shrink-0 relative">
                      <MealImageWithSkeleton
                        src={recipe.image_url}
                        alt={recipe.name}
                        className="w-full h-full object-cover"
                      />
                      {!isCheflyPlus && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Lock className="h-6 w-6 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-foreground line-clamp-2 text-sm leading-tight">
                            {recipe.name}
                          </h3>
                          <Badge 
                            variant="secondary" 
                            className={cn("text-[10px] px-1.5 shrink-0", mealTypeColors[recipe.meal_type])}
                          >
                            {mealTypeLabels[recipe.meal_type]?.[language] || recipe.meal_type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                          {recipe.description}
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1 text-amber-500">
                          <Flame className="h-3.5 w-3.5" />
                          <span>{recipe.calories} {t.kcal}</span>
                        </div>
                        {isCheflyPlus && recipe.ingredients && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <UtensilsCrossed className="h-3.5 w-3.5" />
                            <span>{recipe.ingredients.length} {t.ingredients}</span>
                          </div>
                        )}
                        {isCheflyPlus && recipe.steps && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{recipe.steps.length} {t.steps}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Premium Upsell Banner for Free Users */}
      {!isCheflyPlus && filteredRecipes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="px-4 mt-6"
        >
          <Card className="p-4 bg-gradient-to-r from-amber-500/10 to-primary/10 border-amber-500/30">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                <Crown className="h-5 w-5 text-amber-500" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground mb-1">{t.locked}</h4>
                <p className="text-sm text-muted-foreground mb-3">{t.lockedDesc}</p>
                <Button 
                  onClick={() => navigate("/pricing")}
                  size="sm"
                  className="bg-gradient-to-r from-amber-500 to-primary"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  {t.upgrade}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Contextual Paywall */}
      <ContextualPaywall
        open={showPaywall}
        onOpenChange={setShowPaywall}
        feature="plan"
        userId={userId}
      />
    </div>
  );
}
