import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Camera, Search, CheckCircle2, Crown, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import ContextualPaywall from "@/components/ContextualPaywall";

interface MealEntryOptionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  userId: string | undefined;
  currentMeal?: {
    name: string;
    image_url?: string;
    calories?: number;
  } | null;
  onScanSelect: () => void;
  onSearchSelect: () => void;
  onPlanMealSelect: () => void;
}

const mealTypeLabels = {
  breakfast: { es: "Desayuno", en: "Breakfast" },
  lunch: { es: "Almuerzo", en: "Lunch" },
  dinner: { es: "Cena", en: "Dinner" },
  snack: { es: "Snack", en: "Snack" },
};

export default function MealEntryOptionsModal({
  open,
  onOpenChange,
  mealType,
  userId,
  currentMeal,
  onScanSelect,
  onSearchSelect,
  onPlanMealSelect,
}: MealEntryOptionsModalProps) {
  const { language } = useLanguage();
  const { limits } = useSubscriptionLimits(userId);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState<"scan" | "plan">("scan");

  const handleScanClick = () => {
    if (limits.isCheflyPlus || limits.canScanFood) {
      onScanSelect();
      onOpenChange(false);
    } else {
      setPaywallFeature("scan");
      setShowPaywall(true);
    }
  };

  const handleSearchClick = () => {
    onSearchSelect();
    onOpenChange(false);
  };

  const handlePlanMealClick = () => {
    if (limits.isCheflyPlus) {
      onPlanMealSelect();
      onOpenChange(false);
    } else {
      setPaywallFeature("plan");
      setShowPaywall(true);
    }
  };

  const texts = {
    es: {
      title: `Registrar ${mealTypeLabels[mealType].es}`,
      howToLog: "¿Cómo quieres registrar?",
      scanTitle: "Escanear con IA",
      scanDesc: "Toma una foto y registramos automáticamente",
      searchTitle: "Buscar alimento",
      searchDesc: "Elige de nuestra base de datos",
      planTitle: "Del plan semanal",
      planDesc: "Registra tu comida planificada",
      kcal: "kcal",
    },
    en: {
      title: `Log ${mealTypeLabels[mealType].en}`,
      howToLog: "How do you want to log?",
      scanTitle: "Scan with AI",
      scanDesc: "Take a photo and we'll log it automatically",
      searchTitle: "Search food",
      searchDesc: "Choose from our database",
      planTitle: "From weekly plan",
      planDesc: "Log your planned meal",
      kcal: "kcal",
    },
  };

  const t = texts[language];

  return (
    <>
      <Dialog open={open && !showPaywall} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md mx-4 p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-xl font-bold text-center">
              {t.title}
            </DialogTitle>
            <p className="text-muted-foreground text-center text-sm mt-1">
              {t.howToLog}
            </p>
          </DialogHeader>

          <div className="p-4 space-y-3">
            {/* Scan with AI - Premium */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleScanClick}
              className="w-full p-4 rounded-xl border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 hover:border-primary/40 transition-all text-left relative overflow-hidden group"
            >
              <div className="absolute top-2 right-2">
                <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1">
                  <Crown className="h-3 w-3" />
                  Chefly+
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                  <Camera className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 pr-16">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    {t.scanTitle}
                    <Sparkles className="h-4 w-4 text-primary" />
                  </h3>
                  <p className="text-sm text-muted-foreground">{t.scanDesc}</p>
                </div>
              </div>
            </motion.button>

            {/* Search Food - Free */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleSearchClick}
              className="w-full p-4 rounded-xl border-2 border-border hover:border-primary/40 transition-all text-left bg-card"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{t.searchTitle}</h3>
                  <p className="text-sm text-muted-foreground">{t.searchDesc}</p>
                </div>
              </div>
            </motion.button>

            {/* From Weekly Plan - Premium */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handlePlanMealClick}
              className="w-full p-4 rounded-xl border-2 border-accent/30 bg-gradient-to-r from-accent/5 to-accent/10 hover:border-accent/50 transition-all text-left relative overflow-hidden group"
            >
              <div className="absolute top-2 right-2">
                <span className="px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-xs font-semibold flex items-center gap-1">
                  <Crown className="h-3 w-3" />
                  Chefly+
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors overflow-hidden">
                  {currentMeal?.image_url ? (
                    <img
                      src={currentMeal.image_url}
                      alt={currentMeal.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <CheckCircle2 className="h-6 w-6 text-accent" />
                  )}
                </div>
                <div className="flex-1 pr-16">
                  <h3 className="font-semibold text-foreground">{t.planTitle}</h3>
                  {currentMeal ? (
                    <p className="text-sm text-muted-foreground truncate">
                      {currentMeal.name} • {currentMeal.calories} {t.kcal}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">{t.planDesc}</p>
                  )}
                </div>
              </div>
            </motion.button>
          </div>

          <div className="h-4" />
        </DialogContent>
      </Dialog>

      <ContextualPaywall
        open={showPaywall}
        onOpenChange={setShowPaywall}
        feature={paywallFeature}
        userId={userId}
      />
    </>
  );
}
