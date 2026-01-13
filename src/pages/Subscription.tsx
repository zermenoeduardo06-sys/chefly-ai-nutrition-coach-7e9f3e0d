import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Check, Zap, Gift, RefreshCw, Settings } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import mascotLime from "@/assets/mascot-lime.png";
import { IAPPaywall } from "@/components/IAPPaywall";
import { useInAppPurchases } from "@/hooks/useInAppPurchases";

const Subscription = () => {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [iapPaywallOpen, setIapPaywallOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();
  const subscription = useSubscription(userId);
  const { limits } = useSubscriptionLimits(userId);
  const { restorePurchases, isRestoring } = useInAppPurchases(userId);

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

  const handleSelectPlan = () => {
    setIapPaywallOpen(true);
  };

  const handleIAPPaywallClose = (open: boolean) => {
    setIapPaywallOpen(open);
    if (!open) {
      subscription.checkSubscription();
    }
  };

  const handleRestorePurchases = async () => {
    const success = await restorePurchases();
    if (success) {
      subscription.checkSubscription();
      toast({
        title: language === "es" ? "Compras restauradas" : "Purchases restored",
        description: language === "es" 
          ? "Tu suscripción ha sido restaurada correctamente."
          : "Your subscription has been restored successfully.",
      });
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
      id: "chefly-plus",
      name: "Chefly Plus",
      subtitle: language === "es" ? "Nutrición personalizada sin límites" : "Unlimited personalized nutrition",
      price: "$150 MXN",
      priceUsd: "$7.99",
      period: language === "es" ? "/mes" : "/month",
      features: [
        language === "es" ? "Genera nuevos planes semanales ilimitados" : "Generate unlimited weekly plans",
        language === "es" ? "Intercambia comidas entre días" : "Swap meals between days",
        language === "es" ? "Reemplaza comidas por alternativas" : "Replace meals with alternatives",
        language === "es" ? "Chat ilimitado con coach IA" : "Unlimited AI coach chat",
        language === "es" ? "Escaneo de comidas ilimitado" : "Unlimited food scanning",
        language === "es" ? "Sistema de amigos y comparación" : "Friends & comparison system",
      ],
      recommended: true,
      mascot: mascotLime,
      gradient: "from-emerald-400 via-teal-500 to-cyan-500",
      isCurrentPlan: limits.isCheflyPlus,
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
      mascot: mascotLime,
      gradient: "from-orange-400 to-amber-500",
      isCurrentPlan: limits.isFreePlan,
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-6">
      {/* Compact Header */}
      <div className="relative bg-gradient-to-br from-primary via-primary/80 to-secondary overflow-hidden">
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
                  <Zap className="h-4 w-4" />
                  {language === "es" ? "RECOMENDADO" : "RECOMMENDED"}
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
                  {plan.id === "chefly-plus" ? (
                    plan.isCurrentPlan ? (
                      <div className="text-center py-3 bg-muted/50 rounded-xl">
                        <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
                          <Settings className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {language === "es" ? "Plan activo" : "Active plan"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground px-4">
                          {language === "es" 
                            ? "Gestiona tu suscripción desde Configuración > Apple ID > Suscripciones"
                            : "Manage your subscription from Settings > Apple ID > Subscriptions"}
                        </p>
                      </div>
                    ) : (
                      <Button
                        onClick={handleSelectPlan}
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
                  language === "es" ? "es-MX" : "en-US",
                  { year: 'numeric', month: 'long', day: 'numeric' }
                )}
              </span>
            </p>
          </motion.div>
        )}

        {/* Restore purchases button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Button
            variant="ghost"
            onClick={handleRestorePurchases}
            disabled={isRestoring}
            className="w-full text-sm text-muted-foreground"
          >
            {isRestoring ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {language === "es" ? "Restaurando..." : "Restoring..."}
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                {language === "es" ? "Restaurar compras" : "Restore purchases"}
              </>
            )}
          </Button>
        </motion.div>

        {/* Legal disclosure for Apple App Store */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="space-y-3 pt-2"
        >
          <p className="text-[10px] text-muted-foreground text-center leading-relaxed px-2">
            {language === "es" 
              ? "El pago se cargará a tu cuenta de Apple al confirmar la compra. La suscripción se renueva automáticamente a menos que la auto-renovación sea desactivada al menos 24 horas antes del final del período actual. Tu cuenta será cargada por la renovación dentro de las 24 horas previas al final del período actual. Gestiona tus suscripciones desde Configuración > Apple ID > Suscripciones."
              : "Payment will be charged to your Apple account at confirmation of purchase. Subscription automatically renews unless auto-renew is turned off at least 24 hours before the end of the current period. Your account will be charged for renewal within 24 hours prior to the end of the current period. Manage your subscriptions from Settings > Apple ID > Subscriptions."}
          </p>
          <div className="flex justify-center gap-4 text-[10px] text-muted-foreground">
            <a href="/terms" className="hover:underline">
              {language === "es" ? "Términos de uso" : "Terms of Use"}
            </a>
            <a href="/privacy" className="hover:underline">
              {language === "es" ? "Política de privacidad" : "Privacy Policy"}
            </a>
          </div>
        </motion.div>
      </div>

      {/* IAP Paywall */}
      <IAPPaywall
        open={iapPaywallOpen}
        onOpenChange={handleIAPPaywallClose}
        userId={userId}
        onPurchaseSuccess={() => {
          subscription.checkSubscription();
        }}
      />
    </div>
  );
};

export default Subscription;
