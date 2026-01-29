import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  ChevronRight,
  X,
  BookOpen,
  ChefHat,
  TrendingUp,
  Sparkles,
  Heart,
  User,
} from "lucide-react";
import mascotHappy from "@/assets/mascot-happy.png";
import { useHaptics } from "@/hooks/useHaptics";

interface TourStep {
  target: string;
  titleEs: string;
  titleEn: string;
  descEs: string;
  descEn: string;
  position: "top" | "bottom" | "center";
  icon?: React.ComponentType<{ className?: string }>;
}

interface MobileWelcomeTutorialProps {
  open: boolean;
  onComplete: () => void;
}

const tourSteps: TourStep[] = [
  {
    target: "welcome",
    titleEs: "¡Bienvenido a Chefly!",
    titleEn: "Welcome to Chefly!",
    descEs: "Soy tu coach de nutrición con IA. Te guiaré por la app para que saques el máximo provecho.",
    descEn: "I'm your AI nutrition coach. I'll guide you through the app so you get the most out of it.",
    position: "center",
  },
  {
    target: "nav-diary",
    titleEs: "Tu Diario",
    titleEn: "Your Diary",
    descEs: "Aquí verás tu resumen del día: calorías, macros y comidas. Registra lo que comes y completa tu plan.",
    descEn: "Here you'll see your daily summary: calories, macros and meals. Log what you eat and complete your plan.",
    position: "top",
    icon: BookOpen,
  },
  {
    target: "nav-recipes",
    titleEs: "Recetas",
    titleEn: "Recipes",
    descEs: "Explora recetas personalizadas según tus preferencias. Cada una incluye ingredientes, pasos y valores nutricionales.",
    descEn: "Explore personalized recipes based on your preferences. Each includes ingredients, steps and nutritional values.",
    position: "top",
    icon: ChefHat,
  },
  {
    target: "nav-progress",
    titleEs: "Tu Progreso",
    titleEn: "Your Progress",
    descEs: "Visualiza gráficas de tu evolución nutricional y medidas corporales. ¡También puedes hacer un body scan con IA!",
    descEn: "Visualize charts of your nutritional evolution and body measurements. You can also do an AI body scan!",
    position: "top",
    icon: TrendingUp,
  },
  {
    target: "nav-chef",
    titleEs: "Chef IA",
    titleEn: "Chef AI",
    descEs: "¿Dudas sobre nutrición? Pregúntame lo que quieras. Estoy aquí 24/7 para ayudarte con recetas, sustituciones y más.",
    descEn: "Questions about nutrition? Ask me anything. I'm here 24/7 to help with recipes, substitutions and more.",
    position: "top",
    icon: Sparkles,
  },
  {
    target: "nav-wellness",
    titleEs: "Bienestar",
    titleEn: "Wellness",
    descEs: "Registra cómo te sientes cada día. Descubre patrones entre tu alimentación y tu estado de ánimo.",
    descEn: "Track how you feel each day. Discover patterns between your nutrition and mood.",
    position: "top",
    icon: Heart,
  },
  {
    target: "profile",
    titleEs: "Tu Perfil",
    titleEn: "Your Profile",
    descEs: "Toca tu avatar en la esquina superior para acceder a tu perfil, ajustes y notificaciones.",
    descEn: "Tap your avatar in the top corner to access your profile, settings and notifications.",
    position: "bottom",
    icon: User,
  },
];

