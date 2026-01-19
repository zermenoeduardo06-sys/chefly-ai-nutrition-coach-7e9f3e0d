import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cost estimates in cents
const OPERATION_COSTS = {
  chat: 2,      // ~$0.02 per chat message (gemini-2.5-flash-lite)
  scan: 8,      // ~$0.08 per food scan (gemini-2.5-flash multimodal)
  shopping: 3,  // ~$0.03 per shopping list (gemini-2.5-flash)
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, operationType } = await req.json();

    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid userId');
    }

    if (!operationType || !['chat', 'scan', 'shopping'].includes(operationType)) {
      throw new Error('Invalid operationType');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentYear = now.getFullYear();

    // Get or create usage record for current month
    let { data: usageRecord, error: fetchError } = await supabaseClient
      .from('ai_usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .eq('month', currentMonth)
      .eq('year', currentYear)
      .single();

    if (fetchError && fetchError.code === 'PGRST116') {
      // Record doesn't exist, create it
      const { data: newRecord, error: insertError } = await supabaseClient
        .from('ai_usage_tracking')
        .insert({
          user_id: userId,
          month: currentMonth,
          year: currentYear,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating usage record:', insertError);
        // Allow operation if we can't create record (fail open for better UX)
        return new Response(JSON.stringify({
          allowed: true,
          remaining_cents: 200,
          total_used_cents: 0,
          limit_cents: 200,
          message: null
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      usageRecord = newRecord;
    } else if (fetchError) {
      console.error('Error fetching usage record:', fetchError);
      // Allow operation if we can't fetch (fail open for better UX)
      return new Response(JSON.stringify({
        allowed: true,
        remaining_cents: 200,
        total_used_cents: 0,
        limit_cents: 200,
        message: null
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const monthlyLimit = usageRecord.monthly_limit_cents || 200;
    const totalUsed = usageRecord.total_cost_cents || 0;
    const remaining = Math.max(0, monthlyLimit - totalUsed);
    const operationCost = OPERATION_COSTS[operationType as keyof typeof OPERATION_COSTS];

    // Check if limit is already reached
    if (usageRecord.is_limit_reached) {
      return new Response(JSON.stringify({
        allowed: false,
        remaining_cents: 0,
        total_used_cents: totalUsed,
        limit_cents: monthlyLimit,
        message: 'Has alcanzado tu límite de uso de IA este mes. El límite se reinicia el 1 de cada mes.',
        message_en: 'You have reached your AI usage limit this month. The limit resets on the 1st of each month.'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if this operation would exceed the limit
    if (totalUsed + operationCost > monthlyLimit) {
      return new Response(JSON.stringify({
        allowed: false,
        remaining_cents: remaining,
        total_used_cents: totalUsed,
        limit_cents: monthlyLimit,
        message: 'Has alcanzado tu límite de uso de IA este mes. El límite se reinicia el 1 de cada mes.',
        message_en: 'You have reached your AI usage limit this month. The limit resets on the 1st of each month.'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Operation is allowed
    return new Response(JSON.stringify({
      allowed: true,
      remaining_cents: remaining,
      total_used_cents: totalUsed,
      limit_cents: monthlyLimit,
      message: null
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('check-ai-budget error:', error);
    // Fail open - allow operation if there's an error
    return new Response(JSON.stringify({
      allowed: true,
      remaining_cents: 200,
      total_used_cents: 0,
      limit_cents: 200,
      message: null,
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
