import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
    const payload = await req.json();
    
    console.log("Endorsely webhook received:", JSON.stringify(payload, null, 2));

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Endorsely envía diferentes tipos de eventos
    const eventType = payload.event || payload.type;
    
    switch (eventType) {
      case "conversion":
      case "sale":
        // Procesar conversión
        const affiliateCode = payload.affiliate_code || payload.referral_code;
        const amount = payload.amount || 0;
        
        if (affiliateCode) {
          console.log(`Processing Endorsely conversion for affiliate: ${affiliateCode}`);
          
          // Buscar afiliado
          const { data: affiliate } = await supabaseAdmin
            .from("affiliate_profiles")
            .select("id")
            .eq("affiliate_code", affiliateCode.toUpperCase())
            .single();

          if (affiliate) {
            // Registrar en metadata para tracking
            console.log(`Conversion tracked for affiliate ${affiliateCode}, amount: ${amount}`);
          }
        }
        break;

      case "click":
        // Registrar click desde Endorsely
        const clickAffiliateCode = payload.affiliate_code || payload.referral_code;
        
        if (clickAffiliateCode) {
          const { data: affiliate } = await supabaseAdmin
            .from("affiliate_profiles")
            .select("id")
            .eq("affiliate_code", clickAffiliateCode.toUpperCase())
            .single();

          if (affiliate) {
            await supabaseAdmin
              .from("affiliate_referrals")
              .insert({
                affiliate_id: affiliate.id,
                ip_address: payload.ip || "unknown",
                user_agent: payload.user_agent || "",
                referrer_url: payload.referrer || "",
                landing_page: payload.landing_page || "",
                endorsely_metadata: payload,
              });
            
            console.log(`Click tracked from Endorsely for ${clickAffiliateCode}`);
          }
        }
        break;

      default:
        console.log(`Unhandled Endorsely event type: ${eventType}`);
    }

    return new Response(
      JSON.stringify({ success: true, received: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in endorsely-webhook:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});