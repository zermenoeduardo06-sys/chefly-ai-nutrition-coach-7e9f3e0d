import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SUBSCRIPTION_TIERS } from "./useSubscription";

export interface SubscriptionLimits {
  canReplaceMeals: boolean;
  canSwapMeals: boolean;
  canGeneratePlans: boolean;
  dailyChatLimit: number;
  chatMessagesUsed: number;
  planName: string;
  isFreePlan: boolean;
  isCheflyPlus: boolean;
  isLoading: boolean;
}

export const useSubscriptionLimits = (userId: string | undefined) => {
  const [limits, setLimits] = useState<SubscriptionLimits>({
    canReplaceMeals: false,
    canSwapMeals: false,
    canGeneratePlans: false,
    dailyChatLimit: 5,
    chatMessagesUsed: 0,
    planName: "Gratuito",
    isFreePlan: true,
    isCheflyPlus: false,
    isLoading: true,
  });

  useEffect(() => {
    if (!userId) return;
    loadSubscriptionLimits();
  }, [userId]);

  const loadSubscriptionLimits = async () => {
    if (!userId) return;

    try {
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

      setLimits({
        canReplaceMeals: isCheflyPlus,
        canSwapMeals: isCheflyPlus,
        canGeneratePlans: isCheflyPlus,
        dailyChatLimit: isFreePlan ? 5 : 999,
        chatMessagesUsed,
        planName,
        isFreePlan,
        isCheflyPlus,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error loading subscription limits:", error);
      // Default to free plan on error
      setLimits({
        canReplaceMeals: false,
        canSwapMeals: false,
        canGeneratePlans: false,
        dailyChatLimit: 5,
        chatMessagesUsed: 0,
        planName: "Gratuito",
        isFreePlan: true,
        isCheflyPlus: false,
        isLoading: false,
      });
    }
  };

  const refreshLimits = () => {
    loadSubscriptionLimits();
  };

  return { limits, refreshLimits };
};
