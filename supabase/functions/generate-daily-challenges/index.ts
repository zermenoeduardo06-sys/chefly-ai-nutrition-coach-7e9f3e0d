import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 5 static challenges to save AI credits - one random per day
const STATIC_CHALLENGES = {
  es: [
    {
      title: "Desayuno Saludable",
      description: "Toma una foto de tu desayuno antes de comerlo. Asegúrate de incluir proteína y fibra.",
      challenge_type: "meal_variety",
      target_value: 1,
      points_reward: 50,
      bonus_description: "Un buen desayuno te da energía para todo el día"
    },
    {
      title: "Almuerzo Balanceado",
      description: "Fotografía tu almuerzo. Debe incluir verduras, proteína y carbohidratos complejos.",
      challenge_type: "protein_goal",
      target_value: 1,
      points_reward: 60,
      bonus_description: "Mantén tu metabolismo activo con un almuerzo nutritivo"
    },
    {
      title: "Snack Inteligente",
      description: "Toma una foto de un snack saludable entre comidas. Evita los ultraprocesados.",
      challenge_type: "calorie_target",
      target_value: 1,
      points_reward: 40,
      bonus_description: "Los snacks saludables evitan que llegues con hambre a la siguiente comida"
    },
    {
      title: "Cena Ligera",
      description: "Fotografía tu cena. Debe ser más ligera que el almuerzo para una mejor digestión.",
      challenge_type: "meal_timing",
      target_value: 1,
      points_reward: 55,
      bonus_description: "Una cena ligera mejora tu calidad de sueño"
    },
    {
      title: "Hidratación del Día",
      description: "Toma una foto de tu botella de agua o bebida saludable. Mantente hidratado.",
      challenge_type: "hydration",
      target_value: 1,
      points_reward: 45,
      bonus_description: "Beber suficiente agua mejora tu energía y concentración"
    }
  ],
  en: [
    {
      title: "Healthy Breakfast",
      description: "Take a photo of your breakfast before eating. Make sure to include protein and fiber.",
      challenge_type: "meal_variety",
      target_value: 1,
      points_reward: 50,
      bonus_description: "A good breakfast gives you energy for the whole day"
    },
    {
      title: "Balanced Lunch",
      description: "Photograph your lunch. It should include vegetables, protein and complex carbs.",
      challenge_type: "protein_goal",
      target_value: 1,
      points_reward: 60,
      bonus_description: "Keep your metabolism active with a nutritious lunch"
    },
    {
      title: "Smart Snack",
      description: "Take a photo of a healthy snack between meals. Avoid ultra-processed foods.",
      challenge_type: "calorie_target",
      target_value: 1,
      points_reward: 40,
      bonus_description: "Healthy snacks prevent you from arriving hungry to the next meal"
    },
    {
      title: "Light Dinner",
      description: "Photograph your dinner. It should be lighter than lunch for better digestion.",
      challenge_type: "meal_timing",
      target_value: 1,
      points_reward: 55,
      bonus_description: "A light dinner improves your sleep quality"
    },
    {
      title: "Daily Hydration",
      description: "Take a photo of your water bottle or healthy drink. Stay hydrated.",
      challenge_type: "hydration",
      target_value: 1,
      points_reward: 45,
      bonus_description: "Drinking enough water improves your energy and focus"
    }
  ]
};

// Get deterministic challenge index based on date (same challenge all day)
function getDailyChallengeIndex(userId: string): number {
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  // Create a simple hash from date + userId for variety between users
  let hash = 0;
  const combined = dateStr + userId;
  for (let i = 0; i < combined.length; i++) {
    hash = ((hash << 5) - hash) + combined.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 5;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, language = 'es' } = await req.json();
    
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid userId');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Getting daily challenge for user: ${userId}`);

    // Delete expired challenges
    await supabase
      .from('daily_challenges')
      .delete()
      .eq('user_id', userId)
      .lt('expires_at', new Date().toISOString());

    // Check if user already has active challenge for today
    const { data: existingChallenges } = await supabase
      .from('daily_challenges')
      .select('*')
      .eq('user_id', userId)
      .gte('expires_at', new Date().toISOString());

    if (existingChallenges && existingChallenges.length > 0) {
      console.log("User already has active challenge");
      return new Response(
        JSON.stringify({ 
          message: "User already has active challenge",
          challenges: existingChallenges 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get deterministic challenge for today
    const challengeIndex = getDailyChallengeIndex(userId);
    const lang = language === 'en' ? 'en' : 'es';
    const todayChallenge = STATIC_CHALLENGES[lang][challengeIndex];

    console.log(`Selected challenge index: ${challengeIndex}, title: ${todayChallenge.title}`);

    // Set expiration to end of today
    const expiresAt = new Date();
    expiresAt.setHours(23, 59, 59, 999);

    // Insert challenge into database
    const { data: insertedChallenge, error: insertError } = await supabase
      .from('daily_challenges')
      .insert({
        user_id: userId,
        title: todayChallenge.title,
        description: todayChallenge.description,
        challenge_type: todayChallenge.challenge_type,
        target_value: todayChallenge.target_value,
        points_reward: todayChallenge.points_reward,
        bonus_description: todayChallenge.bonus_description,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting challenge:', insertError);
      throw insertError;
    }

    console.log('Successfully assigned daily challenge:', insertedChallenge?.title);

    return new Response(
      JSON.stringify({ 
        success: true,
        challenges: [insertedChallenge]
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
