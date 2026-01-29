import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Crown, Gift, Zap, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card3D } from "@/components/ui/card-3d";
import { Icon3D } from "@/components/ui/icon-3d";
import { motion } from "framer-motion";

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

  // Chefly Plus subscriber banner
  if (isCheflyPlus) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card3D variant="elevated" hover={false} className="mb-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10" />
          <div className="relative p-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <Icon3D icon={Crown} color="primary" size="lg" />
                
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold text-foreground">Chefly Plus</h3>
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-semibold">
                      {language === "es" ? "Activo" : "Active"}
                    </span>
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
                className="shrink-0"
              >
                {language === "es" ? "Gestionar" : "Manage"}
              </Button>
            </div>
          </div>
        </Card3D>
      </motion.div>
    );
  }

  // Free plan banner with upgrade CTA
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card3D variant="glass" hover={false} className="mb-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5" />
        <div className="relative p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Icon3D icon={Gift} color="secondary" size="lg" />
              
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-bold text-foreground">
                    {language === "es" ? "Plan Gratuito" : "Free Plan"}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {language === "es" 
                    ? "Mejora para desbloquear todo"
                    : "Upgrade to unlock everything"
                  }
                </p>
              </div>
            </div>

            <Button 
              onClick={() => navigate("/subscription")}
              variant="modern3d"
              className="shrink-0 gap-2"
            >
              <Zap className="h-4 w-4" />
              {language === "es" ? "Mejorar" : "Upgrade"}
            </Button>
          </div>
        </div>
      </Card3D>
    </motion.div>
  );
};
