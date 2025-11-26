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
    const { userId, forceNew = false } = await req.json();
    
    // Validate userId
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid userId');
    }
    
    console.log('Force new meal plan:', forceNew);
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

    // Create preferences hash for caching
    const preferencesHash = JSON.stringify({
      goal: preferences.goal,
      diet_type: preferences.diet_type,
      activity_level: preferences.activity_level,
      allergies: preferences.allergies?.sort(),
      dislikes: preferences.dislikes?.sort(),
      cooking_skill: preferences.cooking_skill,
      budget: preferences.budget,
      cooking_time: preferences.cooking_time,
      servings: preferences.servings,
      meal_complexity: preferences.meal_complexity,
      flavor_preferences: preferences.flavor_preferences?.sort(),
      preferred_cuisines: preferences.preferred_cuisines?.sort(),
      meals_per_day: preferences.meals_per_day,
    });

    console.log('Preferences hash:', preferencesHash);

    // Always generate unique plans - no caching
    console.log('Generating new unique meal plan with AI...');
    
    // Add random variation seed to ensure unique results
    const variationSeed = Math.floor(Math.random() * 10000);
    const seasonalVariations = [
      'ingredientes de temporada y frescos',
      'sabores tradicionales auténticos',
      'recetas innovadoras y modernas',
      'platos reconfortantes caseros',
      'fusión de sabores internacionales',
      'cocina ligera y refrescante'
    ];
    const randomVariation = seasonalVariations[Math.floor(Math.random() * seasonalVariations.length)];
    
    console.log(`Applying variation seed: ${variationSeed} with theme: ${randomVariation}`);

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
          role: 'user',
          content: `Eres un chef nutricionista experto. Crea un plan de comidas COMPLETAMENTE ÚNICO Y ORIGINAL para la semana (7 días) con ${preferences.meals_per_day} comidas por día.

CRÍTICO: Este es el plan de menú #${variationSeed}. Debe ser TOTALMENTE DIFERENTE a cualquier plan anterior. Prioriza ${randomVariation} en este plan para garantizar variedad máxima.

PERFIL DEL USUARIO:
- Objetivo: ${preferences.goal}
- Dieta: ${preferences.diet_type}
- Nivel de actividad: ${preferences.activity_level || 'moderado'}
- Alergias: ${preferences.allergies?.join(', ') || 'Ninguna'}
- No le gusta: ${preferences.dislikes?.join(', ') || 'Nada en particular'}

PREFERENCIAS DE COCINA:
- Nivel de habilidad: ${preferences.cooking_skill || 'principiante'}
- Presupuesto: ${preferences.budget || 'medio'}
- Tiempo disponible: ${preferences.cooking_time || 30} minutos por comida
- Cocina para: ${preferences.servings || 1} persona(s)
- Complejidad preferida: ${preferences.meal_complexity || 'simple'}

GUSTOS Y PREFERENCIAS:
- Sabores preferidos: ${preferences.flavor_preferences?.join(', ') || 'Todos'}
- Cocinas preferidas: ${preferences.preferred_cuisines?.join(', ') || 'Variado'}
${preferences.age ? `- Edad: ${preferences.age} años` : ''}
${preferences.weight ? `- Peso: ${preferences.weight} kg` : ''}
${preferences.gender ? `- Género: ${preferences.gender}` : ''}
${preferences.additional_notes ? `\nNOTAS ADICIONALES: ${preferences.additional_notes}` : ''}

IMPORTANTE: 
- Usa creatividad extrema - NUNCA repitas recetas exactas
- Enfoque especial en: ${randomVariation}
- Mezcla diferentes técnicas de cocción cada día
- Varía los ingredientes principales entre comidas
- Respeta el nivel de habilidad (recetas más simples para principiantes, más elaboradas para avanzados)
- Ajusta el presupuesto (ingredientes económicos para presupuesto bajo, premium para alto)
- Las recetas NO deben exceder el tiempo de cocina preferido
- Ajusta las porciones según el número de personas
- Incluye variedad de las cocinas y sabores preferidos
- Evita completamente los alérgenos y los ingredientes que no le gustan
- Ajusta las calorías según el nivel de actividad y objetivos

Responde SOLO con JSON válido (sin markdown, sin texto adicional):
{
  "meals": [
    {
      "day_of_week": 0,
      "meal_type": "breakfast",
      "name": "Avena con Frutas y Almendras",
      "description": "Avena cocida con plátano, fresas y almendras tostadas",
      "ingredients": ["1 taza avena", "1 plátano", "5 fresas", "30g almendras", "1 taza leche"],
      "steps": ["Cocina la avena con leche", "Corta las frutas", "Agrega almendras tostadas"],
      "calories": 420,
      "protein": 18,
      "carbs": 65,
      "fats": 12,
      "benefits": "Alto en fibra, proteína y grasas saludables. Ideal para energía matutina."
    }
  ],
  "shopping_list": ["avena", "plátano", "fresas", "almendras", "leche"]
}

Genera ${7 * preferences.meals_per_day} recetas variadas y específicas. Cada receta DEBE tener nombre único, ingredientes reales, pasos de preparación y valores nutricionales ajustados al perfil del usuario.`
        }]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', errorText);
      throw new Error('Failed to generate meal plan with AI');
    }

    const aiData = await response.json();
    console.log('AI Full Response:', JSON.stringify(aiData, null, 2));
    
    const content = aiData.choices[0].message.content;
    console.log('AI Content:', content);
    
    // Remove markdown code blocks if present
    const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    console.log('Cleaned JSON:', jsonContent);
    
    const mealData = JSON.parse(jsonContent);
    console.log('Parsed meal data:', JSON.stringify(mealData, null, 2));

    // Generate images for each meal using Lovable AI
    console.log('Generating images for meals...');
    const mealsWithImages = await Promise.all(
      mealData.meals.map(async (meal: any) => {
        try {
          const imagePrompt = `Foto profesional apetitosa de alta calidad de ${meal.name}, plato de comida ${preferences.diet_type}, presentación elegante, iluminación natural, estilo gastronómico`;
          
          const imageResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash-image',
              messages: [{
                role: 'user',
                content: imagePrompt
              }],
              modalities: ['image', 'text']
            }),
          });

          if (imageResponse.ok) {
            const imageData = await imageResponse.json();
            const imageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
            console.log(`Generated image for ${meal.name}`);
            return { ...meal, image_url: imageUrl };
          } else {
            console.error(`Failed to generate image for ${meal.name}`);
            return meal;
          }
        } catch (error) {
          console.error(`Error generating image for ${meal.name}:`, error);
          return meal;
        }
      })
    );

    mealData.meals = mealsWithImages;
    console.log('Images generated successfully');

    // Create meal plan
    const { data: mealPlan, error: mealPlanError } = await supabaseClient
      .from('meal_plans')
      .insert({
        user_id: userId,
        week_start_date: new Date().toISOString().split('T')[0],
        preferences_hash: preferencesHash,
      })
      .select()
      .single();

    if (mealPlanError || !mealPlan) {
      console.error('Error creating meal plan:', mealPlanError);
      throw new Error('Failed to create meal plan in database');
    }

    console.log('Meal plan created with ID:', mealPlan.id);

    // Insert meals
    const meals = mealData.meals.map((meal: any) => ({
      meal_plan_id: mealPlan.id,
      day_of_week: meal.day_of_week,
      meal_type: meal.meal_type,
      name: meal.name,
      description: meal.description,
      benefits: meal.benefits,
      ingredients: meal.ingredients || [],
      steps: meal.steps || [],
      calories: meal.calories || 0,
      protein: meal.protein || 0,
      carbs: meal.carbs || 0,
      fats: meal.fats || 0,
      image_url: meal.image_url || null,
    }));

    const { data: insertedMeals, error: mealsError } = await supabaseClient
      .from('meals')
      .insert(meals)
      .select();

    if (mealsError || !insertedMeals || insertedMeals.length === 0) {
      console.error('Error inserting meals:', mealsError);
      // Cleanup: delete the meal plan if meals failed to insert
      await supabaseClient.from('meal_plans').delete().eq('id', mealPlan.id);
      throw new Error('Failed to insert meals into database');
    }

    console.log(`Successfully inserted ${insertedMeals.length} meals`);

    // Insert shopping list
    const { error: shoppingListError } = await supabaseClient
      .from('shopping_lists')
      .insert({
        meal_plan_id: mealPlan.id,
        items: mealData.shopping_list,
      });

    if (shoppingListError) {
      console.error('Error inserting shopping list:', shoppingListError);
      // Don't fail the whole operation for shopping list
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        mealPlanId: mealPlan.id,
        mealsCount: insertedMeals.length,
        cached: false
      }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in generate-meal-plan function:', error);
    
    // Handle specific error types
    let errorMessage = 'Error al generar el plan de comidas';
    let statusCode = 500;
    
    if (error.message?.includes('Rate limit') || error.message?.includes('429')) {
      errorMessage = 'Demasiadas solicitudes. Por favor, espera un momento e intenta de nuevo.';
      statusCode = 429;
    } else if (error.message?.includes('Invalid userId')) {
      errorMessage = 'Usuario inválido';
      statusCode = 400;
    } else if (error.message?.includes('No preferences found')) {
      errorMessage = 'No se encontraron preferencias. Por favor, completa el onboarding primero.';
      statusCode = 400;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: error.message,
        success: false 
      }),
      { 
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
