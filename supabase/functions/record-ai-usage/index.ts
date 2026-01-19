import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, operationType, costCents, wasCached = false } = await req.json();

    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid userId');
    }

    if (!operationType || !['chat', 'scan', 'shopping'].includes(operationType)) {
      throw new Error('Invalid operationType');
    }

    if (typeof costCents !== 'number' || costCents < 0) {
      throw new Error('Invalid costCents');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
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
        return new Response(JSON.stringify({ success: false, error: 'Failed to create usage record' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      usageRecord = newRecord;
    } else if (fetchError) {
      console.error('Error fetching usage record:', fetchError);
      return new Response(JSON.stringify({ success: false, error: 'Failed to fetch usage record' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prepare update object
    const updates: Record<string, any> = {
      total_cost_cents: (usageRecord.total_cost_cents || 0) + costCents,
    };

    // Update specific counters and costs based on operation type
    switch (operationType) {
      case 'chat':
        updates.chat_messages_count = (usageRecord.chat_messages_count || 0) + 1;
        updates.chat_cost_cents = (usageRecord.chat_cost_cents || 0) + costCents;
        break;
      case 'scan':
        if (wasCached) {
          updates.food_scans_cached_count = (usageRecord.food_scans_cached_count || 0) + 1;
        } else {
          updates.food_scans_count = (usageRecord.food_scans_count || 0) + 1;
        }
        updates.scan_cost_cents = (usageRecord.scan_cost_cents || 0) + costCents;
        break;
      case 'shopping':
        updates.shopping_list_count = (usageRecord.shopping_list_count || 0) + 1;
        updates.shopping_cost_cents = (usageRecord.shopping_cost_cents || 0) + costCents;
        break;
    }

    // Check if limit is reached after this operation
    const monthlyLimit = usageRecord.monthly_limit_cents || 200;
    if (updates.total_cost_cents >= monthlyLimit) {
      updates.is_limit_reached = true;
      updates.limit_reached_at = new Date().toISOString();
    }

    // Update the record
    const { error: updateError } = await supabaseClient
      .from('ai_usage_tracking')
      .update(updates)
      .eq('id', usageRecord.id);

    if (updateError) {
      console.error('Error updating usage record:', updateError);
      return new Response(JSON.stringify({ success: false, error: 'Failed to update usage record' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Recorded AI usage: user=${userId}, type=${operationType}, cost=${costCents}c, cached=${wasCached}, total=${updates.total_cost_cents}c`);

    return new Response(JSON.stringify({
      success: true,
      total_cost_cents: updates.total_cost_cents,
      is_limit_reached: updates.is_limit_reached || false,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('record-ai-usage error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
