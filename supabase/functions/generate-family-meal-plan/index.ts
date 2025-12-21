import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FamilyMemberPreferences {
  user_id: string;
  display_name: string;
  goal: string;
  diet_type: string;
  allergies: string[];
  dislikes: string[];
  activity_level: string;
  age: number | null;
  weight: number | null;
  gender: string | null;
  cooking_skill: string;
  meals_per_day: number;
}

interface MealAdaptation {
  member_user_id: string;
  member_name: string;
  adaptation_score: number;
  adaptation_notes: string;
  variant_instructions: string;
  is_best_match: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { language = 'es' } = await req.json();
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get current user
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    console.log('Generating family meal plan for user:', user.id);

    // Get user's family
    const { data: membership, error: membershipError } = await supabaseClient
      .from('family_memberships')
      .select('family_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (membershipError) {
      console.error('Error fetching membership:', membershipError);
      throw new Error('Error fetching family membership');
    }

    if (!membership) {
      throw new Error(language === 'es' ? 'No perteneces a ninguna familia' : 'You are not part of any family');
    }

    const familyId = membership.family_id;

    // Get all family members
    const { data: familyMembers } = await supabaseClient
      .from('family_memberships')
      .select('user_id')
      .eq('family_id', familyId);

    if (!familyMembers || familyMembers.length === 0) {
      throw new Error('No family members found');
    }

    const memberIds = familyMembers.map(m => m.user_id);
    console.log(`Found ${memberIds.length} family members`);

    // Get preferences and profiles for all members
    const { data: allPreferences } = await supabaseClient
      .from('user_preferences')
      .select('*')
      .in('user_id', memberIds);

    const { data: allProfiles } = await supabaseClient
      .from('profiles')
      .select('id, display_name, email')
      .in('id', memberIds);

    // Build member preferences map
    const memberPreferences: FamilyMemberPreferences[] = memberIds.map(memberId => {
      const prefs = allPreferences?.find(p => p.user_id === memberId);
      const profile = allProfiles?.find(p => p.id === memberId);
      
      return {
        user_id: memberId,
        display_name: profile?.display_name || profile?.email?.split('@')[0] || 'Miembro',
        goal: prefs?.goal || 'maintain',
        diet_type: prefs?.diet_type || 'omnivore',
        allergies: prefs?.allergies || [],
        dislikes: prefs?.dislikes || [],
        activity_level: prefs?.activity_level || 'moderate',
        age: prefs?.age,
        weight: prefs?.weight,
        gender: prefs?.gender,
        cooking_skill: prefs?.cooking_skill || 'beginner',
        meals_per_day: prefs?.meals_per_day || 3,
      };
    });

    console.log('Member preferences loaded:', memberPreferences.map(m => m.display_name));

    // Get the owner's preferences as the base
    const ownerPrefs = memberPreferences.find(m => m.user_id === user.id) || memberPreferences[0];

    // Combine all allergies and dislikes (union)
    const allAllergies = [...new Set(memberPreferences.flatMap(m => m.allergies))];
    const allDislikes = [...new Set(memberPreferences.flatMap(m => m.dislikes))];

    // Determine compatible diet type (most restrictive wins)
    const dietPriority = ['vegan', 'vegetarian', 'pescatarian', 'flexitarian', 'omnivore'];
    let familyDiet = 'omnivore';
    for (const diet of dietPriority) {
      if (memberPreferences.some(m => m.diet_type?.toLowerCase() === diet)) {
        familyDiet = diet;
        break;
      }
    }

    const mealTypes = ['breakfast', 'lunch', 'dinner'].slice(0, ownerPrefs.meals_per_day);
    const totalMeals = 7 * mealTypes.length;

    console.log(`Generating ${totalMeals} meals with combined preferences. Diet: ${familyDiet}, Allergies: ${allAllergies.join(', ')}`);

    // Build the AI prompt for family meal generation
    const memberDescriptions = memberPreferences.map(m => {
      const goalMap: Record<string, { es: string; en: string }> = {
        lose_weight: { es: 'perder peso', en: 'lose weight' },
        gain_muscle: { es: 'ganar músculo', en: 'gain muscle' },
        maintain: { es: 'mantener peso', en: 'maintain weight' },
        improve_health: { es: 'mejorar salud', en: 'improve health' },
      };
      const goal = goalMap[m.goal]?.[language as 'es' | 'en'] || m.goal;
      
      return language === 'es'
        ? `- ${m.display_name}: Objetivo: ${goal}${m.age ? `, ${m.age} años` : ''}${m.weight ? `, ${m.weight}kg` : ''}${m.gender ? `, ${m.gender}` : ''}, Actividad: ${m.activity_level}`
        : `- ${m.display_name}: Goal: ${goal}${m.age ? `, ${m.age} years old` : ''}${m.weight ? `, ${m.weight}kg` : ''}${m.gender ? `, ${m.gender}` : ''}, Activity: ${m.activity_level}`;
    }).join('\n');

