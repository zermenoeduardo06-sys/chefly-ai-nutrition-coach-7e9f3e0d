import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { X, Sparkles, Crown, Star, Calendar, Camera, MessageSquare, Utensils, Users, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { IAPPaywall } from "@/components/IAPPaywall";
import { Card3D } from "@/components/ui/card-3d";
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
      title: "Transforma tu alimentación",
      subtitle: "Todo lo que necesitas para alcanzar tus metas nutricionales",
      price: "$7.99 USD/mes",
      continueBtn: "Comenzar ahora",
      cancelAnytime: "Cancela cuando quieras",
      rating: "4.8★ • +50k usuarios",
    },
    en: {
      title: "Transform your nutrition",
      subtitle: "Everything you need to reach your nutrition goals",
      price: "$7.99 USD/month",
      continueBtn: "Start now",
      cancelAnytime: "Cancel anytime",
      rating: "4.8★ • +50k users",
    },
  };

  const t = texts[language];

  const benefits = [
    { icon: Calendar, color: "primary" as const, es: "Planes frescos cada semana", en: "Fresh plans every week" },
    { icon: Utensils, color: "emerald" as const, es: "Cambia comidas cuando quieras", en: "Swap meals anytime" },
    { icon: Camera, color: "amber" as const, es: "Escanea cualquier platillo", en: "Scan any dish" },
    { icon: MessageSquare, color: "sky" as const, es: "Tu nutriólogo 24/7", en: "Your 24/7 nutritionist" },
    { icon: Users, color: "rose" as const, es: "Motívate con amigos", en: "Stay motivated with friends" },
  ];

  // Floating food emojis
  const floatingEmojis = [
    { emoji: "🍎", top: "12%", left: "8%", delay: 0 },
    { emoji: "🥕", top: "18%", right: "12%", delay: 0.5 },
    { emoji: "🧀", top: "32%", left: "5%", delay: 1 },
    { emoji: "🥦", top: "28%", right: "6%", delay: 0.3 },
    { emoji: "✨", top: "42%", left: "12%", delay: 0.7 },
    { emoji: "🥗", top: "38%", right: "10%", delay: 0.2 },
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
    <div className="min-h-screen bg-gradient-to-b from-primary/10 via-background to-background flex flex-col relative overflow-hidden">
      {/* Close Button */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors safe-area-top"
        style={{ marginTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <X className="h-6 w-6 text-foreground" />
      </button>

      {/* Hero Section */}
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

        {/* Rating badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-1 bg-primary/10 border border-primary/20 rounded-full px-4 py-2">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-semibold text-foreground">{t.rating}</span>
          </div>
        </motion.div>

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
              className="h-36 w-36 object-contain"
            />
            {/* Sparkle effects */}
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Crown className="h-5 w-5 text-primary" />
            <span className="font-bold text-primary">Chefly Plus</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground max-w-sm">
            {t.title}
          </h1>
          <p className="text-muted-foreground mt-2">{t.subtitle}</p>
        </motion.div>

        {/* Benefits Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-sm"
        >
          <Card3D variant="elevated" hover={false} className="p-5">
            <div className="space-y-3">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.08 }}
                  className="flex items-center gap-3"
                >
                  <Icon3D icon={benefit.icon} color={benefit.color} size="sm" />
                  <span className="text-sm font-medium text-foreground">
                    {language === "es" ? benefit.es : benefit.en}
                  </span>
                </motion.div>
              ))}
            </div>
          </Card3D>
        </motion.div>
      </div>

      {/* Bottom CTA Section */}
      <div className="px-6 pb-8 space-y-4 safe-area-pb">
        {/* Price badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <span className="text-2xl font-bold text-foreground">{t.price}</span>
        </motion.div>

        {/* Cancel anytime */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
          className="flex items-center justify-center gap-2 text-muted-foreground"
        >
          <Shield className="h-4 w-4" />
          <span className="text-sm">{t.cancelAnytime}</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Button
            onClick={handleContinue}
            variant="modern3d"
            size="lg"
            className="w-full h-14 text-lg font-bold"
          >
            <Crown className="mr-2 h-5 w-5" />
            {t.continueBtn}
          </Button>
        </motion.div>
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
