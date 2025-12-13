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
    // Parse batch parameters from POST body
    let limit = 5;
    let offset = 0;
    
    if (req.method === 'POST') {
      try {
        const body = await req.json();
        limit = body.limit || 5;
        offset = body.offset || 0;
      } catch {
        // Use defaults if no body or invalid JSON
      }
    }

    console.log(`Processing batch: limit=${limit}, offset=${offset}`);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // First get just the IDs of recipes with base64 images (lighter query)
    const { data: recipeIds, error: idError } = await supabaseClient
      .from('recipe_library')
      .select('id')
      .like('image_url', 'data:image%')
      .range(offset, offset + limit - 1);

    if (idError) {
      throw new Error(`Error fetching recipe IDs: ${idError.message}`);
    }

    console.log(`Found ${recipeIds?.length || 0} recipe IDs in this batch`);

    if (!recipeIds || recipeIds.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'No more recipes to migrate in this batch',
        migrated: 0,
        batch: { limit, offset },
        remaining: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let migrated = 0;
    const errors: string[] = [];

    // Process each recipe individually to avoid loading all base64 data at once
    for (const { id } of recipeIds) {
      try {
        console.log(`Processing recipe ${id}...`);
        
        // Fetch single recipe with its image
        const { data: recipe, error: fetchError } = await supabaseClient
          .from('recipe_library')
          .select('id, name, image_url')
          .eq('id', id)
          .single();

        if (fetchError || !recipe) {
          console.error(`Failed to fetch recipe ${id}:`, fetchError);
          errors.push(`${id}: Failed to fetch`);
          continue;
        }

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
        console.error(`Error processing recipe ${id}:`, err);
        errors.push(`${id}: ${errorMsg}`);
      }
    }

    // Count remaining (skip if having connection issues)
    let remaining = 0;
    try {
      const { count } = await supabaseClient
        .from('recipe_library')
        .select('id', { count: 'exact', head: true })
        .like('image_url', 'data:image%');
      remaining = count || 0;
    } catch (countError) {
      console.error('Failed to count remaining:', countError);
      remaining = -1; // Unknown
    }

    return new Response(JSON.stringify({ 
      message: `Migrated ${migrated} recipes`,
      migrated,
      batch: { limit, offset, nextOffset: offset + limit },
      remaining,
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
