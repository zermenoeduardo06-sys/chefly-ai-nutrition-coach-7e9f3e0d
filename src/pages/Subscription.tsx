import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Check, Zap, Gift, RefreshCw, Settings, Star, Crown } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { Card3D } from "@/components/ui/card-3d";
import mascotCelebrating from "@/assets/mascot-celebrating.png";
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

  const texts = {
    es: {
      title: "Elige tu plan",
      rating: "4.8★ App Store",
      recommended: "LO MÁS POPULAR",
      plusName: "Chefly Plus",
      plusSubtitle: "Todo lo que necesitas para tu meta",
      plusPrice: "$7.99",
      plusPeriod: "/mes",
      freeName: "Plan Gratuito",
      freeSubtitle: "Comienza tu viaje",
      freePrice: "GRATIS",
      yourPlan: "Tu plan",
      activePlan: "Plan activo",
      manageNote: "Gestiona desde Configuración > Apple ID > Suscripciones",
      upgrade: "MEJORAR A CHEFLY PLUS",
      restore: "Restaurar compras",
      cancelAnytime: "Cancela cuando quieras",
      renewsOn: "Tu suscripción se renueva el",
      plusFeatures: [
        "Planes frescos cada semana",
        "Escanea cualquier platillo",
        "Tu nutriólogo 24/7",
        "Cambia comidas cuando quieras",
      ],
      freeFeatures: [
        "Ver plan semanal",
        "Marcar comidas completadas",
        "Seguimiento de progreso",
      ],
    },
    en: {
      title: "Choose your plan",
      rating: "4.8★ App Store",
      recommended: "MOST POPULAR",
      plusName: "Chefly Plus",
      plusSubtitle: "Everything you need for your goal",
      plusPrice: "$7.99",
      plusPeriod: "/month",
      freeName: "Free Plan",
      freeSubtitle: "Start your journey",
      freePrice: "FREE",
      yourPlan: "Your plan",
      activePlan: "Active plan",
      manageNote: "Manage from Settings > Apple ID > Subscriptions",
      upgrade: "UPGRADE TO CHEFLY PLUS",
      restore: "Restore purchases",
      cancelAnytime: "Cancel anytime",
      renewsOn: "Your subscription renews on",
      plusFeatures: [
        "Fresh plans every week",
        "Scan any dish",
        "Your 24/7 nutritionist",
        "Swap meals anytime",
      ],
      freeFeatures: [
        "View weekly plan",
        "Mark completed meals",
        "Progress tracking",
      ],
    },
  };

  const t = texts[language];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 bg-gradient-to-br from-primary/20 via-primary/10 to-background px-4 py-4 safe-area-top">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate("/dashboard")}
              className="text-foreground hover:bg-muted h-9 w-9"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">
              {language === "es" ? "Suscripción" : "Subscription"}
            </h1>
          </div>
          
          {/* Rating Badge */}
          <div className="flex items-center gap-1.5 bg-card/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border">
            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
            <span className="text-sm font-medium text-foreground">{t.rating}</span>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-40">
        <div className="max-w-lg mx-auto space-y-4">
          {/* Hero with Mascot */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-4 mb-6"
          >
            <img 
              src={mascotCelebrating} 
              alt="Chefly" 
              className="h-20 w-20 object-contain"
            />
            <div>
              <h2 className="text-lg font-bold text-foreground">{t.title}</h2>
              <p className="text-sm text-muted-foreground">Chefly</p>
            </div>
          </motion.div>

          {/* Plus Plan Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* Recommended Badge */}
            <div className="bg-gradient-to-r from-primary to-secondary rounded-t-2xl px-4 py-2.5">
              <span className="text-white font-bold text-sm flex items-center gap-2">
                <Zap className="h-4 w-4" />
                {t.recommended}
              </span>
            </div>
            
            <Card3D 
              variant="elevated" 
              hover={false}
              className={`rounded-t-none border-t-0 ${limits.isCheflyPlus ? "ring-2 ring-primary/30" : ""}`}
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
                        <Crown className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground">{t.plusName}</h3>
                      {limits.isCheflyPlus && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-semibold">
                          {t.yourPlan}
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm">{t.plusSubtitle}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-foreground">{t.plusPrice}</span>
                    <span className="text-sm text-muted-foreground">{t.plusPeriod}</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-2.5 mb-4">
                  {t.plusFeatures.map((feature, i) => (
                    <motion.li 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.05 }}
                      className="flex items-center gap-2.5"
                    >
                      <div className="p-0.5 rounded-full bg-gradient-to-r from-primary to-secondary">
                        <Check className="h-3.5 w-3.5 text-white" />
                      </div>
                      <span className="text-sm font-medium text-foreground">{feature}</span>
                    </motion.li>
                  ))}
                </ul>

                {/* CTA or Active status */}
                {limits.isCheflyPlus ? (
                  <div className="text-center py-3 bg-muted/50 rounded-xl">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
                      <Settings className="h-4 w-4" />
                      <span className="text-sm font-medium">{t.activePlan}</span>
                    </div>
                    <p className="text-xs text-muted-foreground px-4">{t.manageNote}</p>
                  </div>
                ) : (
                  <Button
                    onClick={handleSelectPlan}
                    variant="modern3d"
                    size="lg"
                    className="w-full"
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    {t.upgrade}
                  </Button>
                )}
              </div>
            </Card3D>
          </motion.div>

          {/* Free Plan Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card3D 
              variant="default" 
              hover={false}
              className={limits.isFreePlan ? "ring-2 ring-muted/50" : ""}
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <div className="p-2 rounded-xl bg-muted/50">
                        <Gift className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground">{t.freeName}</h3>
                      {limits.isFreePlan && (
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-semibold">
                          {t.yourPlan}
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm">{t.freeSubtitle}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-foreground">{t.freePrice}</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-2">
                  {t.freeFeatures.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2.5">
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

          {/* Renewal info */}
          {subscription.subscribed && subscription.subscription_end && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
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
        </div>
      </div>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border p-4 pb-safe">
        <div className="max-w-lg mx-auto space-y-3">
          <p className="text-center text-sm text-muted-foreground">
            ✓ {t.cancelAnytime}
          </p>
          
          {!limits.isCheflyPlus && (
            <Button
              onClick={handleSelectPlan}
              variant="modern3d"
              size="xl"
              className="w-full"
            >
              <Zap className="mr-2 h-5 w-5" />
              {t.upgrade}
            </Button>
          )}
          
          <button
            onClick={handleRestorePurchases}
            disabled={isRestoring}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2 disabled:opacity-50"
          >
            {isRestoring ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {language === "es" ? "Restaurando..." : "Restoring..."}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <RefreshCw className="h-4 w-4" />
                {t.restore}
              </span>
            )}
          </button>
        </div>
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
