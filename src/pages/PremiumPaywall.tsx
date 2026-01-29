import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { X, Check, Sparkles, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { IAPPaywall } from "@/components/IAPPaywall";
import mascotCelebrating from "@/assets/mascot-celebrating.png";

export default function PremiumPaywall() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [userId, setUserId] = useState<string | undefined>();
  const [iapPaywallOpen, setIapPaywallOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("monthly");

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    loadUser();
  }, []);

  const texts = {
    es: {
      title: "Te ayudaremos a alcanzar tu meta nutricional",
      popular: "Lo más popular",
      monthly: "Mensual",
      yearly: "Anual",
      monthlyPrice: "$7.99 USD/mes",
      yearlyPrice: "$59.99 USD/año",
      yearlySaving: "Ahorra 37%",
      continueBtn: "Continuar",
      cancel: "Cancela cuando quieras",
      features: [
        "Planes semanales ilimitados",
        "Intercambio de comidas",
        "Escaneo de comidas ilimitado",
        "Chat ilimitado con IA",
        "Sistema de amigos",
      ],
    },
    en: {
      title: "We'll help you reach your nutrition goals",
      popular: "Most popular",
      monthly: "Monthly",
      yearly: "Yearly",
      monthlyPrice: "$7.99 USD/month",
      yearlyPrice: "$59.99 USD/year",
      yearlySaving: "Save 37%",
      continueBtn: "Continue",
      cancel: "Cancel anytime",
      features: [
        "Unlimited weekly plans",
        "Meal swapping",
        "Unlimited food scanning",
        "Unlimited AI chat",
        "Friends system",
      ],
    },
  };

  const t = texts[language];

  const handleContinue = async () => {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    // Always show native IAP paywall (Apple In-App Purchase)
    setIapPaywallOpen(true);
  };

  const handleClose = () => {
    navigate(-1);
  };

  const handleIAPSuccess = () => {
    navigate("/dashboard");
  };

  // Floating food emojis positions
  const floatingEmojis = [
    { emoji: "🍎", top: "15%", left: "10%", delay: 0 },
    { emoji: "🥕", top: "20%", right: "15%", delay: 0.5 },
    { emoji: "🧀", top: "35%", left: "5%", delay: 1 },
    { emoji: "🥦", top: "30%", right: "8%", delay: 0.3 },
    { emoji: "✨", top: "45%", left: "15%", delay: 0.7 },
    { emoji: "🥗", top: "40%", right: "12%", delay: 0.2 },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Close Button */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors safe-area-top"
        style={{ marginTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <X className="h-6 w-6 text-foreground" />
      </button>

      {/* Hero Section with Mascot */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8 relative">
        {/* Floating Food Emojis */}
        {floatingEmojis.map((item, index) => (
          <motion.div
            key={index}
            className="absolute text-3xl pointer-events-none"
            style={{ top: item.top, left: item.left, right: item.right }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: 1, 
              y: [0, -10, 0],
            }}
            transition={{ 
              opacity: { delay: item.delay, duration: 0.5 },
              y: { delay: item.delay, duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            {item.emoji}
          </motion.div>
        ))}

        {/* Mascot */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="relative mb-6"
        >
          <div className="relative">
            <img
              src={mascotCelebrating}
              alt="Chefly mascot"
              className="h-40 w-40 object-contain"
            />
            {/* Sparkle effects around mascot */}
            <motion.div
              className="absolute -top-2 -right-2"
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Sparkles className="h-6 w-6 text-primary" />
            </motion.div>
            <motion.div
              className="absolute -bottom-1 -left-3"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            >
              <Sparkles className="h-5 w-5 text-secondary" />
            </motion.div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl md:text-3xl font-bold text-foreground text-center max-w-sm mb-8"
        >
          {t.title}
        </motion.h1>

        {/* Plan Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-sm space-y-3"
        >
          {/* Monthly Plan - Recommended */}
          <div
            onClick={() => setSelectedPlan("monthly")}
            className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all ${
              selectedPlan === "monthly"
                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                : "border-border bg-card hover:border-muted-foreground/30"
            }`}
          >
            {/* Popular Badge */}
            <div className="absolute -top-3 left-4">
              <span className="bg-gradient-to-r from-primary to-secondary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                {t.popular}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <h3 className="font-bold text-foreground">{t.monthly}</h3>
                <p className="text-lg font-bold text-foreground">{t.monthlyPrice}</p>
              </div>
              <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${
                selectedPlan === "monthly"
                  ? "border-primary bg-primary"
                  : "border-muted-foreground/30"
              }`}>
                {selectedPlan === "monthly" && <Check className="h-4 w-4 text-primary-foreground" />}
              </div>
            </div>
          </div>

          {/* Features List */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="pt-4 space-y-2"
          >
            {t.features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="h-5 w-5 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
                <span className="text-sm text-foreground">{feature}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom CTA Section */}
      <div className="px-6 pb-8 space-y-4 safe-area-pb">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            onClick={handleContinue}
            size="lg"
            className="w-full h-14 text-lg font-bold bg-foreground text-background hover:bg-foreground/90"
          >
            <Crown className="mr-2 h-5 w-5" />
            {t.continueBtn}
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center text-sm text-muted-foreground"
        >
          {t.cancel}
        </motion.p>
      </div>

      {/* iOS IAP Paywall */}
      <IAPPaywall
        open={iapPaywallOpen}
        onOpenChange={setIapPaywallOpen}
        userId={userId}
        onPurchaseSuccess={handleIAPSuccess}
      />
    </div>
  );
}
