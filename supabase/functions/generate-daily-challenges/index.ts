import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 15 static challenges to save AI credits - one random per day
const STATIC_CHALLENGES = {
  es: [
    // Meal challenges
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
    // Hydration challenges
    {
      title: "Hidratación del Día",
      description: "Toma una foto de tu botella de agua o bebida saludable. Mantente hidratado.",
      challenge_type: "hydration",
      target_value: 1,
      points_reward: 45,
      bonus_description: "Beber suficiente agua mejora tu energía y concentración"
    },
    {
      title: "Reto de 8 Vasos",
      description: "Fotografía tu vaso de agua. Intenta tomar al menos 8 vasos durante el día.",
      challenge_type: "hydration",
      target_value: 1,
      points_reward: 55,
      bonus_description: "La hidratación adecuada mejora tu piel y metabolismo"
    },
    {
      title: "Agua con Limón",
      description: "Prepara y fotografía un vaso de agua con limón. Ideal para comenzar el día.",
      challenge_type: "hydration",
      target_value: 1,
      points_reward: 40,
      bonus_description: "El agua con limón ayuda a la digestión y aporta vitamina C"
    },
    // Exercise challenges
    {
      title: "Caminata Activa",
      description: "Sal a caminar por al menos 15 minutos y toma una foto del paisaje.",
      challenge_type: "exercise",
      target_value: 1,
      points_reward: 65,
      bonus_description: "Caminar mejora tu circulación y estado de ánimo"
    },
    {
      title: "Estiramientos Matutinos",
      description: "Haz una rutina de estiramientos y toma una foto de tu espacio de ejercicio.",
      challenge_type: "exercise",
      target_value: 1,
      points_reward: 50,
      bonus_description: "Estirar reduce tensión muscular y mejora flexibilidad"
    },
    {
      title: "Ejercicio en Casa",
      description: "Realiza 10 minutos de ejercicio en casa y documéntalo con una foto.",
      challenge_type: "exercise",
      target_value: 1,
      points_reward: 60,
      bonus_description: "Pequeños ejercicios suman grandes beneficios"
    },
    // Wellness challenges
    {
      title: "Momento de Calma",
      description: "Tómate 5 minutos para meditar o respirar profundo. Fotografía tu espacio tranquilo.",
      challenge_type: "wellness",
      target_value: 1,
      points_reward: 55,
      bonus_description: "La meditación reduce el estrés y mejora el enfoque"
    },
    {
      title: "Descanso Visual",
      description: "Aléjate de pantallas por 10 minutos. Fotografía algo natural que veas.",
      challenge_type: "wellness",
      target_value: 1,
      points_reward: 45,
      bonus_description: "Descansar la vista reduce fatiga ocular"
    },
    {
      title: "Gratitud Diaria",
      description: "Escribe 3 cosas por las que estés agradecido y fotografía tu nota.",
      challenge_type: "wellness",
      target_value: 1,
      points_reward: 50,
      bonus_description: "Practicar gratitud mejora tu bienestar mental"
    },
    // Food prep challenges
    {
      title: "Preparación Saludable",
      description: "Prepara tus comidas del día y fotografía tu preparación.",
      challenge_type: "meal_prep",
      target_value: 1,
      points_reward: 70,
      bonus_description: "Planificar tus comidas te ayuda a comer mejor"
    },
    {
      title: "Fruta del Día",
      description: "Come una porción de fruta fresca y toma una foto antes de comerla.",
      challenge_type: "nutrition",
      target_value: 1,
      points_reward: 40,
      bonus_description: "Las frutas aportan vitaminas y fibra esencial"
    }
  ],
  en: [
    // Meal challenges
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
    // Hydration challenges
    {
      title: "Daily Hydration",
      description: "Take a photo of your water bottle or healthy drink. Stay hydrated.",
      challenge_type: "hydration",
      target_value: 1,
      points_reward: 45,
      bonus_description: "Drinking enough water improves your energy and focus"
    },
    {
      title: "8 Glasses Challenge",
      description: "Photograph your glass of water. Try to drink at least 8 glasses during the day.",
      challenge_type: "hydration",
      target_value: 1,
      points_reward: 55,
      bonus_description: "Proper hydration improves your skin and metabolism"
    },
    {
      title: "Lemon Water",
      description: "Prepare and photograph a glass of lemon water. Ideal to start the day.",
      challenge_type: "hydration",
      target_value: 1,
      points_reward: 40,
      bonus_description: "Lemon water aids digestion and provides vitamin C"
    },
    // Exercise challenges
    {
      title: "Active Walk",
      description: "Go for a walk for at least 15 minutes and take a photo of the scenery.",
      challenge_type: "exercise",
      target_value: 1,
      points_reward: 65,
      bonus_description: "Walking improves your circulation and mood"
    },
    {
      title: "Morning Stretches",
      description: "Do a stretching routine and take a photo of your exercise space.",
      challenge_type: "exercise",
      target_value: 1,
      points_reward: 50,
      bonus_description: "Stretching reduces muscle tension and improves flexibility"
    },
    {
      title: "Home Workout",
      description: "Do 10 minutes of exercise at home and document it with a photo.",
      challenge_type: "exercise",
      target_value: 1,
      points_reward: 60,
      bonus_description: "Small exercises add up to big benefits"
    },
    // Wellness challenges
    {
      title: "Calm Moment",
      description: "Take 5 minutes to meditate or breathe deeply. Photograph your peaceful space.",
      challenge_type: "wellness",
      target_value: 1,
      points_reward: 55,
      bonus_description: "Meditation reduces stress and improves focus"
    },
    {
      title: "Visual Rest",
      description: "Step away from screens for 10 minutes. Photograph something natural you see.",
      challenge_type: "wellness",
      target_value: 1,
      points_reward: 45,
      bonus_description: "Resting your eyes reduces eye strain"
    },
    {
      title: "Daily Gratitude",
      description: "Write 3 things you're grateful for and photograph your note.",
      challenge_type: "wellness",
      target_value: 1,
      points_reward: 50,
      bonus_description: "Practicing gratitude improves your mental wellbeing"
    },
    // Food prep challenges
    {
      title: "Healthy Prep",
      description: "Prepare your meals for the day and photograph your preparation.",
      challenge_type: "meal_prep",
      target_value: 1,
      points_reward: 70,
      bonus_description: "Planning your meals helps you eat better"
    },
    {
      title: "Fruit of the Day",
      description: "Eat a serving of fresh fruit and take a photo before eating it.",
      challenge_type: "nutrition",
      target_value: 1,
      points_reward: 40,
      bonus_description: "Fruits provide essential vitamins and fiber"
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
  return Math.abs(hash) % 15; // Now 15 challenges
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
