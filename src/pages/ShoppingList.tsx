import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useTrialGuard } from "@/hooks/useTrialGuard";
import { useLanguage } from "@/contexts/LanguageContext";
import { ShoppingListView } from "@/components/shopping/ShoppingListView";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";

interface ShoppingItem {
  ingredient: string;
  category: string;
  isPurchased: boolean;
}

interface MealPlanInfo {
  id: string;
  week_start_date: string;
}

export default function ShoppingList() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isLoading: trialLoading, isBlocked } = useTrialGuard();
  
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [mealPlan, setMealPlan] = useState<MealPlanInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [purchasedItems, setPurchasedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadShoppingList();
    loadPurchasedItems();
  }, []);

  const loadPurchasedItems = () => {
    const saved = localStorage.getItem('chefly_purchased_items');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPurchasedItems(new Set(parsed));
      } catch {
        // Invalid JSON, ignore
      }
    }
  };

  const savePurchasedItems = (items: Set<string>) => {
    localStorage.setItem('chefly_purchased_items', JSON.stringify([...items]));
  };

  const loadShoppingList = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Get current meal plan
      const { data: mealPlanData, error: mpError } = await supabase
        .from("meal_plans")
        .select("id, week_start_date")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (mpError) throw mpError;
      
      if (!mealPlanData) {
        setMealPlan(null);
        setItems([]);
        setIsLoading(false);
        return;
      }

      setMealPlan(mealPlanData);

      // For now, always build the shopping list directly from meal ingredients
      // so that quantities like "1 taza" or "150g" are preserved.
      const { data: meals, error: mealsError } = await supabase
        .from("meals")
        .select("ingredients")
        .eq("meal_plan_id", mealPlanData.id);

      if (mealsError) throw mealsError;

      const allIngredients = meals?.flatMap(m => m.ingredients || []) || [];
      const uniqueIngredients = [...new Set(allIngredients)];
      const categorized = categorizeIngredients(uniqueIngredients);
      setItems(categorized);
    } catch (error) {
      console.error("Error loading shopping list:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const categorizeIngredients = (ingredients: string[]): ShoppingItem[] => {
    const categories: Record<string, string[]> = {
      proteins: ['pollo', 'chicken', 'carne', 'beef', 'pescado', 'fish', 'huevo', 'egg', 'atún', 'tuna', 'salmón', 'salmon', 'cerdo', 'pork', 'jamón', 'ham', 'tocino', 'bacon', 'camarón', 'shrimp', 'tofu', 'lenteja', 'lentil', 'frijol', 'bean', 'garbanzo', 'chickpea'],
      dairy: ['leche', 'milk', 'queso', 'cheese', 'yogur', 'yogurt', 'crema', 'cream', 'mantequilla', 'butter', 'nata'],
      vegetables: ['tomate', 'tomato', 'cebolla', 'onion', 'ajo', 'garlic', 'zanahoria', 'carrot', 'papa', 'potato', 'lechuga', 'lettuce', 'espinaca', 'spinach', 'brócoli', 'broccoli', 'calabaza', 'pumpkin', 'pepino', 'cucumber', 'pimiento', 'pepper', 'champiñón', 'mushroom', 'apio', 'celery', 'chile', 'aguacate', 'avocado', 'elote', 'corn', 'jitomate', 'ejote', 'nopal', 'calabacín', 'zucchini', 'berenjena', 'eggplant', 'coliflor', 'cauliflower', 'col', 'cabbage', 'rábano', 'radish'],
      fruits: ['manzana', 'apple', 'plátano', 'banana', 'naranja', 'orange', 'limón', 'lemon', 'fresa', 'strawberry', 'uva', 'grape', 'piña', 'pineapple', 'mango', 'papaya', 'sandía', 'watermelon', 'melón', 'melon', 'pera', 'pear', 'durazno', 'peach', 'kiwi', 'mora', 'berry', 'arándano', 'blueberry', 'frambuesa', 'raspberry', 'cereza', 'cherry'],
      grains: ['arroz', 'rice', 'pan', 'bread', 'pasta', 'avena', 'oat', 'quinoa', 'maíz', 'tortilla', 'harina', 'flour', 'cereal', 'trigo', 'wheat', 'cuscús', 'couscous', 'fideos', 'noodles'],
      condiments: ['sal', 'salt', 'pimienta', 'pepper', 'aceite', 'oil', 'vinagre', 'vinegar', 'salsa', 'sauce', 'mayonesa', 'mayo', 'mostaza', 'mustard', 'miel', 'honey', 'azúcar', 'sugar', 'orégano', 'oregano', 'cilantro', 'perejil', 'parsley', 'albahaca', 'basil', 'comino', 'cumin', 'canela', 'cinnamon', 'vainilla', 'vanilla', 'especias', 'spices', 'caldo', 'broth', 'soya', 'soy'],
    };

    return ingredients.map(ingredient => {
      const lower = ingredient.toLowerCase();
      let category = 'other';
      
      for (const [cat, keywords] of Object.entries(categories)) {
        if (keywords.some(kw => lower.includes(kw))) {
          category = cat;
          break;
        }
      }
      
      return {
        ingredient,
        category,
        isPurchased: purchasedItems.has(ingredient)
      };
    }).sort((a, b) => a.category.localeCompare(b.category));
  };

  const togglePurchased = (ingredient: string) => {
    const newPurchased = new Set(purchasedItems);
    if (newPurchased.has(ingredient)) {
      newPurchased.delete(ingredient);
    } else {
      newPurchased.add(ingredient);
    }
    setPurchasedItems(newPurchased);
    savePurchasedItems(newPurchased);
    
    setItems(prev => prev.map(item => 
      item.ingredient === ingredient 
        ? { ...item, isPurchased: !item.isPurchased }
        : item
    ));
  };

  const clearPurchased = () => {
    setPurchasedItems(new Set());
    localStorage.removeItem('chefly_purchased_items');
    setItems(prev => prev.map(item => ({ ...item, isPurchased: false })));
  };

  if (trialLoading || isLoading) {
    return (
      <div className="p-4 md:p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-96" />
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isBlocked) {
    navigate("/pricing");
    return null;
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate("/dashboard")}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold">{t("shopping.title")}</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            {t("shopping.subtitle")}
          </p>
        </div>
        <Button 
          variant="outline" 
          size="icon"
          onClick={loadShoppingList}
          className="shrink-0"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <ShoppingListView
        items={items}
        mealPlan={mealPlan}
        onTogglePurchased={togglePurchased}
        onClearPurchased={clearPurchased}
        onNavigateToDashboard={() => navigate("/dashboard")}
      />
    </div>
  );
}