const MobileWelcomeTutorial = ({ open, onComplete }: MobileWelcomeTutorialProps) => {
  const { language } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightRect, setHighlightRect] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [isReady, setIsReady] = useState(false);
  const { selectionChanged, successNotification } = useHaptics();

  const calculatePositions = useCallback(() => {
    if (!open) return;
    
    const step = tourSteps[currentStep];
    
    // Welcome screen or center position doesn't need highlighting
    if (step.target === "welcome" || step.position === "center") {
      setIsReady(true);
      return;
    }
    
    // Handle nav items and profile specially
    let element: Element | null = null;
    
    if (step.target === "profile") {
      // Profile is in the header avatar
      element = document.querySelector('[data-tour="user-avatar"]');
    } else if (step.target.startsWith("nav-")) {
      const navType = step.target.replace("nav-", "");
      const pathMap: Record<string, string> = {
        diary: "/dashboard",
        recipes: "/recipes",
        progress: "/dashboard/progress",
        chef: "/chef-ia",
        wellness: "/dashboard/wellness",
      };
      const path = pathMap[navType];
      element = document.querySelector(`nav a[href="${path}"]`);
    } else {
      element = document.querySelector(step.target);
    }
    
    if (!element) {
      console.log("Element not found:", step.target);
      setIsReady(true);
      return;
    }

    const rect = element.getBoundingClientRect();
    const padding = 8;

    setHighlightRect({
      top: rect.top - padding,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    });

    setIsReady(true);
  }, [currentStep, open]);

  useEffect(() => {
    if (open) {
      setIsReady(false);
      const timer = setTimeout(calculatePositions, 300);
      return () => clearTimeout(timer);
    }
  }, [open, currentStep, calculatePositions]);

  useEffect(() => {
    if (!open) {
      setCurrentStep(0);
      setIsReady(false);
    }
  }, [open]);

  const handleNext = () => {
    selectionChanged();
    if (currentStep < tourSteps.length - 1) {
      setIsReady(false);
      setCurrentStep(currentStep + 1);
    } else {
      successNotification();
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  if (!open) return null;

  const currentStepData = tourSteps[currentStep];
  const isWelcome = currentStepData.target === "welcome";
  const isNavStep = currentStepData.target.startsWith("nav-") || currentStepData.target === "profile";
  const isLastStep = currentStep === tourSteps.length - 1;

  // Calculate tooltip position
  const getTooltipStyle = (): React.CSSProperties => {
    // Welcome and center positions - center on screen
    if (isWelcome || currentStepData.position === "center") {
      return { 
        top: "50%", 
        transform: "translateY(-50%)",
        left: "1rem",
        right: "1rem",
      };
    }
    
    if (currentStepData.position === "top") {
      // Position above the element (for bottom nav)
      const bottomPosition = window.innerHeight - highlightRect.top + 24;
      return { 
        bottom: `${Math.max(bottomPosition, 120)}px`,
        left: "1rem",
        right: "1rem",
      };
    }
    
    // Position "bottom" means tooltip goes below the highlighted element (for header avatar)
    const topPosition = highlightRect.top + highlightRect.height + 24;
    return { 
      top: `${Math.max(topPosition, 80)}px`,
      left: "1rem",
      right: "1rem",
    };
  };

  const tooltipStyle = getTooltipStyle();

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999] overflow-hidden">
          {/* Dark overlay with cutout */}
          {!isWelcome && isReady && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <svg className="w-full h-full">
                <defs>
                  <mask id="mobile-spotlight-mask">
                    <rect width="100%" height="100%" fill="white" />
                    <rect
                      x={highlightRect.left}
                      y={highlightRect.top}
                      width={highlightRect.width}
                      height={highlightRect.height}
                      rx="16"
                      fill="black"
                    />
                  </mask>
                </defs>
                <rect
                  width="100%"
                  height="100%"
                  fill="rgba(0, 0, 0, 0.85)"
                  mask="url(#mobile-spotlight-mask)"
                />
              </svg>
            </motion.div>
          )}

          {/* Welcome screen overlay */}
          {isWelcome && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/95 backdrop-blur-sm"
            />
          )}

          {/* Highlight border for non-welcome steps */}
          {!isWelcome && isReady && (
            <>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute pointer-events-none rounded-2xl border-[3px] border-primary z-[10000]"
                style={{
                  top: highlightRect.top,
                  left: highlightRect.left,
                  width: highlightRect.width,
                  height: highlightRect.height,
                  boxShadow: "0 0 30px 8px hsl(var(--primary) / 0.6)",
                }}
              />
              {/* Pulsing effect */}
              <motion.div
                animate={{ 
                  opacity: [0.3, 0.7, 0.3],
                  scale: [1, 1.05, 1],
                }}
                transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                className="absolute pointer-events-none rounded-2xl border-2 border-primary/60 z-[9999]"
                style={{
                  top: highlightRect.top - 6,
                  left: highlightRect.left - 6,
                  width: highlightRect.width + 12,
                  height: highlightRect.height + 12,
                }}
              />
            </>
          )}

          {/* Progress dots at top */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-0 left-0 right-0 pt-safe-top px-4 pt-3 flex justify-between items-center z-[10001]"
          >
            <div className="flex gap-1">
              {tourSteps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    index === currentStep 
                      ? "w-5 bg-primary" 
                      : index < currentStep 
                      ? "w-1.5 bg-primary/60" 
                      : "w-1.5 bg-white/30"
                  }`}
                />
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-white/70 hover:text-white hover:bg-white/10 text-xs h-8 px-2"
            >
              <X className="h-4 w-4 mr-1" />
              {language === 'es' ? 'Saltar' : 'Skip'}
            </Button>
          </motion.div>

          {/* Tooltip / Content Card */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.9, y: currentStepData.position === "top" ? 30 : -30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="absolute z-[10002]"
            style={tooltipStyle}
          >
            <div className="bg-card border-2 border-primary/30 rounded-3xl shadow-2xl overflow-hidden">
              {/* Header with mascot or icon */}
              <div className="bg-gradient-to-r from-primary via-primary to-primary/80 p-4 flex items-center gap-4">
                {isWelcome ? (
                  <motion.img
                    src={mascotHappy}
                    alt="Chefly"
                    className="w-20 h-20 object-contain drop-shadow-lg flex-shrink-0"
                    animate={{ 
                      y: [0, -5, 0],
                      rotate: [0, 3, -3, 0],
                    }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                  />
                ) : isNavStep && currentStepData.icon ? (
                  <motion.div 
                    className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <currentStepData.icon className="h-8 w-8 text-white" />
                  </motion.div>
                ) : (
                  <motion.div 
                    className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0"
                    animate={{ y: [0, -3, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <span className="text-3xl">👆</span>
                  </motion.div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-primary-foreground font-bold text-lg leading-tight">
                    {language === 'es' ? currentStepData.titleEs : currentStepData.titleEn}
                  </h3>
                  <span className="text-primary-foreground/70 text-xs">
                    {currentStep + 1} / {tourSteps.length}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="p-4">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {language === 'es' ? currentStepData.descEs : currentStepData.descEn}
                </p>
              </div>

              {/* Action button */}
              <div className="px-4 pb-4">
                <Button
                  onClick={handleNext}
                  size="lg"
                  className="w-full h-12 text-base font-semibold rounded-xl"
                >
                  {isLastStep ? (
                    language === 'es' ? '¡Comenzar!' : "Let's go!"
                  ) : (
                    <>
                      {language === 'es' ? 'Siguiente' : 'Next'}
                      <ChevronRight className="ml-1 h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Animated arrow pointing to element */}
          {!isWelcome && isReady && currentStepData.position === "top" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute z-[10001] pointer-events-none"
              style={{
                top: highlightRect.top - 50,
                left: highlightRect.left + highlightRect.width / 2 - 20,
              }}
            >
              <motion.svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
                className="text-primary drop-shadow-lg"
              >
                <path
                  d="M20 8L20 28M20 28L10 18M20 28L30 18"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </motion.svg>
            </motion.div>
          )}

          {!isWelcome && isReady && currentStepData.position === "bottom" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute z-[10001] pointer-events-none"
              style={{
                top: highlightRect.top + highlightRect.height + 8,
                left: highlightRect.left + highlightRect.width / 2 - 20,
              }}
            >
              <motion.svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                animate={{ y: [-8, 0, -8] }}
                transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
                className="text-primary drop-shadow-lg"
                style={{ transform: "rotate(180deg)" }}
              >
                <path
                  d="M20 8L20 28M20 28L10 18M20 28L30 18"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </motion.svg>
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
};

export default MobileWelcomeTutorial;
