import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get recipes with base64 images (they start with 'data:image')
    const { data: recipes, error: fetchError } = await supabaseClient
      .from('recipe_library')
      .select('id, name, image_url')
      .like('image_url', 'data:image%')
      .limit(10); // Process 10 at a time to avoid timeout

    if (fetchError) {
      throw new Error(`Error fetching recipes: ${fetchError.message}`);
    }

    console.log(`Found ${recipes?.length || 0} recipes with base64 images to migrate`);

    if (!recipes || recipes.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'No more recipes to migrate',
        migrated: 0,
        remaining: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let migrated = 0;
    const errors: string[] = [];

    for (const recipe of recipes) {
      try {
        const base64Data = recipe.image_url;
        
        // Extract the base64 content and mime type
        const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/);
        if (!matches) {
          console.error(`Invalid base64 format for recipe ${recipe.id}`);
          errors.push(`${recipe.id}: Invalid base64 format`);
          continue;
        }

        const extension = matches[1] === 'jpeg' ? 'jpg' : matches[1];
        const base64Content = matches[2];
        
        // Decode base64 to binary
        const binaryString = atob(base64Content);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        // Generate unique filename
        const fileName = `${recipe.id}.${extension}`;
        
        // Upload to storage
        const { error: uploadError } = await supabaseClient.storage
          .from('recipe-images')
          .upload(fileName, bytes, {
            contentType: `image/${extension}`,
            upsert: true
          });

        if (uploadError) {
          console.error(`Upload error for ${recipe.id}:`, uploadError);
          errors.push(`${recipe.id}: ${uploadError.message}`);
          continue;
        }

        // Get public URL
        const { data: urlData } = supabaseClient.storage
          .from('recipe-images')
          .getPublicUrl(fileName);

        // Update recipe with new URL
        const { error: updateError } = await supabaseClient
          .from('recipe_library')
          .update({ image_url: urlData.publicUrl })
          .eq('id', recipe.id);

        if (updateError) {
          console.error(`Update error for ${recipe.id}:`, updateError);
          errors.push(`${recipe.id}: ${updateError.message}`);
          continue;
        }

        console.log(`Migrated recipe ${recipe.id}: ${recipe.name}`);
        migrated++;
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error(`Error processing recipe ${recipe.id}:`, err);
        errors.push(`${recipe.id}: ${errorMsg}`);
      }
    }

    // Count remaining
    const { count } = await supabaseClient
      .from('recipe_library')
      .select('id', { count: 'exact', head: true })
      .like('image_url', 'data:image%');

    return new Response(JSON.stringify({ 
      message: `Migrated ${migrated} recipes`,
      migrated,
      remaining: count || 0,
      errors: errors.length > 0 ? errors : undefined
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Migration error:', error);
    return new Response(JSON.stringify({ error: errorMsg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
