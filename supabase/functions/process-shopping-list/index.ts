import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { ingredients, language = 'es' } = await req.json();

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No ingredients provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
      throw new Error(`Lovable API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content?.trim();

    if (!content) {
      throw new Error('Empty response from AI');
    }

    // Parse JSON from response
    let processedItems;
    try {
      // Extract JSON from potential markdown code blocks
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
