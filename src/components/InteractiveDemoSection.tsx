import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ChevronRight, Sparkles, Loader2, Check, User, Target, Clock, Calendar, ChefHat, MessageCircle, RefreshCw } from "lucide-react";

const FLOW_STEPS = [
  {
    id: 'welcome',
    title: 'Paso 1: Bienvenida',
    description: 'Comenzamos conociendo tus objetivos',
    icon: User
  },
  {
    id: 'preferences',
    title: 'Paso 2: Preferencias',
    description: 'Personalizamos tu experiencia',
    icon: Target
  },
  {
    id: 'generating',
    title: 'Paso 3: Generación IA',
    description: 'Creamos tu plan personalizado',
    icon: Sparkles
  },
  {
    id: 'dashboard',
    title: 'Paso 4: Tu Dashboard',
    description: 'Accede a tu plan y características',
    icon: ChefHat
  }
];

const DEMO_MEALS = [
  { name: "Avena con Frutos Rojos", calories: 320, time: "10 min", icon: "🌅" },
  { name: "Pechuga a la Plancha con Quinoa", calories: 480, time: "25 min", icon: "🌞" },
  { name: "Salmón al Horno con Vegetales", calories: 420, time: "30 min", icon: "🌙" }
];

export const InteractiveDemoSection = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  // Auto-advance the demo
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentStep((step) => {
            if (step >= FLOW_STEPS.length - 1) {
              setIsPlaying(false);
              return 0;
            }
            return step + 1;
          });
          return 0;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, currentStep]);

  const startDemo = () => {
    setCurrentStep(0);
    setProgress(0);
    setIsPlaying(true);
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
    setProgress(0);
    setIsPlaying(false);
  };

  return (
    <section className="hidden md:block py-20 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
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
            Descubre cómo funciona{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Chefly.AI
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Sigue el flujo completo desde tu registro hasta tu primer plan de comidas personalizado
          </p>
        </div>

        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="grid grid-cols-4 gap-2 md:gap-4">
            {FLOW_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isActive = idx === currentStep;
              const isCompleted = idx < currentStep;
              
              return (
                <button
                  key={step.id}
                  onClick={() => goToStep(idx)}
                  className="relative group"
                >
                  <div className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all ${
                    isActive 
                      ? 'bg-primary/10 border-2 border-primary' 
                      : isCompleted 
                      ? 'bg-primary/5 border border-primary/30'
                      : 'bg-card border border-border/50'
                  }`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : isCompleted
                        ? 'bg-primary/50 text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <div className="text-center">
                      <p className={`text-xs font-semibold hidden md:block ${
                        isActive ? 'text-primary' : 'text-muted-foreground'
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-muted-foreground hidden lg:block">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  {idx < FLOW_STEPS.length - 1 && (
                    <div className="absolute top-8 left-full w-full h-0.5 bg-border hidden md:block -z-10">
                      <div 
                        className={`h-full transition-all ${
                          isCompleted ? 'bg-primary w-full' : 'w-0'
                        }`}
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Demo Content */}
        <div className="max-w-4xl mx-auto">
          <Card className="border-border/50 shadow-2xl bg-gradient-to-br from-card to-card/80 backdrop-blur-sm overflow-hidden">
            <AnimatePresence mode="wait">
              {/* Step 1: Welcome */}
              {currentStep === 0 && (
                <motion.div
                  key="welcome"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-8"
                >
                  <div className="flex flex-col items-center text-center space-y-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <User className="w-10 h-10 text-primary-foreground" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-3xl font-bold">¡Bienvenido a Chefly.AI! 👋</h3>
                      <p className="text-muted-foreground text-lg">
                        Tu asistente personal de nutrición con inteligencia artificial
                      </p>
                    </div>
                    <div className="w-full max-w-md space-y-4">
                      <Card className="border-primary/20 bg-primary/5">
                        <CardContent className="pt-6">
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <Check className="w-5 h-5 text-primary" />
                              <span>Planes personalizados con IA</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Check className="w-5 h-5 text-primary" />
                              <span>Recetas adaptadas a tus gustos</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Check className="w-5 h-5 text-primary" />
                              <span>Lista de compras automática</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Preferences */}
              {currentStep === 1 && (
                <motion.div
                  key="preferences"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-8"
                >
                  <div className="space-y-6">
                    <div className="text-center space-y-2">
                      <h3 className="text-2xl font-bold">Personaliza tu experiencia</h3>
                      <p className="text-muted-foreground">
                        Cuéntanos sobre ti para crear el plan perfecto
                      </p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Objetivo nutricional</label>
                        <Select value="weight_loss" disabled>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona tu objetivo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="weight_loss">Pérdida de peso</SelectItem>
                            <SelectItem value="muscle_gain">Ganancia muscular</SelectItem>
                            <SelectItem value="maintenance">Mantenimiento</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Dieta preferida</label>
                        <Select value="balanced" disabled>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="balanced">Balanceada</SelectItem>
                            <SelectItem value="vegetarian">Vegetariana</SelectItem>
                            <SelectItem value="vegan">Vegana</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Calorías diarias objetivo</label>
                        <Input type="number" value="2000" disabled />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Nivel de actividad</label>
                        <Select value="moderate" disabled>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sedentary">Sedentario</SelectItem>
                            <SelectItem value="moderate">Moderado</SelectItem>
                            <SelectItem value="active">Activo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium">Tiempo disponible para cocinar</label>
                        <div className="px-3">
                          <Slider value={[30]} max={120} disabled className="py-4" />
                          <p className="text-xs text-muted-foreground text-center">30 minutos por comida</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Generating */}
              {currentStep === 2 && (
                <motion.div
                  key="generating"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-8"
                >
                  <div className="flex flex-col items-center text-center space-y-6 py-12">
                    <motion.div
                      animate={{ 
                        rotate: 360,
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                        scale: { duration: 1, repeat: Infinity }
                      }}
                      className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center"
                    >
                      <Sparkles className="w-12 h-12 text-primary-foreground" />
                    </motion.div>
                    
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold">¡La magia está ocurriendo! ✨</h3>
                      <p className="text-muted-foreground">
                        Nuestra IA está creando tu plan personalizado
                      </p>
                    </div>

                    <div className="w-full max-w-md space-y-4">
                      {[
                        { text: "Analizando tus preferencias", delay: 0 },
                        { text: "Calculando macronutrientes", delay: 0.5 },
                        { text: "Seleccionando recetas perfectas", delay: 1 },
                        { text: "Generando lista de compras", delay: 1.5 }
                      ].map((item, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: item.delay }}
                          className="flex items-center gap-3 text-left"
                        >
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Loader2 className="w-4 h-4 text-primary" />
                          </motion.div>
                          <span className="text-sm">{item.text}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Dashboard */}
              {currentStep === 3 && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-8"
                >
                  <div className="space-y-6">
                    <div className="text-center space-y-2">
                      <h3 className="text-2xl font-bold">¡Tu plan está listo! 🎉</h3>
                      <p className="text-muted-foreground">
                        Aquí está tu dashboard personalizado
                      </p>
                    </div>

                    {/* Mock Dashboard */}
                    <div className="space-y-4">
                      {/* Today's meals */}
                      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Plan de hoy - Lunes</CardTitle>
                            <Badge variant="outline" className="bg-primary/10">
                              <Calendar className="w-3 h-3 mr-1" />
                              Día 1 de 7
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-3">
                            {DEMO_MEALS.map((meal, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex items-center justify-between p-3 rounded-lg bg-card border border-border/50"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">{meal.icon}</span>
                                  <div>
                                    <p className="font-semibold text-sm">{meal.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {meal.calories} kcal • {meal.time}
                                    </p>
                                  </div>
                                </div>
                                <Check className="w-5 h-5 text-primary" />
                              </motion.div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Features grid */}
                      <div className="grid md:grid-cols-3 gap-4">
                        <Card className="border-border/50 hover:shadow-lg transition-all cursor-pointer group">
                          <CardContent className="pt-6 text-center space-y-2">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                              <MessageCircle className="w-6 h-6 text-primary" />
                            </div>
                            <h4 className="font-semibold">Chat con IA</h4>
                            <p className="text-xs text-muted-foreground">
                              Pregunta sobre nutrición
                            </p>
                          </CardContent>
                        </Card>

                        <Card className="border-border/50 hover:shadow-lg transition-all cursor-pointer group">
                          <CardContent className="pt-6 text-center space-y-2">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                              <RefreshCw className="w-6 h-6 text-primary" />
                            </div>
                            <h4 className="font-semibold">Cambiar comidas</h4>
                            <p className="text-xs text-muted-foreground">
                              Intercambia recetas fácilmente
                            </p>
                          </CardContent>
                        </Card>

                        <Card className="border-border/50 hover:shadow-lg transition-all cursor-pointer group">
                          <CardContent className="pt-6 text-center space-y-2">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                              <Target className="w-6 h-6 text-primary" />
                            </div>
                            <h4 className="font-semibold">Progreso</h4>
                            <p className="text-xs text-muted-foreground">
                              Sigue tus objetivos
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Progress bar */}
            {isPlaying && (
              <div className="h-1 bg-muted">
                <motion.div 
                  className="h-full bg-gradient-to-r from-primary to-secondary"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            {/* Controls */}
            <div className="p-6 border-t border-border/50 bg-muted/30">
              <div className="flex items-center justify-between gap-4">
                <div className="flex gap-2">
                  {currentStep > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToStep(currentStep - 1)}
                    >
                      ← Anterior
                    </Button>
                  )}
                  {currentStep < FLOW_STEPS.length - 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToStep(currentStep + 1)}
                    >
                      Siguiente →
                    </Button>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant={isPlaying ? "secondary" : "default"}
                    size="sm"
                    onClick={isPlaying ? () => setIsPlaying(false) : startDemo}
                    className="gap-2"
                  >
                    {isPlaying ? (
                      <>
                        <span className="w-2 h-2 bg-current" />
                        <span className="w-2 h-2 bg-current" />
                        Pausar
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        {currentStep === 0 ? 'Iniciar Demo' : 'Reanudar'}
                      </>
                    )}
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => window.location.href = '/auth'}
                    className="gap-2"
                  >
                    Empezar ahora
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};
