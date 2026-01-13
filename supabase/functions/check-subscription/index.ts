import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Check if user has is_subscribed = true in profiles (Apple IAP via RevenueCat)
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("is_subscribed")
      .eq("id", user.id)
      .single();

    logStep("Profile check", { is_subscribed: profile?.is_subscribed });

    // Subscription is managed entirely by Apple IAP via RevenueCat
    // The is_subscribed field is updated by verify-apple-receipt function
    if (profile?.is_subscribed === true) {
      logStep("User has active subscription via Apple IAP");
      return new Response(JSON.stringify({
        subscribed: true,
        product_id: "chefly_plus_monthly_",
        subscription_end: null,
        plan: "chefly_plus",
        is_chefly_plus: true,
        subscription_source: "apple_iap",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // User is on free plan
    logStep("User is on free plan");
    return new Response(JSON.stringify({
      subscribed: false,
      product_id: null,
      subscription_end: null,
      plan: "free",
      is_chefly_plus: false,
      subscription_source: null,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
