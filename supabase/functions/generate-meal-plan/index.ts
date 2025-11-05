import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY');

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

    console.log('User preferences:', preferences);

    // Map diet type to API parameters
    const dietMap: Record<string, string> = {
      'vegetariana': 'vegetarian',
      'vegana': 'vegan',
      'sin gluten': 'gluten free',
      'cetogénica': 'ketogenic',
      'mediterránea': 'mediterranean',
      'omnívora': '',
    };

    const diet = dietMap[preferences.diet_type] || '';
    const intolerances = preferences.allergies?.join(',') || '';
    
    // Meal types for the plan
    const mealTypes = ['breakfast', 'lunch', 'dinner'];
    const mealsPerDay = Math.min(preferences.meals_per_day, 3);
    const selectedMealTypes = mealTypes.slice(0, mealsPerDay);
    
    const allMeals = [];
    const allIngredients = new Set<string>();

    // Generate meals for 7 days
    for (let day = 0; day < 7; day++) {
      for (const mealType of selectedMealTypes) {
        try {
          // Search for recipes using RapidAPI
          const searchUrl = new URL('https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/complexSearch');
          searchUrl.searchParams.append('type', mealType);
          searchUrl.searchParams.append('number', '1');
          searchUrl.searchParams.append('addRecipeInformation', 'true');
          searchUrl.searchParams.append('fillIngredients', 'true');
          
          if (diet) searchUrl.searchParams.append('diet', diet);
          if (intolerances) searchUrl.searchParams.append('intolerances', intolerances);

          const recipeResponse = await fetch(searchUrl.toString(), {
            method: 'GET',
            headers: {
              'X-RapidAPI-Key': RAPIDAPI_KEY!,
              'X-RapidAPI-Host': 'spoonacular-recipe-food-nutrition-v1.p.rapidapi.com'
            }
          });

          if (!recipeResponse.ok) {
            console.error('RapidAPI error:', await recipeResponse.text());
            throw new Error('Failed to fetch recipes');
          }

          const recipeData = await recipeResponse.json();
          console.log(`Recipe for day ${day}, ${mealType}:`, recipeData);

          if (recipeData.results && recipeData.results.length > 0) {
            const recipe = recipeData.results[0];
            
            // Extract ingredients
            if (recipe.extendedIngredients) {
              recipe.extendedIngredients.forEach((ing: any) => {
                allIngredients.add(ing.original || ing.name);
              });
            }

            // Create meal entry
            allMeals.push({
              day_of_week: day,
              meal_type: mealType,
              name: recipe.title,
              description: recipe.summary?.replace(/<[^>]*>/g, '').substring(0, 200) || 'Receta deliciosa y nutritiva',
              benefits: `Calorías: ${recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Calories')?.amount || 'N/A'} kcal. ${recipe.vegetarian ? 'Vegetariano. ' : ''}${recipe.vegan ? 'Vegano. ' : ''}${recipe.glutenFree ? 'Sin gluten.' : ''}`
            });
          }
        } catch (error) {
          console.error(`Error fetching recipe for day ${day}, ${mealType}:`, error);
          // Fallback meal if API fails
          allMeals.push({
            day_of_week: day,
            meal_type: mealType,
            name: `${mealType === 'breakfast' ? 'Desayuno' : mealType === 'lunch' ? 'Almuerzo' : 'Cena'} saludable`,
            description: 'Receta nutritiva adaptada a tus preferencias',
            benefits: `Adaptado para ${preferences.goal}`
          });
        }
      }
    }

    const mealData = {
      meals: allMeals,
      shopping_list: Array.from(allIngredients)
    };

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
