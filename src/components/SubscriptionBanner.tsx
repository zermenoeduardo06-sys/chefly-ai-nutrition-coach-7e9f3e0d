import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Gift, Zap } from "lucide-react";
import { SUBSCRIPTION_TIERS } from "@/hooks/useSubscription";
import { useLanguage } from "@/contexts/LanguageContext";

interface SubscriptionBannerProps {
  userId: string;
}

export const SubscriptionBanner = ({ userId }: SubscriptionBannerProps) => {
  const [isCheflyPlus, setIsCheflyPlus] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { language } = useLanguage();

  useEffect(() => {
    loadSubscription();
  }, [userId]);

  const loadSubscription = async () => {
    try {
      // Check Stripe subscription
      const { data: stripeData } = await supabase.functions.invoke("check-subscription");
      
      if (stripeData?.subscribed && stripeData?.product_id) {
        setIsCheflyPlus(true);
      } else {
        setIsCheflyPlus(false);
      }
    } catch (error) {
      console.error("Error loading subscription:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return null;

  // Chefly Plus subscriber banner
  if (isCheflyPlus) {
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
                  <h3 className="text-xl font-semibold">Chefly Plus</h3>
                  <Badge variant="default" className="bg-primary">
                    {language === "es" ? "Activo" : "Active"}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {language === "es" 
                    ? "Disfruta de todos los beneficios premium"
                    : "Enjoy all premium benefits"
                  }
                </p>
              </div>
            </div>

            <Button 
              variant="outline"
              onClick={() => navigate("/subscription")}
            >
              {language === "es" ? "Gestionar plan" : "Manage plan"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Free plan banner with upgrade CTA
  return (
    <Card className="mb-6 border-2 border-border bg-gradient-to-r from-muted/50 to-muted/30">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Gift className="h-6 w-6 text-primary" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-xl font-semibold">
                  {language === "es" ? "Plan Gratuito" : "Free Plan"}
                </h3>
                <Badge variant="secondary" className="bg-secondary/20 text-secondary-foreground">
                  {language === "es" ? "Gratis" : "Free"}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground">
                {language === "es" 
                  ? "Mejora a Chefly Plus para desbloquear todas las funciones"
                  : "Upgrade to Chefly Plus to unlock all features"
                }
              </p>
            </div>
          </div>

          <Button 
            onClick={() => navigate("/pricing")}
            className="gap-2"
          >
            <Zap className="h-4 w-4" />
            {language === "es" ? "Mejorar plan" : "Upgrade"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
