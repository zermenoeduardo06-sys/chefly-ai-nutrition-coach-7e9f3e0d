import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SCAN_COST_CENTS = 8; // ~$0.08 per food scan (multimodal)

// Generate SHA-256 hash from image data for cache lookup
async function generateImageHash(imageBase64: string): Promise<string> {
  const sampleData = imageBase64.slice(0, 10000);
  const encoder = new TextEncoder();
  const data = encoder.encode(sampleData);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, language = 'es', userId } = await req.json();

    if (!imageBase64) {
      throw new Error('No image provided');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate hash for cache lookup
    const imageHash = await generateImageHash(imageBase64);
    console.log(`[CACHE] Looking up hash: ${imageHash.substring(0, 16)}...`);

    // Check cache first
    const { data: cachedResult, error: cacheError } = await supabase
      .from('food_analysis_cache')
      .select('*')
      .eq('image_hash', imageHash)
      .eq('language', language)
      .maybeSingle();

    if (cachedResult && !cacheError) {
      // Cache hit! Return cached data and increment hit count
      console.log(`[CACHE] HIT for "${cachedResult.dish_name}" - hit_count: ${cachedResult.hit_count}`);
      
      // Increment hit count in background
      supabase
        .from('food_analysis_cache')
        .update({ hit_count: cachedResult.hit_count + 1 })
        .eq('id', cachedResult.id)
        .then(() => console.log('[CACHE] Hit count updated'));

      // Record usage as cached (0 cost) if userId provided
      if (userId) {
        recordUsageAsync(supabase, userId, 'scan', 0, true);
      }

      return new Response(JSON.stringify({
        success: true,
        dish_name: cachedResult.dish_name,
        foods_identified: cachedResult.foods_identified || [],
        portion_estimate: cachedResult.portion_estimate,
        nutrition: {
          calories: cachedResult.calories,
          protein: cachedResult.protein,
          carbs: cachedResult.carbs,
          fat: cachedResult.fat,
          fiber: cachedResult.fiber,
        },
        confidence: cachedResult.confidence,
        notes: cachedResult.notes,
        cached: true,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[CACHE] MISS for hash: ${imageHash.substring(0, 16)}... - calling AI`);

    // Check AI budget before making expensive API call (only if userId provided)
    if (userId) {
      const budgetCheck = await checkBudget(supabase, userId);
      if (!budgetCheck.allowed) {
        return new Response(JSON.stringify({ 
          success: false,
          error: budgetCheck.message,
          error_en: budgetCheck.message_en,
          code: 'BUDGET_LIMIT'
        }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = language === 'es' 
      ? `Eres un experto nutricionista que analiza fotos de comida. Tu tarea es identificar los alimentos en la imagen y estimar su información nutricional.

IMPORTANTE: 
- Identifica TODOS los alimentos visibles en la imagen
- Estima las porciones basándote en el tamaño visual
- Proporciona valores nutricionales REALISTAS basados en bases de datos nutricionales estándar
- Si no puedes identificar claramente un alimento, indícalo
- Responde SIEMPRE en formato JSON válido

Responde con el siguiente formato JSON exacto:
{
  "success": true,
  "dish_name": "Nombre del plato o descripción",
  "foods_identified": ["alimento1", "alimento2"],
  "portion_estimate": "descripción de la porción estimada",
  "nutrition": {
    "calories": número,
    "protein": número en gramos,
    "carbs": número en gramos,
    "fat": número en gramos,
    "fiber": número en gramos (opcional)
  },
  "confidence": "high" | "medium" | "low",
  "notes": "Notas adicionales o advertencias"
}`
      : `You are an expert nutritionist who analyzes food photos. Your task is to identify foods in the image and estimate their nutritional information.

IMPORTANT:
- Identify ALL visible foods in the image
- Estimate portions based on visual size
- Provide REALISTIC nutritional values based on standard nutritional databases
- If you cannot clearly identify a food, indicate it
- ALWAYS respond in valid JSON format

Respond with the following exact JSON format:
{
  "success": true,
  "dish_name": "Name of dish or description",
  "foods_identified": ["food1", "food2"],
  "portion_estimate": "estimated portion description",
  "nutrition": {
    "calories": number,
    "protein": number in grams,
    "carbs": number in grams,
    "fat": number in grams,
    "fiber": number in grams (optional)
  },
  "confidence": "high" | "medium" | "low",
  "notes": "Additional notes or warnings"
}`;

    const userPrompt = language === 'es'
      ? "Analiza esta foto de comida y proporciona la información nutricional estimada en formato JSON."
      : "Analyze this food photo and provide estimated nutritional information in JSON format.";

    console.log('Calling Lovable AI for food analysis...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: [
              { type: 'text', text: userPrompt },
              { 
                type: 'image_url', 
                image_url: { 
                  url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}` 
                } 
              }
            ]
          }
        ],
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
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response from AI');
    }

    console.log('AI Response:', content);

    // Parse the JSON response
    let nutritionData;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        nutritionData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to analyze food. Please try with a clearer image.',
        raw_response: content
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Record usage after successful AI call (only if userId provided)
    if (userId) {
      recordUsageAsync(supabase, userId, 'scan', SCAN_COST_CENTS, false);
    }

    // Save to cache for future use
    if (nutritionData.success !== false && nutritionData.dish_name) {
      console.log(`[CACHE] Saving new entry: "${nutritionData.dish_name}"`);
      
      const { error: insertError } = await supabase
        .from('food_analysis_cache')
        .insert({
          image_hash: imageHash,
          dish_name: nutritionData.dish_name,
          foods_identified: nutritionData.foods_identified || [],
          portion_estimate: nutritionData.portion_estimate,
          calories: nutritionData.nutrition?.calories,
          protein: nutritionData.nutrition?.protein,
          carbs: nutritionData.nutrition?.carbs,
          fat: nutritionData.nutrition?.fat,
          fiber: nutritionData.nutrition?.fiber,
          confidence: nutritionData.confidence || 'medium',
          notes: nutritionData.notes,
          language: language,
        });

      if (insertError) {
        console.error('[CACHE] Failed to save:', insertError.message);
      } else {
        console.log('[CACHE] Entry saved successfully');
      }
    }

    return new Response(JSON.stringify(nutritionData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in analyze-food function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
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
    // No record exists, user has full budget
    return { allowed: true, message: '', message_en: '' };
  }

  if (error) {
    console.error('Error checking budget:', error);
    // Fail open
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

  if (totalUsed + SCAN_COST_CENTS > monthlyLimit) {
    return {
      allowed: false,
      message: 'Has alcanzado tu límite de uso de IA este mes. El límite se reinicia el 1 de cada mes.',
      message_en: 'You have reached your AI usage limit this month. The limit resets on the 1st of each month.'
    };
  }

  return { allowed: true, message: '', message_en: '' };
}

function recordUsageAsync(supabase: any, userId: string, operationType: string, costCents: number, wasCached: boolean) {
  // Fire and forget - don't block the response
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
      };

      if (wasCached) {
        updates.food_scans_cached_count = (record.food_scans_cached_count || 0) + 1;
      } else {
        updates.food_scans_count = (record.food_scans_count || 0) + 1;
      }
      updates.scan_cost_cents = (record.scan_cost_cents || 0) + costCents;

      const monthlyLimit = record.monthly_limit_cents || 200;
      if (updates.total_cost_cents >= monthlyLimit) {
        updates.is_limit_reached = true;
        updates.limit_reached_at = new Date().toISOString();
      }

      await supabase
        .from('ai_usage_tracking')
        .update(updates)
        .eq('id', record.id);

      console.log(`Recorded scan usage: user=${userId}, cost=${costCents}c, cached=${wasCached}, total=${updates.total_cost_cents}c`);
    } catch (e) {
      console.error('Error recording usage:', e);
    }
  })();
}
