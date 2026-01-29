import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Crown, Gift, Zap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card3D } from "@/components/ui/card-3d";
import { Icon3D } from "@/components/ui/icon-3d";

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

  const texts = {
    es: {
      plusTitle: "Chefly Plus",
      plusActive: "Activo",
      plusSubtitle: "Disfruta de todos los beneficios premium",
      managePlan: "Gestionar plan",
      freeTitle: "Plan Gratuito",
      freeBadge: "Gratis",
      freeSubtitle: "Mejora para desbloquear todas las funciones",
      upgrade: "Mejorar",
    },
    en: {
      plusTitle: "Chefly Plus",
      plusActive: "Active",
      plusSubtitle: "Enjoy all premium benefits",
      managePlan: "Manage plan",
      freeTitle: "Free Plan",
      freeBadge: "Free",
      freeSubtitle: "Upgrade to unlock all features",
      upgrade: "Upgrade",
    },
  };

  const t = texts[language];

  // Chefly Plus subscriber banner
  if (isCheflyPlus) {
    return (
      <Card3D variant="elevated" className="mb-6">
        <div className="p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <Icon3D icon={Crown} color="primary" size="lg" />
              
              <div className="space-y-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-lg font-bold text-foreground">{t.plusTitle}</h3>
                  <span className="text-xs bg-primary text-primary-foreground px-2.5 py-1 rounded-full font-semibold">
                    {t.plusActive}
                  </span>
                </div>
                
                <p className="text-sm text-muted-foreground">{t.plusSubtitle}</p>
              </div>
            </div>

            <Button 
              variant="outline"
              onClick={() => navigate("/subscription")}
              className="shrink-0"
            >
              {t.managePlan}
            </Button>
          </div>
        </div>
      </Card3D>
    );
  }

  // Free plan banner with upgrade CTA
  return (
    <Card3D variant="glass" className="mb-6">
      <div className="p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <Icon3D icon={Gift} color="amber" size="lg" />
            
            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-lg font-bold text-foreground">{t.freeTitle}</h3>
                <span className="text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-full font-medium">
                  {t.freeBadge}
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground">{t.freeSubtitle}</p>
            </div>
          </div>

          <Button 
            onClick={() => navigate("/pricing")}
            variant="modern3d"
            className="shrink-0 gap-2"
          >
            <Zap className="h-4 w-4" />
            {t.upgrade}
          </Button>
        </div>
      </div>
    </Card3D>
  );
};
