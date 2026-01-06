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
    // CACHE SYSTEM: Search for matching recipes (optimized - no image_url in initial query)
    // ============================================
    console.log('Searching recipe library for cached recipes...');
    
    // Build query for cached recipes - select WITHOUT image_url for performance
    // Images are now stored in Storage as URLs, not base64, so this should be fast
    let cacheQuery = supabaseClient
      .from('recipe_library')
      .select('id, name, description, meal_type, ingredients, steps, calories, protein, carbs, fats, benefits')
      .eq('has_image', true)
      .in('meal_type', mealTypes)
      .not('image_url', 'like', 'data:image%') // Only get migrated recipes (Storage URLs)
      .limit(100);

    // Filter by diet type - omnivore recipes work for everyone
    const dietType = preferences.diet_type?.toLowerCase();
    if (dietType && dietType !== 'omnivore' && dietType !== 'omnivoro') {
      cacheQuery = cacheQuery.eq('diet_type', dietType);
    }

    // Filter by language
    cacheQuery = cacheQuery.eq('language', language);

    const { data: cachedRecipes, error: cacheError } = await cacheQuery;

    if (cacheError) {
      console.error('Error fetching cached recipes:', cacheError);
    }

    console.log(`Found ${cachedRecipes?.length || 0} cached recipes with Storage images`);

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
    console.log(`Slots needing recipes: ${slotsNeedingGeneration.length}`);

    // ============================================
    // 100% CACHE MODE - NO AI CALLS
    // If not enough unique recipes, reuse from cache with variety
    // ============================================
    let shoppingList: string[] = [];

    // Handle missing slots by reusing cached recipes
    if (slotsNeedingGeneration.length > 0) {
      console.log('Filling missing slots from cache (NO AI - 100% cache mode)...');
      
      // Get ALL available cached recipes for reuse (without the allergen/dislike filter applied recipes)
      for (const slot of slotsNeedingGeneration) {
        // Try to find any recipe of this meal type from the original filtered list
        const availableForType = filteredCachedRecipes.filter(
          (r: CachedRecipeBase) => r.meal_type === slot.meal_type
        );
        
        if (availableForType.length > 0) {
          // Pick a random one (even if already used - better than no meal)
          const randomIndex = Math.floor(Math.random() * availableForType.length);
          const recipe = availableForType[randomIndex];
          mealsFromCacheBase.push({ ...recipe, day_of_week: slot.day_of_week });
        } else {
          // Last resort: pick ANY recipe from cache
          if (filteredCachedRecipes.length > 0) {
            const randomIndex = Math.floor(Math.random() * filteredCachedRecipes.length);
            const recipe = filteredCachedRecipes[randomIndex];
            mealsFromCacheBase.push({ 
              ...recipe, 
              day_of_week: slot.day_of_week,
              meal_type: slot.meal_type // Override meal type
            });
          }
        }
      }
      
      // Re-fetch images for the additional recipes
      if (mealsFromCacheBase.length > mealsFromCache.length) {
        const allRecipeIds = mealsFromCacheBase.map(r => r.id);
        const { data: imagesData } = await supabaseClient
          .from('recipe_library')
          .select('id, image_url')
          .in('id', allRecipeIds);
        
        const imageMap = new Map((imagesData || []).map((r: any) => [r.id, r.image_url]));
        mealsFromCache = mealsFromCacheBase.map(r => ({
          ...r,
          image_url: imageMap.get(r.id) || null
        }));
      }
      
      console.log(`Filled ${slotsNeedingGeneration.length} slots from cache reuse. Total meals: ${mealsFromCache.length}`);
    }

    // ============================================
    // All meals come from cache (100% cache mode)
    // ============================================
    const allMeals = mealsFromCache.map(m => ({
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
    }));

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

    console.log(`✅ Meal plan complete! 100% from cache: ${cachedCount} meals, 0 AI calls`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        mealPlanId: mealPlan.id,
        mealsCount: insertedMeals.length,
        fromCache: cachedCount,
        generated: 0,
        savingsPercent: 100,
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
