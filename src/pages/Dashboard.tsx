import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RefreshCw, MessageCircle, LogOut, ShoppingCart, Calendar, User, Settings, TrendingUp, Utensils, Clock, ChefHat, Sparkles } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { MealDetailDialog } from "@/components/MealDetailDialog";

interface Meal {
  id: string;
  day_of_week: number;
  meal_type: string;
  name: string;
  description: string;
  benefits: string;
  ingredients?: string[];
  steps?: string[];
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  image_url?: string;
}

interface MealPlan {
  id: string;
  week_start_date: string;
  meals: Meal[];
}

interface ShoppingList {
  items: string[];
}

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [shoppingList, setShoppingList] = useState<ShoppingList | null>(null);
  const [trialExpired, setTrialExpired] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [mealDialogOpen, setMealDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const dayNames = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const mealTypes: { [key: string]: string } = {
    breakfast: "Desayuno",
    lunch: "Almuerzo",
    dinner: "Cena",
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    await loadProfile(user.id);
    await loadMealPlan(user.id);
  };

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (data) {
      setProfile(data);
      const expired = new Date(data.trial_expires_at) < new Date();
      setTrialExpired(expired && !data.is_subscribed);
    }
  };

  const loadMealPlan = async (userId: string) => {
    setLoading(true);
    try {
      // First check if user has preferences
      const { data: preferences } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (!preferences) {
        // Redirect to onboarding if no preferences
        navigate("/onboarding");
        return;
      }

      // Get the most recent meal plan
      const { data: plans, error: planError } = await supabase
        .from("meal_plans")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1);

      if (planError) throw planError;

      if (plans && plans.length > 0) {
        const planId = plans[0].id;
        
        // Get meals for this plan
        const { data: meals, error: mealsError } = await supabase
          .from("meals")
          .select("*")
          .eq("meal_plan_id", planId)
          .order("day_of_week", { ascending: true });

        if (mealsError) throw mealsError;

        setMealPlan({
          id: planId,
          week_start_date: plans[0].week_start_date,
          meals: meals || [],
        });

        // Get shopping list
        const { data: shopping, error: shoppingError } = await supabase
          .from("shopping_lists")
          .select("*")
          .eq("meal_plan_id", planId)
          .single();

        if (shopping) {
          setShoppingList(shopping);
        }
      } else {
        // Generate first meal plan
        await generateMealPlan();
      }
    } catch (error: any) {
      console.error("Error loading meal plan:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateMealPlan = async () => {
    setGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase.functions.invoke("generate-meal-plan", {
        body: { userId: user.id },
      });

      if (error) throw error;

      toast({
        title: "¡Menú generado!",
        description: "Tu nuevo plan semanal está listo",
      });

      await loadMealPlan(user.id);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const groupedMeals = mealPlan?.meals.reduce((acc, meal) => {
    if (!acc[meal.day_of_week]) acc[meal.day_of_week] = [];
    acc[meal.day_of_week].push(meal);
    return acc;
  }, {} as { [key: number]: Meal[] }) || {};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const daysRemaining = profile ? Math.ceil((new Date(profile.trial_expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const trialProgress = profile ? ((4 - daysRemaining) / 4) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Chefly.AI
                </h1>
                <p className="text-xs text-muted-foreground">Tu coach nutricional personal</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate("/chat")} className="gap-2">
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Coach</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Trial Alert */}
        {trialExpired ? (
          <Alert className="border-destructive bg-destructive/10">
            <Sparkles className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Tu prueba gratuita ha terminado. Suscríbete para continuar.</span>
              <Button variant="hero" size="sm">
                Suscribirme ahora
              </Button>
            </AlertDescription>
          </Alert>
        ) : profile && (
          <Alert className="border-primary bg-gradient-to-r from-primary/10 to-secondary/10">
            <Sparkles className="h-4 w-4 text-primary" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Prueba gratuita activa</span>
                  <span className="text-sm">{daysRemaining} de 4 días restantes</span>
                </div>
                <Progress value={trialProgress} className="h-2" />
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-border/50 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <Utensils className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Comidas esta semana</p>
                  <p className="text-2xl font-bold">{mealPlan?.meals.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Planes generados</p>
                  <p className="text-2xl font-bold">1</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Última actualización</p>
                  <p className="text-sm font-semibold">
                    {mealPlan ? new Date(mealPlan.week_start_date).toLocaleDateString('es-ES') : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Button
                onClick={generateMealPlan}
                disabled={generating}
                variant="outline"
                className="h-auto py-4 flex-col gap-2"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm">Generando...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-5 w-5" />
                    <span className="text-sm">Nuevo plan semanal</span>
                  </>
                )}
              </Button>
              
              <Button
                onClick={() => navigate("/chat")}
                variant="outline"
                className="h-auto py-4 flex-col gap-2"
              >
                <MessageCircle className="h-5 w-5" />
                <span className="text-sm">Hablar con coach</span>
              </Button>

              <Button
                onClick={() => navigate("/onboarding")}
                variant="outline"
                className="h-auto py-4 flex-col gap-2"
              >
                <Settings className="h-5 w-5" />
                <span className="text-sm">Ajustar preferencias</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Main Content Tabs */}
        <Tabs defaultValue="meals" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="meals" className="gap-2">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Menú Semanal</span>
                <span className="sm:hidden">Menú</span>
              </TabsTrigger>
              <TabsTrigger value="shopping" className="gap-2">
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden sm:inline">Lista de Compras</span>
                <span className="sm:hidden">Compras</span>
              </TabsTrigger>
            </TabsList>
            
            {mealPlan && (
              <Badge variant="secondary" className="hidden sm:flex">
                Semana del {new Date(mealPlan.week_start_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
              </Badge>
            )}
          </div>

          <TabsContent value="meals" className="space-y-4">
            {Object.keys(groupedMeals).length > 0 ? (
              Object.keys(groupedMeals).map((dayIndex) => {
                const day = parseInt(dayIndex);
                const meals = groupedMeals[day];

                return (
                  <Card key={day} className="overflow-hidden border-border/50 shadow-lg hover:shadow-xl transition-all">
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                            <span className="text-primary-foreground font-bold text-sm">{day + 1}</span>
                          </div>
                          <span className="text-xl">{dayNames[day]}</span>
                        </CardTitle>
                        <Badge variant="outline">{meals.length} comidas</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid gap-4 md:grid-cols-3">
                        {meals.map((meal) => (
                          <Card 
                            key={meal.id} 
                            className="border-border/50 bg-gradient-to-br from-card to-muted/20 hover:shadow-md transition-all cursor-pointer hover:scale-[1.02] overflow-hidden"
                            onClick={() => {
                              setSelectedMeal(meal);
                              setMealDialogOpen(true);
                            }}
                          >
                            {meal.image_url && (
                              <div className="relative h-40 w-full overflow-hidden">
                                <img 
                                  src={meal.image_url} 
                                  alt={meal.name}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 right-2">
                                  <Badge variant="secondary" className="backdrop-blur-sm bg-background/80">
                                    {mealTypes[meal.meal_type]}
                                  </Badge>
                                </div>
                              </div>
                            )}
                            <CardContent className="p-4 space-y-3">
                              {!meal.image_url && (
                                <div className="flex items-start justify-between gap-2">
                                  <Badge variant="secondary" className="shrink-0">
                                    {mealTypes[meal.meal_type]}
                                  </Badge>
                                </div>
                              )}
                              <div>
                                <h4 className="font-semibold text-base mb-1">{meal.name}</h4>
                                <p className="text-sm text-muted-foreground line-clamp-2">{meal.description}</p>
                              </div>
                              <Separator />
                              <div className="flex items-start gap-2">
                                <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                <p className="text-xs text-primary font-medium leading-relaxed">{meal.benefits}</p>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Utensils className="w-16 h-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay plan de comidas</h3>
                  <p className="text-muted-foreground text-center mb-6">
                    Genera tu primer plan semanal personalizado
                  </p>
                  <Button onClick={generateMealPlan} disabled={generating} variant="hero">
                    {generating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generar plan
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="shopping">
            <Card className="shadow-lg border-border/50">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Lista de Compras Semanal</CardTitle>
                    <CardDescription>
                      Todos los ingredientes que necesitas para esta semana
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {shoppingList ? (
                  <>
                    <div className="mb-4 flex items-center justify-between">
                      <Badge variant="secondary" className="text-sm">
                        {shoppingList.items.length} ingredientes
                      </Badge>
                      <Button variant="outline" size="sm">
                        Imprimir lista
                      </Button>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {shoppingList.items.map((item, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors group">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-secondary shrink-0"></div>
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      Genera un menú para ver tu lista de compras
                    </p>
                    <Button onClick={generateMealPlan} disabled={generating} variant="outline">
                      Generar plan
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <MealDetailDialog 
        meal={selectedMeal}
        open={mealDialogOpen}
        onOpenChange={setMealDialogOpen}
      />
    </div>
  );
};

export default Dashboard;
