import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const signature = req.headers.get("stripe-signature");
  
  if (!signature) {
    console.error("No stripe-signature header found");
    return new Response(JSON.stringify({ error: "No signature" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  try {
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET not configured");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log("✅ Webhook verified:", event.type);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error("❌ Webhook signature verification failed:", errorMessage);
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Handle checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("Processing checkout session:", session.id);

      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      // Update user subscription status
      if (session.customer_email) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ is_subscribed: true })
          .eq("email", session.customer_email);

        if (profileError) {
          console.error("Error updating profile:", profileError);
        } else {
          console.log("✅ Profile updated for:", session.customer_email);
        }
      }

      // Process affiliate commission if affiliate code exists
      const affiliateCode = session.metadata?.affiliate_code;
      const endorselyReferral = session.metadata?.endorsely_referral;

      if (affiliateCode || endorselyReferral) {
        console.log("Processing affiliate sale:", { affiliateCode, endorselyReferral });

        // Get line items to determine product and price
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
        const firstItem = lineItems.data[0];

        if (firstItem && firstItem.price) {
          const price = await stripe.prices.retrieve(firstItem.price.id);
          
          const saleData = {
            affiliateCode: affiliateCode || null,
            endorselyReferral: endorselyReferral || null,
            customerEmail: session.customer_email,
            customerId: session.customer as string,
            productId: price.product as string,
            priceId: price.id,
            amount: session.amount_total || 0,
            currency: session.currency || "mxn",
            stripeSessionId: session.id,
            stripeSubscriptionId: session.subscription as string || null,
          };

          // Call process-affiliate-sale function
          const { data, error } = await supabase.functions.invoke("process-affiliate-sale", {
            body: saleData,
          });

          if (error) {
            console.error("❌ Error processing affiliate sale:", error);
          } else {
            console.log("✅ Affiliate sale processed:", data);
          }
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error processing webhook:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
