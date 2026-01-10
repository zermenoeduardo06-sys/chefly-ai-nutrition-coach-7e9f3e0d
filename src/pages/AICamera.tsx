import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Camera, Search, Sparkles, Check, Crown, Zap, Star, TrendingUp, History, Brain, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import mascotHappy from "@/assets/mascot-happy.png";

const mealTypeLabels = {
  breakfast: { es: "Desayuno", en: "Breakfast" },
  lunch: { es: "Almuerzo", en: "Lunch" },
  dinner: { es: "Cena", en: "Dinner" },
  snack: { es: "Snack", en: "Snack" },
};

// Animated scan demo states
const scanStates = [
  { type: "ready", emoji: "📸" },
  { type: "food", emoji: "🍕" },
  { type: "scanning", emoji: "✨" },
  { type: "result", emoji: "✅", calories: "285 kcal" },
];

export default function AICamera() {
  const navigate = useNavigate();
  const { mealType } = useParams<{ mealType: string }>();
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const [userId, setUserId] = useState<string | undefined>();
  const [currentScanState, setCurrentScanState] = useState(0);

  const subscription = useSubscription(userId);
  const { limits } = useSubscriptionLimits(userId);
  const isPremium = subscription.isCheflyPlus;
  
  // Only determine canScan when both subscription AND limits are fully loaded
  const isFullyLoaded = !subscription.isLoading && !limits.isLoading && userId;
  const canScan = isFullyLoaded && isPremium;
  
  const validMealType = (mealType as keyof typeof mealTypeLabels) || "breakfast";
  const selectedDate = searchParams.get('date') || new Date().toISOString().split('T')[0];

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

  // Redirect premium users to the full scanner page
  useEffect(() => {
    if (isFullyLoaded && canScan) {
      const dateParam = selectedDate ? `?date=${selectedDate}` : '';
      navigate(`/dashboard/scanner/${validMealType}${dateParam}`, { replace: true });
    }
  }, [isFullyLoaded, canScan, validMealType, selectedDate, navigate]);

  // Animate through scan states for demo
  useEffect(() => {
    if (canScan) return; // Don't animate if user can scan
    
    const interval = setInterval(() => {
      setCurrentScanState((prev) => (prev + 1) % scanStates.length);
    }, 1800);
    
    return () => clearInterval(interval);
  }, [canScan]);

  const texts = {
    es: {
      title: "Escanea tu comida con IA",
      subtitle: "Toma una foto y obtén los nutrientes al instante",
      accessWithPro: "Desbloquear Chefly Plus",
      cameraAI: "Cámara IA",
      search: "Buscar",
      benefitTitle: "Con Chefly Plus obtienes:",
      benefit1: "Escaneos ilimitados de comida",
      benefit1Desc: "Escanea todo lo que comes sin límites",
      benefit2: "Análisis nutricional detallado",
      benefit2Desc: "Calorías, proteínas, carbos y grasas",
      benefit3: "Historial completo de escaneos",
      benefit3Desc: "Revisa todos tus análisis anteriores",
      benefit4: "IA avanzada de reconocimiento",
      benefit4Desc: "Identifica ingredientes con precisión",
      tryFree: "Buscar manualmente",
    },
    en: {
      title: "Scan your food with AI",
      subtitle: "Take a photo and get nutrients instantly",
      accessWithPro: "Unlock Chefly Plus",
      cameraAI: "AI Camera",
      search: "Search",
      benefitTitle: "With Chefly Plus you get:",
      benefit1: "Unlimited food scans",
      benefit1Desc: "Scan everything you eat without limits",
      benefit2: "Detailed nutritional analysis",
      benefit2Desc: "Calories, protein, carbs and fats",
      benefit3: "Complete scan history",
      benefit3Desc: "Review all your previous analyses",
      benefit4: "Advanced AI recognition",
      benefit4Desc: "Identify ingredients with precision",
      tryFree: "Search manually",
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

  // If redirecting to scanner, show nothing
  if (canScan) {
    return null;
  }

  const currentState = scanStates[currentScanState];

  // Floating food emojis with more variety
  const floatingEmojis = [
    { emoji: "🍎", top: "8%", left: "8%", delay: 0, size: "text-2xl" },
    { emoji: "🥗", top: "5%", right: "12%", delay: 0.2, size: "text-3xl" },
    { emoji: "🍔", top: "15%", left: "85%", delay: 0.4, size: "text-2xl" },
    { emoji: "🥤", bottom: "42%", left: "5%", delay: 0.6, size: "text-2xl" },
    { emoji: "🍕", bottom: "45%", right: "8%", delay: 0.3, size: "text-2xl" },
    { emoji: "🌮", top: "25%", left: "15%", delay: 0.5, size: "text-xl" },
  ];

  const benefits = [
    { icon: Camera, text: t.benefit1, desc: t.benefit1Desc, color: "from-primary/20 to-primary/5" },
    { icon: Target, text: t.benefit2, desc: t.benefit2Desc, color: "from-secondary/20 to-secondary/5" },
    { icon: History, text: t.benefit3, desc: t.benefit3Desc, color: "from-orange-500/20 to-orange-500/5" },
    { icon: Brain, text: t.benefit4, desc: t.benefit4Desc, color: "from-purple-500/20 to-purple-500/5" },
  ];

  // Paywall screen
  return (
    <div className="min-h-[100dvh] bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-area-top">
        <div className="flex items-center p-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 -ml-2"
          >
            <ArrowLeft className="h-6 w-6 text-foreground" />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="flex flex-col items-center px-5 relative">
          {/* Floating Food Emojis */}
          {floatingEmojis.map((item, index) => (
            <motion.div
              key={index}
              className={`absolute ${item.size} pointer-events-none z-0`}
              style={{ 
                top: item.top, 
                left: item.left, 
                right: item.right,
                bottom: item.bottom 
              }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ 
                opacity: [0.4, 0.7, 0.4], 
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0],
              }}
              transition={{ 
                opacity: { delay: item.delay, duration: 3, repeat: Infinity },
                y: { delay: item.delay, duration: 3, repeat: Infinity, ease: "easeInOut" },
                rotate: { delay: item.delay, duration: 4, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              {item.emoji}
            </motion.div>
          ))}

          {/* Phone Mockup with Animation */}
          <motion.div
            className="relative mb-6 z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative">
              {/* Glow effect behind phone */}
              <motion.div 
                className="absolute -inset-4 bg-gradient-to-r from-primary/30 via-orange-500/30 to-secondary/30 rounded-[3rem] blur-2xl"
                animate={{ 
                  scale: [1, 1.05, 1],
                  opacity: [0.5, 0.7, 0.5] 
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              
              {/* Phone frame */}
              <div className="relative w-48 h-60 bg-gradient-to-br from-card to-muted rounded-3xl border-4 border-border shadow-2xl overflow-hidden flex flex-col items-center justify-center">
                {/* Camera notch */}
                <div className="absolute top-2 w-16 h-4 bg-background rounded-full" />
                
                {/* Animated Scan Demo */}
                <div className="w-36 h-36 rounded-2xl bg-gradient-to-br from-muted to-background flex items-center justify-center relative overflow-hidden mt-4">
                  {/* Scan grid overlay */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="grid grid-cols-3 grid-rows-3 h-full w-full">
                      {[...Array(9)].map((_, i) => (
                        <div key={i} className="border border-primary/30" />
                      ))}
                    </div>
                  </div>
                  
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentScanState}
                      initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.5, rotate: 10 }}
                      transition={{ duration: 0.4, type: "spring" }}
                      className="flex flex-col items-center justify-center"
                    >
                      {currentState.type === "ready" && (
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Camera className="h-14 w-14 text-muted-foreground/60" />
                        </motion.div>
                      )}
                      {currentState.type === "food" && (
                        <motion.span 
                          className="text-6xl"
                          animate={{ scale: [1, 1.15, 1] }}
                          transition={{ duration: 0.5 }}
                        >
                          {currentState.emoji}
                        </motion.span>
                      )}
                      {currentState.type === "scanning" && (
                        <motion.div
                          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                          transition={{ 
                            rotate: { duration: 1.5, repeat: Infinity, ease: "linear" },
                            scale: { duration: 0.8, repeat: Infinity }
                          }}
                        >
                          <Sparkles className="h-14 w-14 text-primary" />
                        </motion.div>
                      )}
                      {currentState.type === "result" && (
                        <motion.div 
                          className="flex flex-col items-center gap-2"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200 }}
                        >
                          <motion.div 
                            className="h-12 w-12 rounded-full bg-secondary/20 flex items-center justify-center"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 0.5, repeat: 2 }}
                          >
                            <Check className="h-7 w-7 text-secondary" />
                          </motion.div>
                          <span className="text-sm font-bold text-secondary">{currentState.calories}</span>
                        </motion.div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                  
                  {/* Scan line animation */}
                  {currentState.type === "scanning" && (
                    <motion.div
                      className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
                      initial={{ top: "10%" }}
                      animate={{ top: ["10%", "90%", "10%"] }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}
                  
                  {/* Corner brackets */}
                  <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-primary/50" />
                  <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-primary/50" />
                  <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-primary/50" />
                  <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-primary/50" />
                </div>
                
                {/* Step indicator dots */}
                <div className="flex gap-2 mt-4">
                  {scanStates.map((_, idx) => (
                    <motion.div
                      key={idx}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        idx === currentScanState 
                          ? "w-6 bg-primary" 
                          : "w-2 bg-muted-foreground/30"
                      }`}
                      animate={idx === currentScanState ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    />
                  ))}
                </div>
              </div>

              {/* Mascot */}
              <motion.img
                src={mascotHappy}
                alt="Chefly mascot"
                className="absolute -bottom-6 -right-12 h-32 w-32 object-contain z-20"
                initial={{ x: 30, opacity: 0, rotate: 10 }}
                animate={{ x: 0, opacity: 1, rotate: 0 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
              />
            </div>
          </motion.div>

          {/* Title and Subtitle */}
          <motion.div
            className="text-center mb-5 z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h1 className="text-2xl font-bold text-foreground mb-2">{t.title}</h1>
            <p className="text-sm text-muted-foreground max-w-xs">{t.subtitle}</p>
          </motion.div>

          {/* Benefits Section */}
          <motion.div
            className="w-full max-w-sm z-10 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 text-center">
              {t.benefitTitle}
            </p>
            
            <div className="space-y-2.5">
              {benefits.map((benefit, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1, type: "spring" }}
                  className={`flex items-center gap-3 bg-gradient-to-r ${benefit.color} rounded-2xl p-3.5 border border-border/50`}
                >
                  <motion.div 
                    className="w-10 h-10 rounded-xl bg-background/80 flex items-center justify-center shadow-sm"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <benefit.icon className="h-5 w-5 text-primary" />
                  </motion.div>
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-foreground">{benefit.text}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">{benefit.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className="w-full max-w-sm z-10 space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Button
              onClick={handleUpgrade}
              size="lg"
              className="w-full h-14 text-base font-bold bg-gradient-to-r from-primary via-orange-500 to-primary hover:opacity-90 rounded-2xl shadow-xl relative overflow-hidden group"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              />
              <Crown className="h-5 w-5 mr-2" />
              {t.accessWithPro}
            </Button>
            
            <Button
              onClick={handleGoToSearch}
              variant="ghost"
              size="lg"
              className="w-full h-12 text-sm font-medium text-muted-foreground hover:text-foreground rounded-xl"
            >
              <Search className="h-4 w-4 mr-2" />
              {t.tryFree}
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Bottom Tab Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur border-t safe-area-pb z-50">
        <div className="flex">
          <button
            className="flex-1 flex flex-col items-center gap-1 py-3 text-primary"
          >
            <Camera className="h-6 w-6" />
            <span className="text-xs font-medium">{t.cameraAI}</span>
          </button>
          <button
            onClick={handleGoToSearch}
            className="flex-1 flex flex-col items-center gap-1 py-3 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Search className="h-6 w-6" />
            <span className="text-xs font-medium">{t.search}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
