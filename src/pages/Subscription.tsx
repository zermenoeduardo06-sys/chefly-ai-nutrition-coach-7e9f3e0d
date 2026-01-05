import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Check, ExternalLink, Crown, Zap, Gift, Users } from "lucide-react";
import { useSubscription, SUBSCRIPTION_TIERS } from "@/hooks/useSubscription";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import mascotCelebrating from "@/assets/mascot-lime-celebrating.png";
import mascotMotivated from "@/assets/mascot-lime-motivated.png";
import { InAppCheckout } from "@/components/InAppCheckout";
import { Browser } from "@capacitor/browser";

const Subscription = () => {
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{
    priceId: string;
    name: string;
    price: string;
  } | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();
  const subscription = useSubscription(userId);
  const { limits } = useSubscriptionLimits(userId);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUserId(user.id);
    setLoading(false);
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");

      if (error) throw error;

      if (data.url) {
        // Use Capacitor Browser for in-app experience on iOS/Android
        await Browser.open({ url: data.url, presentationStyle: 'popover' });
      }
    } catch (error) {
      console.error("Error opening customer portal:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: language === "es" 
          ? "No se pudo abrir el portal de gestión. Intenta de nuevo."
          : "Could not open management portal. Please try again.",
      });
    } finally {
      setPortalLoading(false);
    }
  };

  const handleSelectPlan = (priceId: string, planName: string, planPrice: string) => {
    setSelectedPlan({ priceId, name: planName, price: planPrice });
    setCheckoutOpen(true);
  };

  const handleCheckoutClose = (open: boolean) => {
    setCheckoutOpen(open);
    if (!open) {
      // Refresh subscription status after checkout closes
      subscription.checkSubscription();
    }
  };

  if (loading || subscription.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/20 via-background to-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const plans = [
    {
      id: "chefly-family",
      name: "Chefly Familiar",
      subtitle: language === "es" ? "Nutrición para toda la familia" : "Nutrition for the whole family",
      price: "$400 MXN",
      priceUsd: "$20",
      period: language === "es" ? "/mes" : "/month",
      badge: language === "es" ? "5 personas" : "5 people",
      features: [
        language === "es" ? "Todo de Chefly Plus incluido" : "Everything in Chefly Plus included",
        language === "es" ? "Hasta 5 perfiles familiares" : "Up to 5 family profiles",
        language === "es" ? "Cada miembro con sus propias metas" : "Individual goals per member",
        language === "es" ? "Panel de administración familiar" : "Family admin panel",
        language === "es" ? "Sistema de invitación por código" : "Code-based invitation system",
        language === "es" ? "Ahorra 50% vs 5 suscripciones" : "Save 50% vs 5 subscriptions",
      ],
      recommended: true,
      mascot: mascotCelebrating,
      gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
      isCurrentPlan: subscription.is_chefly_family,
      priceId: SUBSCRIPTION_TIERS.CHEFLY_FAMILY.price_id,
    },
    {
      id: "chefly-plus",
      name: "Chefly Plus",
      subtitle: language === "es" ? "Nutrición personalizada sin límites" : "Unlimited personalized nutrition",
      price: "$150 MXN",
      priceUsd: "$7.99",
      period: language === "es" ? "/mes" : "/month",
      features: [
        language === "es" ? "Genera nuevos planes semanales ilimitados" : "Generate unlimited weekly plans",
        language === "es" ? "Intercambia comidas entre días" : "Swap meals between days",
        language === "es" ? "Chat ilimitado con coach IA" : "Unlimited AI coach chat",
        language === "es" ? "Escaneo de comidas ilimitado" : "Unlimited food scanning",
        language === "es" ? "Check-in semanal adaptativo" : "Weekly adaptive check-in",
        language === "es" ? "Sistema de amigos y comparación" : "Friends & comparison system",
        language === "es" ? "Lista de compras con cantidades reales" : "Shopping list with real quantities",
        language === "es" ? "Exportar recetas a PDF" : "Export recipes to PDF",
      ],
      recommended: false,
      mascot: mascotCelebrating,
      gradient: "from-emerald-400 via-teal-500 to-cyan-500",
      isCurrentPlan: limits.isCheflyPlus && !subscription.is_chefly_family,
      priceId: SUBSCRIPTION_TIERS.CHEFLY_PLUS.price_id,
    },
    {
      id: "free",
      name: language === "es" ? "Plan Gratuito" : "Free Plan",
      subtitle: language === "es" ? "Comienza tu viaje nutricional" : "Start your nutrition journey",
      price: language === "es" ? "GRATIS" : "FREE",
      priceUsd: "$0",
      period: language === "es" ? " para siempre" : " forever",
      features: [
        language === "es" ? "Ver tu plan semanal completo" : "View your complete weekly plan",
        language === "es" ? "Marcar comidas completadas" : "Mark completed meals",
        language === "es" ? "5 mensajes de chat al día" : "5 chat messages per day",
        language === "es" ? "1 escaneo de comida al día" : "1 food scan per day",
        language === "es" ? "Seguimiento de progreso y medidas" : "Progress & body tracking",
        language === "es" ? "Sistema de logros y puntos" : "Achievements & points system",
        language === "es" ? "Desafíos diarios" : "Daily challenges",
      ],
      recommended: false,
      mascot: mascotMotivated,
      gradient: "from-orange-400 to-amber-500",
      isCurrentPlan: limits.isFreePlan,
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-6">
      {/* Compact Header with safe area */}
      <div className="relative bg-gradient-to-br from-primary via-primary/80 to-secondary overflow-hidden pt-safe-top">
        <div className="relative px-4 py-4">
          {/* Back button and title row */}
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate("/dashboard")}
              className="text-white hover:bg-white/20 h-9 w-9"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-white">
                {language === "es" ? "Suscripción" : "Subscription"}
              </h1>
              <p className="text-white/70 text-xs uppercase tracking-wide">
                {language === "es" ? "PLANES" : "PLANS"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Plans */}
      <div className="px-4 pt-6 space-y-4 max-w-lg mx-auto">
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
                  <Users className="h-4 w-4" />
                  {language === "es" ? "MEJOR VALOR" : "BEST VALUE"}
                </span>
              </div>
            )}
            
            <div className={`
              bg-card border-2 rounded-2xl overflow-hidden
              ${plan.recommended ? "rounded-t-none border-t-0" : ""}
              ${plan.isCurrentPlan ? "border-primary ring-2 ring-primary/20" : "border-border"}
            `}>
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Plan name */}
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                      {plan.isCurrentPlan && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-semibold">
                          {language === "es" ? "Tu plan" : "Your plan"}
                        </span>
                      )}
                      {plan.badge && (
                        <span className="text-xs bg-violet-500/10 text-violet-600 dark:text-violet-400 px-2 py-0.5 rounded-full font-medium">
                          {plan.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm mb-3">{plan.subtitle}</p>

                    {/* Price */}
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-2xl font-bold text-foreground">
                        {plan.id === "free" ? plan.price : plan.priceUsd}
                      </span>
                      {plan.id !== "free" && (
                        <span className="text-muted-foreground text-sm">
                          USD{plan.period}
                        </span>
                      )}
                      {plan.id === "free" && (
                        <span className="text-muted-foreground text-sm">
                          {plan.period}
                        </span>
                      )}
                    </div>

                    {/* Features */}
                    <ul className="space-y-2">
                      {plan.features.map((feature, i) => (
                        <motion.li 
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + i * 0.05 }}
                          className="flex items-center gap-2"
                        >
                          <div className={`p-0.5 rounded-full bg-gradient-to-r ${plan.gradient}`}>
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
                      src={plan.mascot} 
                      alt={plan.name} 
                      className="h-20 w-20 object-contain"
                    />
                  </motion.div>
                </div>

                {/* CTA Button */}
                <motion.div 
                  className="mt-4"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {plan.id === "chefly-family" ? (
                    plan.isCurrentPlan ? (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => navigate("/family")}
                          variant="duolingoOutline"
                          className="flex-1 h-11 text-sm font-bold"
                        >
                          <Users className="mr-2 h-4 w-4" />
                          {language === "es" ? "GESTIONAR FAMILIA" : "MANAGE FAMILY"}
                        </Button>
                        <Button
                          onClick={handleManageSubscription}
                          disabled={portalLoading}
                          variant="outline"
                          size="icon"
                          className="h-11 w-11"
                        >
                          {portalLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <ExternalLink className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleSelectPlan(plan.priceId!, "Chefly Familiar", "$20")}
                        className="w-full h-11 text-sm font-bold bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 hover:from-violet-600 hover:via-purple-600 hover:to-fuchsia-600 text-white border-0"
                      >
                        <Users className="mr-2 h-4 w-4" />
                        {language === "es" ? "COMENZAR PLAN FAMILIAR" : "START FAMILY PLAN"}
                      </Button>
                    )
                  ) : plan.id === "chefly-plus" ? (
                    plan.isCurrentPlan ? (
                      <Button
                        onClick={handleManageSubscription}
                        disabled={portalLoading}
                        variant="duolingoOutline"
                        className="w-full h-11 text-sm font-bold"
                      >
                        {portalLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {language === "es" ? "Abriendo..." : "Opening..."}
                          </>
                        ) : (
                          <>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            {language === "es" ? "GESTIONAR PLAN" : "MANAGE PLAN"}
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleSelectPlan(plan.priceId!, "Chefly Plus", "$7.99")}
                        variant="duolingo"
                        className="w-full h-11 text-sm font-bold"
                      >
                        <Zap className="mr-2 h-4 w-4" />
                        {language === "es" ? "MEJORAR A CHEFLY PLUS" : "UPGRADE TO CHEFLY PLUS"}
                      </Button>
                    )
                  ) : (
                    plan.isCurrentPlan ? (
                      <div className="flex items-center justify-center gap-2 py-3 text-muted-foreground">
                        <Gift className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {language === "es" ? "Tu plan actual" : "Your current plan"}
                        </span>
                      </div>
                    ) : (
                      <Button
                        variant="duolingoOutline"
                        className="w-full h-11 text-sm font-bold"
                        disabled
                      >
                        {language === "es" ? "PLAN GRATUITO" : "FREE PLAN"}
                      </Button>
                    )
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Subscription renewal info */}
        {subscription.subscribed && subscription.subscription_end && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-muted/50 rounded-2xl p-4 border border-border"
          >
            <p className="text-sm text-center text-muted-foreground">
              {language === "es" ? "Tu suscripción se renueva el " : "Your subscription renews on "}
              <span className="font-semibold text-foreground">
                {new Date(subscription.subscription_end).toLocaleDateString(
                  language === "es" ? 'es-ES' : 'en-US', 
                  { year: 'numeric', month: 'long', day: 'numeric' }
                )}
              </span>
            </p>
          </motion.div>
        )}

        {/* Apple Required: Subscription Terms Disclosure */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="bg-muted/30 rounded-xl p-4 border border-border space-y-3"
        >
          <p className="text-xs text-muted-foreground leading-relaxed">
            {language === "es" 
              ? "• El pago se cargará a tu cuenta al confirmar la compra."
              : "• Payment will be charged to your account upon confirmation of purchase."}
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {language === "es" 
              ? "• La suscripción se renueva automáticamente a menos que se cancele al menos 24 horas antes del final del período actual."
              : "• Subscription automatically renews unless cancelled at least 24 hours before the end of the current period."}
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {language === "es" 
              ? "• El cargo por renovación se realizará dentro de las 24 horas previas al final del período actual."
              : "• Renewal charge will be made within 24 hours before the end of the current period."}
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {language === "es" 
              ? "• Puedes gestionar y cancelar tu suscripción en cualquier momento desde la configuración de tu cuenta."
              : "• You can manage and cancel your subscription anytime from your account settings."}
          </p>
        </motion.div>

        {/* Restore Purchases Button - Apple Required */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="pt-2"
        >
          <Button
            variant="link"
            className="w-full text-sm text-muted-foreground hover:text-primary"
            onClick={() => {
              // For Stripe-based subscriptions, this refreshes the subscription status
              subscription.checkSubscription();
            }}
          >
            {language === "es" ? "Restaurar Compras" : "Restore Purchases"}
          </Button>
        </motion.div>

        {/* Help text */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-xs text-center text-muted-foreground pb-4"
        >
          {language === "es" 
            ? "¿Necesitas ayuda? Contacta soporte desde Configuración."
            : "Need help? Contact support from Settings."}
        </motion.p>
      </div>

      {/* In-App Checkout Modal */}
      {selectedPlan && (
        <InAppCheckout
          open={checkoutOpen}
          onOpenChange={handleCheckoutClose}
          priceId={selectedPlan.priceId}
          planName={selectedPlan.name}
          planPrice={selectedPlan.price}
        />
      )}
    </div>
  );
};

export default Subscription;
