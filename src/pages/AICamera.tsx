import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Camera, Lock, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { FoodScanner } from "@/components/FoodScanner";
import { cn } from "@/lib/utils";
import mascotHappy from "@/assets/mascot-happy.png";

const mealTypeLabels = {
  breakfast: { es: "Desayuno", en: "Breakfast" },
  lunch: { es: "Almuerzo", en: "Lunch" },
  dinner: { es: "Cena", en: "Dinner" },
  snack: { es: "Snack", en: "Snack" },
};

export default function AICamera() {
  const navigate = useNavigate();
  const { mealType } = useParams<{ mealType: string }>();
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const [userId, setUserId] = useState<string | undefined>();
  const [showScanner, setShowScanner] = useState(false);

  const subscription = useSubscription(userId);
  const { limits } = useSubscriptionLimits(userId);
  const isPremium = subscription.isCheflyPlus;
  const canScan = isPremium || limits.foodScansUsed < limits.dailyFoodScanLimit;
  
  const validMealType = (mealType as keyof typeof mealTypeLabels) || "breakfast";
  const selectedDate = searchParams.get('date');

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUserId(user.id);
      
      // If user can scan, open scanner immediately
      if (canScan && !subscription.isLoading) {
        setShowScanner(true);
      }
    };

    loadData();
  }, [navigate, canScan, subscription.isLoading]);

  // Update scanner visibility when subscription loads
  useEffect(() => {
    if (!subscription.isLoading && canScan) {
      setShowScanner(true);
    }
  }, [subscription.isLoading, canScan]);

  const texts = {
    es: {
      title: "¡Haz una foto y nosotros lo registramos!",
      description: "El reconocimiento por foto con IA ofrece un montón de ventajas increíbles.",
      accessWithPro: "Desbloquear con Chefly Plus",
      takePhoto: "Hacer foto",
      back: "Volver",
      cameraAI: "Cámara IA",
      search: "Buscar",
      benefits: [
        "Análisis instantáneo con IA",
        "Calorías y macros precisos",
        "Historial de escaneos",
      ],
    },
    en: {
      title: "Take a photo and we'll log it!",
      description: "AI photo recognition offers tons of incredible benefits.",
      accessWithPro: "Unlock with Chefly Plus",
      takePhoto: "Take photo",
      back: "Back",
      cameraAI: "AI Camera",
      search: "Search",
      benefits: [
        "Instant AI analysis",
        "Accurate calories and macros",
        "Scan history",
      ],
    },
  };

  const t = texts[language];

  const handleUpgrade = () => {
    navigate("/premium-paywall");
  };

  const handleGoToSearch = () => {
    const dateParam = selectedDate ? `?date=${selectedDate}` : '';
    navigate(`/dashboard/add-food/${validMealType}${dateParam}`);
  };

  const handleScannerClose = (open: boolean) => {
    if (!open) {
      navigate(-1);
    }
    setShowScanner(open);
  };

  // If user can scan, show scanner dialog
  if (canScan && showScanner && !subscription.isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <FoodScanner
          open={showScanner}
          onOpenChange={handleScannerClose}
          mealType={validMealType}
          onSaveSuccess={() => {
            // Close and go back after saving
            setTimeout(() => navigate(-1), 500);
          }}
        />
      </div>
    );
  }

  // Floating food emojis for paywall
  const floatingEmojis = [
    { emoji: "🍲", top: "8%", left: "8%", delay: 0 },
    { emoji: "🥗", top: "12%", right: "12%", delay: 0.3 },
    { emoji: "🥤", top: "25%", left: "5%", delay: 0.6 },
    { emoji: "🍽️", top: "20%", right: "8%", delay: 0.2 },
  ];

  // Paywall screen for non-premium users
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-area-top">
        <div className="flex items-center p-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2"
          >
            <ArrowLeft className="h-6 w-6 text-foreground" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-24 relative">
        {/* Floating Food Emojis */}
        {floatingEmojis.map((item, index) => (
          <motion.div
            key={index}
            className="absolute text-4xl pointer-events-none"
            style={{ top: item.top, left: item.left, right: item.right }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: 1, 
              y: [0, -10, 0],
            }}
            transition={{ 
              opacity: { delay: item.delay, duration: 0.5 },
              y: { delay: item.delay, duration: 2.5, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            {item.emoji}
          </motion.div>
        ))}

        {/* Phone Mockup with Mascot */}
        <motion.div
          className="relative mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            {/* Phone frame */}
            <div className="w-52 h-72 bg-card rounded-3xl border-4 border-muted shadow-2xl overflow-hidden flex flex-col items-center justify-center">
              {/* Camera viewfinder simulation */}
              <div className="w-40 h-40 rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mb-4">
                <div className="relative">
                  <Camera className="h-16 w-16 text-muted-foreground/50" />
                  <motion.div
                    className="absolute -top-1 -right-1"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Sparkles className="h-5 w-5 text-primary" />
                  </motion.div>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{t.takePhoto}</span>
            </div>

            {/* Mascot peeking */}
            <motion.img
              src={mascotHappy}
              alt="Chefly mascot"
              className="absolute -bottom-6 -right-8 h-24 w-24 object-contain"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
            />
          </div>
        </motion.div>

        {/* Title and Description */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className="text-2xl font-bold text-foreground mb-3">{t.title}</h1>
          <p className="text-muted-foreground max-w-sm">{t.description}</p>
        </motion.div>

        {/* Benefits List */}
        <motion.div
          className="w-full max-w-sm mb-8 space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {t.benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="flex items-center gap-3 bg-muted/50 rounded-xl px-4 py-3"
            >
              <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-primary" />
              </div>
              <span className="text-sm text-foreground">{benefit}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Upgrade Button */}
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Button
            onClick={handleUpgrade}
            size="lg"
            className="w-full h-14 text-lg font-semibold gap-2 bg-primary hover:bg-primary/90"
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
            <Search className="h-6 w-6" />
            <span className="text-xs font-medium">{t.search}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
