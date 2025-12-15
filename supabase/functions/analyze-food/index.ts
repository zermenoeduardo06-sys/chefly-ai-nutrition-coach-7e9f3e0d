import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, language = 'es' } = await req.json();

    if (!imageBase64) {
      throw new Error('No image provided');
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
      // Extract JSON from response (in case there's extra text)
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
