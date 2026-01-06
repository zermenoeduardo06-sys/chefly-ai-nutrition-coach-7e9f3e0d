import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionStatus {
  subscribed: boolean;
  product_id: string | null;
  subscription_end: string | null;
  isLoading: boolean;
  plan: string | null;
  is_chefly_family: boolean;
  is_family_owner: boolean;
  is_family_member: boolean;
  family_id: string | null;
  family_name: string | null;
  has_family: boolean;
}

// Subscription tiers
export const SUBSCRIPTION_TIERS = {
  CHEFLY_PLUS: {
    product_id: "prod_TUMZx1BcskL9rK",
    price_id: "price_1SXNqfRXGCRSzpK7WyaN4yij",
    name: "Chefly Plus",
    price: 150, // ~7.99 USD
  },
  CHEFLY_FAMILY: {
    product_id: "prod_Te9zehdPjvu5Yg",
    price_id: "price_1SgrfqRXGCRSzpK7qigQi8y0",
    name: "Chefly Familiar",
    price: 400, // ~20 USD
    maxMembers: 5,
  },
};

export const useSubscription = (userId: string | undefined) => {
  const [status, setStatus] = useState<SubscriptionStatus>({
    subscribed: false,
    product_id: null,
    subscription_end: null,
    isLoading: true,
    plan: null,
    is_chefly_family: false,
    is_family_owner: false,
    is_family_member: false,
    family_id: null,
    family_name: null,
    has_family: false,
  });

  const checkSubscription = async () => {
    if (!userId) {
      setStatus(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      setStatus(prev => ({ ...prev, isLoading: true }));
      
      // First check the profiles table for Apple IAP subscriptions
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_subscribed')
        .eq('id', userId)
        .single();
      
      // If is_subscribed is true in profiles (from Apple IAP), use that
      if (profile?.is_subscribed) {
        console.log('[Subscription] User is subscribed via Apple IAP');
        setStatus({
          subscribed: true,
          product_id: SUBSCRIPTION_TIERS.CHEFLY_PLUS.product_id, // Default to Plus for IAP
          subscription_end: null, // IAP doesn't provide this easily
          isLoading: false,
          plan: "chefly_plus",
          is_chefly_family: false,
          is_family_owner: false,
          is_family_member: false,
          family_id: null,
          family_name: null,
          has_family: false,
        });
        return;
      }
      
      // Otherwise check Stripe subscription
      const { data, error } = await supabase.functions.invoke("check-subscription");

      if (error) {
        console.error("Error checking subscription:", error);
        setStatus({
          subscribed: false,
          product_id: null,
          subscription_end: null,
          isLoading: false,
          plan: "free",
          is_chefly_family: false,
          is_family_owner: false,
          is_family_member: false,
          family_id: null,
          family_name: null,
          has_family: false,
        });
        return;
      }

      setStatus({
        subscribed: data.subscribed || false,
        product_id: data.product_id || null,
        subscription_end: data.subscription_end || null,
        isLoading: false,
        plan: data.plan || "free",
        is_chefly_family: data.is_chefly_family || false,
        is_family_owner: data.is_family_owner || false,
        is_family_member: data.is_family_member || false,
        family_id: data.family_id || null,
        family_name: data.family_name || null,
        has_family: data.has_family || false,
      });
    } catch (error) {
      console.error("Error in checkSubscription:", error);
      setStatus({
        subscribed: false,
        product_id: null,
        subscription_end: null,
        isLoading: false,
        plan: "free",
        is_chefly_family: false,
        is_family_owner: false,
        is_family_member: false,
        family_id: null,
        family_name: null,
        has_family: false,
      });
    }
  };

  useEffect(() => {
    checkSubscription();
  }, [userId]);

  const getPlanName = () => {
    if (!status.product_id) return null;
    
    if (status.product_id === SUBSCRIPTION_TIERS.CHEFLY_FAMILY.product_id) {
      return SUBSCRIPTION_TIERS.CHEFLY_FAMILY.name;
    }
    if (status.product_id === SUBSCRIPTION_TIERS.CHEFLY_PLUS.product_id) {
      return SUBSCRIPTION_TIERS.CHEFLY_PLUS.name;
    }
    return "Chefly Plus";
  };

  const isCheflyPlus = status.subscribed && (
    status.product_id === SUBSCRIPTION_TIERS.CHEFLY_PLUS.product_id ||
    status.product_id === SUBSCRIPTION_TIERS.CHEFLY_FAMILY.product_id
  );

  const isCheflyFamily = status.subscribed && status.product_id === SUBSCRIPTION_TIERS.CHEFLY_FAMILY.product_id;

  return {
    ...status,
    checkSubscription,
    planName: getPlanName(),
    isCheflyPlus,
    isCheflyFamily,
  };
};
