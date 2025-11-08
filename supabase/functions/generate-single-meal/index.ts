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

    // Prepare meal type label
    const mealTypeLabels: Record<string, string> = {
      breakfast: "desayuno",
      lunch: "almuerzo",
      dinner: "cena",
    };
    const mealTypeLabel = mealTypeLabels[mealType] || mealType;

    // Generate meal with AI
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-5-mini",
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

    // Generate image for the meal
    const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-5-mini",
        messages: [
          {
            role: "user",
            content: `Generate a high-quality, appetizing food photography image URL for: ${meal.name}. The image should look professional and make the food look delicious. Return ONLY the image URL, nothing else.`,
          },
        ],
      }),
    });

    if (!imageResponse.ok) {
      console.error("Image generation API error:", imageResponse.status);
      // Continue without image if image generation fails
    }

    let imageUrl = "";
    try {
      const imageData = await imageResponse.json();
      if (imageData.choices && imageData.choices[0] && imageData.choices[0].message) {
        imageUrl = imageData.choices[0].message.content.trim();
      }
    } catch (error) {
      console.error("Error parsing image response:", error);
      // Continue without image
    }

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

    return new Response(JSON.stringify({ meal: newMeal }), {
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