    const prompt = language === 'es'
      ? `Eres un chef nutricionista experto creando un plan de comidas FAMILIAR que funcione para TODOS los miembros.

MIEMBROS DE LA FAMILIA:
${memberDescriptions}

RESTRICCIONES COMBINADAS:
- Dieta compatible: ${familyDiet}
- Alergias (de todos): ${allAllergies.join(', ') || 'Ninguna'}
- No les gusta (de todos): ${allDislikes.join(', ') || 'Nada'}

INSTRUCCIONES:
1. Genera ${totalMeals} comidas (${mealTypes.join(', ')} × 7 días) que sean nutritivas y equilibradas
2. Cada comida debe ser SEGURA para todos (sin alérgenos ni disgustos de ningún miembro)
3. Para cada comida, indica qué miembro se beneficia MÁS y por qué
4. Incluye variantes opcionales para adaptar mejor a cada objetivo individual

Responde SOLO con JSON válido:
{
  "meals": [
    {
      "day_of_week": 0,
      "meal_type": "breakfast",
      "name": "Nombre de la Receta",
      "description": "Descripción breve",
      "ingredients": ["ingrediente 1", "ingrediente 2"],
      "steps": ["Paso 1", "Paso 2"],
      "calories": 400,
      "protein": 20,
      "carbs": 50,
      "fats": 15,
      "benefits": "Beneficios para la familia",
      "adaptations": [
        {
          "member_name": "Nombre",
          "score": 85,
          "notes": "Por qué le conviene más/menos a este miembro",
          "variant": "Modificación opcional: agregar X o quitar Y"
        }
      ]
    }
  ],
  "shopping_list": ["item1", "item2"]
}`
      : `You are an expert nutritionist chef creating a FAMILY meal plan that works for ALL members.

FAMILY MEMBERS:
${memberDescriptions}

COMBINED RESTRICTIONS:
- Compatible diet: ${familyDiet}
- All allergies: ${allAllergies.join(', ') || 'None'}
- All dislikes: ${allDislikes.join(', ') || 'None'}

INSTRUCTIONS:
1. Generate ${totalMeals} meals (${mealTypes.join(', ')} × 7 days) that are nutritious and balanced
2. Each meal must be SAFE for everyone (no allergens or dislikes from any member)
3. For each meal, indicate which member benefits MOST and why
4. Include optional variants to better adapt to each individual goal

Respond ONLY with valid JSON:
{
  "meals": [
    {
      "day_of_week": 0,
      "meal_type": "breakfast",
      "name": "Recipe Name",
      "description": "Brief description",
      "ingredients": ["ingredient 1", "ingredient 2"],
      "steps": ["Step 1", "Step 2"],
      "calories": 400,
      "protein": 20,
      "carbs": 50,
      "fats": 15,
      "benefits": "Family benefits",
      "adaptations": [
        {
          "member_name": "Name",
          "score": 85,
          "notes": "Why this suits this member more/less",
          "variant": "Optional modification: add X or remove Y"
        }
      ]
    }
  ],
  "shopping_list": ["item1", "item2"]
}`;

