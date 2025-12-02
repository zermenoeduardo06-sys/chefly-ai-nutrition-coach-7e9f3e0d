import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SUBSCRIPTION_TIERS } from "@/hooks/useSubscription";
import { useLanguage } from "@/contexts/LanguageContext";

interface SubscriptionPlan {
  id: string;
  name: string;
  nameEn: string;
  price_mxn: number;
  billing_period: string;
  features: string[];
  featuresEn: string[];
  display_order: number;
  coming_soon?: boolean;
  is_active: boolean;
  stripe_price_id?: string;
}

const Pricing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  // Planes directamente desde la configuración de Stripe
  const plans: SubscriptionPlan[] = [
    {
      id: "basic",
      name: "Básico",
      nameEn: "Basic",
      price_mxn: SUBSCRIPTION_TIERS.BASIC.price,
      billing_period: "monthly",
      features: [
        "Plan de comidas semanal personalizado",
        "Seguimiento de calorías y macros",
        "Acceso a recetas básicas",
        "Chat con IA (5 mensajes/día)",
      ],
      featuresEn: [
        "Personalized weekly meal plan",
        "Calorie and macro tracking",
        "Access to basic recipes",
        "AI Chat (5 messages/day)",
      ],
      display_order: 1,
      is_active: true,
      stripe_price_id: SUBSCRIPTION_TIERS.BASIC.price_id,
    },
    {
      id: "intermediate",
      name: "Intermedio",
      nameEn: "Intermediate",
      price_mxn: SUBSCRIPTION_TIERS.INTERMEDIATE.price,
      billing_period: "monthly",
      features: [
        "Todo lo del plan Básico",
        "Planes de comidas diarios ilimitados",
        "Recetas premium y variadas",
        "Chat con IA ilimitado",
        "Lista de compras automática",
        "Seguimiento de progreso avanzado",
        "Desafíos diarios ilimitados",
      ],
      featuresEn: [
        "Everything in Basic plan",
        "Unlimited daily meal plans",
        "Premium and varied recipes",
        "Unlimited AI Chat",
        "Automatic shopping list",
        "Advanced progress tracking",
        "Unlimited daily challenges",
      ],
      display_order: 2,
      is_active: true,
      stripe_price_id: SUBSCRIPTION_TIERS.INTERMEDIATE.price_id,
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

      // Capturar código de afiliado y referido de Endorsely
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
        // En móvil, redirigir en la misma ventana para mejor UX
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
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t("pricing.pageTitle")}
          </h1>
          <p className="text-xl text-muted-foreground">
            {t("pricing.pageSubtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={plan.id}
              className={`relative flex flex-col ${
                index === 1 ? "border-primary shadow-lg scale-105" : ""
              }`}
            >
              {index === 1 && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  {t("pricing.mostPopular")}
                </Badge>
              )}
              
              <CardHeader>
                <CardTitle className="text-2xl">{language === "es" ? plan.name : plan.nameEn}</CardTitle>
                <CardDescription>
                  <span className="text-4xl font-bold text-foreground">
                    ${Math.round(plan.price_mxn / 20)}
                  </span>
                  <span className="text-muted-foreground"> USD/{t("pricing.month")}</span>
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {(language === "es" ? plan.features : plan.featuresEn).map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  variant={index === 1 ? "default" : "outline"}
                  onClick={() => handleSelectPlan(plan)}
                  disabled={checkoutLoading === plan.id}
                >
                  {checkoutLoading === plan.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("pricing.processing")}
                    </>
                  ) : (
                    t("pricing.selectPlan")
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>{t("pricing.allPlansInclude")}</p>
          <p className="mt-2">{t("pricing.cancelAnytime")}</p>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
