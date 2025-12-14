import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Crown, Sparkles, Star, ArrowLeft, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SUBSCRIPTION_TIERS } from "@/hooks/useSubscription";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import mascotFlexing from "@/assets/mascot-flexing.png";
import mascotFire from "@/assets/mascot-fire.png";

interface SubscriptionPlan {
  id: string;
  name: string;
  nameEn: string;
  subtitle: string;
  subtitleEn: string;
  price_mxn: number;
  billing_period: string;
  features: string[];
  featuresEn: string[];
  display_order: number;
  coming_soon?: boolean;
  is_active: boolean;
  stripe_price_id?: string;
  recommended: boolean;
  mascot: string;
  gradient: string;
}

const Pricing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  const plans: SubscriptionPlan[] = [
    {
      id: "intermediate",
      name: "Chefly Plus",
      nameEn: "Chefly Plus",
      subtitle: "Nutrición personalizada sin límites",
      subtitleEn: "Unlimited personalized nutrition",
      price_mxn: SUBSCRIPTION_TIERS.INTERMEDIATE.price,
      billing_period: "monthly",
      features: [
        "Genera nuevos planes semanales ilimitados",
        "Intercambia comidas entre días",
        "Chat ilimitado con coach IA",
        "Check-in semanal adaptativo",
        "Sistema de amigos y comparación",
        "Lista de compras con cantidades reales",
        "Exportar recetas a PDF",
        "Modo offline disponible",
      ],
      featuresEn: [
        "Generate unlimited weekly plans",
        "Swap meals between days",
        "Unlimited AI coach chat",
        "Weekly adaptive check-in",
        "Friends & comparison system",
        "Shopping list with real quantities",
        "Export recipes to PDF",
        "Offline mode available",
      ],
      display_order: 1,
      is_active: true,
      stripe_price_id: SUBSCRIPTION_TIERS.INTERMEDIATE.price_id,
      recommended: true,
      mascot: mascotFlexing,
      gradient: "from-emerald-400 via-teal-500 to-cyan-500",
    },
    {
      id: "basic",
      name: "Plan Básico",
      nameEn: "Basic Plan",
      subtitle: "Comienza tu viaje nutricional",
      subtitleEn: "Start your nutrition journey",
      price_mxn: SUBSCRIPTION_TIERS.BASIC.price,
      billing_period: "monthly",
      features: [
        "Ver tu plan semanal completo",
        "Marcar comidas completadas",
        "5 mensajes de chat al día",
        "Seguimiento de progreso y medidas",
        "Sistema de logros y puntos",
        "Desafíos diarios",
      ],
      featuresEn: [
        "View your complete weekly plan",
        "Mark completed meals",
        "5 chat messages per day",
        "Progress & body tracking",
        "Achievements & points system",
        "Daily challenges",
      ],
      display_order: 2,
      is_active: true,
      stripe_price_id: SUBSCRIPTION_TIERS.BASIC.price_id,
      recommended: false,
      mascot: mascotFire,
      gradient: "from-orange-400 to-amber-500",
    },
  ];

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    if (!plan.stripe_price_id) {
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: language === "es" ? "Este plan no está disponible por el momento" : "This plan is not available at the moment",
      });
      return;
    }

    setCheckoutLoading(plan.id);
    
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
          priceId: plan.stripe_price_id,
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
      setCheckoutLoading(null);
    }
  };

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
          <motion.div 
            className="absolute top-20 right-1/3"
            animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2.2, repeat: Infinity, delay: 0.3 }}
          >
            <Star className="h-3 w-3 text-white/30" />
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
              {language === "es" ? "Elige tu Plan" : "Choose Your Plan"}
            </h1>
            <p className="text-white/70 text-sm uppercase tracking-widest font-semibold">
              {language === "es" ? "DESBLOQUEA TU POTENCIAL" : "UNLOCK YOUR POTENTIAL"}
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
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            {/* Recommended Badge */}
            {plan.recommended && (
              <div className={`bg-gradient-to-r ${plan.gradient} rounded-t-2xl px-4 py-2`}>
                <span className="text-white font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                  <Crown className="h-4 w-4" />
                  {language === "es" ? "RECOMENDADO" : "RECOMMENDED"}
                </span>
              </div>
            )}
            
            <div className={`
              bg-card border-2 rounded-2xl overflow-hidden
              ${plan.recommended ? "rounded-t-none border-t-0 border-primary" : "border-border"}
            `}>
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Plan name */}
                    <h3 className="text-xl font-bold text-foreground mb-1">
                      {language === "es" ? plan.name : plan.nameEn}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-3">
                      {language === "es" ? plan.subtitle : plan.subtitleEn}
                    </p>

                    {/* Price */}
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-3xl font-bold text-foreground">
                        ${Math.round(plan.price_mxn / 20)}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        USD/{language === "es" ? "mes" : "month"}
                      </span>
                    </div>

                    {/* Features */}
                    <ul className="space-y-2.5">
                      {(language === "es" ? plan.features : plan.featuresEn).map((feature, i) => (
                        <motion.li 
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + i * 0.05 }}
                          className="flex items-center gap-2.5"
                        >
                          <div className={`p-0.5 rounded-full bg-gradient-to-r ${plan.gradient}`}>
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
                      src={plan.mascot} 
                      alt={plan.name} 
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
                    onClick={() => handleSelectPlan(plan)}
                    disabled={checkoutLoading === plan.id}
                    variant={plan.recommended ? "duolingo" : "duolingoOutline"}
                    className="w-full h-12 text-base font-bold"
                  >
                    {checkoutLoading === plan.id ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        {language === "es" ? "Procesando..." : "Processing..."}
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-5 w-5" />
                        {language === "es" 
                          ? `COMENZAR POR $${Math.round(plan.price_mxn / 20)}/MES`
                          : `START FOR $${Math.round(plan.price_mxn / 20)}/MONTH`
                        }
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Footer info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center space-y-2 pt-4"
        >
          <p className="text-sm text-muted-foreground">
            {language === "es" 
              ? "✨ Prueba gratis por 4 días incluida"
              : "✨ 4-day free trial included"}
          </p>
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
