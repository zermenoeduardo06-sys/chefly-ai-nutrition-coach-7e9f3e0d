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
    const { affiliateCode, referrerUrl, landingPage } = await req.json();
    
    if (!affiliateCode) {
      throw new Error("Affiliate code is required");
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Buscar afiliado por código
    const { data: affiliate, error: affiliateError } = await supabaseAdmin
      .from("affiliate_profiles")
      .select("id, status")
      .eq("affiliate_code", affiliateCode.toUpperCase())
      .eq("status", "active")
      .single();

    if (affiliateError || !affiliate) {
      console.log("Affiliate not found or inactive:", affiliateCode);
      return new Response(
        JSON.stringify({ error: "Invalid affiliate code" }), 
        { 
          status: 404, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Obtener información del request
    const userAgent = req.headers.get("user-agent") || "";
    const forwarded = req.headers.get("x-forwarded-for");
    const ipAddress = forwarded ? forwarded.split(",")[0] : "unknown";

    // Registrar click
    const { data: referral, error: referralError } = await supabaseAdmin
      .from("affiliate_referrals")
      .insert({
        affiliate_id: affiliate.id,
        ip_address: ipAddress,
        user_agent: userAgent,
        referrer_url: referrerUrl,
        landing_page: landingPage,
      })
      .select()
      .single();

    if (referralError) {
      console.error("Error creating referral:", referralError);
      throw referralError;
    }

    // Actualizar contador de clicks del afiliado
    const { data: profileData } = await supabaseAdmin
      .from("affiliate_profiles")
      .select("total_clicks")
      .eq("id", affiliate.id)
      .single();

    if (profileData) {
      try {
        await supabaseAdmin
          .from("affiliate_profiles")
          .update({ total_clicks: (profileData.total_clicks || 0) + 1 })
          .eq("id", affiliate.id);
        console.log("Click count updated");
      } catch (err: any) {
        console.warn("Failed to increment clicks:", err);
      }
    }

    console.log(`Click tracked for affiliate ${affiliateCode}, referral ID: ${referral.id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        referralId: referral.id,
        affiliateCode 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in track-affiliate-click:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});