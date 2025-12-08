import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ChefHat, 
  Calendar, 
  MessageCircle, 
  Trophy, 
  ShoppingCart, 
  TrendingUp,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Check,
  Clock,
  Flame,
  Users
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

interface DemoScreen {
  id: string;
  title: string;
  subtitle: string;
  icon: typeof ChefHat;
  highlights: { x: string; y: string; label: string }[];
  features: string[];
}

const DEMO_SCREENS: DemoScreen[] = [
  {
    id: "dashboard",
    title: "Tu Dashboard Personal",
    subtitle: "Vista completa de tu plan alimenticio semanal",
    icon: Calendar,
    highlights: [
      { x: "15%", y: "20%", label: "Menú semanal" },
      { x: "75%", y: "35%", label: "Calorías diarias" },
      { x: "50%", y: "70%", label: "Progreso" }
    ],
    features: ["Plan de 7 días", "Macros calculados", "Lista de compras"]
  },
  {
    id: "meals",
    title: "Recetas Detalladas",
    subtitle: "Instrucciones paso a paso para cada comida",
    icon: ChefHat,
    highlights: [
      { x: "30%", y: "25%", label: "Ingredientes" },
      { x: "70%", y: "50%", label: "Pasos" },
      { x: "50%", y: "80%", label: "Nutrición" }
    ],
    features: ["Videos guía", "Tips de cocina", "Sustituciones"]
  },
  {
    id: "chat",
    title: "Coach con IA",
    subtitle: "Asistente nutricional disponible 24/7",
    icon: MessageCircle,
    highlights: [
      { x: "50%", y: "30%", label: "Consultas" },
      { x: "25%", y: "60%", label: "Consejos" },
      { x: "75%", y: "75%", label: "Motivación" }
    ],
    features: ["Respuestas instantáneas", "Consejos personalizados", "Seguimiento"]
  },
  {
    id: "progress",
    title: "Seguimiento de Progreso",
    subtitle: "Visualiza tu evolución con gráficos detallados",
    icon: TrendingUp,
    highlights: [
      { x: "40%", y: "35%", label: "Gráficas" },
      { x: "70%", y: "55%", label: "Medidas" },
      { x: "30%", y: "75%", label: "Logros" }
    ],
    features: ["Peso y medidas", "Nutrición diaria", "Tendencias"]
  },
  {
    id: "achievements",
    title: "Gamificación y Logros",
    subtitle: "Mantente motivado con recompensas y retos",
    icon: Trophy,
    highlights: [
      { x: "25%", y: "30%", label: "Badges" },
      { x: "65%", y: "45%", label: "Puntos" },
      { x: "45%", y: "70%", label: "Ranking" }
    ],
    features: ["Retos diarios", "Tabla de líderes", "Recompensas"]
  }
];

