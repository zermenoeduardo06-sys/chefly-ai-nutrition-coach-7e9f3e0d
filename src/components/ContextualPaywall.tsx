import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Camera, Sparkles, Zap, Utensils, MessageSquare, Star, X } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { Icon3D } from "@/components/ui/icon-3d";
import { Card3D } from "@/components/ui/card-3d";
import mascotCelebrating from "@/assets/mascot-celebrating.png";

interface ContextualPaywallProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: "scan" | "plan" | "chat" | "swap" | "generate";
  userId?: string;
}

const featureData = {
  scan: {
    icon: Camera,
    iconColor: "sky" as const,
    gradient: "from-sky-500 to-cyan-500",
    es: {
      title: "Conoce lo que comes en segundos",
      description: "Toma una foto y obtén información nutricional instantánea de cualquier platillo",
      benefits: [
        "Análisis instantáneo con IA",
        "Calorías y macros precisos",
        "Historial de escaneos",
      ],
    },
    en: {
      title: "Know what you eat in seconds",
      description: "Take a photo and get instant nutritional info from any dish",
      benefits: [
        "Instant AI analysis",
        "Accurate calories and macros",
        "Scan history",
      ],
    },
  },
  plan: {
    icon: Zap,
    iconColor: "amber" as const,
    gradient: "from-amber-500 to-orange-500",
    es: {
      title: "Planes frescos cada semana",
      description: "Genera planes personalizados ilimitados adaptados a tus objetivos",
      benefits: [
        "Planes ilimitados",
        "Adaptados a ti",
        "Recetas variadas",
      ],
    },
    en: {
      title: "Fresh plans every week",
      description: "Generate unlimited personalized plans adapted to your goals",
      benefits: [
        "Unlimited plans",
        "Tailored to you",
        "Varied recipes",
      ],
    },
  },
  chat: {
    icon: MessageSquare,
    iconColor: "emerald" as const,
    gradient: "from-emerald-500 to-teal-500",
    es: {
      title: "Tu nutriólogo de bolsillo 24/7",
      description: "Pregunta sobre nutrición, recetas y consejos personalizados cuando quieras",
      benefits: [
        "Respuestas instantáneas",
        "Consejos personalizados",
        "Recetas a medida",
      ],
    },
    en: {
      title: "Your pocket nutritionist 24/7",
      description: "Ask about nutrition, recipes and personalized tips anytime",
      benefits: [
        "Instant answers",
        "Personalized advice",
        "Custom recipes",
      ],
    },
  },
  swap: {
    icon: Utensils,
    iconColor: "rose" as const,
    gradient: "from-rose-500 to-pink-500",
    es: {
      title: "Cambia comidas cuando quieras",
      description: "Flexibilidad total para adaptar tu plan a tu día",
      benefits: [
        "Flexibilidad total",
        "Mantiene tus macros",
        "Sugerencias inteligentes",
      ],
    },
    en: {
      title: "Swap meals anytime",
      description: "Total flexibility to adapt your plan to your day",
      benefits: [
        "Total flexibility",
        "Keeps your macros",
        "Smart suggestions",
      ],
    },
  },
  generate: {
    icon: Sparkles,
    iconColor: "primary" as const,
    gradient: "from-primary to-secondary",
    es: {
      title: "Genera planes ilimitados",
      description: "Crea nuevos planes semanales personalizados según tus preferencias",
      benefits: [
        "Sin límites",
        "100% personalizado",
        "Actualizado a tus gustos",
      ],
    },
    en: {
      title: "Generate unlimited plans",
      description: "Create new personalized weekly plans based on your preferences",
      benefits: [
        "No limits",
        "100% personalized",
        "Updated to your tastes",
      ],
    },
  },
};

// Floating food emojis
const floatingEmojis = [
  { emoji: "🍎", top: "5%", left: "8%", delay: 0 },
  { emoji: "✨", top: "8%", right: "10%", delay: 0.3 },
  { emoji: "🥕", top: "15%", left: "5%", delay: 0.5 },
];

