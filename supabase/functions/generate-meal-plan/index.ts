import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CachedRecipeBase {
  id: string;
  name: string;
  description: string;
  meal_type: string;
  ingredients: string[];
  steps: string[];
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  benefits: string;
}

interface CachedRecipe extends CachedRecipeBase {
  image_url: string | null;
}

interface MealSlot {
  day_of_week: number;
  meal_type: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, forceNew = false, language = 'es', weeklyCheckIn } = await req.json();
    
    console.log('Weekly Check-In data received:', weeklyCheckIn);

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

    // Map meal types based on meals per day
    const mealTypeMap: Record<number, string[]> = {
      1: ['breakfast'],
      2: ['breakfast', 'lunch'],
      3: ['breakfast', 'lunch', 'dinner'],
    };
    const mealTypes = mealTypeMap[preferences.meals_per_day] || ['breakfast', 'lunch', 'dinner'];
    const totalMealsNeeded = 7 * mealTypes.length;

    console.log(`Need ${totalMealsNeeded} meals (${mealTypes.length} per day × 7 days)`);

    // ============================================
    // CACHE SYSTEM: Temporarily disabled due to timeout
    // ============================================
    console.log('Cache temporarily disabled - generating all meals fresh');
    
    const cachedRecipes: CachedRecipeBase[] = [];
    console.log(`Found ${cachedRecipes.length} cached recipes (cache disabled)`);

    // Filter out recipes containing allergens or dislikes
    const userAllergens = preferences.allergies || [];
    const userDislikes = preferences.dislikes || [];
    
    const filteredCachedRecipes = (cachedRecipes || []).filter((recipe: CachedRecipeBase) => {
      const ingredientsLower = (recipe.ingredients || []).map((i: string) => i.toLowerCase());
      const nameLower = recipe.name.toLowerCase();
      
      // Check for allergens
      for (const allergen of userAllergens) {
        const allergenLower = allergen.toLowerCase();
        if (nameLower.includes(allergenLower) || 
            ingredientsLower.some((i: string) => i.includes(allergenLower))) {
          return false;
        }
      }
      
      // Check for dislikes
      for (const dislike of userDislikes) {
        const dislikeLower = dislike.toLowerCase();
        if (nameLower.includes(dislikeLower) || 
            ingredientsLower.some((i: string) => i.includes(dislikeLower))) {
          return false;
        }
      }
      
      return true;
    }) as CachedRecipeBase[];

    console.log(`After filtering allergens/dislikes: ${filteredCachedRecipes.length} recipes available`);

    // Group cached recipes by meal type
    const cachedByMealType: Record<string, CachedRecipeBase[]> = {};
    for (const mealType of mealTypes) {
      cachedByMealType[mealType] = filteredCachedRecipes.filter(
        (r: CachedRecipeBase) => r.meal_type === mealType
      );
      // Shuffle for variety
      cachedByMealType[mealType].sort(() => Math.random() - 0.5);
    }

    // Determine which meals we can get from cache and which need generation
    const mealsFromCacheBase: Array<CachedRecipeBase & { day_of_week: number }> = [];
    const slotsNeedingGeneration: MealSlot[] = [];

    for (let day = 0; day < 7; day++) {
      for (const mealType of mealTypes) {
        const availableFromCache = cachedByMealType[mealType];
        if (availableFromCache.length > 0) {
          const recipe = availableFromCache.shift()!;
          mealsFromCacheBase.push({ ...recipe, day_of_week: day });
        } else {
          slotsNeedingGeneration.push({ day_of_week: day, meal_type: mealType });
        }
      }
    }

    // Fetch images only for selected cache recipes (much smaller query)
    let mealsFromCache: Array<CachedRecipe & { day_of_week: number }> = [];
    if (mealsFromCacheBase.length > 0) {
      const recipeIds = mealsFromCacheBase.map(r => r.id);
      const { data: imagesData } = await supabaseClient
        .from('recipe_library')
        .select('id, image_url')
        .in('id', recipeIds);
      
      const imageMap = new Map((imagesData || []).map((r: any) => [r.id, r.image_url]));
      mealsFromCache = mealsFromCacheBase.map(r => ({
        ...r,
        image_url: imageMap.get(r.id) || null
      }));
    }

    console.log(`Using ${mealsFromCache.length} meals from cache`);
    console.log(`Need to generate ${slotsNeedingGeneration.length} new meals`);

    // ============================================
    // Generate only the missing meals (if any)
    // ============================================
    let generatedMeals: any[] = [];
    let shoppingList: string[] = [];

    if (slotsNeedingGeneration.length > 0) {
      console.log('Generating new meals with AI for missing slots...');

      // Build weekly check-in context
      let checkInContext = '';
      if (weeklyCheckIn) {
        const weightMap: Record<string, string> = {
          up: language === 'en' ? 'gained weight' : 'subió de peso',
          down: language === 'en' ? 'lost weight' : 'bajó de peso',
          same: language === 'en' ? 'stayed the same' : 'se mantuvo igual',
        };
        const energyMap: Record<string, string> = {
          high: language === 'en' ? 'high' : 'alta',
          normal: language === 'en' ? 'normal' : 'normal',
          low: language === 'en' ? 'low' : 'baja',
        };

        checkInContext = language === 'en'
          ? `\nWEEKLY ADAPTATION:\n- Weight: ${weightMap[weeklyCheckIn.weightChange] || ''}\n- Energy: ${energyMap[weeklyCheckIn.energyLevel] || ''}\n${weeklyCheckIn.availableIngredients ? `- Available ingredients: ${weeklyCheckIn.availableIngredients}` : ''}`
          : `\nADAPTACIÓN SEMANAL:\n- Peso: ${weightMap[weeklyCheckIn.weightChange] || ''}\n- Energía: ${energyMap[weeklyCheckIn.energyLevel] || ''}\n${weeklyCheckIn.availableIngredients ? `- Ingredientes disponibles: ${weeklyCheckIn.availableIngredients}` : ''}`;
      }

      // Create prompt for only the missing meals
      const slotDescriptions = slotsNeedingGeneration.map(s => 
        `Day ${s.day_of_week}, ${s.meal_type}`
      ).join('; ');

      const prompt = language === 'en'
        ? `You are an expert nutritionist chef. Generate ONLY these specific meals: ${slotDescriptions}

USER PROFILE:
- Goal: ${preferences.goal}
- Diet: ${preferences.diet_type}
- Allergies: ${preferences.allergies?.join(', ') || 'None'}
- Dislikes: ${preferences.dislikes?.join(', ') || 'None'}
- Skill level: ${preferences.cooking_skill || 'beginner'}
- Budget: ${preferences.budget || 'medium'}
- Max cooking time: ${preferences.cooking_time || 30} minutes
${checkInContext}

Generate ${slotsNeedingGeneration.length} UNIQUE recipes. Respond ONLY with valid JSON:
{
  "meals": [
    {
      "day_of_week": 0,
      "meal_type": "breakfast",
      "name": "Recipe Name",
      "description": "Brief description",
      "ingredients": ["ingredient 1", "ingredient 2"],
      "steps": ["Step 1", "Step 2"],
      "calories": 400,
      "protein": 20,
      "carbs": 50,
      "fats": 15,
      "benefits": "Nutritional benefits"
    }
  ],
  "shopping_list": ["item1", "item2"]
}`
        : `Eres un chef nutricionista experto. Genera SOLO estas comidas específicas: ${slotDescriptions}

PERFIL DEL USUARIO:
- Objetivo: ${preferences.goal}
- Dieta: ${preferences.diet_type}
- Alergias: ${preferences.allergies?.join(', ') || 'Ninguna'}
- No le gusta: ${preferences.dislikes?.join(', ') || 'Nada'}
- Nivel de habilidad: ${preferences.cooking_skill || 'principiante'}
- Presupuesto: ${preferences.budget || 'medio'}
- Tiempo máximo de cocina: ${preferences.cooking_time || 30} minutos
${checkInContext}

Genera ${slotsNeedingGeneration.length} recetas ÚNICAS. Responde SOLO con JSON válido:
{
  "meals": [
    {
      "day_of_week": 0,
      "meal_type": "breakfast",
      "name": "Nombre de la Receta",
      "description": "Descripción breve",
      "ingredients": ["ingrediente 1", "ingrediente 2"],
      "steps": ["Paso 1", "Paso 2"],
      "calories": 400,
      "protein": 20,
      "carbs": 50,
      "fats": 15,
      "benefits": "Beneficios nutricionales"
    }
  ],
  "shopping_list": ["item1", "item2"]
}`;

      // Call AI for text generation
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash-lite', // Use cheaper model for text
          messages: [{ role: 'user', content: prompt }]
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI text generation error:', errorText);
        throw new Error('Failed to generate meals with AI');
      }

      const aiData = await response.json();
      const content = aiData.choices[0].message.content;
      const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      let mealData;
      try {
        mealData = JSON.parse(jsonContent);
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        throw new Error('AI returned invalid JSON');
      }

      shoppingList = mealData.shopping_list || [];

      // Generate images for NEW meals (maintaining quality as user requested)
      console.log(`Generating ${mealData.meals.length} images for new meals...`);
      
      generatedMeals = await Promise.all(
        mealData.meals.map(async (meal: any) => {
          try {
            const imagePrompt = language === 'en'
              ? `Professional appetizing high quality food photo of ${meal.name}, ${preferences.diet_type} dish, elegant presentation, natural lighting, gastronomic style`
              : `Foto profesional apetitosa de alta calidad de ${meal.name}, plato ${preferences.diet_type}, presentación elegante, iluminación natural, estilo gastronómico`;

            const imageResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'google/gemini-2.5-flash-image',
                messages: [{ role: 'user', content: imagePrompt }],
                modalities: ['image', 'text']
              }),
            });

            if (imageResponse.ok) {
              const imageData = await imageResponse.json();
              const imageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
              console.log(`Generated image for: ${meal.name}`);
              return { ...meal, image_url: imageUrl };
            } else {
              console.error(`Failed to generate image for ${meal.name}`);
              return { ...meal, image_url: null };
            }
          } catch (error) {
            console.error(`Error generating image for ${meal.name}:`, error);
            return { ...meal, image_url: null };
          }
        })
      );

      // Save new recipes to the library for future use
      console.log('Saving new recipes to library...');
      for (const meal of generatedMeals) {
        if (meal.image_url) {
          await supabaseClient
            .from('recipe_library')
            .insert({
              name: meal.name,
              description: meal.description,
              meal_type: meal.meal_type,
              diet_type: preferences.diet_type,
              ingredients: meal.ingredients || [],
              steps: meal.steps || [],
              calories: meal.calories || 0,
              protein: meal.protein || 0,
              carbs: meal.carbs || 0,
              fats: meal.fats || 0,
              benefits: meal.benefits,
              image_url: meal.image_url,
              language: language,
              has_image: true,
              complexity: preferences.meal_complexity || 'simple',
              cooking_time_minutes: preferences.cooking_time || 30,
            });
        }
      }
      console.log(`Saved ${generatedMeals.filter(m => m.image_url).length} new recipes to library`);
    }

    // ============================================
    // Combine cached and generated meals
    // ============================================
    const allMeals = [
      ...mealsFromCache.map(m => ({
        day_of_week: m.day_of_week,
        meal_type: m.meal_type,
        name: m.name,
        description: m.description,
        ingredients: m.ingredients,
        steps: m.steps,
        calories: m.calories,
        protein: m.protein,
        carbs: m.carbs,
        fats: m.fats,
        benefits: m.benefits,
        image_url: m.image_url,
      })),
      ...generatedMeals.map(m => ({
        day_of_week: m.day_of_week,
        meal_type: m.meal_type,
        name: m.name,
        description: m.description,
        ingredients: m.ingredients || [],
        steps: m.steps || [],
        calories: m.calories || 0,
        protein: m.protein || 0,
        carbs: m.carbs || 0,
        fats: m.fats || 0,
        benefits: m.benefits,
        image_url: m.image_url,
      }))
    ];

    // Generate shopping list from all ingredients if not from AI
    if (shoppingList.length === 0) {
      const allIngredients = allMeals.flatMap(m => m.ingredients);
      shoppingList = [...new Set(allIngredients)];
    }

    // ============================================
    // Create meal plan in database
    // ============================================
    const preferencesHash = JSON.stringify({
      goal: preferences.goal,
      diet_type: preferences.diet_type,
      allergies: preferences.allergies?.sort(),
      dislikes: preferences.dislikes?.sort(),
      meals_per_day: preferences.meals_per_day,
    });

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
    const mealsToInsert = allMeals.map(meal => ({
      meal_plan_id: mealPlan.id,
      day_of_week: meal.day_of_week,
      meal_type: meal.meal_type,
      name: meal.name,
      description: meal.description,
      benefits: meal.benefits,
      ingredients: meal.ingredients,
      steps: meal.steps,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fats: meal.fats,
      image_url: meal.image_url,
    }));

    const { data: insertedMeals, error: mealsError } = await supabaseClient
      .from('meals')
      .insert(mealsToInsert)
      .select();

    if (mealsError || !insertedMeals || insertedMeals.length === 0) {
      console.error('Error inserting meals:', mealsError);
      await supabaseClient.from('meal_plans').delete().eq('id', mealPlan.id);
      throw new Error('Failed to insert meals into database');
    }

    console.log(`Successfully inserted ${insertedMeals.length} meals`);

    // Insert shopping list
    await supabaseClient
      .from('shopping_lists')
      .insert({
        meal_plan_id: mealPlan.id,
        items: shoppingList,
      });

    const cachedCount = mealsFromCache.length;
    const generatedCount = generatedMeals.length;
    const savingsPercent = totalMealsNeeded > 0 
      ? Math.round((cachedCount / totalMealsNeeded) * 100) 
      : 0;

    console.log(`✅ Meal plan complete! Cache: ${cachedCount}, Generated: ${generatedCount}, Savings: ${savingsPercent}%`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        mealPlanId: mealPlan.id,
        mealsCount: insertedMeals.length,
        fromCache: cachedCount,
        generated: generatedCount,
        savingsPercent: savingsPercent,
      }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in generate-meal-plan function:', error);
    
    let errorLanguage = 'es';
    try {
      const body = await req.clone().json();
      errorLanguage = body.language || 'es';
    } catch {}
    
    const errorMessages: Record<string, { es: string; en: string }> = {
      rate_limit: {
        es: 'Demasiadas solicitudes. Por favor, espera un momento.',
        en: 'Too many requests. Please wait a moment.'
      },
      invalid_user: { es: 'Usuario inválido', en: 'Invalid user' },
      no_preferences: {
        es: 'No se encontraron preferencias. Completa el onboarding primero.',
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
    
    return new Response(
      JSON.stringify({ 
        error: errorMessages[errorKey][errorLanguage as 'es' | 'en'] || error.message,
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
