import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ChefHat, 
  Calendar, 
  MessageCircle, 
  Trophy, 
  TrendingUp,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Check,
  Circle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

// Import demo images
import demoDashboard from "@/assets/demo-dashboard.jpg";
import demoRecipe from "@/assets/demo-recipe.jpg";
import demoChat from "@/assets/demo-chat.jpg";
import demoProgress from "@/assets/demo-progress.jpg";
import demoAchievements from "@/assets/demo-achievements.jpg";

interface DemoScreen {
  id: string;
  title: string;
  subtitle: string;
  icon: typeof ChefHat;
  image: string;
  features: string[];
  color: string;
}

const DEMO_SCREENS: DemoScreen[] = [
  {
    id: "dashboard",
    title: "Dashboard Semanal",
    subtitle: "Visualiza tu plan de comidas completo de un vistazo",
    icon: Calendar,
    image: demoDashboard,
    features: ["Menú de 7 días personalizado", "Calorías y macros calculados", "Lista de compras automática"],
    color: "from-orange-500 to-amber-500"
  },
  {
    id: "meals",
    title: "Recetas Detalladas",
    subtitle: "Instrucciones paso a paso con fotos profesionales",
    icon: ChefHat,
    image: demoRecipe,
    features: ["Ingredientes con cantidades exactas", "Pasos ilustrados", "Información nutricional completa"],
    color: "from-green-500 to-emerald-500"
  },
  {
    id: "chat",
    title: "Coach IA 24/7",
    subtitle: "Tu asistente nutricional siempre disponible",
    icon: MessageCircle,
    image: demoChat,
    features: ["Respuestas personalizadas", "Consejos de nutrición", "Motivación diaria"],
    color: "from-blue-500 to-cyan-500"
  },
  {
    id: "progress",
    title: "Seguimiento de Progreso",
    subtitle: "Monitorea tu evolución con gráficos detallados",
    icon: TrendingUp,
    image: demoProgress,
    features: ["Gráficas de peso y medidas", "Historial nutricional", "Tendencias semanales"],
    color: "from-purple-500 to-violet-500"
  },
  {
    id: "achievements",
    title: "Logros y Gamificación",
    subtitle: "Mantente motivado con recompensas y retos",
    icon: Trophy,
    image: demoAchievements,
    features: ["Badges y trofeos", "Retos diarios", "Tabla de clasificación"],
    color: "from-yellow-500 to-orange-500"
  }
];

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
    <section className="py-20 bg-gradient-to-b from-background via-muted/30 to-background relative overflow-hidden">
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
        <div className="max-w-6xl mx-auto">
          {/* Browser/Laptop Mockup */}
          <div className="relative">
            {/* Laptop frame */}
            <div className="relative mx-auto">
              {/* Screen bezel */}
              <div className="bg-gradient-to-b from-zinc-700 to-zinc-800 rounded-t-xl p-2 shadow-2xl">
                {/* Browser chrome */}
                <div className="bg-zinc-800 rounded-t-lg">
                  {/* Window controls and address bar */}
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-700">
                    {/* Traffic lights */}
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    {/* Address bar */}
                    <div className="flex-1 max-w-xl mx-auto">
                      <div className="bg-zinc-700 rounded-md px-4 py-1.5 text-xs text-zinc-400 flex items-center gap-2">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span>app.chefly.ai/{screen.id}</span>
                      </div>
                    </div>
                    {/* Spacer for symmetry */}
                    <div className="w-14" />
                  </div>
                </div>

                {/* Screen content */}
                <div className="bg-background rounded-b-lg overflow-hidden">
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={screen.id}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0"
                      >
                        <img 
                          src={screen.image} 
                          alt={screen.title}
                          className="w-full h-full object-cover object-top"
                        />
                        {/* Gradient overlay for readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      </motion.div>
                    </AnimatePresence>

                    {/* Feature badges on screen */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={`features-${screen.id}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: 0.3 }}
                          className="flex flex-wrap gap-2"
                        >
                          {screen.features.map((feature, i) => (
                            <motion.div
                              key={feature}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.4 + i * 0.1 }}
                            >
                              <Badge 
                                variant="secondary" 
                                className="bg-white/90 text-zinc-800 backdrop-blur-sm text-xs md:text-sm"
                              >
                                <Check className="w-3 h-3 mr-1 text-green-600" />
                                {feature}
                              </Badge>
                            </motion.div>
                          ))}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>

              {/* Laptop base/keyboard */}
              <div className="relative">
                <div className="bg-gradient-to-b from-zinc-700 to-zinc-600 h-4 rounded-b-lg mx-8" />
                <div className="bg-gradient-to-b from-zinc-600 to-zinc-500 h-2 rounded-b-xl mx-16" />
                {/* Laptop hinge detail */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-zinc-500 rounded-b" />
              </div>

              {/* Glow effect under laptop */}
              <div className={`absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-16 bg-gradient-to-r ${screen.color} blur-3xl opacity-30`} />
            </div>
          </div>

          {/* Info panel below */}
          <div className="mt-12 text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={screen.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className={`inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r ${screen.color} rounded-2xl text-white shadow-lg`}>
                  <Icon className="w-6 h-6" />
                  <div className="text-left">
                    <h3 className="text-xl font-bold">{screen.title}</h3>
                    <p className="text-sm text-white/80">{screen.subtitle}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation dots */}
            <div className="flex items-center justify-center gap-3 mt-8">
              {DEMO_SCREENS.map((s, i) => {
                const ScreenIcon = s.icon;
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      setCurrentScreen(i);
                      setIsPlaying(false);
                    }}
                    className={`relative p-2 rounded-xl transition-all duration-300 ${
                      i === currentScreen 
                        ? `bg-gradient-to-r ${s.color} text-white shadow-lg scale-110` 
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    <ScreenIcon className="w-5 h-5" />
                    {i === currentScreen && isPlaying && (
                      <motion.div
                        className="absolute inset-0 rounded-xl border-2 border-white/50"
                        initial={{ scale: 1, opacity: 1 }}
                        animate={{ scale: 1.3, opacity: 0 }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Progress bar */}
            {isPlaying && (
              <div className="w-64 mx-auto mt-4 h-1 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className={`h-full bg-gradient-to-r ${screen.color}`}
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 5, ease: "linear" }}
                  key={currentScreen}
                />
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-center gap-3 mt-6">
              <Button variant="outline" size="icon" onClick={goToPrev} className="rounded-full">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setIsPlaying(!isPlaying)}
                className="rounded-full"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button variant="outline" size="icon" onClick={goToNext} className="rounded-full">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* CTA */}
            <div className="pt-8">
              <Button 
                variant="hero" 
                size="lg" 
                className="text-lg px-10 py-6 h-auto group"
                onClick={() => navigate("/auth")}
              >
                Comenzar Gratis
                <Sparkles className="ml-2 w-5 h-5 group-hover:rotate-12 transition-transform" />
              </Button>
              <p className="text-sm text-muted-foreground mt-3">
                4 días gratis • Sin tarjeta requerida
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDemoTour;
