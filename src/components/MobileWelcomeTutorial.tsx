import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  ChefHat,
  Check, 
  Trophy, 
  ShoppingCart,
  MessageCircle,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import cheflyMascot from "@/assets/chefly-mascot.png";
import { useHaptics } from "@/hooks/useHaptics";

interface MobileWelcomeTutorialProps {
  open: boolean;
  onComplete: () => void;
}

const MobileWelcomeTutorial = ({ open, onComplete }: MobileWelcomeTutorialProps) => {
  const { t, language } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const { selectionChanged, successNotification } = useHaptics();

  const steps = [
    {
      icon: Sparkles,
      emoji: "👋",
      titleEs: "¡Bienvenido a Chefly!",
      titleEn: "Welcome to Chefly!",
      descEs: "Tu coach de nutrición personalizado con inteligencia artificial. Te ayudaré a comer mejor cada día.",
      descEn: "Your personalized AI nutrition coach. I'll help you eat better every day.",
      color: "from-primary to-primary/80",
    },
    {
      icon: ChefHat,
      emoji: "🍽️",
      titleEs: "Tu menú semanal",
      titleEn: "Your weekly menu",
      descEs: "Desliza entre días para ver todas tus comidas. Cada receta está personalizada para ti.",
      descEn: "Swipe between days to see all your meals. Each recipe is personalized for you.",
      color: "from-orange-500 to-amber-500",
    },
    {
      icon: Check,
      emoji: "✅",
      titleEs: "Marca tus comidas",
      titleEn: "Track your meals",
      descEs: "Toca la palomita verde para marcar cuando completes una comida y ganar puntos.",
      descEn: "Tap the green checkmark when you complete a meal to earn points.",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Trophy,
      emoji: "🏆",
      titleEs: "Gana recompensas",
      titleEn: "Earn rewards",
      descEs: "Completa comidas para subir de nivel, mantener tu racha y desbloquear logros.",
      descEn: "Complete meals to level up, maintain your streak and unlock achievements.",
      color: "from-yellow-500 to-orange-500",
    },
    {
      icon: ShoppingCart,
      emoji: "🛒",
      titleEs: "Lista de compras",
      titleEn: "Shopping list",
      descEs: "Tu lista de ingredientes se genera automáticamente. ¡Todo listo para ir al super!",
      descEn: "Your ingredient list is generated automatically. Ready to go shopping!",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: MessageCircle,
      emoji: "💬",
      titleEs: "Chat con tu coach",
      titleEn: "Chat with your coach",
      descEs: "¿Dudas sobre nutrición? Pregúntame lo que quieras en el chat.",
      descEn: "Nutrition questions? Ask me anything in the chat.",
      color: "from-purple-500 to-pink-500",
    },
  ];

  const handleNext = () => {
    selectionChanged();
    if (currentStep < steps.length - 1) {
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

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-background flex flex-col"
    >
      {/* Progress dots at top */}
      <div className="pt-safe-top px-6 pt-4 flex justify-between items-center">
        <div className="flex gap-1.5">
          {steps.map((_, index) => (
            <motion.div
              key={index}
              className={`h-1.5 rounded-full transition-all ${
                index === currentStep 
                  ? "w-6 bg-primary" 
                  : index < currentStep 
                  ? "w-1.5 bg-primary/60" 
                  : "w-1.5 bg-muted"
              }`}
              layoutId={`dot-${index}`}
            />
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSkip}
          className="text-muted-foreground text-xs"
        >
          {language === 'es' ? 'Saltar' : 'Skip'}
        </Button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-safe-bottom">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center w-full max-w-sm"
          >
            {/* Mascot with animated glow */}
            <div className="relative mb-6">
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${currentStepData.color} rounded-full blur-3xl opacity-30`}
                animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="relative"
              >
                {currentStep === 0 ? (
                  <img 
                    src={cheflyMascot} 
                    alt="Chefly" 
                    className="w-32 h-32 object-contain drop-shadow-xl"
                  />
                ) : (
                  <div className={`w-28 h-28 rounded-3xl bg-gradient-to-br ${currentStepData.color} flex items-center justify-center shadow-xl`}>
                    <span className="text-5xl">{currentStepData.emoji}</span>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Title */}
            <motion.h2
              className="text-2xl font-bold text-foreground mb-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {language === 'es' ? currentStepData.titleEs : currentStepData.titleEn}
            </motion.h2>

            {/* Description */}
            <motion.p
              className="text-muted-foreground text-base leading-relaxed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {language === 'es' ? currentStepData.descEs : currentStepData.descEn}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom action button */}
      <div className="px-6 pb-8 pb-safe-bottom">
        <Button
          onClick={handleNext}
          size="lg"
          className="w-full h-14 text-lg font-semibold rounded-2xl shadow-lg"
        >
          {isLastStep ? (
            language === 'es' ? '¡Comenzar!' : "Let's go!"
          ) : (
            <>
              {language === 'es' ? 'Siguiente' : 'Next'}
              <ChevronRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
};

export default MobileWelcomeTutorial;
