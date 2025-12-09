import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionStatus {
  subscribed: boolean;
  product_id: string | null;
  subscription_end: string | null;
  isLoading: boolean;
}

// Mapeo de product IDs a nombres de planes
// BASIC = Plan Básico en Stripe (240 MXN / ~$12 USD)
// INTERMEDIATE = Plan Intermedio en Stripe (600 MXN / ~$30 USD)
export const SUBSCRIPTION_TIERS = {
  BASIC: {
    product_id: "prod_TUMZMM3fEINWI3",
    price_id: "price_1SXNqRRXGCRSzpK73nntP57D",
    name: "Básico",
    price: 240, // ~12 USD
  },
  INTERMEDIATE: {
    product_id: "prod_TUMZx1BcskL9rK",
    price_id: "price_1SXNqfRXGCRSzpK7WyaN4yij",
    name: "Intermedio",
    price: 600, // ~30 USD
  },
};

export const useSubscription = (userId: string | undefined) => {
  const [status, setStatus] = useState<SubscriptionStatus>({
    subscribed: false,
    product_id: null,
    subscription_end: null,
    isLoading: true,
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
        });
        return;
      }

      setStatus({
        subscribed: data.subscribed || false,
        product_id: data.product_id || null,
        subscription_end: data.subscription_end || null,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error in checkSubscription:", error);
      setStatus({
        subscribed: false,
        product_id: null,
        subscription_end: null,
        isLoading: false,
      });
    }
  };

  useEffect(() => {
    checkSubscription();
  }, [userId]);

  const getPlanName = () => {
    if (!status.product_id) return null;
    
    if (status.product_id === SUBSCRIPTION_TIERS.BASIC.product_id) {
      return SUBSCRIPTION_TIERS.BASIC.name;
    }
    if (status.product_id === SUBSCRIPTION_TIERS.INTERMEDIATE.product_id) {
      return SUBSCRIPTION_TIERS.INTERMEDIATE.name;
    }
    return null;
  };

  return {
    ...status,
    checkSubscription,
    planName: getPlanName(),
  };
};
