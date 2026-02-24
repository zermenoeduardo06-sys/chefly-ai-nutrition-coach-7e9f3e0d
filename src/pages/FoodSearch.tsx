import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useInitialAnimation } from "@/hooks/useInitialAnimation";
import { Search, ArrowLeft, Clock, Star, TrendingUp, Utensils } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";

// Sample food data - in production this would come from an API or database
const sampleFoods = [
  { id: "1", name: "Manzana", nameEn: "Apple", calories: 95, protein: 0.5, carbs: 25, fats: 0.3, category: "frutas" },
  { id: "2", name: "Plátano", nameEn: "Banana", calories: 105, protein: 1.3, carbs: 27, fats: 0.4, category: "frutas" },
  { id: "3", name: "Pechuga de pollo", nameEn: "Chicken breast", calories: 165, protein: 31, carbs: 0, fats: 3.6, category: "proteínas" },
  { id: "4", name: "Arroz blanco cocido", nameEn: "Cooked white rice", calories: 206, protein: 4.3, carbs: 45, fats: 0.4, category: "granos" },
  { id: "5", name: "Huevo cocido", nameEn: "Boiled egg", calories: 78, protein: 6, carbs: 0.6, fats: 5, category: "proteínas" },
  { id: "6", name: "Aguacate", nameEn: "Avocado", calories: 160, protein: 2, carbs: 9, fats: 15, category: "frutas" },
  { id: "7", name: "Pan integral", nameEn: "Whole wheat bread", calories: 69, protein: 3.6, carbs: 12, fats: 1.1, category: "granos" },
  { id: "8", name: "Yogurt natural", nameEn: "Plain yogurt", calories: 100, protein: 17, carbs: 6, fats: 0.7, category: "lácteos" },
  { id: "9", name: "Almendras", nameEn: "Almonds", calories: 164, protein: 6, carbs: 6, fats: 14, category: "snacks" },
  { id: "10", name: "Brócoli cocido", nameEn: "Cooked broccoli", calories: 55, protein: 3.7, carbs: 11, fats: 0.6, category: "verduras" },
];

export default function FoodSearch() {
  const shouldAnimate = useInitialAnimation();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const texts = {
    es: {
      title: "Buscar alimento",
      searchPlaceholder: "¿Qué has comido?",
      all: "Todos",
      recent: "Recientes",
      frequent: "Frecuentes",
      favorites: "Favoritos",
      kcal: "kcal",
      noResults: "No se encontraron resultados",
      tryDifferent: "Intenta con otro término de búsqueda",
      protein: "P",
      carbs: "C",
      fats: "G",
    },
    en: {
      title: "Search food",
      searchPlaceholder: "What did you eat?",
      all: "All",
      recent: "Recent",
      frequent: "Frequent",
      favorites: "Favorites",
      kcal: "kcal",
      noResults: "No results found",
      tryDifferent: "Try a different search term",
      protein: "P",
      carbs: "C",
      fats: "F",
    },
  };

  const t = texts[language];

  const filteredFoods = sampleFoods.filter((food) => {
    const name = language === "es" ? food.name : food.nameEn;
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleSelectFood = (food: typeof sampleFoods[0]) => {
    // TODO: Navigate to quantity selection or add directly
    console.log("Selected food:", food);
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b">
        <div className="flex items-center gap-3 p-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold">{t.title}</h1>
        </div>

        {/* Search bar */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 rounded-2xl bg-muted/50 border-0"
              autoFocus
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4">
          <TabsList className="w-full grid grid-cols-4 h-auto p-1 rounded-2xl">
            <TabsTrigger value="all" className="rounded-xl py-2 text-xs">
              <Utensils className="h-4 w-4 mr-1" />
              {t.all}
            </TabsTrigger>
            <TabsTrigger value="recent" className="rounded-xl py-2 text-xs">
              <Clock className="h-4 w-4 mr-1" />
              {t.recent}
            </TabsTrigger>
            <TabsTrigger value="frequent" className="rounded-xl py-2 text-xs">
              <TrendingUp className="h-4 w-4 mr-1" />
              {t.frequent}
            </TabsTrigger>
            <TabsTrigger value="favorites" className="rounded-xl py-2 text-xs">
              <Star className="h-4 w-4 mr-1" />
              {t.favorites}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Food list */}
      <div className="p-4 space-y-2">
        {filteredFoods.length > 0 ? (
          filteredFoods.map((food, index) => (
            <motion.div
              key={food.id}
              initial={shouldAnimate ? { opacity: 0, y: 10 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer"
                onClick={() => handleSelectFood(food)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold">
                        {language === "es" ? food.name : food.nameEn}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{t.protein}: {food.protein}g</span>
                        <span>•</span>
                        <span>{t.carbs}: {food.carbs}g</span>
                        <span>•</span>
                        <span>{t.fats}: {food.fats}g</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="rounded-xl font-bold">
                      {food.calories} {t.kcal}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="font-semibold text-muted-foreground">{t.noResults}</h3>
            <p className="text-sm text-muted-foreground/70">{t.tryDifferent}</p>
          </div>
        )}
      </div>
    </div>
  );
}
