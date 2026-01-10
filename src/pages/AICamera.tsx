import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Camera, Lock, Search, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { FoodScanner } from "@/components/FoodScanner";
import mascotHappy from "@/assets/mascot-happy.png";

const mealTypeLabels = {
  breakfast: { es: "Desayuno", en: "Breakfast" },
  lunch: { es: "Almuerzo", en: "Lunch" },
  dinner: { es: "Cena", en: "Dinner" },
  snack: { es: "Snack", en: "Snack" },
};

// Animated scan demo states
const scanStates = [
  { type: "ready", icon: "📷" },
  { type: "food", icon: "🍕" },
  { type: "scanning", icon: "✨" },
  { type: "result", icon: "✅", calories: "245 kcal" },
];

export default function AICamera() {
  const navigate = useNavigate();
  const { mealType } = useParams<{ mealType: string }>();
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const [userId, setUserId] = useState<string | undefined>();
  const [showScanner, setShowScanner] = useState(false);
  const [currentScanState, setCurrentScanState] = useState(0);

  const subscription = useSubscription(userId);
  const { limits } = useSubscriptionLimits(userId);
  const isPremium = subscription.isCheflyPlus;
  
  // Only determine canScan when both subscription AND limits are fully loaded
  const isFullyLoaded = !subscription.isLoading && !limits.isLoading && userId;
  const canScan = isFullyLoaded && (isPremium || limits.foodScansUsed < limits.dailyFoodScanLimit);
  
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
    };

    loadData();
  }, [navigate]);

  // Open scanner ONLY when fully loaded AND user has permission
  useEffect(() => {
    if (isFullyLoaded && canScan) {
      setShowScanner(true);
    }
  }, [isFullyLoaded, canScan]);

  // Animate through scan states for demo
  useEffect(() => {
    if (canScan) return; // Don't animate if user can scan
    
    const interval = setInterval(() => {
      setCurrentScanState((prev) => (prev + 1) % scanStates.length);
    }, 1500);
    
    return () => clearInterval(interval);
  }, [canScan]);

  const texts = {
    es: {
      title: "¡Haz foto y lo registramos!",
      subtitle: "IA que reconoce tu comida al instante",
      accessWithPro: "🔒 Desbloquear con Chefly Plus",
      cameraAI: "Cámara IA",
      search: "Buscar",
    },
    en: {
      title: "Snap a photo, we'll log it!",
      subtitle: "AI that recognizes your food instantly",
      accessWithPro: "🔒 Unlock with Chefly Plus",
      cameraAI: "AI Camera",
      search: "Search",
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

  // Show loading state while checking subscription
  if (!isFullyLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="h-8 w-8 text-primary" />
        </motion.div>
      </div>
    );
  }

  // If user can scan, show scanner dialog
  if (canScan && showScanner) {
    return (
      <div className="min-h-screen bg-background">
        <FoodScanner
          open={showScanner}
          onOpenChange={handleScannerClose}
          mealType={validMealType}
          onSaveSuccess={() => {
            setTimeout(() => navigate(-1), 500);
          }}
        />
      </div>
    );
  }

  // Floating food emojis
  const floatingEmojis = [
    { emoji: "🍲", top: "5%", left: "10%", delay: 0 },
    { emoji: "🥗", top: "8%", right: "15%", delay: 0.3 },
    { emoji: "🥤", bottom: "35%", left: "8%", delay: 0.6 },
    { emoji: "🍽️", bottom: "38%", right: "10%", delay: 0.2 },
  ];

  const currentState = scanStates[currentScanState];

  // Paywall screen - compact, no scroll
  return (
    <div className="min-h-[100dvh] bg-background flex flex-col overflow-hidden">
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

      {/* Content - centered, no scroll needed */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20 relative">
        {/* Floating Food Emojis */}
        {floatingEmojis.map((item, index) => (
          <motion.div
            key={index}
            className="absolute text-3xl pointer-events-none z-0"
            style={{ 
              top: item.top, 
              left: item.left, 
              right: item.right,
              bottom: item.bottom 
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: 0.7, 
              y: [0, -8, 0],
            }}
            transition={{ 
              opacity: { delay: item.delay, duration: 0.5 },
              y: { delay: item.delay, duration: 2.5, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            {item.emoji}
          </motion.div>
        ))}

        {/* Compact Phone Mockup with Animation */}
        <motion.div
          className="relative mb-5 z-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            {/* Phone frame - smaller */}
            <div className="w-44 h-56 bg-card rounded-3xl border-4 border-muted shadow-2xl overflow-hidden flex flex-col items-center justify-center">
              {/* Animated Scan Demo */}
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center relative overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentScanState}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center justify-center"
                  >
                    {currentState.type === "ready" && (
                      <Camera className="h-12 w-12 text-muted-foreground/60" />
                    )}
                    {currentState.type === "food" && (
                      <span className="text-5xl">{currentState.icon}</span>
                    )}
                    {currentState.type === "scanning" && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkles className="h-12 w-12 text-primary" />
                      </motion.div>
                    )}
                    {currentState.type === "result" && (
                      <div className="flex flex-col items-center gap-1">
                        <div className="h-10 w-10 rounded-full bg-secondary/20 flex items-center justify-center">
                          <Check className="h-6 w-6 text-secondary" />
                        </div>
                        <span className="text-sm font-bold text-secondary">{currentState.calories}</span>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
                
                {/* Scan line animation */}
                {currentState.type === "scanning" && (
                  <motion.div
                    className="absolute left-0 right-0 h-0.5 bg-primary"
                    initial={{ top: "20%" }}
                    animate={{ top: ["20%", "80%", "20%"] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
              </div>
              
              {/* Step indicator dots */}
              <div className="flex gap-1.5 mt-3">
                {scanStates.map((_, idx) => (
                  <motion.div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentScanState 
                        ? "w-4 bg-primary" 
                        : "w-1.5 bg-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Mascot - larger and positioned better */}
            <motion.img
              src={mascotHappy}
              alt="Chefly mascot"
              className="absolute -bottom-4 -right-10 h-28 w-28 object-contain z-20"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
            />
          </div>
        </motion.div>

        {/* Title and Subtitle - compact */}
        <motion.div
          className="text-center mb-6 z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className="text-xl font-bold text-foreground mb-1">{t.title}</h1>
          <p className="text-sm text-muted-foreground">{t.subtitle}</p>
        </motion.div>

        {/* Upgrade Button */}
        <motion.div
          className="w-full max-w-xs z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Button
            onClick={handleUpgrade}
            size="lg"
            className="w-full h-14 text-base font-semibold bg-primary hover:bg-primary/90 rounded-2xl shadow-lg"
          >
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