    // Call AI for meal generation
    console.log('Calling AI for family meal generation...');
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'user', content: prompt }]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI generation error:', errorText);
      throw new Error('Failed to generate family meals with AI');
    }

    const aiData = await response.json();
    const content = aiData.choices[0].message.content;
    const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    let mealData;
    try {
      mealData = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('AI returned invalid JSON');
    }

    console.log(`AI generated ${mealData.meals?.length || 0} meals`);

    // Generate images for meals (in parallel, max 5 at a time)
    console.log('Generating images for family meals...');
    const mealsWithImages = await Promise.all(
      mealData.meals.map(async (meal: any) => {
        try {
          const imagePrompt = language === 'es'
            ? `Foto profesional apetitosa de ${meal.name}, plato familiar ${familyDiet}, presentación elegante, iluminación natural`
            : `Professional appetizing photo of ${meal.name}, family ${familyDiet} dish, elegant presentation, natural lighting`;

          const imageResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'google/gemini-3-pro-image-preview',
              messages: [{ role: 'user', content: imagePrompt }],
              modalities: ['image', 'text']
            }),
          });

          if (imageResponse.ok) {
            const imageData = await imageResponse.json();
            const base64Url = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
            
            if (base64Url && base64Url.startsWith('data:image')) {
              try {
                const matches = base64Url.match(/^data:image\/(\w+);base64,(.+)$/);
                if (matches) {
                  const extension = matches[1] === 'jpeg' ? 'jpg' : matches[1];
                  const base64Content = matches[2];
                  
                  const binaryString = atob(base64Content);
                  const bytes = new Uint8Array(binaryString.length);
                  for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                  }

                  const fileName = `family-meal-${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;
                  
                  const { error: uploadError } = await supabaseClient.storage
                    .from('recipe-images')
                    .upload(fileName, bytes, {
                      contentType: `image/${extension}`,
                      upsert: true
                    });

                  if (!uploadError) {
                    const { data: urlData } = supabaseClient.storage
                      .from('recipe-images')
                      .getPublicUrl(fileName);
                    
                    return { ...meal, image_url: urlData.publicUrl };
                  }
                }
              } catch (uploadErr) {
                console.error(`Failed to upload image for ${meal.name}:`, uploadErr);
              }
            }
          }
          return { ...meal, image_url: null };
        } catch (error) {
          console.error(`Error generating image for ${meal.name}:`, error);
          return { ...meal, image_url: null };
        }
      })
    );

    // Create family meal plan in database
    const { data: mealPlan, error: mealPlanError } = await supabaseClient
      .from('meal_plans')
      .insert({
        user_id: user.id,
        week_start_date: new Date().toISOString().split('T')[0],
        is_family_plan: true,
        family_id: familyId,
      })
      .select()
      .single();

    if (mealPlanError || !mealPlan) {
      console.error('Error creating meal plan:', mealPlanError);
      throw new Error('Failed to create meal plan in database');
    }

    console.log('Family meal plan created with ID:', mealPlan.id);

    // Insert meals
    const mealsToInsert = mealsWithImages.map((meal: any) => ({
      meal_plan_id: mealPlan.id,
      day_of_week: meal.day_of_week,
      meal_type: meal.meal_type,
      name: meal.name,
      description: meal.description,
      benefits: meal.benefits,
      ingredients: meal.ingredients || [],
      steps: meal.steps || [],
      calories: meal.calories || 0,
      protein: meal.protein || 0,
      carbs: meal.carbs || 0,
      fats: meal.fats || 0,
      image_url: meal.image_url,
    }));

    const { data: insertedMeals, error: mealsError } = await supabaseClient
      .from('meals')
      .insert(mealsToInsert)
      .select();

    if (mealsError || !insertedMeals) {
      console.error('Error inserting meals:', mealsError);
      await supabaseClient.from('meal_plans').delete().eq('id', mealPlan.id);
      throw new Error('Failed to insert meals');
    }

    console.log(`Inserted ${insertedMeals.length} meals`);

    // Insert member adaptations
    const adaptationsToInsert: any[] = [];
    
    for (const meal of mealsWithImages) {
      const insertedMeal = insertedMeals.find(
        (m: any) => m.day_of_week === meal.day_of_week && m.meal_type === meal.meal_type
      );
      
      if (!insertedMeal || !meal.adaptations) continue;

      // Find the best match (highest score)
      const sortedAdaptations = [...meal.adaptations].sort((a: any, b: any) => b.score - a.score);
      
      for (const adaptation of meal.adaptations) {
        // Match member name to user_id
        const member = memberPreferences.find(
          m => m.display_name.toLowerCase() === adaptation.member_name.toLowerCase()
        );
        
        if (member) {
          adaptationsToInsert.push({
            meal_id: insertedMeal.id,
            member_user_id: member.user_id,
            adaptation_score: adaptation.score || 50,
            adaptation_notes: adaptation.notes || '',
            variant_instructions: adaptation.variant || '',
            is_best_match: sortedAdaptations[0]?.member_name === adaptation.member_name,
          });
        }
      }
    }

    if (adaptationsToInsert.length > 0) {
      const { error: adaptError } = await supabaseClient
        .from('meal_member_adaptations')
        .insert(adaptationsToInsert);
      
      if (adaptError) {
        console.error('Error inserting adaptations:', adaptError);
      } else {
        console.log(`Inserted ${adaptationsToInsert.length} meal adaptations`);
      }
    }

    // Insert shopping list
    if (mealData.shopping_list?.length > 0) {
      await supabaseClient
        .from('shopping_lists')
        .insert({
          meal_plan_id: mealPlan.id,
          items: mealData.shopping_list,
        });
    }

    console.log('✅ Family meal plan complete!');

    return new Response(
      JSON.stringify({ 
        success: true, 
        mealPlanId: mealPlan.id,
        mealsCount: insertedMeals.length,
        membersCount: memberPreferences.length,
        adaptationsCount: adaptationsToInsert.length,
      }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in generate-family-meal-plan:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Error generating family meal plan',
        success: false 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
