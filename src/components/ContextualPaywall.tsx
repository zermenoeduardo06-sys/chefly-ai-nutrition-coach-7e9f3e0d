import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Camera, CheckCircle2, Sparkles, Zap, Utensils, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate, Link } from "react-router-dom";
import mascotHappy from "@/assets/mascot-happy.png";

interface ContextualPaywallProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: "scan" | "plan" | "chat" | "swap" | "generate";
  userId?: string;
}

const featureData = {
  scan: {
    icon: Camera,
    gradient: "from-primary to-primary/70",
    es: {
      title: "Escanea tu comida con IA",
      description: "Toma una foto y registra automáticamente las calorías y nutrientes de cualquier platillo",
      benefits: [
        "Análisis instantáneo con IA",
        "Calorías y macros precisos",
        "Historial de escaneos",
      ],
    },
    en: {
      title: "Scan your food with AI",
      description: "Take a photo and automatically log calories and nutrients from any dish",
      benefits: [
        "Instant AI analysis",
        "Accurate calories and macros",
        "Scan history",
      ],
    },
  },
  plan: {
    icon: CheckCircle2,
    gradient: "from-accent to-accent/70",
    es: {
      title: "Registra tu plan semanal",
      description: "Marca las comidas de tu plan personalizado con un solo tap y mantén tu progreso al día",
      benefits: [
        "Un tap para registrar",
        "Nutrición ya calculada",
        "Plan personalizado por IA",
      ],
    },
    en: {
      title: "Log your weekly plan",
      description: "Mark meals from your personalized plan with a single tap and keep your progress updated",
      benefits: [
        "One tap to log",
        "Nutrition pre-calculated",
        "AI-personalized plan",
      ],
    },
  },
  chat: {
    icon: MessageSquare,
    gradient: "from-secondary to-secondary/70",
    es: {
      title: "Chat con Chef IA",
      description: "Pregunta sobre nutrición, recetas y consejos personalizados ($2 USD/mes en créditos)",
      benefits: [
        "$2 USD de créditos al mes",
        "Consejos personalizados",
        "Recetas a medida",
      ],
    },
    en: {
      title: "Chef AI Chat",
      description: "Ask about nutrition, recipes and personalized tips ($2 USD/month in credits)",
      benefits: [
        "$2 USD credits per month",
        "Personalized advice",
        "Custom recipes",
      ],
    },
  },
  swap: {
    icon: Utensils,
    gradient: "from-orange-500 to-orange-400",
    es: {
      title: "Intercambia comidas",
      description: "Cambia cualquier comida de tu plan por otra que se ajuste a tus preferencias del momento",
      benefits: [
        "Flexibilidad total",
        "Mantiene tus macros",
        "Sugerencias inteligentes",
      ],
    },
    en: {
      title: "Swap meals",
      description: "Change any meal in your plan for another that fits your current preferences",
      benefits: [
        "Total flexibility",
        "Keeps your macros",
        "Smart suggestions",
      ],
    },
  },
  generate: {
    icon: Zap,
    gradient: "from-yellow-500 to-yellow-400",
    es: {
      title: "Genera planes ilimitados",
      description: "Crea nuevos planes semanales personalizados según tus objetivos y preferencias",
      benefits: [
        "Planes ilimitados",
        "Adaptados a ti",
        "Recetas variadas",
      ],
    },
    en: {
      title: "Generate unlimited plans",
      description: "Create new personalized weekly plans based on your goals and preferences",
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
      getButton: "Obtener Chefly+",
      price: "$7.99 USD/mes",
      cancel: "Ahora no",
    },
    en: {
      unlockWith: "Unlock with",
      getButton: "Get Chefly+",
      price: "$7.99 USD/month",
      cancel: "Not now",
    },
  };

  const t = commonTexts[language];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md mx-4 p-0 overflow-hidden border-0">
        {/* Hero section with gradient */}
        <div className={`bg-gradient-to-br ${data.gradient} p-6 pb-12 relative`}>
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring" }}
              className="h-20 w-20 rounded-full bg-background shadow-xl flex items-center justify-center border-4 border-background"
            >
              <Icon className="h-10 w-10 text-primary" />
            </motion.div>
          </div>
          
          {/* Mascot floating */}
          <motion.img
            src={mascotHappy}
            alt="Chef mascot"
            className="absolute top-2 right-2 h-16 w-16 object-contain"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          />

          <div className="text-center text-white">
            <p className="text-sm opacity-90 flex items-center justify-center gap-1">
              {t.unlockWith}
              <Crown className="h-4 w-4" />
              <span className="font-bold">Chefly+</span>
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 pt-12 space-y-4">
          <div className="text-center">
            <h2 className="text-xl font-bold text-foreground">{texts.title}</h2>
            <p className="text-muted-foreground text-sm mt-2">{texts.description}</p>
          </div>

          {/* Benefits */}
          <div className="space-y-2 py-2">
            {texts.benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-primary" />
                </div>
                <span className="text-sm text-foreground">{benefit}</span>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <div className="space-y-3 pt-2">
            <Button
              onClick={handleGetPremium}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
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
            {/* Legal Links */}
            <div className="text-center text-xs text-muted-foreground pt-1">
              <Link to="/terms" className="underline">{language === 'es' ? 'Términos de Uso' : 'Terms of Use'}</Link>
              {" · "}
              <Link to="/privacy" className="underline">{language === 'es' ? 'Política de Privacidad' : 'Privacy Policy'}</Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
