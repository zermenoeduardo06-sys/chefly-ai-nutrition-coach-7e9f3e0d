import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SUBSCRIPTION_TIERS } from "./useSubscription";

export interface SubscriptionLimits {
  canReplaceMeals: boolean;
  canSwapMeals: boolean;
  canGeneratePlans: boolean;
  dailyChatLimit: number;
  chatMessagesUsed: number;
  dailyFoodScanLimit: number;
  foodScansUsed: number;
  canScanFood: boolean;
  planName: string;
  isFreePlan: boolean;
  isCheflyPlus: boolean;
  isLoading: boolean;
}

const DEFAULT_LIMITS: SubscriptionLimits = {
  canReplaceMeals: false,
  canSwapMeals: false,
  canGeneratePlans: false,
  dailyChatLimit: 5,
  chatMessagesUsed: 0,
  dailyFoodScanLimit: 0,
  foodScansUsed: 0,
  canScanFood: false,
  planName: "Gratuito",
  isFreePlan: true,
  isCheflyPlus: false,
  isLoading: false,
};

const fetchSubscriptionLimits = async (userId: string): Promise<Omit<SubscriptionLimits, 'isLoading'>> => {
  // Check Stripe subscription first
  const { data: stripeData } = await supabase.functions.invoke("check-subscription");
  
  let planName = "Gratuito";
  let isCheflyPlus = false;
  let isFreePlan = true;
  
  if (stripeData?.subscribed && stripeData?.product_id) {
    // User has active Stripe subscription (Chefly Plus)
    planName = "Chefly Plus";
    isCheflyPlus = true;
    isFreePlan = false;
  }

  // Count chat messages used today
  const today = new Date().toISOString().split('T')[0];
  const { data: chatMessages } = await supabase
    .from("chat_messages")
    .select("id")
    .eq("user_id", userId)
    .eq("role", "user")
    .gte("created_at", today);

  const chatMessagesUsed = chatMessages?.length || 0;

  // Count food scans used today
  const { data: foodScans } = await supabase
    .from("food_scans")
    .select("id")
    .eq("user_id", userId)
    .gte("scanned_at", today);

  const foodScansUsed = foodScans?.length || 0;
  // Free users have 0 scans - scanning is a premium-only feature
  const dailyFoodScanLimit = isCheflyPlus ? 999 : 0;
  const canScanFood = isCheflyPlus;

  return {
    canReplaceMeals: isCheflyPlus,
    canSwapMeals: isCheflyPlus,
    canGeneratePlans: isCheflyPlus,
    dailyChatLimit: isFreePlan ? 5 : 999,
    chatMessagesUsed,
    dailyFoodScanLimit,
    foodScansUsed,
    canScanFood,
    planName,
    isFreePlan,
    isCheflyPlus,
  };
};

export const useSubscriptionLimits = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["subscriptionLimits", userId],
    queryFn: () => fetchSubscriptionLimits(userId!),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 min
    gcTime: 5 * 60 * 1000, // 5 min
  });

  const refreshLimits = () => {
    queryClient.invalidateQueries({ queryKey: ["subscriptionLimits", userId] });
  };

  const limits: SubscriptionLimits = {
    ...(query.data ?? {
      canReplaceMeals: false,
      canSwapMeals: false,
      canGeneratePlans: false,
      dailyChatLimit: 5,
      chatMessagesUsed: 0,
      dailyFoodScanLimit: 0,
      foodScansUsed: 0,
      canScanFood: false,
      planName: "Gratuito",
      isFreePlan: true,
      isCheflyPlus: false,
    }),
    isLoading: query.isLoading,
  };

  return { limits, refreshLimits };
};
