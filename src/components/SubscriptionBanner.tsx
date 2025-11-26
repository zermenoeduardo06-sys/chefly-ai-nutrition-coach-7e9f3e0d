import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Crown, Sparkles } from "lucide-react";

interface SubscriptionBannerProps {
  userId: string;
  trialExpiresAt?: string;
}

export const SubscriptionBanner = ({ userId, trialExpiresAt }: SubscriptionBannerProps) => {
  const [activePlan, setActivePlan] = useState<string | null>(null);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [isTrialActive, setIsTrialActive] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadSubscription();
    if (!activePlan) {
      calculateTrialDays();
    }
  }, [userId, trialExpiresAt, activePlan]);

  const loadSubscription = async () => {
    try {
      // Check Stripe subscription
      const { data: stripeData } = await supabase.functions.invoke("check-subscription");
      
      if (stripeData?.subscribed && stripeData?.product_id) {
        // User has active Stripe subscription
        setActivePlan("Intermedio"); // Default to Intermedio for paid plans
        setIsTrialActive(false);
        return;
      }

      // If no Stripe subscription, check database subscriptions
      const { data: subscription } = await supabase
        .from("user_subscriptions")
        .select(`
          *,
          plan:subscription_plans(name)
        `)
        .eq("user_id", userId)
        .eq("status", "active")
        .single();

      if (subscription && subscription.plan) {
        setActivePlan(subscription.plan.name);
        setIsTrialActive(false);
      }
    } catch (error) {
      console.error("Error loading subscription:", error);
    }
  };

  const calculateTrialDays = () => {
    if (!trialExpiresAt) return;

    const expiryDate = new Date(trialExpiresAt);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    setDaysRemaining(diffDays > 0 ? diffDays : 0);
  };

  // Don't show banner if user has active paid plan
  if (activePlan) {
    return (
      <Card className="mb-6 border-2 border-primary bg-gradient-to-r from-primary/10 to-secondary/10">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-primary/20">
                <Crown className="h-6 w-6 text-primary" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-xl font-semibold">
                    Plan {activePlan}
                  </h3>
                  <Badge variant="default" className="bg-primary">
                    Activo
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Disfruta de todos los beneficios de tu plan
                </p>
              </div>
            </div>

            <Button 
              variant="outline"
              onClick={() => navigate("/subscription")}
            >
              Gestionar plan
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show trial banner only if no active plan
  if (!isTrialActive) return null;

  const isExpiringSoon = daysRemaining !== null && daysRemaining <= 1;

  return (
    <Card className={`mb-6 border-2 ${
      isExpiringSoon 
        ? "border-destructive bg-destructive/5" 
        : "border-primary bg-gradient-to-r from-primary/10 to-secondary/10"
    }`}>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full ${
              isExpiringSoon ? "bg-destructive/20" : "bg-primary/20"
            }`}>
              {activePlan ? (
                <Crown className="h-6 w-6 text-primary" />
              ) : (
                <Sparkles className="h-6 w-6 text-primary" />
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-xl font-semibold">
                  {activePlan ? `Plan ${activePlan}` : "Periodo de Prueba Gratis"}
                </h3>
                {!activePlan && (
                  <Badge variant="secondary" className="bg-primary/20 text-primary">
                    Prueba Activa
                  </Badge>
                )}
              </div>
              
              {isTrialActive && daysRemaining !== null && (
                <>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      {daysRemaining > 0 
                        ? `${daysRemaining} ${daysRemaining === 1 ? "día restante" : "días restantes"} de prueba gratis`
                        : "Tu periodo de prueba ha expirado"
                      }
                    </span>
                  </div>
                  {daysRemaining > 0 && (
                    <p className="text-sm text-muted-foreground">
                      💡 Puedes suscribirte ahora y disfrutar de todos los beneficios premium
                    </p>
                  )}
                </>
              )}

              {!isTrialActive && activePlan && (
                <p className="text-sm text-muted-foreground">
                  Disfruta de todos los beneficios de tu plan
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant={isExpiringSoon ? "default" : "outline"}
              className={isExpiringSoon ? "bg-primary hover:bg-primary/90" : ""}
              onClick={() => navigate("/pricing")}
            >
              {daysRemaining && daysRemaining > 0 ? "Suscribirme ahora" : "Ver planes"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
