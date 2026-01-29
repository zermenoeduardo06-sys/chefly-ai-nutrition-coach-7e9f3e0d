import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Zap, Gift, RefreshCw, Settings, Star, Crown, Calendar, Camera, MessageSquare, Users, Utensils, Shield } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { Card3D } from "@/components/ui/card-3d";
import { Icon3D } from "@/components/ui/icon-3d";
import mascotFlexing from "@/assets/mascot-flexing.png";
import mascotHappy from "@/assets/mascot-happy.png";
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
      title: "Tu Plan",
      subtitle: "SUSCRIPCIÓN",
      recommended: "RECOMENDADO",
      cheflyPlus: "Chefly Plus",
      plusSubtitle: "Todo lo que necesitas para transformar tu alimentación",
      price: "$7.99",
      priceUnit: "USD/mes",
      upgradeCta: "MEJORAR AHORA",
      activePlan: "Plan activo",
      manageHint: "Gestiona desde Configuración > Apple ID > Suscripciones",
      freePlan: "Plan Gratuito",
      freeSubtitle: "Gratis para siempre",
      yourPlan: "Tu plan actual",
      renewsOn: "Tu suscripción se renueva el",
      restore: "Restaurar compras",
      restoring: "Restaurando...",
      cancelAnytime: "Cancela cuando quieras",
      legal: "El pago se cargará a tu cuenta de Apple al confirmar. La suscripción se renueva automáticamente.",
      terms: "Términos de uso",
      privacy: "Política de privacidad",
      rating: "4.8★ • +50k usuarios",
    },
    en: {
      title: "Your Plan",
      subtitle: "SUBSCRIPTION",
      recommended: "RECOMMENDED",
      cheflyPlus: "Chefly Plus",
      plusSubtitle: "Everything you need to transform your nutrition",
      price: "$7.99",
      priceUnit: "USD/month",
      upgradeCta: "UPGRADE NOW",
      activePlan: "Active plan",
      manageHint: "Manage from Settings > Apple ID > Subscriptions",
      freePlan: "Free Plan",
      freeSubtitle: "Free forever",
      yourPlan: "Your current plan",
      renewsOn: "Your subscription renews on",
      restore: "Restore purchases",
      restoring: "Restoring...",
      cancelAnytime: "Cancel anytime",
      legal: "Payment will be charged to your Apple account upon confirmation. Subscription auto-renews.",
      terms: "Terms of Use",
      privacy: "Privacy Policy",
      rating: "4.8★ • +50k users",
    },
  };

  const t = texts[language];

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-6">
      {/* Compact Header */}
      <div className="relative bg-gradient-to-br from-primary via-primary/80 to-secondary overflow-hidden">
        <div className="relative px-4 py-4">
          <div className="flex items-center justify-between">
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
                <h1 className="text-xl font-bold text-white">{t.title}</h1>
                <p className="text-white/70 text-xs uppercase tracking-wide">{t.subtitle}</p>
              </div>
            </div>
            
            {/* Social proof badge */}
            <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5">
              <Star className="h-3.5 w-3.5 text-yellow-300 fill-yellow-300" />
              <span className="text-xs font-semibold text-white">{t.rating}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Plans */}
      <div className="px-4 pt-6 space-y-4 max-w-lg mx-auto">
        {/* Chefly Plus Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Recommended Badge */}
          <div className="bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 rounded-t-2xl px-4 py-2.5">
            <span className="text-white font-bold text-sm uppercase tracking-wide flex items-center gap-2">
              <Crown className="h-4 w-4" />
              {t.recommended}
            </span>
          </div>

          <Card3D 
            variant="elevated" 
            hover={false}
            className={`rounded-t-none border-t-0 ${limits.isCheflyPlus ? "ring-2 ring-primary/30" : ""}`}
          >
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Plan name and badge */}
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-xl font-bold text-foreground">{t.cheflyPlus}</h3>
                    {limits.isCheflyPlus && (
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-semibold">
                        ✓ {language === "es" ? "Activo" : "Active"}
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm mb-4">{t.plusSubtitle}</p>

                  {/* Price */}
                  <div className="flex items-baseline gap-1 mb-5">
                    <span className="text-3xl font-bold text-foreground">{t.price}</span>
                    <span className="text-muted-foreground text-sm">{t.priceUnit}</span>
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
              <div className="mt-5">
                {limits.isCheflyPlus ? (
                  <div className="text-center py-3 bg-muted/50 rounded-xl">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
                      <Settings className="h-4 w-4" />
                      <span className="text-sm font-medium">{t.activePlan}</span>
                    </div>
                    <p className="text-xs text-muted-foreground px-4">{t.manageHint}</p>
                  </div>
                ) : (
                  <Button
                    onClick={handleSelectPlan}
                    variant="modern3d"
                    size="lg"
                    className="w-full h-12 text-base font-bold"
                  >
                    <Zap className="mr-2 h-5 w-5" />
                    {t.upgradeCta}
                  </Button>
                )}
              </div>
            </div>
          </Card3D>
        </motion.div>

        {/* Free Plan Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card3D variant="default" hover={false}>
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Gift className="h-5 w-5 text-amber-500" />
                    <h3 className="text-lg font-bold text-foreground">{t.freePlan}</h3>
                    {limits.isFreePlan && (
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">
                        {t.yourPlan}
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm mb-3">{t.freeSubtitle}</p>

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
            </div>
          </Card3D>
        </motion.div>

        {/* Subscription renewal info */}
        {subscription.subscribed && subscription.subscription_end && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-muted/50 rounded-2xl p-4 border border-border"
          >
            <p className="text-sm text-center text-muted-foreground">
              {t.renewsOn}{" "}
              <span className="font-semibold text-foreground">
                {new Date(subscription.subscription_end).toLocaleDateString(
                  language === "es" ? "es-MX" : "en-US",
                  { year: 'numeric', month: 'long', day: 'numeric' }
                )}
              </span>
            </p>
          </motion.div>
        )}

        {/* Cancel anytime badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-2 text-muted-foreground py-2"
        >
          <Shield className="h-4 w-4" />
          <span className="text-sm">{t.cancelAnytime}</span>
        </motion.div>

        {/* Restore purchases button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
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
                {t.restoring}
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                {t.restore}
              </>
            )}
          </Button>
        </motion.div>

        {/* Legal disclosure */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="space-y-3 pt-2"
        >
          <p className="text-[10px] text-muted-foreground text-center leading-relaxed px-2">
            {t.legal}
          </p>
          <div className="flex justify-center gap-4 text-[10px] text-muted-foreground">
            <a href="/terms" className="hover:underline">{t.terms}</a>
            <a href="/privacy" className="hover:underline">{t.privacy}</a>
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
