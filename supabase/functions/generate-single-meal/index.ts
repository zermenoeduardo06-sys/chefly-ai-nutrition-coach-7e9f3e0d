import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { mealId, mealType, dayOfWeek, mealPlanId } = await req.json();
    
    // Validate inputs
    if (!mealType || !dayOfWeek || !mealPlanId) {
      throw new Error('Invalid input parameters');
    }

    // Initialize Supabase clients
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    // Get authenticated user using the auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }
    const token = authHeader.replace('Bearer ', '');
    
    // Create auth client to verify user
    const authClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    const { data: { user }, error: userError } = await authClient.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Fetch meal plan and verify ownership
    const { data: mealPlan, error: mealPlanError } = await supabaseClient
      .from("meal_plans")
      .select("user_id")
      .eq("id", mealPlanId)
      .single();

    if (mealPlanError) {
      console.error('Error fetching meal plan:', mealPlanError);
      throw new Error('Failed to fetch meal plan');
    }
    
    if (!mealPlan) {
      throw new Error("Meal plan not found");
    }
    
    // Verify the user owns this meal plan
    if (mealPlan.user_id !== user.id) {
      throw new Error('Unauthorized: You do not own this meal plan');
    }

    const { data: preferences } = await supabaseClient
      .from("user_preferences")
      .select("*")
      .eq("user_id", mealPlan.user_id)
      .single();

    if (!preferences) {
      throw new Error("User preferences not found");
    }

    // ============================================
    // OPTIMIZATION: Try cache first (recipe_library)
    // ============================================
    console.log(`Looking for cached recipe: type=${mealType}, diet=${preferences.diet_type}`);
    
    // Build query for recipe_library
    let recipeQuery = supabaseClient
      .from("recipe_library")
      .select("*")
      .eq("meal_type", mealType)
      .eq("language", "es");
    
    // Filter by diet type if not omnívora
    if (preferences.diet_type && preferences.diet_type !== "omnívora") {
      recipeQuery = recipeQuery.eq("diet_type", preferences.diet_type);
    }
    
    // Get all matching recipes and pick a random one
    const { data: cachedRecipes, error: cacheError } = await recipeQuery;
    
    if (!cacheError && cachedRecipes && cachedRecipes.length > 0) {
      // Pick a random recipe from cache
      const randomIndex = Math.floor(Math.random() * cachedRecipes.length);
      const cachedRecipe = cachedRecipes[randomIndex];
      
      console.log(`Found cached recipe: ${cachedRecipe.name} (from ${cachedRecipes.length} options)`);
      
      // Delete old meal if provided
      if (mealId) {
        await supabaseClient.from("meals").delete().eq("id", mealId);
      }

      // Insert cached recipe as new meal
      const { data: newMeal, error: insertError } = await supabaseClient
        .from("meals")
        .insert({
          meal_plan_id: mealPlanId,
          day_of_week: dayOfWeek,
          meal_type: mealType,
          name: cachedRecipe.name,
          description: cachedRecipe.description,
          benefits: cachedRecipe.benefits || "Nutritivo y delicioso",
          calories: cachedRecipe.calories,
          protein: cachedRecipe.protein,
          carbs: cachedRecipe.carbs,
          fats: cachedRecipe.fats,
          ingredients: cachedRecipe.ingredients,
          steps: cachedRecipe.steps,
          image_url: cachedRecipe.image_url,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      console.log("Meal created from cache successfully");
      return new Response(JSON.stringify({ meal: newMeal, fromCache: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // ============================================
    // 100% CACHE MODE - NO AI CALLS
    // If no exact match, pick any recipe of same meal type
    // ============================================
    console.log("No exact cached recipe match, trying any recipe of same meal type...");
    
    // Try without diet filter
    const { data: anyRecipes } = await supabaseClient
      .from("recipe_library")
      .select("*")
      .eq("meal_type", mealType)
      .eq("has_image", true)
      .not("image_url", "is", null);
    
    if (anyRecipes && anyRecipes.length > 0) {
      const randomIndex = Math.floor(Math.random() * anyRecipes.length);
      const recipe = anyRecipes[randomIndex];
      
      console.log(`Found fallback recipe: ${recipe.name} (from ${anyRecipes.length} options)`);
      
      // Delete old meal if provided
      if (mealId) {
        await supabaseClient.from("meals").delete().eq("id", mealId);
      }

      // Insert recipe as new meal
      const { data: newMeal, error: insertError } = await supabaseClient
        .from("meals")
        .insert({
          meal_plan_id: mealPlanId,
          day_of_week: dayOfWeek,
          meal_type: mealType,
          name: recipe.name,
          description: recipe.description,
          benefits: recipe.benefits || "Nutritivo y delicioso",
          calories: recipe.calories,
          protein: recipe.protein,
          carbs: recipe.carbs,
          fats: recipe.fats,
          ingredients: recipe.ingredients,
          steps: recipe.steps,
          image_url: recipe.image_url,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      console.log("Meal created from fallback cache successfully");
      return new Response(JSON.stringify({ meal: newMeal, fromCache: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Last resort: try ANY recipe from cache
    const { data: lastResort } = await supabaseClient
      .from("recipe_library")
      .select("*")
      .eq("has_image", true)
      .not("image_url", "is", null)
      .limit(50);
    
    if (lastResort && lastResort.length > 0) {
      const randomIndex = Math.floor(Math.random() * lastResort.length);
      const recipe = lastResort[randomIndex];
      
      console.log(`Using last resort recipe: ${recipe.name}`);
      
      if (mealId) {
        await supabaseClient.from("meals").delete().eq("id", mealId);
      }

      const { data: newMeal, error: insertError } = await supabaseClient
        .from("meals")
        .insert({
          meal_plan_id: mealPlanId,
          day_of_week: dayOfWeek,
          meal_type: mealType,
          name: recipe.name,
          description: recipe.description,
          benefits: recipe.benefits || "Nutritivo y delicioso",
          calories: recipe.calories,
          protein: recipe.protein,
          carbs: recipe.carbs,
          fats: recipe.fats,
          ingredients: recipe.ingredients,
          steps: recipe.steps,
          image_url: recipe.image_url,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      return new Response(JSON.stringify({ meal: newMeal, fromCache: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // If absolutely no recipes in cache, return error
    throw new Error("No recipes available in cache. Please contact support.");
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
