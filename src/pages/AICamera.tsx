import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Camera, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { FoodScanner } from "@/components/FoodScanner";
import { cn } from "@/lib/utils";

const mealTypeLabels = {
  breakfast: { es: "Desayuno", en: "Breakfast" },
  lunch: { es: "Almuerzo", en: "Lunch" },
  dinner: { es: "Cena", en: "Dinner" },
  snack: { es: "Snack", en: "Snack" },
};

export default function AICamera() {
  const navigate = useNavigate();
  const { mealType } = useParams<{ mealType: string }>();
  const { language } = useLanguage();
  const [userId, setUserId] = useState<string | undefined>();
  const [showScanner, setShowScanner] = useState(false);

  const subscription = useSubscription(userId);
  const isPremium = subscription.isCheflyPlus;
  
  const validMealType = (mealType as keyof typeof mealTypeLabels) || "breakfast";

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUserId(user.id);
      
      // If premium, open scanner immediately
      if (subscription.isCheflyPlus) {
        setShowScanner(true);
      }
    };

    loadData();
  }, [navigate, subscription.isCheflyPlus]);

  const texts = {
    es: {
      title: "¡Haz una foto y nosotros lo registramos!",
      description: "El reconocimiento por foto con IA ofrece un montón de ventajas increíbles.",
      accessWithPro: "Accede con Chefly Plus",
      takePhoto: "Hacer foto",
      back: "Volver",
      cameraAI: "Cámara IA",
      search: "Buscar",
    },
    en: {
      title: "Take a photo and we'll log it!",
      description: "AI photo recognition offers tons of incredible benefits.",
      accessWithPro: "Access with Chefly Plus",
      takePhoto: "Take photo",
      back: "Back",
      cameraAI: "AI Camera",
      search: "Search",
    },
  };

  const t = texts[language];

  const handleUpgrade = () => {
    navigate("/pricing");
  };

  const handleGoToSearch = () => {
    navigate(`/dashboard/add-food/${validMealType}`);
  };

  // If premium, show scanner dialog
  if (isPremium && showScanner) {
    return (
      <div className="min-h-screen bg-background">
        <FoodScanner
          open={showScanner}
          onOpenChange={(open) => {
            if (!open) {
              navigate(-1);
            }
            setShowScanner(open);
          }}
        />
      </div>
    );
  }

  // Paywall screen for non-premium users
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center p-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-24">
        {/* Food Images Decoration */}
        <motion.div 
          className="relative mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center gap-2">
            <span className="text-5xl">🍲</span>
            <span className="text-6xl">🥗</span>
            <span className="text-5xl">🥤</span>
          </div>
          <div className="flex items-center justify-center mt-2">
            <span className="text-7xl">🍽️</span>
          </div>
        </motion.div>

        {/* Phone Mockup with Camera */}
        <motion.div
          className="relative mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="w-48 h-32 bg-muted/50 rounded-2xl border-2 border-muted flex items-center justify-center shadow-lg">
            <div className="flex flex-col items-center gap-2">
              <Camera className="h-10 w-10 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{t.takePhoto}</span>
            </div>
          </div>
        </motion.div>

        {/* Title and Description */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h1 className="text-2xl font-bold mb-3">{t.title}</h1>
          <p className="text-muted-foreground max-w-sm">{t.description}</p>
        </motion.div>

        {/* Upgrade Button */}
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Button
            onClick={handleUpgrade}
            size="lg"
            className="w-full h-14 text-lg font-semibold gap-2"
          >
            <Lock className="h-5 w-5" />
            {t.accessWithPro}
          </Button>
        </motion.div>
      </div>

      {/* Bottom Tab Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t safe-area-pb z-50">
        <div className="flex">
          <button
            className="flex-1 flex flex-col items-center gap-1 py-3 text-primary"
          >
            <Camera className="h-6 w-6" />
            <span className="text-xs font-medium">{t.cameraAI}</span>
          </button>
          <button
            onClick={handleGoToSearch}
            className="flex-1 flex flex-col items-center gap-1 py-3 text-muted-foreground"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-xs font-medium">{t.search}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
