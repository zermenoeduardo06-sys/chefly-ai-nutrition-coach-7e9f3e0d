import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Chefly Plus es el único plan de pago en el modelo freemium
const CHEFLY_PLUS_PRODUCT_ID = "prod_TUMZx1BcskL9rK";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started - Freemium model (Chefly Plus only)");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No Stripe customer found - user is on Free plan");
      
      // Update profile to reflect no paid subscription (Free plan)
      await supabaseClient
        .from("profiles")
        .update({ is_subscribed: false })
        .eq("id", user.id);
      
      return new Response(JSON.stringify({ 
        subscribed: false,
        plan: "free",
        is_chefly_plus: false
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    
    const hasActiveSub = subscriptions.data.length > 0;
    let productId = null;
    let subscriptionEnd = null;
    let isCheflyPlus = false;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      
      logStep("Processing subscription", { 
        current_period_end: subscription.current_period_end,
        current_period_end_type: typeof subscription.current_period_end 
      });
      
      // Safely convert timestamp to ISO string
      if (subscription.current_period_end && typeof subscription.current_period_end === 'number') {
        const timestamp = subscription.current_period_end * 1000;
        const date = new Date(timestamp);
        
        if (!isNaN(date.getTime())) {
          subscriptionEnd = date.toISOString();
        } else {
          logStep("Invalid date created from timestamp", { timestamp, current_period_end: subscription.current_period_end });
          subscriptionEnd = null;
        }
      }
      
      // Safely get product ID
      if (subscription.items?.data?.[0]?.price?.product) {
        productId = subscription.items.data[0].price.product as string;
        isCheflyPlus = productId === CHEFLY_PLUS_PRODUCT_ID;
        logStep("Subscription product identified", { 
          productId, 
          isCheflyPlus,
          expectedCheflyPlusId: CHEFLY_PLUS_PRODUCT_ID
        });
      }
      
      logStep("Active Chefly Plus subscription found", { 
        subscriptionId: subscription.id, 
        endDate: subscriptionEnd,
        isCheflyPlus 
      });
      
      // Update profile with subscription status
      await supabaseClient
        .from("profiles")
        .update({ is_subscribed: true })
        .eq("id", user.id);
    } else {
      logStep("No active paid subscription - user is on Free plan");
      
      // Update profile to reflect no subscription (Free plan)
      await supabaseClient
        .from("profiles")
        .update({ is_subscribed: false })
        .eq("id", user.id);
    }

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      product_id: productId,
      subscription_end: subscriptionEnd,
      plan: hasActiveSub ? "chefly_plus" : "free",
      is_chefly_plus: isCheflyPlus
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
