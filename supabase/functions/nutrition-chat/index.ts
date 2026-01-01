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

    const aiData = await response.json();
    const aiResponse = aiData.choices[0].message.content;

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
