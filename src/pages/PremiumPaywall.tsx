import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { X, Sparkles, Crown, Camera, MessageSquare, Utensils, Zap, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { IAPPaywall } from "@/components/IAPPaywall";
import { Icon3D } from "@/components/ui/icon-3d";
import mascotCelebrating from "@/assets/mascot-celebrating.png";

export default function PremiumPaywall() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [userId, setUserId] = useState<string | undefined>();
  const [iapPaywallOpen, setIapPaywallOpen] = useState(false);

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
      title: "Te ayudaremos a alcanzar",
      titleHighlight: "tu meta nutricional",
      rating: "4.8★ App Store",
      cta: "COMENZAR AHORA",
      price: "$7.99 USD/mes",
      cancel: "Cancela cuando quieras",
      benefits: [
        { icon: Zap, color: "amber" as const, text: "Planes frescos cada semana" },
        { icon: Camera, color: "sky" as const, text: "Escanea cualquier platillo" },
        { icon: MessageSquare, color: "emerald" as const, text: "Tu nutriólogo 24/7" },
        { icon: Utensils, color: "rose" as const, text: "Cambia comidas cuando quieras" },
      ],
    },
    en: {
      title: "We'll help you reach",
      titleHighlight: "your nutrition goals",
      rating: "4.8★ App Store",
      cta: "START NOW",
      price: "$7.99 USD/month",
      cancel: "Cancel anytime",
      benefits: [
        { icon: Zap, color: "amber" as const, text: "Fresh plans every week" },
        { icon: Camera, color: "sky" as const, text: "Scan any dish" },
        { icon: MessageSquare, color: "emerald" as const, text: "Your 24/7 nutritionist" },
        { icon: Utensils, color: "rose" as const, text: "Swap meals anytime" },
      ],
    },
  };

  const t = texts[language];

  // Floating food emojis positions
  const floatingEmojis = [
    { emoji: "🍎", top: "10%", left: "8%", delay: 0 },
    { emoji: "🥕", top: "15%", right: "10%", delay: 0.5 },
    { emoji: "🧀", top: "25%", left: "5%", delay: 1 },
    { emoji: "🥦", top: "20%", right: "6%", delay: 0.3 },
    { emoji: "✨", top: "30%", left: "12%", delay: 0.7 },
    { emoji: "🥗", top: "28%", right: "15%", delay: 0.2 },
  ];

  const handleContinue = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setIapPaywallOpen(true);
  };

  const handleClose = () => {
    navigate(-1);
  };

  const handleIAPSuccess = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Close Button */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-muted/80 hover:bg-muted transition-colors safe-area-top"
        style={{ marginTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <X className="h-5 w-5 text-foreground" />
      </button>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-40">
        {/* Hero Section */}
        <div className="relative px-6 pt-16 pb-8">
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
                y: { delay: item.delay, duration: 2.5, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              {item.emoji}
            </motion.div>
          ))}

          {/* Rating Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center mb-6"
          >
            <div className="flex items-center gap-1.5 bg-card/80 backdrop-blur-sm px-4 py-2 rounded-full border border-border shadow-sm">
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              <span className="text-sm font-medium text-foreground">{t.rating}</span>
            </div>
          </motion.div>

          {/* Mascot */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="flex justify-center mb-6"
          >
            <div className="relative">
              <img
                src={mascotCelebrating}
                alt="Chefly mascot"
                className="h-44 w-44 object-contain drop-shadow-xl"
              />
              {/* Sparkle effects */}
              <motion.div
                className="absolute -top-2 -right-2"
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Sparkles className="h-7 w-7 text-primary" />
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
              {t.title}
            </h1>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {t.titleHighlight}
            </h1>
          </motion.div>

          {/* Benefits with Icon3D */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4 max-w-sm mx-auto"
          >
            {t.benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center gap-4"
              >
                <Icon3D icon={benefit.icon} color={benefit.color} size="md" />
                <span className="text-base font-medium text-foreground">{benefit.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border p-6 pb-safe">
        <div className="max-w-sm mx-auto space-y-3">
          <p className="text-center text-sm text-muted-foreground">
            ✓ {t.cancel}
          </p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Button
              onClick={handleContinue}
              variant="modern3d"
              size="xl"
              className="w-full"
            >
              <Crown className="mr-2 h-5 w-5" />
              {t.cta} - {t.price}
            </Button>
          </motion.div>

          <p className="text-center text-xs text-muted-foreground">
            {t.price}
          </p>
        </div>
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
