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

    // Generate meal plan with AI
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
          content: `Eres un nutricionista experto. Genera un plan de comidas semanal (7 días) con ${preferences.meals_per_day} comidas por día.
Objetivo: ${preferences.goal}
Dieta: ${preferences.diet_type}
Alergias: ${preferences.allergies?.join(', ') || 'Ninguna'}

Responde en formato JSON con esta estructura:
{
  "meals": [
    {
      "day": 0-6,
      "type": "breakfast/lunch/dinner",
      "name": "Nombre del plato",
      "description": "Descripción breve",
      "benefits": "Beneficios nutricionales"
    }
  ],
  "shopping_list": ["ingrediente 1", "ingrediente 2"]
}`
        }]
      }),
    });

    const aiData = await response.json();
    const mealData = JSON.parse(aiData.choices[0].message.content);

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
      day_of_week: meal.day,
      meal_type: meal.type,
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
