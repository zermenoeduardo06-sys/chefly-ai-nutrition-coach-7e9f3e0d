import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  ChefHat, 
  Flame, 
  Lock, 
  Crown,
  ArrowLeft,
  Search,
  Loader2,
  Sparkles,
  FileText,
  ListChecks,
  X,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { MealImageWithSkeleton } from "@/components/MealImageWithSkeleton";
import { cn } from "@/lib/utils";
import { RecipeCard } from "@/components/recipes/RecipeCard";

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
    subtitle: "Recetas saludables creadas con IA para ti",
    aiPowered: "Personalizado con IA",
    search: "Buscar recetas...",
    noRecipes: "Aún no tienes recetas",
    noRecipesDesc: "Nuestra IA generará recetas saludables personalizadas según tu objetivo y preferencias",
    generatePlan: "Generar Recetas con IA",
    viewDetails: "Ver receta completa",
    locked: "Solo Chefly Plus",
    lockedDesc: "Accede a ingredientes, pasos y descarga de PDF",
    upgrade: "Mejorar a Plus",
    kcal: "kcal",
    ingredients: "Ingredientes",
    steps: "Pasos de preparación",
    downloadPdf: "Descargar PDF",
    all: "Todas",
    loading: "Cargando recetas...",
    benefits: "Beneficios",
    macros: "Información nutricional",
    protein: "Proteína",
    carbs: "Carbohidratos",
    fats: "Grasas",
    unlockContent: "Desbloquea el contenido completo",
    unlockDesc: "Con Chefly Plus obtienes acceso a todos los ingredientes, pasos detallados y descarga de PDF",
    premiumFeature: "Función Premium",
  },
  en: {
    title: "My Recipes",
    subtitle: "Healthy AI-powered recipes made for you",
    aiPowered: "AI Personalized",
    search: "Search recipes...",
    noRecipes: "No recipes yet",
    noRecipesDesc: "Our AI will generate healthy recipes personalized to your goals and preferences",
    generatePlan: "Generate AI Recipes",
    viewDetails: "View full recipe",
    locked: "Chefly Plus Only",
    lockedDesc: "Access ingredients, steps and PDF download",
    upgrade: "Upgrade to Plus",
    kcal: "kcal",
    ingredients: "Ingredients",
    steps: "Preparation steps",
    downloadPdf: "Download PDF",
    all: "All",
    loading: "Loading recipes...",
    benefits: "Benefits",
    macros: "Nutritional info",
    protein: "Protein",
    carbs: "Carbohydrates",
    fats: "Fats",
    unlockContent: "Unlock full content",
    unlockDesc: "With Chefly Plus you get access to all ingredients, detailed steps and PDF download",
    premiumFeature: "Premium Feature",
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
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showRecipeDetail, setShowRecipeDetail] = useState(false);

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

      const { data: meals } = await supabase
        .from("meals")
        .select("*")
        .eq("meal_plan_id", mealPlan.id)
        .order("day_of_week", { ascending: true })
        .order("meal_type", { ascending: true });

      if (meals) {
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
      const { data: preferences } = await supabase
        .from("user_preferences")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (!preferences) {
        navigate("/onboarding");
        return;
      }

      const { error } = await supabase.functions.invoke("generate-meal-plan", {
        body: { userId, forceNew: false, language },
      });

      if (error) {
        console.error("Error generating meal plan:", error);
        return;
      }

      await loadRecipes();
    } catch (error) {
      console.error("Error generating plan:", error);
    } finally {
      setIsGenerating(false);
    }
  };

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
    setSelectedRecipe(recipe);
    setShowRecipeDetail(true);
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
    <div className="min-h-full bg-background pb-24 lg:pb-6">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center gap-3 p-4 tablet:px-6 max-w-4xl mx-auto">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft className="h-5 w-5 tablet:h-6 tablet:w-6 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl tablet:text-2xl font-bold text-foreground">{t.title}</h1>
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-primary" />
              <p className="text-sm text-primary font-medium">{t.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full">
            <ChefHat className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">{filteredRecipes.length}</span>
          </div>
        </div>
      </div>

      {/* AI Badge Banner */}
      {filteredRecipes.length > 0 && (
        <div className="px-4 tablet:px-6 py-3 max-w-4xl mx-auto">
          <div className="flex items-center gap-2 p-3 tablet:p-4 bg-gradient-to-r from-primary/10 via-cyan-500/10 to-primary/10 rounded-xl border border-primary/20">
            <div className="w-8 h-8 tablet:w-10 tablet:h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Sparkles className="h-4 w-4 tablet:h-5 tablet:w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm tablet:text-base font-medium text-foreground">{t.aiPowered}</p>
              <p className="text-xs tablet:text-sm text-muted-foreground">
                {language === 'es' 
                  ? 'Recetas adaptadas a tus objetivos y preferencias' 
                  : 'Recipes adapted to your goals and preferences'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="px-4 tablet:px-6 py-2 max-w-4xl mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder={t.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 tablet:h-14 tablet:text-base bg-muted border-0"
          />
        </div>
      </div>

      {/* Meal Type Filter Pills */}
      <div className="px-4 tablet:px-6 pb-3 max-w-4xl mx-auto">
        <div className="flex gap-2 tablet:gap-3 overflow-x-auto no-scrollbar">
          {mealTypes.map((type) => (
            <button
              key={type}
              onClick={() => setActiveFilter(type)}
              className={cn(
                "px-4 tablet:px-5 py-2 tablet:py-2.5 rounded-full text-sm tablet:text-base font-medium whitespace-nowrap transition-colors",
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
      <div className="px-4 tablet:px-6 grid grid-cols-2 tablet:grid-cols-3 gap-3 tablet:gap-4 max-w-4xl mx-auto">
        {filteredRecipes.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-2 flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-cyan-500/20 flex items-center justify-center mb-4">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{t.noRecipes}</h3>
            <p className="text-muted-foreground mb-6 max-w-xs text-sm">{t.noRecipesDesc}</p>
            <Button 
              onClick={handleGeneratePlan} 
              disabled={isGenerating}
              className="bg-gradient-to-r from-primary to-cyan-500"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {language === 'es' ? 'Generando...' : 'Generating...'}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {t.generatePlan}
                </>
              )}
            </Button>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredRecipes.map((recipe, index) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onClick={() => handleRecipeClick(recipe)}
                index={index}
                mealTypeColors={mealTypeColors}
                mealTypeLabel={mealTypeLabels[recipe.meal_type]?.[language] || recipe.meal_type}
                kcalLabel={t.kcal}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Recipe Detail Dialog - Full Screen Sheet Style */}
      <Dialog open={showRecipeDetail} onOpenChange={setShowRecipeDetail}>
        <DialogContent className="max-w-md w-full h-[85vh] p-0 overflow-hidden rounded-t-3xl sm:rounded-2xl flex flex-col">
          {selectedRecipe && (
            <>
              {/* Fixed Header with Image */}
              <div className="relative shrink-0">
                <div className="aspect-[16/10] relative">
                  <MealImageWithSkeleton
                    src={selectedRecipe.image_url}
                    alt={selectedRecipe.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                  
                  {/* Close Button */}
                  <button 
                    onClick={() => setShowRecipeDetail(false)}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  
                  {/* Badge */}
                  <div className="absolute top-3 left-3">
                    <Badge 
                      className={cn("backdrop-blur-sm", mealTypeColors[selectedRecipe.meal_type])}
                    >
                      {mealTypeLabels[selectedRecipe.meal_type]?.[language] || selectedRecipe.meal_type}
                    </Badge>
                  </div>
                  
                  {/* Title overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h2 className="text-xl font-bold text-foreground leading-tight">{selectedRecipe.name}</h2>
                  </div>
                </div>
              </div>

              {/* Scrollable Content */}
              <ScrollArea className="flex-1 overflow-auto">
                <div className="p-4 pb-8 space-y-5">
                  {/* Description */}
                  <p className="text-muted-foreground text-sm leading-relaxed">{selectedRecipe.description}</p>

                  {/* Macros Grid */}
                  <div className="grid grid-cols-4 gap-2">
                    <div className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-xl p-3 text-center border border-amber-500/10">
                      <Flame className="h-5 w-5 mx-auto text-amber-500 mb-1" />
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{t.kcal}</p>
                      <p className="font-bold text-lg text-foreground">{selectedRecipe.calories}</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 rounded-xl p-3 text-center border border-emerald-500/10">
                      <div className="w-5 h-5 mx-auto mb-1 rounded-full bg-emerald-500/30 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-emerald-500">P</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{t.protein}</p>
                      <p className="font-bold text-lg text-foreground">{selectedRecipe.protein}g</p>
                    </div>
                    <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 rounded-xl p-3 text-center border border-cyan-500/10">
                      <div className="w-5 h-5 mx-auto mb-1 rounded-full bg-cyan-500/30 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-cyan-500">C</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{t.carbs}</p>
                      <p className="font-bold text-lg text-foreground">{selectedRecipe.carbs}g</p>
                    </div>
                    <div className="bg-gradient-to-br from-pink-500/20 to-pink-500/5 rounded-xl p-3 text-center border border-pink-500/10">
                      <div className="w-5 h-5 mx-auto mb-1 rounded-full bg-pink-500/30 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-pink-500">F</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{t.fats}</p>
                      <p className="font-bold text-lg text-foreground">{selectedRecipe.fats}g</p>
                    </div>
                  </div>

                  {/* Benefits */}
                  {selectedRecipe.benefits && (
                    <div className="bg-gradient-to-r from-primary/10 to-cyan-500/10 rounded-xl p-4 border border-primary/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <h4 className="font-semibold text-foreground text-sm">{t.benefits}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{selectedRecipe.benefits}</p>
                    </div>
                  )}

                  {/* Ingredients Section */}
                  <div className="bg-muted/50 rounded-xl p-4 border border-border/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <ListChecks className="h-5 w-5 text-primary" />
                        <h4 className="font-semibold text-foreground">{t.ingredients}</h4>
                      </div>
                      {!isCheflyPlus && (
                        <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30">
                          <Lock className="h-3 w-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                    </div>
                    
                    {isCheflyPlus ? (
                      <ul className="space-y-2">
                        {selectedRecipe.ingredients?.map((ing, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-start gap-3">
                            <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                            {ing}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="relative overflow-hidden rounded-lg min-h-[100px]">
                        <div className="blur-[6px] select-none pointer-events-none opacity-60">
                          <ul className="space-y-2">
                            {['200g de pollo deshuesado', '1 taza de arroz integral', '2 cucharadas de aceite de oliva', '1 cebolla picada', '2 dientes de ajo picados'].map((ing, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-3">
                                <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                                {ing}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/40">
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                            <Lock className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <span className="text-xs text-muted-foreground font-medium">
                            {language === 'es' ? 'Contenido bloqueado' : 'Locked content'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Steps Section */}
                  <div className="bg-muted/50 rounded-xl p-4 border border-border/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <ChefHat className="h-5 w-5 text-primary" />
                        <h4 className="font-semibold text-foreground">{t.steps}</h4>
                      </div>
                      {!isCheflyPlus && (
                        <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30">
                          <Lock className="h-3 w-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                    </div>
                    
                    {isCheflyPlus ? (
                      <ol className="space-y-4">
                        {selectedRecipe.steps?.map((step, idx) => (
                          <li key={idx} className="flex gap-3 text-sm">
                            <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center shrink-0 font-bold">
                              {idx + 1}
                            </span>
                            <span className="text-muted-foreground pt-1 leading-relaxed">{step}</span>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <div className="relative overflow-hidden rounded-lg min-h-[120px]">
                        <div className="blur-[6px] select-none pointer-events-none opacity-60">
                          <ol className="space-y-4">
                            {['Precalienta el horno a 180°C y prepara una bandeja', 'Corta el pollo en cubos medianos uniformes', 'Sofríe la cebolla y el ajo hasta que estén dorados', 'Añade el pollo y cocina hasta dorar por todos lados'].map((step, idx) => (
                              <li key={idx} className="flex gap-3 text-sm">
                                <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center shrink-0 font-bold">
                                  {idx + 1}
                                </span>
                                <span className="text-muted-foreground pt-1">{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/40">
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                            <Lock className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <span className="text-xs text-muted-foreground font-medium">
                            {language === 'es' ? 'Contenido bloqueado' : 'Locked content'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* PDF Download Button */}
                  {isCheflyPlus ? (
                    <Button 
                      variant="outline" 
                      className="w-full h-12"
                      onClick={() => {
                        // TODO: Implement PDF download
                      }}
                    >
                      <Download className="h-5 w-5 mr-2" />
                      {t.downloadPdf}
                    </Button>
                  ) : (
                    <div className="relative">
                      <Button 
                        variant="outline" 
                        className="w-full h-12 opacity-40 pointer-events-none"
                      >
                        <Download className="h-5 w-5 mr-2" />
                        {t.downloadPdf}
                      </Button>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full">
                          <Lock className="h-4 w-4 text-amber-500" />
                          <span className="text-xs font-medium text-amber-500">Premium</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Upgrade CTA for Free Users */}
                  {!isCheflyPlus && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-br from-amber-500/15 via-primary/10 to-amber-500/15 rounded-2xl p-5 border border-amber-500/30 shadow-lg shadow-amber-500/5"
                    >
                      <div className="flex flex-col items-center text-center gap-3">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-primary flex items-center justify-center shadow-lg shadow-amber-500/30">
                          <Crown className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-foreground text-lg mb-1">{t.unlockContent}</h4>
                          <p className="text-sm text-muted-foreground">{t.unlockDesc}</p>
                        </div>
                        <Button 
                          onClick={() => {
                            setShowRecipeDetail(false);
                            navigate("/pricing");
                          }}
                          className="w-full h-12 bg-gradient-to-r from-amber-500 to-primary hover:from-amber-600 hover:to-primary/90 text-white font-semibold shadow-lg shadow-primary/30"
                        >
                          <Crown className="h-5 w-5 mr-2" />
                          {t.upgrade}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}