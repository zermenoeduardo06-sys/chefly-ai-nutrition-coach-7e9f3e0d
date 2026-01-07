import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Stripe Subscription tiers
const CHEFLY_PLUS_PRODUCT_ID = "prod_TUMZx1BcskL9rK";
const CHEFLY_FAMILY_PRODUCT_ID = "prod_Te9zehdPjvu5Yg";

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

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Check if user has is_subscribed = true in profiles (Apple IAP)
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("is_subscribed")
      .eq("id", user.id)
      .single();

    logStep("Profile check", { is_subscribed: profile?.is_subscribed });

    // Check family membership
    const { data: familyMembership } = await supabaseClient
      .from("family_memberships")
      .select(`family_id, role, families!inner (id, name, owner_id)`)
      .eq("user_id", user.id)
      .single();

    const { data: ownedFamily } = await supabaseClient
      .from("families")
      .select("id, name")
      .eq("owner_id", user.id)
      .single();

    const hasFamily = !!familyMembership || !!ownedFamily;
    const familyId = familyMembership?.family_id || ownedFamily?.id;
    const familyName = (familyMembership?.families as any)?.name || ownedFamily?.name;
    const isOwner = !!ownedFamily || familyMembership?.role === "owner";

    // If user has is_subscribed = true in profiles (Apple IAP)
    if (profile?.is_subscribed === true) {
      logStep("User has active Apple IAP subscription");
      return new Response(JSON.stringify({
        subscribed: true,
        product_id: CHEFLY_PLUS_PRODUCT_ID,
        subscription_end: null,
        plan: "chefly_plus",
        is_chefly_plus: true,
        is_chefly_family: false,
        has_family: hasFamily,
        is_family_owner: isOwner,
        is_family_member: !!familyMembership && familyMembership.role === "member",
        family_id: familyId,
        family_name: familyName,
        subscription_source: "apple_iap",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Check Stripe subscription via API
    const stripeResponse = await fetch(`https://api.stripe.com/v1/customers?email=${encodeURIComponent(user.email)}&limit=1`, {
      headers: { Authorization: `Bearer ${stripeKey}` },
    });
    const customers = await stripeResponse.json();

    if (!customers.data?.length) {
      logStep("No Stripe customer - Free plan");
      return new Response(JSON.stringify({ 
        subscribed: false, plan: "free", is_chefly_plus: false, is_chefly_family: false,
        has_family: hasFamily, is_family_owner: isOwner,
        is_family_member: !!familyMembership && familyMembership.role === "member",
        family_id: familyId, family_name: familyName,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
    }

    const customerId = customers.data[0].id;
    const subsResponse = await fetch(`https://api.stripe.com/v1/subscriptions?customer=${customerId}&status=active&limit=1`, {
      headers: { Authorization: `Bearer ${stripeKey}` },
    });
    const subscriptions = await subsResponse.json();
    
    const hasActiveSub = subscriptions.data?.length > 0;
    let productId = null, subscriptionEnd = null, isCheflyPlus = false, isCheflyFamily = false;

    if (hasActiveSub) {
      const sub = subscriptions.data[0];
      subscriptionEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null;
      productId = sub.items?.data?.[0]?.price?.product;
      isCheflyPlus = productId === CHEFLY_PLUS_PRODUCT_ID;
      isCheflyFamily = productId === CHEFLY_FAMILY_PRODUCT_ID;
      
      await supabaseClient.from("profiles").update({ is_subscribed: true }).eq("id", user.id);
    } else {
      await supabaseClient.from("profiles").update({ is_subscribed: false }).eq("id", user.id);
    }

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      product_id: productId,
      subscription_end: subscriptionEnd,
      plan: isCheflyFamily ? "chefly_family" : (isCheflyPlus ? "chefly_plus" : "free"),
      is_chefly_plus: isCheflyPlus || isCheflyFamily,
      is_chefly_family: isCheflyFamily,
      has_family: hasFamily,
      is_family_owner: isOwner,
      is_family_member: !!familyMembership && familyMembership.role === "member",
      family_id: familyId,
      family_name: familyName,
      subscription_source: hasActiveSub ? "stripe" : null,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500,
    });
  }
});
