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
    const { userId } = await req.json();
    
    // Validate userId
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid userId');
    }
    
    if (!userId) {
      throw new Error("userId is required");
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Generating daily challenges for user: ${userId}`);

    // Get user preferences
    const { data: preferences } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Get user stats
    const { data: stats } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Delete expired challenges
    await supabase
      .from('daily_challenges')
      .delete()
      .eq('user_id', userId)
      .lt('expires_at', new Date().toISOString());

    // Check if user already has active challenges for today
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    const { data: existingChallenges } = await supabase
      .from('daily_challenges')
      .select('*')
      .eq('user_id', userId)
      .gte('expires_at', new Date().toISOString());

    if (existingChallenges && existingChallenges.length >= 3) {
      console.log("User already has active challenges");
      return new Response(
        JSON.stringify({ 
          message: "User already has active challenges",
          challenges: existingChallenges 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate personalized challenges using Lovable AI
    const systemPrompt = `Eres un experto en nutrición y motivación. Tu trabajo es generar 3 desafíos diarios personalizados y motivadores para usuarios.

Considera:
- Dieta del usuario: ${preferences?.diet_type || 'No especificada'}
- Objetivo: ${preferences?.goal || 'No especificado'}
- Nivel actual: ${stats?.level || 1}
- Comidas completadas: ${stats?.meals_completed || 0}
- Racha actual: ${stats?.current_streak || 0} días

Debes responder SOLO con JSON válido (sin markdown, sin comillas extras) con este formato exacto:
{
  "challenges": [
    {
      "title": "Título corto y motivador",
      "description": "Descripción clara del desafío",
      "challenge_type": "meal_variety|protein_goal|hydration|meal_timing|calorie_target|streak_bonus",
      "target_value": número_entero,
      "points_reward": puntos_entre_30_y_100,
      "bonus_description": "Descripción del beneficio"
    }
  ]
}`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-lite',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Genera 3 desafíos diarios personalizados para este usuario.' }
        ],
        temperature: 0.8,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        console.error('Rate limit exceeded');
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        console.error('Payment required');
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices[0].message.content;
    
    console.log('AI Response:', aiContent);
    
    // Parse the AI response
    let challenges;
    try {
      // Try to parse as JSON directly
      const parsed = JSON.parse(aiContent);
      challenges = parsed.challenges;
    } catch (e) {
      // If it fails, try to extract JSON from markdown code blocks
      const jsonMatch = aiContent.match(/```json\n([\s\S]*?)\n```/) || aiContent.match(/```([\s\S]*?)```/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[1]);
        challenges = parsed.challenges;
      } else {
        throw new Error('Failed to parse AI response');
      }
    }

    if (!challenges || !Array.isArray(challenges)) {
      throw new Error('Invalid challenges format from AI');
    }

    // Insert challenges into database
    const expiresAt = new Date();
    expiresAt.setHours(23, 59, 59, 999);

    const challengesToInsert = challenges.map(challenge => ({
      user_id: userId,
      title: challenge.title,
      description: challenge.description,
      challenge_type: challenge.challenge_type,
      target_value: challenge.target_value,
      points_reward: challenge.points_reward,
      bonus_description: challenge.bonus_description,
      expires_at: expiresAt.toISOString(),
    }));

    const { data: insertedChallenges, error: insertError } = await supabase
      .from('daily_challenges')
      .insert(challengesToInsert)
      .select();

    if (insertError) {
      console.error('Error inserting challenges:', insertError);
      throw insertError;
    }

    console.log('Successfully generated challenges:', insertedChallenges?.length);

    return new Response(
      JSON.stringify({ 
        success: true,
        challenges: insertedChallenges 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Error in generate-daily-challenges:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
