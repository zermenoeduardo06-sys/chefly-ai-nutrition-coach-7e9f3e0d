import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Crown, Sparkles, Star, ArrowLeft, Zap, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SUBSCRIPTION_TIERS } from "@/hooks/useSubscription";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import mascotFlexing from "@/assets/mascot-flexing.png";
import mascotFire from "@/assets/mascot-fire.png";

const Pricing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleSelectCheflyPlus = async () => {
    setCheckoutLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const affiliateCode = localStorage.getItem("affiliate_code");
      const endorselyReferral = (window as any).endorsely_referral;

      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { 
          priceId: SUBSCRIPTION_TIERS.CHEFLY_PLUS.price_id,
          affiliateCode: affiliateCode || null,
          endorselyReferral: endorselyReferral || null,
        },
      });

      if (error) throw error;

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: language === "es" ? "No se pudo iniciar el proceso de pago. Intenta de nuevo." : "Could not start payment process. Please try again.",
      });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const cheflyPlusFeatures = language === "es" ? [
    "Genera nuevos planes semanales ilimitados",
    "Intercambia comidas entre días",
    "Chat ilimitado con coach IA",
    "Check-in semanal adaptativo",
    "Sistema de amigos y comparación",
    "Lista de compras con cantidades reales",
    "Exportar recetas a PDF",
    "Modo offline disponible",
  ] : [
    "Generate unlimited weekly plans",
    "Swap meals between days",
    "Unlimited AI coach chat",
    "Weekly adaptive check-in",
    "Friends & comparison system",
    "Shopping list with real quantities",
    "Export recipes to PDF",
    "Offline mode available",
  ];

  const freeFeatures = language === "es" ? [
    "Ver tu plan semanal completo",
    "Marcar comidas completadas",
    "5 mensajes de chat al día",
    "Seguimiento de progreso y medidas",
    "Sistema de logros y puntos",
    "Desafíos diarios",
  ] : [
    "View your complete weekly plan",
    "Mark completed meals",
    "5 chat messages per day",
    "Progress & body tracking",
    "Achievements & points system",
    "Daily challenges",
  ];

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
          <motion.div 
            className="absolute bottom-16 left-1/4"
            animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 1.8, repeat: Infinity, delay: 1 }}
          >
            <Sparkles className="h-3 w-3 text-white/40" />
          </motion.div>
        </div>

        <div className="relative px-4 pt-4 pb-8">
          {/* Back button */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="text-white hover:bg-white/20 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-3xl font-bold text-white mb-1">
              {language === "es" ? "Mejora tu experiencia" : "Upgrade Your Experience"}
            </h1>
            <p className="text-white/70 text-sm uppercase tracking-widest font-semibold">
              {language === "es" ? "DESBLOQUEA TODO EL POTENCIAL" : "UNLOCK FULL POTENTIAL"}
            </p>
          </motion.div>

          {/* Mascot in hero */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="flex justify-center mt-4"
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-white/20 rounded-3xl blur-xl" />
              <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-4 border border-white/20">
                <img 
                  src={mascotFlexing} 
                  alt="Chefly mascot" 
                  className="h-28 w-28 object-contain"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Plans */}
      <div className="px-4 -mt-4 space-y-4 max-w-lg mx-auto">
        {/* Chefly Plus - Main CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 rounded-t-2xl px-4 py-2">
            <span className="text-white font-bold text-sm uppercase tracking-wide flex items-center gap-2">
              <Crown className="h-4 w-4" />
              {language === "es" ? "RECOMENDADO" : "RECOMMENDED"}
            </span>
          </div>
          
          <div className="bg-card border-2 rounded-2xl rounded-t-none border-t-0 border-primary overflow-hidden">
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-1">Chefly Plus</h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    {language === "es" ? "Nutrición personalizada sin límites" : "Unlimited personalized nutrition"}
                  </p>

                  {/* Price */}
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-bold text-foreground">$7.99</span>
                    <span className="text-muted-foreground text-sm">
                      USD/{language === "es" ? "mes" : "month"}
                    </span>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2.5">
                    {cheflyPlusFeatures.map((feature, i) => (
                      <motion.li 
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + i * 0.05 }}
                        className="flex items-center gap-2.5"
                      >
                        <div className="p-0.5 rounded-full bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500">
                          <Check className="h-3.5 w-3.5 text-white" />
                        </div>
                        <span className="text-sm text-foreground">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Mascot */}
                <motion.div 
                  className="flex-shrink-0"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <img 
                    src={mascotFlexing} 
                    alt="Chefly Plus" 
                    className="h-24 w-24 object-contain"
                  />
                </motion.div>
              </div>

              {/* CTA Button */}
              <motion.div 
                className="mt-5"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={handleSelectCheflyPlus}
                  disabled={checkoutLoading}
                  variant="duolingo"
                  className="w-full h-12 text-base font-bold"
                >
                  {checkoutLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {language === "es" ? "Procesando..." : "Processing..."}
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-5 w-5" />
                      {language === "es" 
                        ? "COMENZAR POR $7.99/MES"
                        : "START FOR $7.99/MONTH"
                      }
                    </>
                  )}
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Free Plan Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="bg-card border-2 rounded-2xl border-border overflow-hidden">
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-foreground">
                      {language === "es" ? "Plan Gratuito" : "Free Plan"}
                    </h3>
                    <Gift className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-muted-foreground text-sm mb-3">
                    {language === "es" ? "Gratis para siempre" : "Free forever"}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2">
                    {freeFeatures.map((feature, i) => (
                      <motion.li 
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.05 }}
                        className="flex items-center gap-2"
                      >
                        <div className="p-0.5 rounded-full bg-gradient-to-r from-orange-400 to-amber-500">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-sm text-foreground">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Mascot */}
                <motion.div 
                  className="flex-shrink-0"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <img 
                    src={mascotFire} 
                    alt="Free Plan" 
                    className="h-20 w-20 object-contain"
                  />
                </motion.div>
              </div>

              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  {language === "es" 
                    ? "Ya tienes acceso al plan gratuito"
                    : "You already have access to the free plan"
                  }
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center space-y-2 pt-4"
        >
          <p className="text-xs text-muted-foreground">
            {language === "es" 
              ? "Cancela en cualquier momento. Sin compromisos."
              : "Cancel anytime. No commitments."}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Pricing;
