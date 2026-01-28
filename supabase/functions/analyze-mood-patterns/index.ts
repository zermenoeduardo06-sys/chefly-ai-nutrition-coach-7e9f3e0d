import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { language = 'es' } = await req.json();

    // Fetch user's mood logs (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: moodLogs, error: moodError } = await supabase
      .from("mood_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("logged_at", thirtyDaysAgo.toISOString())
      .order("logged_at", { ascending: true });

    if (moodError) throw moodError;

    // Fetch user's food scans (last 30 days)
    const { data: foodScans, error: foodError } = await supabase
      .from("food_scans")
      .select("*")
      .eq("user_id", user.id)
      .gte("scanned_at", thirtyDaysAgo.toISOString())
      .order("scanned_at", { ascending: true });

    if (foodError) throw foodError;

    // Need at least 7 mood logs to generate insights
    if (!moodLogs || moodLogs.length < 7) {
      return new Response(JSON.stringify({
        success: true,
        insights: [],
        message: language === 'es' 
          ? 'Necesitas al menos 7 registros de ánimo para generar insights'
          : 'You need at least 7 mood logs to generate insights'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Call AI to analyze patterns
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const systemPrompt = language === 'es' 
      ? `Eres un experto en nutrición y bienestar mental. Analiza los patrones entre los registros de ánimo y alimentación del usuario para encontrar correlaciones útiles.

IMPORTANTE:
- Busca patrones reales en los datos, no inventes correlaciones
- Sé específico con fechas y datos cuando menciones patrones
- Da consejos prácticos y accionables
- Mantén un tono positivo y motivador
- Si no hay suficientes datos o patrones claros, indica que se necesita más información

Responde en JSON con este formato exacto:
{
  "insights": [
    {
      "type": "mood_food" | "mood_trend" | "mood_pattern",
      "title": "título corto y claro",
      "description": "descripción detallada del insight con datos específicos"
    }
  ]
}

Genera máximo 3 insights relevantes.`
      : `You are an expert in nutrition and mental wellness. Analyze patterns between the user's mood logs and food intake to find useful correlations.

IMPORTANT:
- Look for real patterns in the data, don't invent correlations
- Be specific with dates and data when mentioning patterns
- Give practical and actionable advice
- Maintain a positive and motivating tone
- If there's not enough data or clear patterns, indicate that more information is needed

Respond in JSON with this exact format:
{
  "insights": [
    {
      "type": "mood_food" | "mood_trend" | "mood_pattern",
      "title": "short and clear title",
      "description": "detailed description of the insight with specific data"
    }
  ]
}

Generate maximum 3 relevant insights.`;

    const userPrompt = `Datos del usuario:

REGISTROS DE ÁNIMO (últimos 30 días):
${JSON.stringify(moodLogs.map(m => ({
  fecha: m.logged_at,
  puntuacion: m.mood_score,
  factores: m.factors,
  nota: m.note
})), null, 2)}

ESCANEOS DE COMIDA (últimos 30 días):
${JSON.stringify(foodScans?.map(f => ({
  fecha: f.scanned_at,
  nombre: f.dish_name,
  calorias: f.calories,
  proteina: f.protein,
  carbos: f.carbs,
  grasa: f.fat
})) || [], null, 2)}

Analiza estos datos y encuentra patrones entre la alimentación y el estado de ánimo.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      console.error("AI API error:", await aiResponse.text());
      throw new Error("Failed to analyze patterns");
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "{}";
    
    // Parse JSON from AI response
    let parsedInsights;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                        content.match(/```\s*([\s\S]*?)\s*```/) ||
                        [null, content];
      parsedInsights = JSON.parse(jsonMatch[1] || content);
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      parsedInsights = { insights: [] };
    }

    // Store insights in database
    const insightsToStore = (parsedInsights.insights || []).map((insight: any) => ({
      user_id: user.id,
      insight_type: insight.type || 'general',
      title: insight.title,
      description: insight.description,
      related_data: { generated_from: 'mood_food_analysis' },
      generated_at: new Date().toISOString(),
    }));

    if (insightsToStore.length > 0) {
      const { error: insertError } = await supabase
        .from("wellness_insights")
        .insert(insightsToStore);

      if (insertError) {
        console.error("Error storing insights:", insertError);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      insights: parsedInsights.insights || [],
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in analyze-mood-patterns:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
