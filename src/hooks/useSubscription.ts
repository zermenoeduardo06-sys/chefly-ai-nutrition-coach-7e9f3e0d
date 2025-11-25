import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionStatus {
  subscribed: boolean;
  product_id: string | null;
  subscription_end: string | null;
  isLoading: boolean;
}

// Mapeo de product IDs a nombres de planes
export const SUBSCRIPTION_TIERS = {
  BASIC: {
    product_id: "prod_TO2fjEwGT0uZws",
    price_id: "price_1SRGa3RXGCRSzpK7yJ0D6pIq",
    name: "Básico",
    price: 240,
  },
  INTERMEDIATE: {
    product_id: "prod_TO2fq5FTwt27xw",
    price_id: "price_1SRGaLRXGCRSzpK79WCV1y1M",
    name: "Intermedio",
    price: 290,
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
