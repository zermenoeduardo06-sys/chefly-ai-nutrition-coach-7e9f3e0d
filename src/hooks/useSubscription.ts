import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionStatus {
  subscribed: boolean;
  product_id: string | null;
  subscription_end: string | null;
  isLoading: boolean;
}

// Chefly Plus es el único plan de pago
export const SUBSCRIPTION_TIERS = {
  CHEFLY_PLUS: {
    product_id: "prod_TUMZx1BcskL9rK",
    price_id: "price_1SXNqfRXGCRSzpK7WyaN4yij",
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
    
    if (status.product_id === SUBSCRIPTION_TIERS.CHEFLY_PLUS.product_id) {
      return SUBSCRIPTION_TIERS.CHEFLY_PLUS.name;
    }
    // Fallback for any other product
    return "Chefly Plus";
  };

  const isCheflyPlus = status.subscribed && status.product_id === SUBSCRIPTION_TIERS.CHEFLY_PLUS.product_id;

  return {
    ...status,
    checkSubscription,
    planName: getPlanName(),
    isCheflyPlus,
  };
};