export default function ContextualPaywall({
  open,
  onOpenChange,
  feature,
  userId,
}: ContextualPaywallProps) {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const data = featureData[feature];
  const Icon = data.icon;
  const texts = data[language];

  const handleGetPremium = () => {
    onOpenChange(false);
    navigate("/subscription");
  };

  const commonTexts = {
    es: {
      unlockWith: "Desbloquea con",
      getButton: "OBTENER CHEFLY PLUS",
      price: "$7.99 USD/mes",
      cancel: "Cancela cuando quieras",
      rating: "4.8★",
    },
    en: {
      unlockWith: "Unlock with",
      getButton: "GET CHEFLY PLUS",
      price: "$7.99 USD/month",
      cancel: "Cancel anytime",
      rating: "4.8★",
    },
  };

  const t = commonTexts[language];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md mx-4 p-0 overflow-hidden border-0 bg-background max-h-[85vh] flex flex-col">
        {/* Close button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-3 right-3 z-50 p-2 rounded-full bg-muted/80 hover:bg-muted transition-colors"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>

        {/* Hero section with gradient */}
        <div className={`relative bg-gradient-to-br ${data.gradient} p-6 pb-16 overflow-hidden`}>
          {/* Floating Emojis */}
          {floatingEmojis.map((item, index) => (
            <motion.div
              key={index}
              className="absolute text-xl pointer-events-none"
              style={{ top: item.top, left: item.left, right: item.right }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ 
                opacity: 0.8, 
                y: [0, -6, 0],
              }}
              transition={{ 
                opacity: { delay: item.delay, duration: 0.3 },
                y: { delay: item.delay, duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              {item.emoji}
            </motion.div>
          ))}

          {/* Rating Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-end mb-2"
          >
            <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
              <Star className="h-3 w-3 text-white fill-white" />
              <span className="text-xs font-medium text-white">{t.rating}</span>
            </div>
          </motion.div>

          {/* Mascot floating */}
          <motion.img
            src={mascotCelebrating}
            alt="Chef mascot"
            className="absolute -bottom-8 right-4 h-24 w-24 object-contain"
            initial={{ y: 10, opacity: 0, rotate: -5 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring" }}
          />

          <div className="text-white">
            <p className="text-sm opacity-90 flex items-center gap-1.5 mb-2">
              {t.unlockWith}
              <Crown className="h-4 w-4" />
              <span className="font-bold">Chefly+</span>
            </p>
          </div>

          {/* Feature Icon Badge - positioned at bottom edge */}
          <div className="absolute -bottom-10 left-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring" }}
            >
              <Icon3D icon={Icon} color={data.iconColor} size="xl" />
            </motion.div>
          </div>
        </div>

        {/* Content - scrollable */}
        <div className="flex-1 overflow-y-auto p-6 pt-14">
          <div className="text-left mb-5">
            <h2 className="text-xl font-bold text-foreground mb-2">{texts.title}</h2>
            <p className="text-muted-foreground text-sm">{texts.description}</p>
          </div>

          {/* Benefits with styled cards */}
          <Card3D variant="default" hover={false} className="p-4 mb-4">
            <div className="space-y-3">
              {texts.benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className={`h-6 w-6 rounded-full bg-gradient-to-r ${data.gradient} flex items-center justify-center shadow-sm`}>
                    <Sparkles className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </Card3D>
        </div>

        {/* Fixed bottom CTA */}
        <div className="flex-shrink-0 p-6 pt-3 bg-gradient-to-t from-background via-background to-transparent border-t border-border/50">
          <p className="text-center text-sm text-muted-foreground mb-3">
            ✓ {t.cancel}
          </p>
          
          <Button
            onClick={handleGetPremium}
            variant="modern3d"
            size="xl"
            className="w-full mb-2"
          >
            <Crown className="h-5 w-5 mr-2" />
            {t.getButton}
          </Button>
          
          <p className="text-center text-xs text-muted-foreground">{t.price}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
