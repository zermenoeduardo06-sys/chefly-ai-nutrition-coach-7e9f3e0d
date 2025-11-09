import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SubscriptionLimits {
  canReplaceMeals: boolean;
  canSwapMeals: boolean;
  canGeneratePlans: boolean;
  dailyChatLimit: number;
  chatMessagesUsed: number;
  planName: string;
  isBasicPlan: boolean;
  isLoading: boolean;
}

export const useSubscriptionLimits = (userId: string | undefined) => {
  const [limits, setLimits] = useState<SubscriptionLimits>({
    canReplaceMeals: false,
    canSwapMeals: false,
    canGeneratePlans: false,
    dailyChatLimit: 0,
    chatMessagesUsed: 0,
    planName: "",
    isBasicPlan: true,
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
      
      let planName = "None";
      let isIntermediatePlan = false;
      let isBasicPlan = true;
      
      if (stripeData?.subscribed && stripeData?.product_id) {
        // User has active Stripe subscription
        planName = "Intermedio";
        isIntermediatePlan = true;
        isBasicPlan = false;
      } else {
        // Check database subscription and trial
        const { data: subscription } = await supabase
          .from("user_subscriptions")
          .select(`
            *,
            plan:subscription_plans(name, id)
          `)
          .eq("user_id", userId)
          .eq("status", "active")
          .single();

        const { data: profile } = await supabase
          .from("profiles")
          .select("trial_expires_at, is_subscribed")
          .eq("id", userId)
          .single();

        const hasActiveTrial = profile && new Date(profile.trial_expires_at) > new Date();
        const isSubscribed = profile?.is_subscribed || false;
        
        planName = subscription?.plan?.name || (hasActiveTrial ? "Trial" : "None");
        isBasicPlan = planName === "Básico" || (!isSubscribed && !hasActiveTrial);
        isIntermediatePlan = planName === "Intermedio" || hasActiveTrial;
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
        canReplaceMeals: isIntermediatePlan,
        canSwapMeals: isIntermediatePlan,
        canGeneratePlans: isIntermediatePlan,
        dailyChatLimit: isBasicPlan ? 5 : 999,
        chatMessagesUsed,
        planName,
        isBasicPlan,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error loading subscription limits:", error);
      // Default to basic plan on error
      setLimits({
        canReplaceMeals: false,
        canSwapMeals: false,
        canGeneratePlans: false,
        dailyChatLimit: 5,
        chatMessagesUsed: 0,
        planName: "Básico",
        isBasicPlan: true,
        isLoading: false,
      });
    }
  };

  const refreshLimits = () => {
    loadSubscriptionLimits();
  };

  return { limits, refreshLimits };
};
