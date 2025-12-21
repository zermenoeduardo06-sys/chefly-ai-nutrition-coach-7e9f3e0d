import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Subscription tiers
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

    // First, check if user belongs to a family with active subscription
    const { data: familyMembership } = await supabaseClient
      .from("family_memberships")
      .select(`
        family_id,
        role,
        families!inner (
          id,
          name,
          owner_id
        )
      `)
      .eq("user_id", user.id)
      .single();

    if (familyMembership) {
      logStep("User belongs to a family", { familyId: familyMembership.family_id, role: familyMembership.role });
      
      // Get owner's email to check their subscription
      const family = familyMembership.families as any;
      const { data: ownerProfile } = await supabaseClient
        .from("profiles")
        .select("email")
        .eq("id", family.owner_id)
        .single();

      if (ownerProfile?.email) {
        const ownerCustomers = await stripe.customers.list({ email: ownerProfile.email, limit: 1 });
        
        if (ownerCustomers.data.length > 0) {
          const ownerCustomerId = ownerCustomers.data[0].id;
          const ownerSubscriptions = await stripe.subscriptions.list({
            customer: ownerCustomerId,
            status: "active",
            limit: 1,
          });

          if (ownerSubscriptions.data.length > 0) {
            const subscription = ownerSubscriptions.data[0];
            const productId = subscription.items?.data?.[0]?.price?.product as string;
            
            if (productId === CHEFLY_FAMILY_PRODUCT_ID) {
              logStep("User inherits Family plan benefits", { ownerId: family.owner_id });
              
              let subscriptionEnd = null;
              if (subscription.current_period_end && typeof subscription.current_period_end === 'number') {
                const date = new Date(subscription.current_period_end * 1000);
                if (!isNaN(date.getTime())) {
                  subscriptionEnd = date.toISOString();
                }
              }

              await supabaseClient
                .from("profiles")
                .update({ is_subscribed: true })
                .eq("id", user.id);

              return new Response(JSON.stringify({
                subscribed: true,
                product_id: productId,
                subscription_end: subscriptionEnd,
                plan: "chefly_family",
                is_chefly_plus: true,
                is_chefly_family: true,
                is_family_member: familyMembership.role === "member",
                is_family_owner: familyMembership.role === "owner",
                family_id: familyMembership.family_id,
                family_name: family.name,
              }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
              });
            }
          }
        }
      }
    }

    // Check direct subscription
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No Stripe customer found - user is on Free plan");
      
      await supabaseClient
        .from("profiles")
        .update({ is_subscribed: false })
        .eq("id", user.id);
      
      return new Response(JSON.stringify({ 
        subscribed: false,
        plan: "free",
        is_chefly_plus: false,
        is_chefly_family: false,
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
    let isCheflyFamily = false;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      
      logStep("Processing subscription", { 
        current_period_end: subscription.current_period_end,
      });
      
      if (subscription.current_period_end && typeof subscription.current_period_end === 'number') {
        const timestamp = subscription.current_period_end * 1000;
        const date = new Date(timestamp);
        
        if (!isNaN(date.getTime())) {
          subscriptionEnd = date.toISOString();
        }
      }
      
      if (subscription.items?.data?.[0]?.price?.product) {
        productId = subscription.items.data[0].price.product as string;
        isCheflyPlus = productId === CHEFLY_PLUS_PRODUCT_ID;
        isCheflyFamily = productId === CHEFLY_FAMILY_PRODUCT_ID;
        logStep("Subscription product identified", { 
          productId, 
          isCheflyPlus,
          isCheflyFamily,
        });
      }
      
      logStep("Active subscription found", { 
        subscriptionId: subscription.id, 
        endDate: subscriptionEnd,
      });
      
      await supabaseClient
        .from("profiles")
        .update({ is_subscribed: true })
        .eq("id", user.id);
    } else {
      logStep("No active paid subscription - user is on Free plan");
      
      await supabaseClient
        .from("profiles")
        .update({ is_subscribed: false })
        .eq("id", user.id);
    }

    const response: any = {
      subscribed: hasActiveSub,
      product_id: productId,
      subscription_end: subscriptionEnd,
      plan: isCheflyFamily ? "chefly_family" : (isCheflyPlus ? "chefly_plus" : "free"),
      is_chefly_plus: isCheflyPlus || isCheflyFamily,
      is_chefly_family: isCheflyFamily,
    };

    // Add family info if user has family subscription
    if (isCheflyFamily && familyMembership) {
      response.is_family_owner = familyMembership.role === "owner";
      response.family_id = familyMembership.family_id;
      response.family_name = (familyMembership.families as any).name;
    }

    return new Response(JSON.stringify(response), {
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
