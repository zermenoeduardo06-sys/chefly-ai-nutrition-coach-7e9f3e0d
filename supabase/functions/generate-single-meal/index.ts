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
    // No cache hit - Generate with AI
    // ============================================
    console.log("No cached recipe found, generating with AI...");

    // Prepare meal type label
    const mealTypeLabels: Record<string, string> = {
      breakfast: "desayuno",
      lunch: "almuerzo",
      dinner: "cena",
    };
    const mealTypeLabel = mealTypeLabels[mealType] || mealType;

    // Generate meal with AI using the economical model
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: "Eres un experto nutricionista mexicano. Genera una comida completa en español con toda la información nutricional, ingredientes y pasos de preparación.",
          },
          {
            role: "user",
            content: `Genera un ${mealTypeLabel} personalizado para alguien con las siguientes características:
- Tipo de dieta: ${preferences.diet_type}
- Objetivo: ${preferences.goal}
- Alergias: ${preferences.allergies?.join(", ") || "ninguna"}

Responde SOLO con un objeto JSON válido sin markdown ni texto adicional:
{
  "name": "nombre de la comida",
  "description": "descripción breve (1-2 líneas)",
  "benefits": "beneficios principales para la salud",
  "calories": número_de_calorías,
  "protein": gramos_de_proteína,
  "carbs": gramos_de_carbohidratos,
  "fats": gramos_de_grasas,
  "ingredients": ["ingrediente 1", "ingrediente 2", ...],
  "steps": ["paso 1", "paso 2", ...]
}`,
          },
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error(`AI API error: ${response.status} - ${errorText}`);
    }

    const aiData = await response.json();
    
    if (!aiData.choices || !aiData.choices[0] || !aiData.choices[0].message) {
      console.error("Invalid AI response structure:", aiData);
      throw new Error("Invalid response from AI API");
    }

    let mealData = aiData.choices[0].message.content;

    // Clean and parse JSON response
    mealData = mealData.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const meal = JSON.parse(mealData);

    // Use a static Unsplash image based on meal type instead of generating with AI
    const unsplashImages: Record<string, string[]> = {
      breakfast: [
        "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=400&h=300&fit=crop",
      ],
      lunch: [
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop",
      ],
      dinner: [
        "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&h=300&fit=crop",
      ],
    };
    
    const mealImages = unsplashImages[mealType] || unsplashImages.lunch;
    const imageUrl = mealImages[Math.floor(Math.random() * mealImages.length)];

    // Delete old meal if provided
    if (mealId) {
      await supabaseClient.from("meals").delete().eq("id", mealId);
    }

    // Insert new meal
    const { data: newMeal, error: insertError } = await supabaseClient
      .from("meals")
      .insert({
        meal_plan_id: mealPlanId,
        day_of_week: dayOfWeek,
        meal_type: mealType,
        name: meal.name,
        description: meal.description,
        benefits: meal.benefits,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fats: meal.fats,
        ingredients: meal.ingredients,
        steps: meal.steps,
        image_url: imageUrl,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Save to recipe library for future cache hits
    await supabaseClient
      .from("recipe_library")
      .insert({
        name: meal.name,
        description: meal.description,
        benefits: meal.benefits,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fats: meal.fats,
        ingredients: meal.ingredients,
        steps: meal.steps,
        image_url: imageUrl,
        meal_type: mealType,
        diet_type: preferences.diet_type,
        language: "es",
        has_image: true,
      })
      .select()
      .single();

    console.log("Meal generated with AI and saved to cache");
    return new Response(JSON.stringify({ meal: newMeal, fromCache: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
