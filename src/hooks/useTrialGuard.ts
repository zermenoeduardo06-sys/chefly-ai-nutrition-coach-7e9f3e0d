import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useTrialGuard = () => {
  const [isBlocked, setIsBlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkTrialStatus();
  }, []);

  const checkTrialStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Get profile data
      const { data: profile } = await supabase
        .from("profiles")
        .select("trial_expires_at, is_subscribed")
        .eq("id", user.id)
        .single();

      if (!profile) {
        setIsLoading(false);
        return;
      }

      const trialExpired = new Date(profile.trial_expires_at) < new Date();
      const hasActiveSubscription = profile.is_subscribed;

      // If trial expired and no active subscription, verify with Stripe
      if (trialExpired && !hasActiveSubscription) {
        const { data: subData } = await supabase.functions.invoke("check-subscription");
        
        if (!subData?.subscribed) {
          // Block access - redirect to pricing
          setIsBlocked(true);
          toast({
            title: "Acceso bloqueado",
            description: "Tu periodo de prueba ha expirado. Suscríbete para continuar usando la app.",
            variant: "destructive",
          });
          navigate("/pricing");
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error checking trial status:", error);
      setIsLoading(false);
    }
  };

  return { isBlocked, isLoading };
};
