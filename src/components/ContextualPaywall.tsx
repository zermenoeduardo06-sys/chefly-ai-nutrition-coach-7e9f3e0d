import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Camera, CheckCircle2, Sparkles, Zap, Utensils, MessageSquare, Star, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { Card3D } from "@/components/ui/card-3d";
import { Icon3D } from "@/components/ui/icon-3d";
import mascotMoney from "@/assets/mascot-money.png";

interface ContextualPaywallProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: "scan" | "plan" | "chat" | "swap" | "generate";
  userId?: string;
}

const featureData = {
  scan: {
    icon: Camera,
    iconColor: "amber" as const,
    gradient: "from-amber-500 to-orange-500",
    es: {
      title: "Escanea cualquier platillo",
      description: "Toma una foto y conoce las calorías y nutrientes en segundos",
      benefits: [
        "Análisis instantáneo con IA",
        "Calorías y macros precisos",
        "Historial de escaneos",
      ],
    },
    en: {
      title: "Scan any dish",
      description: "Take a photo and know calories and nutrients in seconds",
      benefits: [
        "Instant AI analysis",
        "Accurate calories and macros",
        "Scan history",
      ],
    },
  },
  plan: {
    icon: CheckCircle2,
    iconColor: "emerald" as const,
    gradient: "from-emerald-500 to-teal-500",
    es: {
      title: "Registra tu plan semanal",
      description: "Marca las comidas de tu plan personalizado con un solo tap",
      benefits: [
        "Un tap para registrar",
        "Nutrición ya calculada",
        "Plan personalizado por IA",
      ],
    },
    en: {
      title: "Log your weekly plan",
      description: "Mark meals from your personalized plan with a single tap",
      benefits: [
        "One tap to log",
        "Nutrition pre-calculated",
        "AI-personalized plan",
      ],
    },
  },
  chat: {
    icon: MessageSquare,
    iconColor: "sky" as const,
    gradient: "from-sky-500 to-cyan-500",
    es: {
      title: "Tu nutriólogo 24/7",
      description: "Pregunta sobre nutrición, recetas y consejos personalizados",
      benefits: [
        "$2 USD de créditos al mes",
        "Consejos personalizados",
        "Recetas a medida",
      ],
    },
    en: {
      title: "Your 24/7 nutritionist",
      description: "Ask about nutrition, recipes and personalized tips",
      benefits: [
        "$2 USD credits per month",
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
      description: "Intercambia cualquier comida de tu plan por otra que prefieras",
      benefits: [
        "Flexibilidad total",
        "Mantiene tus macros",
        "Sugerencias inteligentes",
      ],
    },
    en: {
      title: "Swap meals anytime",
      description: "Change any meal in your plan for another you prefer",
      benefits: [
        "Total flexibility",
        "Keeps your macros",
        "Smart suggestions",
      ],
    },
  },
  generate: {
    icon: Zap,
    iconColor: "primary" as const,
    gradient: "from-primary to-secondary",
    es: {
      title: "Planes frescos cada semana",
      description: "Genera nuevos planes personalizados según tus objetivos",
      benefits: [
        "Planes ilimitados",
        "Adaptados a ti",
        "Recetas variadas",
      ],
    },
    en: {
      title: "Fresh plans every week",
      description: "Generate new personalized plans based on your goals",
      benefits: [
        "Unlimited plans",
        "Tailored to you",
        "Varied recipes",
      ],
    },
  },
};

export default function ContextualPaywall({
  open,
  onOpenChange,
  feature,
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
      getButton: "Comenzar ahora",
      price: "$7.99 USD/mes",
      cancel: "Ahora no",
      cancelAnytime: "Cancela cuando quieras",
      rating: "4.8★ App Store",
    },
    en: {
      unlockWith: "Unlock with",
      getButton: "Start now",
      price: "$7.99 USD/month",
      cancel: "Not now",
      cancelAnytime: "Cancel anytime",
      rating: "4.8★ App Store",
    },
  };

  const t = commonTexts[language];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md mx-4 p-0 overflow-hidden border-0 bg-transparent">
        <Card3D variant="elevated" className="overflow-hidden">
          {/* Hero section with gradient */}
          <div className={`bg-gradient-to-br ${data.gradient} p-6 pb-14 relative`}>
            {/* Rating badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-4 left-4"
            >
              <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-2.5 py-1">
                <Star className="h-3 w-3 text-yellow-300 fill-yellow-300" />
                <span className="text-[10px] font-semibold text-white">{t.rating}</span>
              </div>
            </motion.div>

            {/* Mascot floating */}
            <motion.img
              src={mascotMoney}
              alt="Chef mascot"
              className="absolute top-2 right-2 h-20 w-20 object-contain"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            />
            
            {/* Sparkles */}
            <motion.div
              className="absolute bottom-8 left-6"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="h-4 w-4 text-white/60" />
            </motion.div>

            <div className="text-center text-white pt-4">
              <p className="text-sm opacity-90 flex items-center justify-center gap-1 mb-1">
                {t.unlockWith}
                <Crown className="h-4 w-4" />
                <span className="font-bold">Chefly+</span>
              </p>
            </div>

            {/* Icon badge floating */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: "spring" }}
              >
                <Icon3D icon={Icon} color={data.iconColor} size="xl" animate />
              </motion.div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 pt-12 space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground">{texts.title}</h2>
              <p className="text-muted-foreground text-sm mt-2">{texts.description}</p>
            </div>

            {/* Benefits with mini icons */}
            <div className="space-y-2.5 py-2">
              {texts.benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className={`h-7 w-7 rounded-xl bg-gradient-to-br ${data.gradient} flex items-center justify-center shadow-md`}>
                    <Sparkles className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{benefit}</span>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <div className="space-y-3 pt-2">
              {/* Cancel anytime */}
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span className="text-xs">{t.cancelAnytime}</span>
              </div>

              <Button
                onClick={handleGetPremium}
                variant="modern3d"
                size="lg"
                className="w-full h-12 text-base font-bold"
              >
                <Crown className="h-5 w-5 mr-2" />
                {t.getButton}
              </Button>
              
              <p className="text-center text-xs text-muted-foreground">{t.price}</p>
              
              <button
                onClick={() => onOpenChange(false)}
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </Card3D>
      </DialogContent>
    </Dialog>
  );
}
