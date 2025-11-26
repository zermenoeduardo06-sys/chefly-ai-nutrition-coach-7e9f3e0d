import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user) throw new Error("User not authenticated");

    // Get affiliate profile
    const { data: profile, error: profileError } = await supabaseClient
      .from("affiliate_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileError) throw profileError;
    if (!profile) throw new Error("Affiliate profile not found");

    // Check if already has Stripe account
    if (profile.stripe_account_id) {
      return new Response(
        JSON.stringify({ 
          accountId: profile.stripe_account_id,
          exists: true 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Create Stripe Connect Express account
    const account = await stripe.accounts.create({
      type: "express",
      country: profile.country || "MX",
      email: profile.email,
      capabilities: {
        transfers: { requested: true },
      },
      business_type: "individual",
      business_profile: {
        mcc: "5734", // Computer Software Stores
        product_description: "Affiliate marketing commissions",
      },
    });

    console.log("Created Stripe account:", account.id);

    // Update affiliate profile with Stripe account ID
    const { error: updateError } = await supabaseClient
      .from("affiliate_profiles")
      .update({
        stripe_account_id: account.id,
        stripe_account_status: "pending",
      })
      .eq("id", profile.id);

    if (updateError) throw updateError;

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${req.headers.get("origin")}/afiliados/dashboard`,
      return_url: `${req.headers.get("origin")}/afiliados/dashboard?stripe_onboarding=success`,
      type: "account_onboarding",
    });

    console.log("Created account link:", accountLink.url);

    return new Response(
      JSON.stringify({
        accountId: account.id,
        onboardingUrl: accountLink.url,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating Stripe account:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
