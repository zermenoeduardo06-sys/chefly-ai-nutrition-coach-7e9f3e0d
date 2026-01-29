import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles, Star, ArrowLeft, Zap, Gift, Calendar, Camera, MessageSquare, Utensils, Users, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { Card3D } from "@/components/ui/card-3d";
import { Icon3D } from "@/components/ui/icon-3d";
import mascotFlexing from "@/assets/mascot-flexing.png";
import mascotHappy from "@/assets/mascot-happy.png";
import { IAPPaywall } from "@/components/IAPPaywall";

const Pricing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [iapPaywallOpen, setIapPaywallOpen] = useState(false);
  const [userId, setUserId] = useState<string | undefined>();

  const handleSelectPlan = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      setUserId(user.id);
      setIapPaywallOpen(true);
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: language === "es" ? "No se pudo iniciar el proceso de pago. Intenta de nuevo." : "Could not start payment process. Please try again.",
      });
    }
  };

  const plusFeatures = [
    { icon: Calendar, color: "primary" as const, es: "Planes frescos cada semana", en: "Fresh plans every week" },
    { icon: Utensils, color: "emerald" as const, es: "Cambia comidas cuando quieras", en: "Swap meals anytime" },
    { icon: Camera, color: "amber" as const, es: "Escanea cualquier platillo", en: "Scan any dish" },
    { icon: MessageSquare, color: "sky" as const, es: "Tu nutriólogo 24/7", en: "Your 24/7 nutritionist" },
    { icon: Users, color: "rose" as const, es: "Motívate con amigos", en: "Stay motivated with friends" },
  ];

  const freeFeatures = language === "es" 
    ? ["Ver tu plan semanal", "Marcar comidas completadas", "Seguimiento de progreso", "Sistema de logros", "Desafíos diarios"]
    : ["View your weekly plan", "Mark completed meals", "Progress tracking", "Achievements system", "Daily challenges"];

  const texts = {
    es: {
      pageTitle: "Mejora tu experiencia",
      pageSubtitle: "DESBLOQUEA TODO EL POTENCIAL",
      recommended: "RECOMENDADO",
      cheflyPlus: "Chefly Plus",
      plusSubtitle: "Todo lo que necesitas para transformar tu alimentación",
      price: "$7.99",
      priceUnit: "USD/mes",
      cta: "COMENZAR POR $7.99/MES",
      freePlan: "Plan Gratuito",
      freeSubtitle: "Gratis para siempre",
      freeNote: "Ya tienes acceso al plan gratuito",
      cancelAnytime: "Cancela cuando quieras",
      rating: "4.8★ • +50k usuarios",
    },
    en: {
      pageTitle: "Upgrade your experience",
      pageSubtitle: "UNLOCK FULL POTENTIAL",
      recommended: "RECOMMENDED",
      cheflyPlus: "Chefly Plus",
      plusSubtitle: "Everything you need to transform your nutrition",
      price: "$7.99",
      priceUnit: "USD/month",
      cta: "START FOR $7.99/MONTH",
      freePlan: "Free Plan",
      freeSubtitle: "Free forever",
      freeNote: "You already have access to the free plan",
      cancelAnytime: "Cancel anytime",
      rating: "4.8★ • +50k users",
    },
  };

  const txt = texts[language];

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Hero Header with Gradient */}
      <div className="relative bg-gradient-to-br from-primary via-primary/80 to-secondary overflow-hidden">
        {/* Sparkle decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div 
            className="absolute top-8 left-8"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="h-5 w-5 text-white/60" />
          </motion.div>
          <motion.div 
            className="absolute top-12 right-12"
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
          >
            <Star className="h-4 w-4 text-white/50" />
          </motion.div>
        </div>

        <div className="relative px-4 pt-4 pb-8">
          {/* Header row */}
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            {/* Social proof badge */}
            <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5">
              <Star className="h-3.5 w-3.5 text-yellow-300 fill-yellow-300" />
              <span className="text-xs font-semibold text-white">{txt.rating}</span>
            </div>
          </div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-3xl font-bold text-white mb-1">{txt.pageTitle}</h1>
            <p className="text-white/70 text-xs uppercase tracking-widest font-semibold">
              {txt.pageSubtitle}
            </p>
          </motion.div>

          {/* Mascot */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="flex justify-center mt-4"
          >
            <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-4 border border-white/20">
              <img 
                src={mascotFlexing} 
                alt="Chefly mascot" 
                className="h-28 w-28 object-contain"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Plans */}
      <div className="px-4 -mt-4 space-y-4 max-w-lg mx-auto">
        {/* Chefly Plus */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 rounded-t-2xl px-4 py-2.5">
            <span className="text-white font-bold text-sm uppercase tracking-wide flex items-center gap-2">
              <Crown className="h-4 w-4" />
              {txt.recommended}
            </span>
          </div>
          
          <Card3D variant="elevated" hover={false} className="rounded-t-none border-t-0">
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-1">{txt.cheflyPlus}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{txt.plusSubtitle}</p>

                  {/* Price */}
                  <div className="flex items-baseline gap-1 mb-5">
                    <span className="text-3xl font-bold text-foreground">{txt.price}</span>
                    <span className="text-muted-foreground text-sm">{txt.priceUnit}</span>
                  </div>

                  {/* Features with Icon3D */}
                  <div className="space-y-3">
                    {plusFeatures.map((feature, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.05 }}
                        className="flex items-center gap-3"
                      >
                        <Icon3D icon={feature.icon} color={feature.color} size="sm" />
                        <span className="text-sm font-medium text-foreground">
                          {language === "es" ? feature.es : feature.en}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Mascot */}
                <motion.img 
                  src={mascotFlexing}
                  alt="Chefly Plus"
                  className="h-24 w-24 object-contain flex-shrink-0"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>

              {/* CTA Button */}
              <div className="mt-5 space-y-3">
                {/* Cancel anytime */}
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm">{txt.cancelAnytime}</span>
                </div>

                <Button
                  onClick={handleSelectPlan}
                  disabled={iapPaywallOpen}
                  variant="modern3d"
                  size="lg"
                  className="w-full h-12 text-base font-bold"
                >
                  <Zap className="mr-2 h-5 w-5" />
                  {txt.cta}
                </Button>
              </div>
            </div>
          </Card3D>
        </motion.div>

        {/* Free Plan */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card3D variant="default" hover={false}>
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Gift className="h-5 w-5 text-amber-500" />
                    <h3 className="text-lg font-bold text-foreground">{txt.freePlan}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm mb-3">{txt.freeSubtitle}</p>

                  <ul className="space-y-1.5">
                    {freeFeatures.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <img 
                  src={mascotHappy}
                  alt="Free Plan"
                  className="h-16 w-16 object-contain flex-shrink-0 opacity-80"
                />
              </div>

              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">{txt.freeNote}</p>
              </div>
            </div>
          </Card3D>
        </motion.div>
      </div>

      {/* IAP Paywall */}
      <IAPPaywall
        open={iapPaywallOpen}
        onOpenChange={setIapPaywallOpen}
        userId={userId}
        onPurchaseSuccess={() => {
          navigate("/dashboard");
        }}
      />
    </div>
  );
};

export default Pricing;
