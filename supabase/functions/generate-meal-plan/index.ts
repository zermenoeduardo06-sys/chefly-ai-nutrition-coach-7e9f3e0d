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
    const { userId } = await req.json();
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

    if (!preferences) throw new Error('No preferences found');

    console.log('Generating meal plan for user with preferences:', preferences);

    // Map meal types
    const mealTypeMap: Record<number, string[]> = {
      1: ['breakfast'],
      2: ['breakfast', 'lunch'],
      3: ['breakfast', 'lunch', 'dinner'],
    };

    const mealTypes = mealTypeMap[preferences.meals_per_day] || ['breakfast', 'lunch', 'dinner'];
    const mealTypesES = {
      breakfast: 'desayuno',
      lunch: 'almuerzo',
      dinner: 'cena'
    };

    // Generate meal plan with Lovable AI
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{
          role: 'system',
          content: `Eres un nutricionista experto. Genera un plan de comidas semanal completo (7 días) con ${preferences.meals_per_day} comidas por día.

PREFERENCIAS DEL USUARIO:
- Objetivo: ${preferences.goal}
- Tipo de dieta: ${preferences.diet_type}
- Alergias/Restricciones: ${preferences.allergies?.join(', ') || 'Ninguna'}
- Comidas por día: ${preferences.meals_per_day}

INSTRUCCIONES:
1. Crea recetas saludables, variadas y deliciosas para cada día
2. Asegúrate de que todas las recetas sean apropiadas para la dieta "${preferences.diet_type}"
3. NUNCA incluyas ingredientes que estén en la lista de alergias
4. Las recetas deben estar alineadas con el objetivo: "${preferences.goal}"
5. Incluye información nutricional relevante en los beneficios
6. Genera exactamente ${7 * preferences.meals_per_day} comidas en total

Responde ÚNICAMENTE con un objeto JSON válido (sin texto adicional) con esta estructura exacta:
{
  "meals": [
    {
      "day_of_week": 0,
      "meal_type": "breakfast",
      "name": "Nombre del plato",
      "description": "Descripción breve de la receta y cómo prepararla (máximo 150 caracteres)",
      "benefits": "Beneficios nutricionales específicos (ej: 350 kcal, 20g proteína, rico en fibra)"
    }
  ],
  "shopping_list": ["ingrediente 1", "ingrediente 2", "ingrediente 3"]
}

IMPORTANTE: 
- day_of_week debe ser un número de 0 a 6
- meal_type debe ser exactamente: ${mealTypes.map(m => `"${m}"`).join(' o ')}
- La shopping_list debe contener todos los ingredientes únicos necesarios para la semana`
        }]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', errorText);
      throw new Error('Failed to generate meal plan with AI');
    }

    const aiData = await response.json();
    console.log('AI Response:', aiData);
    
    const content = aiData.choices[0].message.content;
    // Remove markdown code blocks if present
    const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const mealData = JSON.parse(jsonContent);

    console.log('Generated meal data:', mealData);

    // Create meal plan
    const { data: mealPlan } = await supabaseClient
      .from('meal_plans')
      .insert({
        user_id: userId,
        week_start_date: new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    // Insert meals
    const meals = mealData.meals.map((meal: any) => ({
      meal_plan_id: mealPlan.id,
      day_of_week: meal.day_of_week,
      meal_type: meal.meal_type,
      name: meal.name,
      description: meal.description,
      benefits: meal.benefits,
    }));

    await supabaseClient.from('meals').insert(meals);

    // Insert shopping list
    await supabaseClient.from('shopping_lists').insert({
      meal_plan_id: mealPlan.id,
      items: mealData.shopping_list,
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
