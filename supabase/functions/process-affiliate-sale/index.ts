import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Apple IAP product configuration for Chefly Plus ($7.99 USD ≈ 150 MXN)
const COMMISSION_RATES = {
  "chefly_plus_monthly_": { rate: 25, plan: "Chefly Plus", amount: 150 },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      affiliateCode,
      customerId,
      customerEmail,
      stripeSubscriptionId,
      stripeCustomerId,
      productId,
      metadata,
    } = await req.json();

    if (!affiliateCode || !productId) {
      throw new Error("Affiliate code and product ID are required");
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Buscar afiliado con tier
    const { data: affiliate, error: affiliateError } = await supabaseAdmin
      .from("affiliate_profiles")
      .select("id, commission_rate_basic, commission_rate_intermediate, current_tier")
      .eq("affiliate_code", affiliateCode.toUpperCase())
      .single();

    if (affiliateError || !affiliate) {
      console.error("Affiliate not found:", affiliateCode);
      throw new Error("Affiliate not found");
    }

    // Obtener información del producto
    const productInfo = COMMISSION_RATES[productId as keyof typeof COMMISSION_RATES];
    if (!productInfo) {
      throw new Error("Invalid product ID");
    }

    // Obtener bonificación de tier
    const { data: tierInfo } = await supabaseAdmin
      .from("affiliate_tiers")
      .select("commission_bonus_percentage")
      .eq("tier", affiliate.current_tier)
      .single();

    const tierBonus = tierInfo?.commission_bonus_percentage || 0;

    // Calcular comisión base
    let commissionRate = productInfo.plan === "Básico" 
      ? affiliate.commission_rate_basic 
      : affiliate.commission_rate_intermediate;
    
    // Aplicar bonificación de tier
    commissionRate = commissionRate + tierBonus;
    
    const commissionAmount = (productInfo.amount * commissionRate) / 100;

    // Buscar referral reciente del afiliado (últimas 24 horas)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: referral } = await supabaseAdmin
      .from("affiliate_referrals")
      .select("id")
      .eq("affiliate_id", affiliate.id)
      .eq("converted", false)
      .gte("clicked_at", oneDayAgo)
      .order("clicked_at", { ascending: false })
      .limit(1)
      .single();

    // Crear venta
    const { data: sale, error: saleError } = await supabaseAdmin
      .from("affiliate_sales")
      .insert({
        affiliate_id: affiliate.id,
        referral_id: referral?.id || null,
        customer_id: customerId || null,
        customer_email: customerEmail,
        stripe_subscription_id: stripeSubscriptionId,
        stripe_customer_id: stripeCustomerId,
        product_id: productId,
        plan_name: productInfo.plan,
        sale_amount_mxn: productInfo.amount,
        commission_rate: commissionRate,
        commission_amount_mxn: commissionAmount,
        commission_status: "pending",
        stripe_metadata: metadata || {},
      })
      .select()
      .single();

    if (saleError) {
      console.error("Error creating sale:", saleError);
      throw saleError;
    }

    // Marcar referral como convertido
    if (referral) {
      await supabaseAdmin
        .from("affiliate_referrals")
        .update({
          converted: true,
          converted_at: new Date().toISOString(),
          sale_id: sale.id,
        })
        .eq("id", referral.id);
    }

    // Actualizar estadísticas del afiliado y lifetime sales
    const { data: currentStats } = await supabaseAdmin
      .from("affiliate_profiles")
      .select("total_conversions, total_earned_mxn, pending_balance_mxn, lifetime_sales_mxn")
      .eq("id", affiliate.id)
      .single();

    if (currentStats) {
      await supabaseAdmin
        .from("affiliate_profiles")
        .update({
          total_conversions: (currentStats.total_conversions || 0) + 1,
          total_earned_mxn: parseFloat(currentStats.total_earned_mxn || "0") + commissionAmount,
          pending_balance_mxn: parseFloat(currentStats.pending_balance_mxn || "0") + commissionAmount,
          lifetime_sales_mxn: parseFloat(currentStats.lifetime_sales_mxn || "0") + productInfo.amount,
        })
        .eq("id", affiliate.id);

      // Actualizar tier del afiliado basado en rendimiento
      await supabaseAdmin.rpc("update_affiliate_tier", {
        affiliate_profile_id: affiliate.id,
      });
    }

    // Actualizar comisión mensual
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    // Buscar comisión existente
    const { data: existingCommission } = await supabaseAdmin
      .from("affiliate_commissions")
      .select("*")
      .eq("affiliate_id", affiliate.id)
      .eq("month", month)
      .eq("year", year)
      .single();

    if (existingCommission) {
      // Actualizar existente
      await supabaseAdmin
        .from("affiliate_commissions")
        .update({
          total_sales: (existingCommission.total_sales || 0) + 1,
          total_amount_mxn: parseFloat(existingCommission.total_amount_mxn || "0") + productInfo.amount,
          commission_earned_mxn: parseFloat(existingCommission.commission_earned_mxn || "0") + commissionAmount,
          commission_pending_mxn: parseFloat(existingCommission.commission_pending_mxn || "0") + commissionAmount,
        })
        .eq("id", existingCommission.id);
    } else {
      // Crear nuevo
      await supabaseAdmin
        .from("affiliate_commissions")
        .insert({
          affiliate_id: affiliate.id,
          month,
          year,
          total_sales: 1,
          total_amount_mxn: productInfo.amount,
          commission_earned_mxn: commissionAmount,
          commission_pending_mxn: commissionAmount,
        });
    }

    console.log(`Sale processed for affiliate ${affiliateCode}: $${commissionAmount} MXN commission`);

    return new Response(
      JSON.stringify({
        success: true,
        saleId: sale.id,
        commissionAmount,
        affiliateCode,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in process-affiliate-sale:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});