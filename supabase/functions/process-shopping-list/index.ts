import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SHOPPING_COST_CENTS = 3; // ~$0.03 per shopping list

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ingredients, language = 'es', userId } = await req.json();

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No ingredients provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check AI budget before proceeding (only if userId provided)
    if (userId) {
      const budgetCheck = await checkBudget(supabase, userId);
      if (!budgetCheck.allowed) {
        return new Response(JSON.stringify({ 
          error: budgetCheck.message,
          error_en: budgetCheck.message_en,
          code: 'BUDGET_LIMIT'
        }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = language === 'es' 
      ? `Eres un asistente que convierte ingredientes de recetas a cantidades de supermercado.

REGLAS:
1. Agrupa ingredientes similares y suma sus cantidades
2. Convierte medidas de cocina a cantidades comprables:
   - Tazas/cucharadas de líquidos → litros o mililitros
   - Tazas de granos/cereales → gramos o kilogramos  
   - Rebanadas/piezas → unidades o paquetes
   - Porciones de carne/pescado → gramos o kilogramos
3. Redondea hacia arriba a cantidades prácticas de compra
4. Usa unidades estándar: g, kg, ml, L, unidades, paquete
5. Sé conciso: "500g pechuga de pollo", "1L leche", "6 huevos"

Responde SOLO con un JSON array de objetos con esta estructura:
[{"item": "nombre del ingrediente con cantidad", "category": "proteins|dairy|vegetables|fruits|grains|condiments|other"}]`
      : `You are an assistant that converts recipe ingredients to grocery store quantities.

RULES:
1. Group similar ingredients and sum their quantities
2. Convert cooking measurements to purchasable quantities:
   - Cups/tablespoons of liquids → liters or milliliters
   - Cups of grains/cereals → grams or kilograms
   - Slices/pieces → units or packages
   - Portions of meat/fish → grams or kilograms
3. Round up to practical purchase quantities
4. Use standard units: g, kg, ml, L, units, package
5. Be concise: "500g chicken breast", "1L milk", "6 eggs"

Respond ONLY with a JSON array of objects with this structure:
[{"item": "ingredient name with quantity", "category": "proteins|dairy|vegetables|fruits|grains|condiments|other"}]`;

    const userPrompt = language === 'es'
      ? `Convierte estos ingredientes de recetas a cantidades de supermercado:\n\n${ingredients.join('\n')}`
      : `Convert these recipe ingredients to grocery store quantities:\n\n${ingredients.join('\n')}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable API error:', errorText);
      
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
      
      throw new Error(`Lovable API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content?.trim();

    if (!content) {
      throw new Error('Empty response from AI');
    }

    // Record usage after successful response (only if userId provided)
    if (userId) {
      recordUsageAsync(supabase, userId, SHOPPING_COST_CENTS);
    }

    // Parse JSON from response
    let processedItems;
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        processedItems = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON array found in response');
      }
    } catch (parseError) {
      console.error('Parse error:', parseError, 'Content:', content);
      throw new Error('Failed to parse AI response');
    }

    return new Response(
      JSON.stringify({ items: processedItems }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error processing shopping list:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function checkBudget(supabase: any, userId: string): Promise<{allowed: boolean, message: string, message_en: string}> {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  let { data: usageRecord, error } = await supabase
    .from('ai_usage_tracking')
    .select('*')
    .eq('user_id', userId)
    .eq('month', currentMonth)
    .eq('year', currentYear)
    .single();

  if (error && error.code === 'PGRST116') {
    return { allowed: true, message: '', message_en: '' };
  }

  if (error) {
    console.error('Error checking budget:', error);
    return { allowed: true, message: '', message_en: '' };
  }

  if (usageRecord.is_limit_reached) {
    return {
      allowed: false,
      message: 'Has alcanzado tu límite de uso de IA este mes. El límite se reinicia el 1 de cada mes.',
      message_en: 'You have reached your AI usage limit this month. The limit resets on the 1st of each month.'
    };
  }

  const monthlyLimit = usageRecord.monthly_limit_cents || 200;
  const totalUsed = usageRecord.total_cost_cents || 0;

  if (totalUsed + SHOPPING_COST_CENTS > monthlyLimit) {
    return {
      allowed: false,
      message: 'Has alcanzado tu límite de uso de IA este mes. El límite se reinicia el 1 de cada mes.',
      message_en: 'You have reached your AI usage limit this month. The limit resets on the 1st of each month.'
    };
  }

  return { allowed: true, message: '', message_en: '' };
}

function recordUsageAsync(supabase: any, userId: string, costCents: number) {
  (async () => {
    try {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      let { data: record, error } = await supabase
        .from('ai_usage_tracking')
        .select('*')
        .eq('user_id', userId)
        .eq('month', currentMonth)
        .eq('year', currentYear)
        .single();

      if (error && error.code === 'PGRST116') {
        const { data: newRecord, error: insertError } = await supabase
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
          return;
        }
        record = newRecord;
      } else if (error) {
        console.error('Error fetching usage record:', error);
        return;
      }

      const updates: Record<string, any> = {
        total_cost_cents: (record.total_cost_cents || 0) + costCents,
        shopping_list_count: (record.shopping_list_count || 0) + 1,
        shopping_cost_cents: (record.shopping_cost_cents || 0) + costCents,
      };

      const monthlyLimit = record.monthly_limit_cents || 200;
      if (updates.total_cost_cents >= monthlyLimit) {
        updates.is_limit_reached = true;
        updates.limit_reached_at = new Date().toISOString();
      }

      await supabase
        .from('ai_usage_tracking')
        .update(updates)
        .eq('id', record.id);

      console.log(`Recorded shopping usage: user=${userId}, cost=${costCents}c, total=${updates.total_cost_cents}c`);
    } catch (e) {
      console.error('Error recording usage:', e);
    }
  })();
}
