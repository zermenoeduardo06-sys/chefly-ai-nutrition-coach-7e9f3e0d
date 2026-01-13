import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionStatus {
  subscribed: boolean;
  product_id: string | null;
  subscription_end: string | null;
  isLoading: boolean;
  plan: string | null;
}

// Apple IAP Product IDs (RevenueCat)
export const SUBSCRIPTION_TIERS = {
  CHEFLY_PLUS: {
    product_id: "chefly_plus_monthly_",
    name: "Chefly Plus",
    price: 150, // ~7.99 USD
  },
};

export const useSubscription = (userId: string | undefined) => {
  const [status, setStatus] = useState<SubscriptionStatus>({
    subscribed: false,
    product_id: null,
    subscription_end: null,
    isLoading: true,
    plan: null,
  });

  const checkSubscription = async () => {
    if (!userId) {
      setStatus(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      setStatus(prev => ({ ...prev, isLoading: true }));
      
      const { data, error } = await supabase.functions.invoke("check-subscription");

      if (error) {
        console.error("Error checking subscription:", error);
        setStatus({
          subscribed: false,
          product_id: null,
          subscription_end: null,
          isLoading: false,
          plan: "free",
        });
        return;
      }

      setStatus({
        subscribed: data.subscribed || false,
        product_id: data.product_id || null,
        subscription_end: data.subscription_end || null,
        isLoading: false,
        plan: data.plan || "free",
      });
    } catch (error) {
      console.error("Error in checkSubscription:", error);
      setStatus({
        subscribed: false,
        product_id: null,
        subscription_end: null,
        isLoading: false,
        plan: "free",
      });
    }
  };

  useEffect(() => {
    checkSubscription();
  }, [userId]);

  const getPlanName = () => {
    if (!status.subscribed) return null;
    return SUBSCRIPTION_TIERS.CHEFLY_PLUS.name;
  };

  const isCheflyPlus = status.subscribed;

  return {
    ...status,
    checkSubscription,
    planName: getPlanName(),
    isCheflyPlus,
  };
};
