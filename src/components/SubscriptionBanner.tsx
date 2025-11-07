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
    calculateTrialDays();
  }, [userId, trialExpiresAt]);

  const loadSubscription = async () => {
    try {
      // Get active subscription
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

  if (!isTrialActive && !activePlan) return null;

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
                  {activePlan ? `Plan ${activePlan}` : "Periodo de Prueba"}
                </h3>
                {activePlan && (
                  <Badge variant="default" className="bg-primary">
                    Activo
                  </Badge>
                )}
              </div>
              
              {isTrialActive && daysRemaining !== null && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>
                    {daysRemaining > 0 
                      ? `${daysRemaining} ${daysRemaining === 1 ? "día restante" : "días restantes"} de prueba gratis`
                      : "Tu periodo de prueba ha expirado"
                    }
                  </span>
                </div>
              )}

              {!isTrialActive && activePlan && (
                <p className="text-sm text-muted-foreground">
                  Disfruta de todos los beneficios de tu plan
                </p>
              )}
            </div>
          </div>

          <Button 
            variant={isExpiringSoon ? "default" : "outline"}
            className={isExpiringSoon ? "bg-primary hover:bg-primary/90" : ""}
            onClick={() => navigate("/pricing")}
          >
            {activePlan ? "Cambiar plan" : "Ver planes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
