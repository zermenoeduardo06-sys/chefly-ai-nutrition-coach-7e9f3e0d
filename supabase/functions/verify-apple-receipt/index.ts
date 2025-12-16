import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Apple's receipt validation endpoints
const APPLE_PRODUCTION_URL = "https://buy.itunes.apple.com/verifyReceipt";
const APPLE_SANDBOX_URL = "https://sandbox.itunes.apple.com/verifyReceipt";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-APPLE-RECEIPT] ${step}${detailsStr}`);
};

interface AppleReceiptResponse {
  status: number;
  environment?: string;
  receipt?: {
    bundle_id: string;
    in_app: Array<{
      product_id: string;
      transaction_id: string;
      original_transaction_id: string;
      purchase_date_ms: string;
      expires_date_ms?: string;
    }>;
  };
  latest_receipt_info?: Array<{
    product_id: string;
    transaction_id: string;
    original_transaction_id: string;
    purchase_date_ms: string;
    expires_date_ms?: string;
    is_trial_period?: string;
  }>;
  pending_renewal_info?: Array<{
    auto_renew_status: string;
    product_id: string;
  }>;
}

async function verifyReceiptWithApple(
  receipt: string, 
  sharedSecret: string,
  useSandbox: boolean = false
): Promise<AppleReceiptResponse> {
  const url = useSandbox ? APPLE_SANDBOX_URL : APPLE_PRODUCTION_URL;
  
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      "receipt-data": receipt,
      "password": sharedSecret,
      "exclude-old-transactions": true,
    }),
  });

  return await response.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get Apple Shared Secret from environment
    const appleSharedSecret = Deno.env.get("APPLE_SHARED_SECRET");
    if (!appleSharedSecret) {
      throw new Error("APPLE_SHARED_SECRET not configured");
    }

    const { receipt, userId, productId } = await req.json();
    logStep("Request received", { userId, productId, hasReceipt: !!receipt });

    if (!receipt || !userId || !productId) {
      throw new Error("Missing required parameters: receipt, userId, productId");
    }

    // Verify with Apple Production first
    logStep("Verifying with Apple Production");
    let appleResponse = await verifyReceiptWithApple(receipt, appleSharedSecret, false);

    // If status is 21007, it's a sandbox receipt - retry with sandbox
    if (appleResponse.status === 21007) {
      logStep("Production returned sandbox receipt, retrying with Sandbox");
      appleResponse = await verifyReceiptWithApple(receipt, appleSharedSecret, true);
    }

    logStep("Apple response status", { status: appleResponse.status });

    // Check Apple's response status
    // Status 0 = valid receipt
    if (appleResponse.status !== 0) {
      const errorMessages: Record<number, string> = {
        21000: "The App Store could not read the JSON object",
        21002: "The data in the receipt-data property was malformed",
        21003: "The receipt could not be authenticated",
        21004: "The shared secret does not match",
        21005: "The receipt server is not currently available",
        21006: "This receipt is valid but the subscription has expired",
        21007: "This receipt is from the test environment (sandbox)",
        21008: "This receipt is from the production environment",
      };
      
      throw new Error(errorMessages[appleResponse.status] || `Unknown Apple error: ${appleResponse.status}`);
    }

    // Get the latest receipt info for subscriptions
    const latestReceiptInfo = appleResponse.latest_receipt_info || [];
    const relevantPurchase = latestReceiptInfo.find(
      (info) => info.product_id === productId
    );

    if (!relevantPurchase) {
      logStep("Product not found in receipt", { productId });
      return new Response(
        JSON.stringify({ valid: false, error: "Product not found in receipt" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Check if subscription is still active
    const expiresDateMs = parseInt(relevantPurchase.expires_date_ms || "0");
    const isActive = expiresDateMs > Date.now();
    
    logStep("Subscription status", { 
      isActive, 
      expiresDate: new Date(expiresDateMs).toISOString(),
      transactionId: relevantPurchase.transaction_id 
    });

    if (isActive) {
      // Update user's subscription status in database
      const { error: updateError } = await supabaseClient
        .from("profiles")
        .update({ 
          is_subscribed: true,
          updated_at: new Date().toISOString()
        })
        .eq("id", userId);

      if (updateError) {
        logStep("Error updating profile", { error: updateError.message });
      } else {
        logStep("Profile updated successfully");
      }

      // Store the Apple transaction for records (optional - create table if needed)
      // await supabaseClient.from("apple_transactions").upsert({
      //   user_id: userId,
      //   transaction_id: relevantPurchase.transaction_id,
      //   original_transaction_id: relevantPurchase.original_transaction_id,
      //   product_id: productId,
      //   purchase_date: new Date(parseInt(relevantPurchase.purchase_date_ms)).toISOString(),
      //   expires_date: new Date(expiresDateMs).toISOString(),
      //   environment: appleResponse.environment,
      // });
    }

    return new Response(
      JSON.stringify({
        valid: isActive,
        subscription: {
          productId: relevantPurchase.product_id,
          transactionId: relevantPurchase.transaction_id,
          expiresDate: new Date(expiresDateMs).toISOString(),
          isTrialPeriod: relevantPurchase.is_trial_period === "true",
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    return new Response(
      JSON.stringify({ valid: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
