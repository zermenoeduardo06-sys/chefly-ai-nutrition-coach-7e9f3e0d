import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight, Flame, Beef, Croissant, Droplet, Clock, Users } from "lucide-react";

const DEMO_MEALS = {
  Lunes: {
    breakfast: {
      name: "Avena con Frutos Rojos",
      calories: 320,
      protein: 12,
      carbs: 45,
      fats: 8,
      time: "10 min"
    },
    lunch: {
      name: "Pechuga a la Plancha con Quinoa",
      calories: 480,
      protein: 35,
      carbs: 50,
      fats: 12,
      time: "25 min"
    },
    dinner: {
      name: "Salmón al Horno con Vegetales",
      calories: 420,
      protein: 32,
      carbs: 25,
      fats: 22,
      time: "30 min"
    }
  },
  Martes: {
    breakfast: {
      name: "Tortilla de Claras con Espinacas",
      calories: 280,
      protein: 24,
      carbs: 15,
      fats: 12,
      time: "15 min"
    },
    lunch: {
      name: "Tacos de Pescado con Salsa Verde",
      calories: 450,
      protein: 30,
      carbs: 42,
      fats: 16,
      time: "20 min"
    },
    dinner: {
      name: "Pollo al Curry con Arroz Integral",
      calories: 480,
      protein: 36,
      carbs: 48,
      fats: 14,
      time: "35 min"
    }
  },
  Miércoles: {
    breakfast: {
      name: "Smoothie Bowl de Plátano y Mantequilla de Maní",
      calories: 350,
      protein: 15,
      carbs: 52,
      fats: 10,
      time: "8 min"
    },
    lunch: {
      name: "Ensalada César con Pollo Grillado",
      calories: 420,
      protein: 32,
      carbs: 28,
      fats: 20,
      time: "15 min"
    },
    dinner: {
      name: "Pasta Integral con Albóndigas de Pavo",
      calories: 520,
      protein: 38,
      carbs: 56,
      fats: 16,
      time: "40 min"
    }
  }
};

export const InteractiveDemoSection = () => {
  const [selectedDay, setSelectedDay] = useState<keyof typeof DEMO_MEALS>("Lunes");
  const days = Object.keys(DEMO_MEALS) as Array<keyof typeof DEMO_MEALS>;
  
  const meals = DEMO_MEALS[selectedDay];
  const totalCalories = meals.breakfast.calories + meals.lunch.calories + meals.dinner.calories;
  const totalProtein = meals.breakfast.protein + meals.lunch.protein + meals.dinner.protein;

  return (
    <section className="py-20 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-48 h-48 rounded-full bg-gradient-to-br from-secondary/10 to-primary/10 blur-2xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12 space-y-4">
          <Badge variant="secondary" className="px-4 py-2 text-sm">
            Demo interactiva
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold">
            Explora{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Chefly.AI
            </span>
            {" "}en acción
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Mira cómo se verían tus menús personalizados sin necesidad de crear una cuenta
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <Card className="border-border/50 shadow-2xl bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
            <CardHeader className="space-y-2 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">Tu Plan Semanal</CardTitle>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  Demo
                </Badge>
              </div>
              <CardDescription>
                Ejemplo de menú personalizado generado por IA
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Day selector tabs */}
              <Tabs value={selectedDay} onValueChange={(value) => setSelectedDay(value as keyof typeof DEMO_MEALS)}>
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  {days.map((day) => (
                    <TabsTrigger 
                      key={day} 
                      value={day}
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-hover"
                    >
                      {day}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {days.map((day) => (
                  <TabsContent key={day} value={day} className="space-y-4 animate-fade-in">
                    {/* Daily summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Flame className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Calorías</p>
                          <p className="font-bold">{totalCalories} kcal</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Beef className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Proteína</p>
                          <p className="font-bold">{totalProtein}g</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Croissant className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Carbos</p>
                          <p className="font-bold">{meals.breakfast.carbs + meals.lunch.carbs + meals.dinner.carbs}g</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Droplet className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Grasas</p>
                          <p className="font-bold">{meals.breakfast.fats + meals.lunch.fats + meals.dinner.fats}g</p>
                        </div>
                      </div>
                    </div>

                    {/* Meals grid */}
                    <div className="grid md:grid-cols-3 gap-4">
                      {(['breakfast', 'lunch', 'dinner'] as const).map((mealType, idx) => {
                        const meal = meals[mealType];
                        const mealNames = {
                          breakfast: '🌅 Desayuno',
                          lunch: '🌞 Comida',
                          dinner: '🌙 Cena'
                        };
                        
                        return (
                          <Card 
                            key={mealType} 
                            className="border-border/50 hover:shadow-lg transition-all hover:-translate-y-1 bg-gradient-to-br from-card to-card/50 animate-fade-in"
                            style={{ animationDelay: `${idx * 100}ms` }}
                          >
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base">{mealNames[mealType]}</CardTitle>
                              <CardDescription className="text-sm font-semibold text-foreground">
                                {meal.name}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="flex items-center gap-2 text-sm">
                                <Flame className="w-4 h-4 text-primary" />
                                <span className="font-semibold">{meal.calories} kcal</span>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-xs">
                                <div>
                                  <p className="text-muted-foreground">Proteína</p>
                                  <p className="font-semibold">{meal.protein}g</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Carbos</p>
                                  <p className="font-semibold">{meal.carbs}g</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Grasas</p>
                                  <p className="font-semibold">{meal.fats}g</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border/50">
                                <Clock className="w-3 h-3" />
                                <span>{meal.time}</span>
                                <Users className="w-3 h-3 ml-auto" />
                                <span>1 porción</span>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>

              {/* CTA */}
              <div className="flex flex-col items-center gap-4 pt-6 border-t border-border/50">
                <p className="text-center text-muted-foreground">
                  ¿Te gusta lo que ves? Crea tu cuenta gratis y obtén tu propio plan personalizado
                </p>
                <Button 
                  size="lg" 
                  className="text-lg px-8 h-12 group"
                  onClick={() => window.location.href = '/auth'}
                >
                  Comenzar mi prueba gratis
                  <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
