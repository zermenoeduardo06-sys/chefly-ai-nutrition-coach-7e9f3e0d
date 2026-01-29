import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Check, Crown, Sparkles, Star, ArrowLeft, Zap, Gift, Camera, MessageSquare, Utensils } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { Card3D } from "@/components/ui/card-3d";
import { Icon3D } from "@/components/ui/icon-3d";
import mascotCelebrating from "@/assets/mascot-celebrating.png";
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
        description: language === "es" ? "No se pudo iniciar el proceso de pago." : "Could not start payment process.",
      });
    }
  };

  const texts = {
    es: {
      title: "Mejora tu experiencia",
      subtitle: "DESBLOQUEA TODO EL POTENCIAL",
      rating: "4.8★ App Store",
      recommended: "RECOMENDADO",
      plusName: "Chefly Plus",
      plusSubtitle: "Nutrición personalizada sin límites",
      price: "$7.99",
      period: "/mes",
      freeName: "Plan Gratuito",
      freeSubtitle: "Gratis para siempre",
      cta: "COMENZAR AHORA",
      cancelAnytime: "Cancela cuando quieras",
      plusFeatures: [
        { icon: Zap, color: "amber" as const, text: "Planes frescos cada semana" },
        { icon: Camera, color: "sky" as const, text: "Escanea cualquier platillo" },
        { icon: MessageSquare, color: "emerald" as const, text: "Tu nutriólogo 24/7" },
        { icon: Utensils, color: "rose" as const, text: "Cambia comidas cuando quieras" },
      ],
      freeFeatures: [
        "Ver plan semanal",
        "Marcar comidas completadas",
        "Seguimiento de progreso",
      ],
    },
    en: {
      title: "Upgrade Your Experience",
      subtitle: "UNLOCK FULL POTENTIAL",
      rating: "4.8★ App Store",
      recommended: "RECOMMENDED",
      plusName: "Chefly Plus",
      plusSubtitle: "Unlimited personalized nutrition",
      price: "$7.99",
      period: "/month",
      freeName: "Free Plan",
      freeSubtitle: "Free forever",
      cta: "START NOW",
      cancelAnytime: "Cancel anytime",
      plusFeatures: [
        { icon: Zap, color: "amber" as const, text: "Fresh plans every week" },
        { icon: Camera, color: "sky" as const, text: "Scan any dish" },
        { icon: MessageSquare, color: "emerald" as const, text: "Your 24/7 nutritionist" },
        { icon: Utensils, color: "rose" as const, text: "Swap meals anytime" },
      ],
      freeFeatures: [
        "View weekly plan",
        "Mark completed meals",
        "Progress tracking",
      ],
    },
  };

  const txt = texts[language];

  // Floating emojis
  const floatingEmojis = [
    { emoji: "🍎", top: "15%", left: "8%", delay: 0 },
    { emoji: "✨", top: "20%", right: "10%", delay: 0.3 },
    { emoji: "🥕", top: "30%", left: "5%", delay: 0.6 },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with gradient */}
      <div className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-background overflow-hidden px-4 pt-4 pb-6 safe-area-top">
        {/* Floating emojis */}
        {floatingEmojis.map((item, index) => (
          <motion.div
            key={index}
            className="absolute text-2xl pointer-events-none"
            style={{ top: item.top, left: item.left, right: item.right }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ 
              opacity: 0.7, 
              y: [0, -8, 0],
            }}
            transition={{ 
              opacity: { delay: item.delay, duration: 0.4 },
              y: { delay: item.delay, duration: 2.5, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            {item.emoji}
          </motion.div>
        ))}

        {/* Back button and rating row */}
        <div className="flex items-center justify-between mb-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="text-foreground hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-1.5 bg-card/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border">
            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
            <span className="text-sm font-medium text-foreground">{txt.rating}</span>
          </div>
        </div>

        {/* Hero with mascot */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-4"
        >
          <img 
            src={mascotCelebrating} 
            alt="Chefly mascot" 
            className="h-20 w-20 object-contain"
          />
          <div>
            <h1 className="text-xl font-bold text-foreground">{txt.title}</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{txt.subtitle}</p>
          </div>
        </motion.div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-44">
        <div className="max-w-lg mx-auto space-y-4 pt-4">
          {/* Chefly Plus Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* Recommended Badge */}
            <div className="bg-gradient-to-r from-primary to-secondary rounded-t-2xl px-4 py-2.5">
              <span className="text-white font-bold text-sm flex items-center gap-2">
                <Crown className="h-4 w-4" />
                {txt.recommended}
              </span>
            </div>
            
            <Card3D variant="elevated" hover={false} className="rounded-t-none border-t-0">
              <div className="p-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
                        <Crown className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground">{txt.plusName}</h3>
                    </div>
                    <p className="text-muted-foreground text-sm">{txt.plusSubtitle}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-foreground">{txt.price}</span>
                    <span className="text-sm text-muted-foreground">{txt.period}</span>
                  </div>
                </div>

                {/* Benefits with Icon3D */}
                <div className="space-y-3">
                  {txt.plusFeatures.map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <Icon3D icon={benefit.icon} color={benefit.color} size="sm" />
                      <span className="text-sm font-medium text-foreground">{benefit.text}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Card3D>
          </motion.div>

          {/* Free Plan Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card3D variant="default" hover={false}>
              <div className="p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="p-2 rounded-xl bg-muted/50">
                        <Gift className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground">{txt.freeName}</h3>
                    </div>
                    <p className="text-muted-foreground text-sm">{txt.freeSubtitle}</p>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-2">
                  {txt.freeFeatures.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <div className="p-0.5 rounded-full bg-muted">
                        <Check className="h-3 w-3 text-muted-foreground" />
                      </div>
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card3D>
          </motion.div>
        </div>
      </div>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border p-4 pb-safe">
        <div className="max-w-lg mx-auto space-y-3">
          <p className="text-center text-sm text-muted-foreground">
            ✓ {txt.cancelAnytime}
          </p>
          
          <Button
            onClick={handleSelectPlan}
            disabled={iapPaywallOpen}
            variant="modern3d"
            size="xl"
            className="w-full"
          >
            <Zap className="mr-2 h-5 w-5" />
            {txt.cta} - {txt.price}{txt.period}
          </Button>
        </div>
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
