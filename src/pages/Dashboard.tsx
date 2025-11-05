import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RefreshCw, MessageCircle, LogOut, ShoppingCart, Calendar } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Meal {
  id: string;
  day_of_week: number;
  meal_type: string;
  name: string;
  description: string;
  benefits: string;
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Chefly.AI
          </h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/chat")}>
              <MessageCircle className="mr-2 h-4 w-4" />
              Chat
            </Button>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {trialExpired && (
          <Alert className="mb-6 border-destructive bg-destructive/10">
            <AlertDescription className="text-center">
              Tu prueba gratuita ha terminado. Suscríbete para seguir disfrutando de tus menús personalizados.
              <Button variant="hero" className="ml-4">
                Suscribirme ahora
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {profile && !trialExpired && (
          <Alert className="mb-6 border-primary bg-primary/10">
            <AlertDescription className="text-center">
              🎉 Tienes {Math.ceil((new Date(profile.trial_expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} días restantes de prueba gratuita
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Tu Menú Semanal</h2>
            <p className="text-muted-foreground">Plan personalizado según tus preferencias</p>
          </div>
          <Button
            onClick={generateMealPlan}
            disabled={generating}
            variant="hero"
            size="lg"
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Actualizar menú
              </>
            )}
          </Button>
        </div>

        <Tabs defaultValue="meals" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="meals">
              <Calendar className="mr-2 h-4 w-4" />
              Menú Semanal
            </TabsTrigger>
            <TabsTrigger value="shopping">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Lista de Compras
            </TabsTrigger>
          </TabsList>

          <TabsContent value="meals" className="space-y-6">
            {Object.keys(groupedMeals).map((dayIndex) => {
              const day = parseInt(dayIndex);
              const meals = groupedMeals[day];

              return (
                <Card key={day} className="overflow-hidden border-border/50 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
                    <CardTitle className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-lg px-4 py-1">
                        {dayNames[day]}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-3 gap-4">
                      {meals.map((meal) => (
                        <div key={meal.id} className="space-y-2 p-4 rounded-lg bg-muted/30 border border-border/50">
                          <Badge className="mb-2">{mealTypes[meal.meal_type]}</Badge>
                          <h4 className="font-semibold text-lg">{meal.name}</h4>
                          <p className="text-sm text-muted-foreground">{meal.description}</p>
                          <div className="pt-2 border-t border-border/50">
                            <p className="text-xs text-primary font-medium">✨ {meal.benefits}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="shopping">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Lista de Compras Semanal</CardTitle>
                <CardDescription>
                  Todos los ingredientes que necesitas para esta semana
                </CardDescription>
              </CardHeader>
              <CardContent>
                {shoppingList ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {shoppingList.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border/50">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Genera un menú para ver tu lista de compras
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
