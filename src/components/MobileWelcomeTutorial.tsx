import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  ChevronRight,
  X,
  Home,
  ShoppingCart,
  TrendingUp,
  MessageCircle,
  User,
  Camera,
} from "lucide-react";
import mascotLime from "@/assets/mascot-lime.png";
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
    descEs: "Tu coach de nutrición con IA. Te guiaré por la app para que saques el máximo provecho.",
    descEn: "Your AI nutrition coach. I'll guide you through the app so you get the most out of it.",
    position: "center",
  },
  {
    target: "nav-home",
    titleEs: "Tu menú semanal",
    titleEn: "Your weekly menu",
    descEs: "Aquí verás todas tus comidas personalizadas. Desliza entre días y toca cualquier comida para ver la receta completa.",
    descEn: "Here you'll see all your personalized meals. Swipe between days and tap any meal to see the full recipe.",
    position: "top",
    icon: Home,
  },
  {
    target: "nav-shopping",
    titleEs: "Lista de compras",
    titleEn: "Shopping list",
    descEs: "Tu lista de ingredientes generada automáticamente. ¡Lista para ir al super!",
    descEn: "Your automatically generated ingredient list. Ready to go shopping!",
    position: "top",
    icon: ShoppingCart,
  },
  {
    target: "nav-scanner",
    titleEs: "Escanea tu comida",
    titleEn: "Scan your food",
    descEs: "Toma una foto de cualquier comida y nuestra IA calculará las calorías y nutrientes automáticamente. ¡Perfecto para llevar registro de lo que comes!",
    descEn: "Take a photo of any food and our AI will calculate calories and nutrients automatically. Perfect for tracking what you eat!",
    position: "top",
    icon: Camera,
  },
  {
    target: "nav-progress",
    titleEs: "Tu progreso",
    titleEn: "Your progress",
    descEs: "Aquí verás gráficas de tu nutrición y medidas corporales a lo largo del tiempo.",
    descEn: "Here you'll see charts of your nutrition and body measurements over time.",
    position: "top",
    icon: TrendingUp,
  },
  {
    target: "nav-chat",
    titleEs: "Chat con tu coach",
    titleEn: "Chat with your coach",
    descEs: "¿Dudas sobre nutrición? Pregúntame lo que quieras. Estoy aquí para ayudarte.",
    descEn: "Nutrition questions? Ask me anything. I'm here to help.",
    position: "top",
    icon: MessageCircle,
  },
  {
    target: "nav-profile",
    titleEs: "Tu perfil",
    titleEn: "Your profile",
    descEs: "Configura tu avatar, ajustes, notificaciones y administra tu suscripción.",
    descEn: "Set up your avatar, settings, notifications and manage your subscription.",
    position: "top",
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
    
    // Handle nav items specially
    let element: Element | null = null;
    if (step.target.startsWith("nav-")) {
      const navType = step.target.replace("nav-", "");
      const pathMap: Record<string, string> = {
        home: "/dashboard",
        shopping: "/dashboard/shopping",
        scanner: "/dashboard/food-history",
        progress: "/dashboard/progress",
        chat: "/chat",
        profile: "/dashboard/profile",
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
  const isNavStep = currentStepData.target.startsWith("nav-");
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
    
    // Position "bottom" means tooltip goes below the highlighted element
    // But we want it visible, so put it in the center-ish area of the screen
    return { 
      top: "30%",
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
                    src={mascotLime}
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
