import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionData {
  subscribed: boolean;
  product_id: string | null;
  subscription_end: string | null;
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

const fetchSubscription = async (): Promise<SubscriptionData> => {
  const { data, error } = await supabase.functions.invoke("check-subscription");

  if (error) {
    console.error("Error checking subscription:", error);
    return {
      subscribed: false,
      product_id: null,
      subscription_end: null,
      plan: "free",
    };
  }

  return {
    subscribed: data?.subscribed || false,
    product_id: data?.product_id || null,
    subscription_end: data?.subscription_end || null,
    plan: data?.plan || "free",
  };
};

export const useSubscription = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["subscription", userId],
    queryFn: fetchSubscription,
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 min - no refetch on navigation
    gcTime: 10 * 60 * 1000, // 10 min garbage collection
  });

  const getPlanName = () => {
    if (!query.data?.subscribed) return null;
    return SUBSCRIPTION_TIERS.CHEFLY_PLUS.name;
  };

  const checkSubscription = async () => {
    await queryClient.invalidateQueries({ queryKey: ["subscription", userId] });
  };

  return {
    subscribed: query.data?.subscribed ?? false,
    product_id: query.data?.product_id ?? null,
    subscription_end: query.data?.subscription_end ?? null,
    plan: query.data?.plan ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    checkSubscription,
    planName: getPlanName(),
    isCheflyPlus: query.data?.subscribed ?? false,
  };
};
