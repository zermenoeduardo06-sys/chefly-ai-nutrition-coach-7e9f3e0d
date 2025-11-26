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

    const { amount, payoutMethod } = await req.json();

    // Get affiliate profile
    const { data: profile, error: profileError } = await supabaseClient
      .from("affiliate_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileError) throw profileError;
    if (!profile) throw new Error("Affiliate profile not found");

    // Validate amount
    if (amount < 200) {
      throw new Error("Minimum payout amount is 200 MXN");
    }

    if (amount > profile.pending_balance_mxn) {
      throw new Error("Insufficient balance");
    }

    // Check Stripe account
    if (!profile.stripe_account_id || !profile.stripe_onboarding_completed) {
      throw new Error("Stripe account not connected or onboarding incomplete");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Verify Stripe account status
    const account = await stripe.accounts.retrieve(profile.stripe_account_id);
    
    if (!account.charges_enabled || !account.payouts_enabled) {
      throw new Error("Stripe account not fully enabled for payouts");
    }

    console.log(`Processing payout of ${amount} MXN to ${profile.stripe_account_id}`);

    // Create transfer to connected account
    // Convert MXN to cents (Stripe uses smallest currency unit)
    const amountInCents = Math.round(amount * 100);

    const transfer = await stripe.transfers.create({
      amount: amountInCents,
      currency: "mxn",
      destination: profile.stripe_account_id,
      description: `Affiliate commission payout - ${profile.affiliate_code}`,
      metadata: {
        affiliate_id: profile.id,
        affiliate_code: profile.affiliate_code,
        payout_method: payoutMethod,
      },
    });

    console.log("Transfer created:", transfer.id);

    const now = new Date().toISOString();

    // Create payout record
    const { data: payout, error: payoutError } = await supabaseClient
      .from("affiliate_payouts")
      .insert({
        affiliate_id: profile.id,
        amount_mxn: amount,
        payout_method: payoutMethod,
        status: "completed",
        processed_at: now,
        completed_at: now,
        transaction_id: transfer.id,
      })
      .select()
      .single();

    if (payoutError) throw payoutError;

    // Update affiliate profile
    const { error: updateError } = await supabaseClient
      .from("affiliate_profiles")
      .update({
        pending_balance_mxn: profile.pending_balance_mxn - amount,
        total_paid_mxn: (profile.total_paid_mxn || 0) + amount,
        last_payout_at: now,
      })
      .eq("id", profile.id);

    if (updateError) throw updateError;

    console.log("Payout processed successfully");

    return new Response(
      JSON.stringify({
        success: true,
        payout,
        transferId: transfer.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error processing payout:", error);
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
