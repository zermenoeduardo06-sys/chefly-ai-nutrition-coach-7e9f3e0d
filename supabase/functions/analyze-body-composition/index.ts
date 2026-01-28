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

    const { image, language = 'es', scanType = 'front' } = await req.json();

    if (!image) {
      return new Response(JSON.stringify({ error: "Image is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Fetch user preferences for context
    const { data: preferences } = await supabase
      .from("user_preferences")
      .select("gender, age, height, weight, goal")
      .eq("user_id", user.id)
      .single();

    const genderContext = preferences?.gender 
      ? (language === 'es' ? `Género: ${preferences.gender}` : `Gender: ${preferences.gender}`)
      : '';
    const goalContext = preferences?.goal
      ? (language === 'es' ? `Objetivo: ${preferences.goal}` : `Goal: ${preferences.goal}`)
      : '';

    const systemPrompt = language === 'es'
      ? `Eres un experto en fitness y composición corporal con más de 20 años de experiencia. Analiza esta foto de cuerpo ${scanType === 'front' ? 'de frente' : 'de lado'} y proporciona una estimación visual educativa.

${genderContext}
${goalContext}

INSTRUCCIONES IMPORTANTES:
- Esta es SOLO una estimación visual educativa, NO un diagnóstico médico
- Usa rangos amplios para el porcentaje de grasa corporal (mínimo 4 puntos de diferencia)
- Sé respetuoso, positivo y constructivo en todas las observaciones
- Si la imagen no muestra claramente el cuerpo, indica que la confianza es baja
- No hagas comentarios negativos sobre la apariencia

CATEGORÍAS DE GRASA CORPORAL:
- Bajo: <10% hombres, <18% mujeres
- Saludable: 10-20% hombres, 18-28% mujeres  
- Moderado: 20-25% hombres, 28-33% mujeres
- Alto: >25% hombres, >33% mujeres

TIPOS DE CUERPO:
- Ectomorfo: Delgado, metabolismo rápido, dificultad para ganar peso
- Mesomorfo: Atlético, gana músculo fácilmente, estructura media
- Endomorfo: Robusto, metabolismo lento, tendencia a almacenar grasa
- Combinado: Mezcla de características

Responde SOLO en JSON válido con este formato exacto:
{
  "success": true,
  "estimated_body_fat": {
    "min": número,
    "max": número,
    "category": "bajo" | "saludable" | "moderado" | "alto"
  },
  "body_type": "ectomorfo" | "mesomorfo" | "endomorfo" | "combinado",
  "fat_distribution": "central" | "periférica" | "uniforme",
  "observations": "observaciones constructivas sobre la composición corporal visible",
  "recommendations": ["recomendación 1", "recomendación 2", "recomendación 3"],
  "confidence": "high" | "medium" | "low"
}`
      : `You are a fitness and body composition expert with over 20 years of experience. Analyze this ${scanType === 'front' ? 'front-facing' : 'side-view'} body photo and provide an educational visual estimate.

${genderContext}
${goalContext}

IMPORTANT INSTRUCTIONS:
- This is ONLY an educational visual estimate, NOT a medical diagnosis
- Use wide ranges for body fat percentage (minimum 4 points difference)
- Be respectful, positive, and constructive in all observations
- If the image doesn't clearly show the body, indicate low confidence
- Don't make negative comments about appearance

BODY FAT CATEGORIES:
- Low: <10% men, <18% women
- Healthy: 10-20% men, 18-28% women
- Moderate: 20-25% men, 28-33% women
- High: >25% men, >33% women

BODY TYPES:
- Ectomorph: Lean, fast metabolism, difficulty gaining weight
- Mesomorph: Athletic, gains muscle easily, medium build
- Endomorph: Robust, slow metabolism, tendency to store fat
- Combined: Mix of characteristics

Respond ONLY in valid JSON with this exact format:
{
  "success": true,
  "estimated_body_fat": {
    "min": number,
    "max": number,
    "category": "low" | "healthy" | "moderate" | "high"
  },
  "body_type": "ectomorph" | "mesomorph" | "endomorph" | "combined",
  "fat_distribution": "central" | "peripheral" | "uniform",
  "observations": "constructive observations about visible body composition",
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "confidence": "high" | "medium" | "low"
}`;

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
          { 
            role: "user", 
            content: [
              {
                type: "image_url",
                image_url: { url: image }
              },
              {
                type: "text",
                text: language === 'es' 
                  ? "Analiza esta foto y proporciona la estimación de composición corporal en formato JSON."
                  : "Analyze this photo and provide the body composition estimate in JSON format."
              }
            ]
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ 
          error: language === 'es' 
            ? "Límite de uso alcanzado. Intenta más tarde."
            : "Rate limit reached. Try again later."
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error("Failed to analyze image");
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "{}";
    
    // Parse JSON from AI response
    let analysis;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                        content.match(/```\s*([\s\S]*?)\s*```/) ||
                        [null, content];
      analysis = JSON.parse(jsonMatch[1] || content);
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      return new Response(JSON.stringify({ 
        error: language === 'es'
          ? "No se pudo analizar la imagen. Intenta con una foto más clara."
          : "Could not analyze the image. Try with a clearer photo."
      }), {
        status: 422,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Translate categories if needed
    const categoryMap: { [key: string]: string } = language === 'es' 
      ? { low: 'bajo', healthy: 'saludable', moderate: 'moderado', high: 'alto' }
      : { bajo: 'low', saludable: 'healthy', moderado: 'moderate', alto: 'high' };

    const bodyTypeMap: { [key: string]: string } = language === 'es'
      ? { ectomorph: 'ectomorfo', mesomorph: 'mesomorfo', endomorph: 'endomorfo', combined: 'combinado' }
      : { ectomorfo: 'ectomorph', mesomorfo: 'mesomorph', endomorfo: 'endomorph', combinado: 'combined' };

    const distributionMap: { [key: string]: string } = language === 'es'
      ? { peripheral: 'periférica', uniform: 'uniforme', central: 'central' }
      : { periférica: 'peripheral', uniforme: 'uniform', central: 'central' };

    // Normalize response
    const normalizedAnalysis = {
      estimated_body_fat_min: analysis.estimated_body_fat?.min || 15,
      estimated_body_fat_max: analysis.estimated_body_fat?.max || 25,
      body_fat_category: categoryMap[analysis.estimated_body_fat?.category] || analysis.estimated_body_fat?.category || (language === 'es' ? 'saludable' : 'healthy'),
      body_type: bodyTypeMap[analysis.body_type] || analysis.body_type || (language === 'es' ? 'combinado' : 'combined'),
      fat_distribution: distributionMap[analysis.fat_distribution] || analysis.fat_distribution || (language === 'es' ? 'uniforme' : 'uniform'),
      ai_notes: analysis.observations || '',
      recommendations: analysis.recommendations || [],
      confidence: analysis.confidence || 'medium',
      raw_analysis: analysis,
    };

    // Record AI usage for body scan (~8 cents, same as food scan with vision)
    const BODY_SCAN_COST_CENTS = 8;
    try {
      await supabase.functions.invoke('record-ai-usage', {
        body: {
          userId: user.id,
          operationType: 'body_scan',
          costCents: BODY_SCAN_COST_CENTS,
          wasCached: false,
        },
      });
    } catch (usageError) {
      console.error("Failed to record AI usage:", usageError);
      // Don't fail the request if usage tracking fails
    }

    return new Response(JSON.stringify({
      success: true,
      analysis: normalizedAnalysis,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in analyze-body-composition:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