// Mock dashboard content for each screen
const DashboardMockup = ({ screenId, isActive }: { screenId: string; isActive: boolean }) => {
  const mockMeals = [
    { name: "Avena con Frutos", cal: 320, icon: "🌅", time: "Desayuno" },
    { name: "Pechuga con Quinoa", cal: 480, icon: "🌞", time: "Comida" },
    { name: "Salmón al Horno", cal: 420, icon: "🌙", time: "Cena" }
  ];

  const renderContent = () => {
    switch (screenId) {
      case "dashboard":
        return (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border/30">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary" />
                <span className="font-semibold text-sm">Hola, María 👋</span>
              </div>
              <Badge variant="secondary" className="text-xs">Día 5 de 7</Badge>
            </div>
            
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Calorías", value: "1,850", icon: Flame },
                { label: "Racha", value: "5 días", icon: Trophy },
                { label: "Puntos", value: "450", icon: Sparkles }
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: isActive ? 1 : 0.5, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card/50 rounded-lg p-2 text-center border border-border/30"
                >
                  <stat.icon className="w-4 h-4 mx-auto text-primary mb-1" />
                  <p className="font-bold text-sm">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Meals */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Hoy - Viernes</p>
              {mockMeals.map((meal, i) => (
                <motion.div
                  key={meal.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: isActive ? 1 : 0.5, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex items-center gap-2 p-2 bg-card/30 rounded-lg border border-border/20"
                >
                  <span className="text-lg">{meal.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{meal.name}</p>
                    <p className="text-[10px] text-muted-foreground">{meal.time}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{meal.cal} kcal</Badge>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case "meals":
        return (
          <div className="space-y-3">
            <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
              <ChefHat className="w-12 h-12 text-primary/50" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">Salmón al Horno con Vegetales</h4>
              <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 30 min</span>
                <span className="flex items-center gap-1"><Flame className="w-3 h-3" /> 420 kcal</span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> 2 porciones</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-medium">Ingredientes:</p>
              {["200g filete de salmón", "1 taza brócoli", "½ taza zanahorias"].map((ing, i) => (
                <motion.div
                  key={ing}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isActive ? 1 : 0.5 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-2 text-[10px]"
                >
                  <Check className="w-3 h-3 text-primary" />
                  <span>{ing}</span>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case "chat":
        return (
          <div className="space-y-2 h-full">
            {[
              { role: "user", text: "¿Qué puedo comer como snack?" },
              { role: "ai", text: "Te recomiendo: nueces, yogur griego, o fruta fresca. ¿Cuántas calorías buscas?" },
              { role: "user", text: "Menos de 200 calorías" },
              { role: "ai", text: "Perfecto! Prueba: 🍎 Manzana (95 kcal) o 🥜 15 almendras (105 kcal)" }
            ].map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: isActive ? 1 : 0.5, y: 0 }}
                transition={{ delay: i * 0.15 }}
                className={`p-2 rounded-lg text-[10px] max-w-[85%] ${
                  msg.role === "user" 
                    ? "ml-auto bg-primary text-primary-foreground" 
                    : "bg-muted"
                }`}
              >
                {msg.text}
              </motion.div>
            ))}
          </div>
        );

      case "progress":
        return (
          <div className="space-y-3">
            <div className="flex gap-2">
              {["1S", "1M", "3M"].map((period, i) => (
                <Badge 
                  key={period}
                  variant={i === 0 ? "default" : "outline"} 
                  className="text-[10px]"
                >
                  {period}
                </Badge>
              ))}
            </div>
            <div className="h-24 bg-gradient-to-t from-primary/20 to-transparent rounded-lg relative overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 200 80">
                <motion.path
                  d="M 0 60 Q 30 45 60 50 T 120 35 T 180 25 L 200 20"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: isActive ? 1 : 0.3 }}
                  transition={{ duration: 1.5 }}
                />
              </svg>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Peso perdido", value: "-2.5 kg" },
                { label: "Comidas completadas", value: "28/35" }
              ].map((stat) => (
                <div key={stat.label} className="bg-card/30 p-2 rounded-lg text-center border border-border/20">
                  <p className="font-bold text-sm text-primary">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case "achievements":
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Nivel 5</span>
              <span className="text-[10px] text-muted-foreground">450 / 500 XP</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-primary to-secondary"
                initial={{ width: 0 }}
                animate={{ width: isActive ? "90%" : "30%" }}
                transition={{ duration: 1 }}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: "🔥", label: "Racha 5", unlocked: true },
                { icon: "🥗", label: "Semana 1", unlocked: true },
                { icon: "💪", label: "Meta peso", unlocked: false }
              ].map((badge, i) => (
                <motion.div
                  key={badge.label}
                  initial={{ scale: 0 }}
                  animate={{ scale: isActive ? 1 : 0.8 }}
                  transition={{ delay: i * 0.1, type: "spring" }}
                  className={`p-2 rounded-lg text-center border ${
                    badge.unlocked 
                      ? "bg-primary/10 border-primary/30" 
                      : "bg-muted/50 border-border/30 opacity-50"
                  }`}
                >
                  <span className="text-lg">{badge.icon}</span>
                  <p className="text-[9px] mt-1">{badge.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full p-4">
      {renderContent()}
    </div>
  );
};

export const ProductDemoTour = () => {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentScreen((prev) => (prev + 1) % DEMO_SCREENS.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const screen = DEMO_SCREENS[currentScreen];
  const Icon = screen.icon;

  const goToPrev = () => {
    setCurrentScreen((prev) => (prev - 1 + DEMO_SCREENS.length) % DEMO_SCREENS.length);
    setIsPlaying(false);
  };

  const goToNext = () => {
    setCurrentScreen((prev) => (prev + 1) % DEMO_SCREENS.length);
    setIsPlaying(false);
  };

  return (
    <section className="py-20 bg-gradient-to-b from-background via-muted/20 to-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-secondary/10 to-transparent blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <Badge variant="secondary" className="px-4 py-2">
            <Sparkles className="w-3 h-3 mr-2" />
            Tour del Producto
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold">
            Explora{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Chefly.AI
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Descubre todas las funcionalidades que transformarán tu alimentación
          </p>
        </div>

        {/* Main demo area */}
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Phone mockup */}
            <div className="relative mx-auto w-full max-w-[320px]">
              {/* Phone frame */}
              <div className="relative bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-[3rem] p-3 shadow-2xl">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-zinc-900 rounded-b-2xl z-20" />
                
                {/* Screen */}
                <div className="relative bg-background rounded-[2.5rem] overflow-hidden aspect-[9/19]">
                  {/* Status bar */}
                  <div className="absolute top-0 left-0 right-0 h-10 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-between px-6 pt-1">
                    <span className="text-[10px]">9:41</span>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-2 border border-foreground/50 rounded-sm">
                        <div className="w-3/4 h-full bg-foreground/50 rounded-sm" />
                      </div>
                    </div>
                  </div>

                  {/* App content */}
                  <div className="pt-12 pb-4 h-full">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={screen.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                        className="h-full"
                      >
                        <DashboardMockup screenId={screen.id} isActive={true} />
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Highlight pulses */}
                  {screen.highlights.map((highlight, i) => (
                    <motion.div
                      key={`${screen.id}-${i}`}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.5 + i * 0.2 }}
                      className="absolute z-20"
                      style={{ left: highlight.x, top: highlight.y }}
                    >
                      <div className="relative">
                        <motion.div
                          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute inset-0 w-6 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary"
                        />
                        <div className="w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary border-2 border-background shadow-lg" />
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Home indicator */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/30 rounded-full" />
              </div>

              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-[4rem] blur-2xl -z-10 opacity-60" />
            </div>

            {/* Info panel */}
            <div className="space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={screen.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="inline-flex items-center gap-3 p-3 bg-primary/10 rounded-2xl">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{screen.title}</h3>
                      <p className="text-muted-foreground">{screen.subtitle}</p>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    {screen.features.map((feature, i) => (
                      <motion.div
                        key={feature}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                        className="flex items-center gap-3 p-3 bg-card/50 rounded-xl border border-border/50"
                      >
                        <Check className="w-5 h-5 text-primary" />
                        <span className="font-medium">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation dots */}
              <div className="flex items-center justify-center gap-2">
                {DEMO_SCREENS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setCurrentScreen(i);
                      setIsPlaying(false);
                    }}
                    className={`transition-all duration-300 rounded-full ${
                      i === currentScreen 
                        ? "w-8 h-2 bg-primary" 
                        : "w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    }`}
                  />
                ))}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-3">
                <Button variant="outline" size="icon" onClick={goToPrev}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button variant="outline" size="icon" onClick={goToNext}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* CTA */}
              <div className="pt-4">
                <Button 
                  variant="hero" 
                  size="lg" 
                  className="w-full group"
                  onClick={() => navigate("/auth")}
                >
                  Comenzar Gratis
                  <Sparkles className="ml-2 w-5 h-5 group-hover:rotate-12 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDemoTour;
