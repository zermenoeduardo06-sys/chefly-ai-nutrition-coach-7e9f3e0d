import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CHAT_COST_CENTS = 2; // ~$0.02 per chat message

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId } = await req.json();
    
    // Validate inputs
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      throw new Error('Invalid message');
    }
    if (message.length > 2000) {
      throw new Error('Message too long (max 2000 characters)');
    }
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid userId');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check AI budget before proceeding
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    let usageRecord = await getOrCreateUsageRecord(supabaseClient, userId, currentMonth, currentYear);
    
    if (usageRecord && usageRecord.is_limit_reached) {
      return new Response(JSON.stringify({ 
        error: 'Has alcanzado tu límite de uso de IA este mes. El límite se reinicia el 1 de cada mes.',
        error_en: 'You have reached your AI usage limit this month. The limit resets on the 1st of each month.',
        code: 'BUDGET_LIMIT'
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const monthlyLimit = usageRecord?.monthly_limit_cents || 200;
    const totalUsed = usageRecord?.total_cost_cents || 0;
    
    if (totalUsed + CHAT_COST_CENTS > monthlyLimit) {
      return new Response(JSON.stringify({ 
        error: 'Has alcanzado tu límite de uso de IA este mes. El límite se reinicia el 1 de cada mes.',
        error_en: 'You have reached your AI usage limit this month. The limit resets on the 1st of each month.',
        code: 'BUDGET_LIMIT'
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user preferences
    const { data: preferences } = await supabaseClient
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-lite',
        messages: [{
          role: 'system',
          content: `You are Chefly, an expert and friendly nutrition coach. You help users with personalized advice.

CRITICAL RULES:
- NEVER introduce yourself or say your name unless explicitly asked "who are you?" or "what's your name?"
- ALWAYS respond in the SAME LANGUAGE the user writes in. If they write in English, respond in English. If they write in Spanish, respond in Spanish.
- Be conversational, helpful, and motivating
- Keep responses concise and actionable

User preferences:
- Goal: ${preferences?.goal || 'Not specified'}
- Diet: ${preferences?.diet_type || 'Not specified'}
- Allergies: ${preferences?.allergies?.join(', ') || 'None'}`
        }, {
          role: 'user',
          content: message
        }]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again later.',
          code: 'RATE_LIMIT'
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'AI credits exhausted. Please add credits to continue.',
          code: 'CREDITS_EXHAUSTED'
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiData = await response.json();
    const aiResponse = aiData.choices[0].message.content;

    // Record usage after successful response
    await recordUsage(supabaseClient, usageRecord, 'chat', CHAT_COST_CENTS);

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('nutrition-chat error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function getOrCreateUsageRecord(supabase: any, userId: string, month: number, year: number) {
  let { data: record, error } = await supabase
    .from('ai_usage_tracking')
    .select('*')
    .eq('user_id', userId)
    .eq('month', month)
    .eq('year', year)
    .single();

  if (error && error.code === 'PGRST116') {
    const { data: newRecord, error: insertError } = await supabase
      .from('ai_usage_tracking')
      .insert({
        user_id: userId,
        month: month,
        year: year,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating usage record:', insertError);
      return null;
    }
    return newRecord;
  }
  
  if (error) {
    console.error('Error fetching usage record:', error);
    return null;
  }
  
  return record;
}

async function recordUsage(supabase: any, usageRecord: any, operationType: string, costCents: number) {
  if (!usageRecord) return;

  const updates: Record<string, any> = {
    total_cost_cents: (usageRecord.total_cost_cents || 0) + costCents,
    chat_messages_count: (usageRecord.chat_messages_count || 0) + 1,
    chat_cost_cents: (usageRecord.chat_cost_cents || 0) + costCents,
  };

  const monthlyLimit = usageRecord.monthly_limit_cents || 200;
  if (updates.total_cost_cents >= monthlyLimit) {
    updates.is_limit_reached = true;
    updates.limit_reached_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('ai_usage_tracking')
    .update(updates)
    .eq('id', usageRecord.id);

  if (error) {
    console.error('Error recording usage:', error);
  } else {
    console.log(`Recorded chat usage: user=${usageRecord.user_id}, cost=${costCents}c, total=${updates.total_cost_cents}c`);
  }
}
