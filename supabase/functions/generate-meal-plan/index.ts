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
    const { userId, forceNew = false, language = 'es', weeklyCheckIn } = await req.json();
    
    console.log('Weekly Check-In data received:', weeklyCheckIn);

    // Validate userId
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid userId');
    }
    
    console.log('Force new meal plan:', forceNew, 'Language:', language);
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
    
    // Language-specific variations
    const seasonalVariationsES = [
      'ingredientes de temporada y frescos',
      'sabores tradicionales auténticos',
      'recetas innovadoras y modernas',
      'platos reconfortantes caseros',
      'fusión de sabores internacionales',
      'cocina ligera y refrescante'
    ];
    
    const seasonalVariationsEN = [
      'fresh seasonal ingredients',
      'authentic traditional flavors',
      'innovative modern recipes',
      'comforting homemade dishes',
      'international flavor fusion',
      'light and refreshing cuisine'
    ];
    
    const seasonalVariations = language === 'en' ? seasonalVariationsEN : seasonalVariationsES;
    const randomVariation = seasonalVariations[Math.floor(Math.random() * seasonalVariations.length)];
    
    console.log(`Applying variation seed: ${variationSeed} with theme: ${randomVariation}`);

    // Map meal types
    const mealTypeMap: Record<number, string[]> = {
      1: ['breakfast'],
      2: ['breakfast', 'lunch'],
      3: ['breakfast', 'lunch', 'dinner'],
    };

    const mealTypes = mealTypeMap[preferences.meals_per_day] || ['breakfast', 'lunch', 'dinner'];
    
    // Build weekly check-in context for AI prompt
    let checkInContextES = '';
    let checkInContextEN = '';
    
    if (weeklyCheckIn) {
      const weightMap: Record<string, { es: string; en: string }> = {
        up: { es: 'subió de peso', en: 'gained weight' },
        down: { es: 'bajó de peso', en: 'lost weight' },
        same: { es: 'se mantuvo igual', en: 'stayed the same' },
      };
      
      const energyMap: Record<string, { es: string; en: string }> = {
        high: { es: 'alta', en: 'high' },
        normal: { es: 'normal', en: 'normal' },
        low: { es: 'baja', en: 'low' },
      };
      
      const prefMap: Record<string, { es: string; en: string }> = {
        healthier: { es: 'más saludables', en: 'healthier' },
        faster: { es: 'más rápidas', en: 'faster' },
        cheaper: { es: 'más económicas', en: 'cheaper' },
        more_protein: { es: 'más proteicas', en: 'more protein' },
        more_varied: { es: 'más variadas', en: 'more varied' },
        different: { es: 'algo diferente', en: 'something different' },
      };
      
      const goalMap: Record<string, { es: string; en: string }> = {
        cheaper: { es: 'más económico', en: 'cheaper' },
        faster: { es: 'más rápido de cocinar', en: 'faster to cook' },
        more_protein: { es: 'más contenido proteico', en: 'more protein content' },
      };
      
      const weightChangeES = weeklyCheckIn.weightChange ? weightMap[weeklyCheckIn.weightChange]?.es : '';
      const weightChangeEN = weeklyCheckIn.weightChange ? weightMap[weeklyCheckIn.weightChange]?.en : '';
      const energyES = weeklyCheckIn.energyLevel ? energyMap[weeklyCheckIn.energyLevel]?.es : '';
      const energyEN = weeklyCheckIn.energyLevel ? energyMap[weeklyCheckIn.energyLevel]?.en : '';
      
      const recipePrefsES = weeklyCheckIn.recipePreferences?.map((p: string) => prefMap[p]?.es).filter(Boolean).join(', ') || '';
      const recipePrefsEN = weeklyCheckIn.recipePreferences?.map((p: string) => prefMap[p]?.en).filter(Boolean).join(', ') || '';
      
      const goalsES = weeklyCheckIn.weeklyGoals?.map((g: string) => goalMap[g]?.es).filter(Boolean).join(', ') || '';
      const goalsEN = weeklyCheckIn.weeklyGoals?.map((g: string) => goalMap[g]?.en).filter(Boolean).join(', ') || '';
      
      checkInContextES = `
ADAPTACIÓN SEMANAL (MUY IMPORTANTE):
El usuario acaba de hacer su check-in semanal con la siguiente información:
- Esta semana ${weightChangeES}
- Su nivel de energía fue: ${energyES}
${recipePrefsES ? `- Quiere recetas: ${recipePrefsES}` : ''}
${weeklyCheckIn.customRecipePreference ? `- Solicitud especial: ${weeklyCheckIn.customRecipePreference}` : ''}
${weeklyCheckIn.availableIngredients ? `- Ingredientes disponibles en casa: ${weeklyCheckIn.availableIngredients}` : ''}
${goalsES ? `- Prioridades esta semana: ${goalsES}` : ''}

AJUSTES OBLIGATORIOS:
${weeklyCheckIn.weightChange === 'up' ? '- REDUCE calorías y carbohidratos. Enfócate en proteínas magras y vegetales.' : ''}
${weeklyCheckIn.weightChange === 'down' ? '- Mantén el buen trabajo. Puedes incluir más variedad manteniendo el balance calórico.' : ''}
${weeklyCheckIn.energyLevel === 'low' ? '- AUMENTA carbohidratos complejos y asegura suficiente hierro y B12.' : ''}
${weeklyCheckIn.energyLevel === 'high' ? '- Mantén el equilibrio actual, el usuario está funcionando bien.' : ''}
${weeklyCheckIn.weeklyGoals?.includes('cheaper') ? '- USA ingredientes económicos y recetas de bajo costo.' : ''}
${weeklyCheckIn.weeklyGoals?.includes('faster') ? '- PRIORIZA recetas rápidas de menos de 20 minutos.' : ''}
${weeklyCheckIn.weeklyGoals?.includes('more_protein') ? '- AUMENTA el contenido de proteína en cada comida.' : ''}
${weeklyCheckIn.availableIngredients ? `- INCLUYE estos ingredientes que el usuario ya tiene: ${weeklyCheckIn.availableIngredients}` : ''}
`;
      
      checkInContextEN = `
WEEKLY ADAPTATION (VERY IMPORTANT):
The user just completed their weekly check-in with the following information:
- This week they ${weightChangeEN}
- Their energy level was: ${energyEN}
${recipePrefsEN ? `- They want recipes that are: ${recipePrefsEN}` : ''}
${weeklyCheckIn.customRecipePreference ? `- Special request: ${weeklyCheckIn.customRecipePreference}` : ''}
${weeklyCheckIn.availableIngredients ? `- Ingredients available at home: ${weeklyCheckIn.availableIngredients}` : ''}
${goalsEN ? `- Priorities this week: ${goalsEN}` : ''}

MANDATORY ADJUSTMENTS:
${weeklyCheckIn.weightChange === 'up' ? '- REDUCE calories and carbohydrates. Focus on lean proteins and vegetables.' : ''}
${weeklyCheckIn.weightChange === 'down' ? '- Keep up the good work. You can include more variety while maintaining caloric balance.' : ''}
${weeklyCheckIn.energyLevel === 'low' ? '- INCREASE complex carbohydrates and ensure adequate iron and B12.' : ''}
${weeklyCheckIn.energyLevel === 'high' ? '- Maintain current balance, the user is doing well.' : ''}
${weeklyCheckIn.weeklyGoals?.includes('cheaper') ? '- USE budget-friendly ingredients and low-cost recipes.' : ''}
${weeklyCheckIn.weeklyGoals?.includes('faster') ? '- PRIORITIZE quick recipes under 20 minutes.' : ''}
${weeklyCheckIn.weeklyGoals?.includes('more_protein') ? '- INCREASE protein content in every meal.' : ''}
${weeklyCheckIn.availableIngredients ? `- INCLUDE these ingredients the user already has: ${weeklyCheckIn.availableIngredients}` : ''}
`;
    }

    // Generate language-specific prompt
    const promptES = `Eres un chef nutricionista experto. Crea un plan de comidas COMPLETAMENTE ÚNICO Y ORIGINAL para la semana (7 días) con ${preferences.meals_per_day} comidas por día.

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
${checkInContextES}

IMPORTANTE: 
- Usa creatividad extrema - NUNCA repitas recetas exactas
- Enfoque especial en: ${randomVariation}
- Mezcla diferentes técnicas de cocción cada día
- Varía los ingredientes principales entre comidas
- Respeta el nivel de habilidad
- Ajusta el presupuesto
- Las recetas NO deben exceder el tiempo de cocina preferido
- Ajusta las porciones según el número de personas
- Evita completamente los alérgenos y los ingredientes que no le gustan

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

Genera ${7 * preferences.meals_per_day} recetas variadas y específicas. Cada receta DEBE tener nombre único, ingredientes reales, pasos de preparación y valores nutricionales.`;

    const promptEN = `You are an expert nutritionist chef. Create a COMPLETELY UNIQUE AND ORIGINAL meal plan for the week (7 days) with ${preferences.meals_per_day} meals per day.

CRITICAL: This is menu plan #${variationSeed}. It must be TOTALLY DIFFERENT from any previous plan. Prioritize ${randomVariation} in this plan to ensure maximum variety.

USER PROFILE:
- Goal: ${preferences.goal}
- Diet: ${preferences.diet_type}
- Activity level: ${preferences.activity_level || 'moderate'}
- Allergies: ${preferences.allergies?.join(', ') || 'None'}
- Dislikes: ${preferences.dislikes?.join(', ') || 'Nothing in particular'}

COOKING PREFERENCES:
- Skill level: ${preferences.cooking_skill || 'beginner'}
- Budget: ${preferences.budget || 'medium'}
- Available time: ${preferences.cooking_time || 30} minutes per meal
- Cooking for: ${preferences.servings || 1} person(s)
- Preferred complexity: ${preferences.meal_complexity || 'simple'}

TASTES AND PREFERENCES:
- Preferred flavors: ${preferences.flavor_preferences?.join(', ') || 'All'}
- Preferred cuisines: ${preferences.preferred_cuisines?.join(', ') || 'Varied'}
${preferences.age ? `- Age: ${preferences.age} years` : ''}
${preferences.weight ? `- Weight: ${preferences.weight} kg` : ''}
${preferences.gender ? `- Gender: ${preferences.gender}` : ''}
${preferences.additional_notes ? `\nADDITIONAL NOTES: ${preferences.additional_notes}` : ''}
${checkInContextEN}

IMPORTANT: 
- Use extreme creativity - NEVER repeat exact recipes
- Special focus on: ${randomVariation}
- Mix different cooking techniques each day
- Vary main ingredients between meals
- Respect skill level
- Adjust for budget
- Recipes should NOT exceed preferred cooking time
- Adjust portions according to number of people
- Completely avoid allergens and disliked ingredients

Respond ONLY with valid JSON (no markdown, no additional text):
{
  "meals": [
    {
      "day_of_week": 0,
      "meal_type": "breakfast",
      "name": "Oatmeal with Fruits and Almonds",
      "description": "Cooked oatmeal with banana, strawberries and toasted almonds",
      "ingredients": ["1 cup oats", "1 banana", "5 strawberries", "30g almonds", "1 cup milk"],
      "steps": ["Cook oatmeal with milk", "Cut the fruits", "Add toasted almonds"],
      "calories": 420,
      "protein": 18,
      "carbs": 65,
      "fats": 12,
      "benefits": "High in fiber, protein and healthy fats. Ideal for morning energy."
    }
  ],
  "shopping_list": ["oats", "banana", "strawberries", "almonds", "milk"]
}

Generate ${7 * preferences.meals_per_day} varied and specific recipes. Each recipe MUST have a unique name, real ingredients, preparation steps and nutritional values.`;

    const aiPrompt = language === 'en' ? promptEN : promptES;

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
          content: aiPrompt
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
    
    let mealData;
    try {
      mealData = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      throw new Error('AI returned invalid JSON format');
    }
    
    // Validate meal data structure BEFORE generating images (to save credits)
    const validateMealData = (data: any): { valid: boolean; error?: string } => {
      if (!data || typeof data !== 'object') {
        return { valid: false, error: 'Response is not an object' };
      }
      if (!Array.isArray(data.meals) || data.meals.length === 0) {
        return { valid: false, error: 'No meals array found or empty' };
      }
      if (!Array.isArray(data.shopping_list)) {
        return { valid: false, error: 'No shopping_list array found' };
      }
      
      const requiredFields = ['day_of_week', 'meal_type', 'name', 'description', 'benefits'];
      for (let i = 0; i < data.meals.length; i++) {
        const meal = data.meals[i];
        for (const field of requiredFields) {
          if (meal[field] === undefined || meal[field] === null) {
            return { valid: false, error: `Meal ${i} missing required field: ${field}` };
          }
        }
      }
      return { valid: true };
    };

    const validation = validateMealData(mealData);
    if (!validation.valid) {
      console.error('AI response validation failed:', validation.error);
      throw new Error(`Invalid AI response: ${validation.error}`);
    }
    
    console.log('Parsed and validated meal data:', JSON.stringify(mealData, null, 2));

    // Generate images for each meal using Lovable AI
    console.log('Generating images for meals...');
    const mealsWithImages = await Promise.all(
      mealData.meals.map(async (meal: any) => {
        try {
          const imagePrompt = language === 'en' 
            ? `Professional appetizing high quality photo of ${meal.name}, ${preferences.diet_type} food dish, elegant presentation, natural lighting, gastronomic style`
            : `Foto profesional apetitosa de alta calidad de ${meal.name}, plato de comida ${preferences.diet_type}, presentación elegante, iluminación natural, estilo gastronómico`;
          
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

    // Helper function to convert day name to number
    const dayNameToNumber = (day: any): number => {
      if (typeof day === 'number') return day;
      const dayMap: Record<string, number> = {
        'monday': 0, 'lunes': 0,
        'tuesday': 1, 'martes': 1,
        'wednesday': 2, 'miércoles': 2, 'miercoles': 2,
        'thursday': 3, 'jueves': 3,
        'friday': 4, 'viernes': 4,
        'saturday': 5, 'sábado': 5, 'sabado': 5,
        'sunday': 6, 'domingo': 6,
      };
      const normalized = String(day).toLowerCase().trim();
      return dayMap[normalized] ?? 0;
    };

    // Insert meals
    const meals = mealData.meals.map((meal: any) => ({
      meal_plan_id: mealPlan.id,
      day_of_week: dayNameToNumber(meal.day_of_week),
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
    
    // Get language from request for error messages
    let errorLanguage = 'es';
    try {
      const body = await req.clone().json();
      errorLanguage = body.language || 'es';
    } catch {}
    
    // Handle specific error types with bilingual messages
    const errorMessages: Record<string, { es: string; en: string }> = {
      rate_limit: {
        es: 'Demasiadas solicitudes. Por favor, espera un momento e intenta de nuevo.',
        en: 'Too many requests. Please wait a moment and try again.'
      },
      invalid_user: {
        es: 'Usuario inválido',
        en: 'Invalid user'
      },
      no_preferences: {
        es: 'No se encontraron preferencias. Por favor, completa el onboarding primero.',
        en: 'No preferences found. Please complete onboarding first.'
      },
      default: {
        es: 'Error al generar el plan de comidas',
        en: 'Error generating meal plan'
      }
    };
    
    let errorKey = 'default';
    let statusCode = 500;
    
    if (error.message?.includes('Rate limit') || error.message?.includes('429')) {
      errorKey = 'rate_limit';
      statusCode = 429;
    } else if (error.message?.includes('Invalid userId')) {
      errorKey = 'invalid_user';
      statusCode = 400;
    } else if (error.message?.includes('No preferences found')) {
      errorKey = 'no_preferences';
      statusCode = 400;
    }
    
    const errorMessage = errorMessages[errorKey][errorLanguage as 'es' | 'en'] || error.message;
    
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
