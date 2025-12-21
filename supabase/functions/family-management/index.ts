import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[FAMILY-MANAGEMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started", { method: req.method });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    // GET - Get family info
    if (req.method === "GET") {
      logStep("Getting family info");

      // Check if user owns a family
      const { data: ownedFamily } = await supabaseClient
        .from("families")
        .select("*")
        .eq("owner_id", user.id)
        .single();

      if (ownedFamily) {
        // Get members
        const { data: memberships } = await supabaseClient
          .from("family_memberships")
          .select(`
            id,
            user_id,
            role,
            joined_at
          `)
          .eq("family_id", ownedFamily.id);

        // Get member profiles
        const memberIds = memberships?.map(m => m.user_id) || [];
        const { data: profiles } = await supabaseClient
          .from("profiles")
          .select("id, email, display_name, avatar_config, avatar_background_color")
          .in("id", memberIds);

        const membersWithProfiles = memberships?.map(m => ({
          ...m,
          profile: profiles?.find(p => p.id === m.user_id),
        })) || [];

        return new Response(JSON.stringify({
          family: ownedFamily,
          members: membersWithProfiles,
          isOwner: true,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      // Check if user is a member of a family
      const { data: membership } = await supabaseClient
        .from("family_memberships")
        .select(`
          id,
          family_id,
          role,
          joined_at,
          families (
            id,
            name,
            owner_id,
            invite_code,
            max_members
          )
        `)
        .eq("user_id", user.id)
        .single();

      if (membership) {
        const family = membership.families as any;
        
        // Get all members
        const { data: memberships } = await supabaseClient
          .from("family_memberships")
          .select("id, user_id, role, joined_at")
          .eq("family_id", family.id);

        const memberIds = memberships?.map(m => m.user_id) || [];
        const { data: profiles } = await supabaseClient
          .from("profiles")
          .select("id, email, display_name, avatar_config, avatar_background_color")
          .in("id", memberIds);

        const membersWithProfiles = memberships?.map(m => ({
          ...m,
          profile: profiles?.find(p => p.id === m.user_id),
        })) || [];

        return new Response(JSON.stringify({
          family,
          members: membersWithProfiles,
          isOwner: false,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      return new Response(JSON.stringify({ family: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // POST - Create family or join family
    if (req.method === "POST") {
      const body = await req.json();
      const { action: postAction, inviteCode, familyName } = body;

      // Create new family
      if (postAction === "create") {
        logStep("Creating new family", { familyName });

        // Check if user already belongs to a family
        const { data: existingMembership } = await supabaseClient
          .from("family_memberships")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (existingMembership) {
          throw new Error("User already belongs to a family");
        }

        // Create family
        const { data: newFamily, error: familyError } = await supabaseClient
          .from("families")
          .insert({
            name: familyName || "Mi Familia",
            owner_id: user.id,
            invite_code: "", // Will be auto-generated by trigger
          })
          .select()
          .single();

        if (familyError) throw new Error(`Failed to create family: ${familyError.message}`);
        logStep("Family created", { familyId: newFamily.id });

        // Add owner as member
        const { error: memberError } = await supabaseClient
          .from("family_memberships")
          .insert({
            family_id: newFamily.id,
            user_id: user.id,
            role: "owner",
          });

        if (memberError) throw new Error(`Failed to add owner as member: ${memberError.message}`);

        return new Response(JSON.stringify({ 
          success: true, 
          family: newFamily,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      // Join existing family
      if (postAction === "join") {
        logStep("Joining family with invite code", { inviteCode });

        if (!inviteCode) throw new Error("Invite code is required");

        // Check if user already belongs to a family
        const { data: existingMembership } = await supabaseClient
          .from("family_memberships")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (existingMembership) {
          throw new Error("User already belongs to a family");
        }

        // Find family by invite code (case-insensitive)
        const { data: family, error: familyError } = await supabaseClient
          .from("families")
          .select("*")
          .ilike("invite_code", inviteCode)
          .single();

        if (familyError || !family) {
          throw new Error("Invalid invite code");
        }

        // Check member count
        const { count } = await supabaseClient
          .from("family_memberships")
          .select("id", { count: "exact" })
          .eq("family_id", family.id);

        if ((count || 0) >= (family.max_members || 5)) {
          throw new Error("Family has reached maximum members");
        }

        // Add user as member
        const { error: memberError } = await supabaseClient
          .from("family_memberships")
          .insert({
            family_id: family.id,
            user_id: user.id,
            role: "member",
          });

        if (memberError) throw new Error(`Failed to join family: ${memberError.message}`);
        logStep("User joined family", { familyId: family.id });

        return new Response(JSON.stringify({ 
          success: true, 
          family,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      // Validate invite code
      if (postAction === "validate") {
        logStep("Validating invite code", { inviteCode });

        if (!inviteCode) throw new Error("Invite code is required");

        // Case-insensitive search
        const { data: family, error } = await supabaseClient
          .from("families")
          .select("id, name, max_members")
          .ilike("invite_code", inviteCode)
          .single();

        if (error || !family) {
          return new Response(JSON.stringify({ valid: false }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }

        // Check member count
        const { count } = await supabaseClient
          .from("family_memberships")
          .select("id", { count: "exact" })
          .eq("family_id", family.id);

        const hasSpace = (count || 0) < (family.max_members || 5);

        return new Response(JSON.stringify({ 
          valid: true, 
          familyName: family.name,
          hasSpace,
          currentMembers: count || 0,
          maxMembers: family.max_members || 5,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      throw new Error("Invalid action");
    }

    // DELETE - Remove member or leave family
    if (req.method === "DELETE") {
      const { memberId, leaveFamily } = await req.json();

      if (leaveFamily) {
        logStep("User leaving family");

        const { error } = await supabaseClient
          .from("family_memberships")
          .delete()
          .eq("user_id", user.id)
          .eq("role", "member"); // Can only leave if member, not owner

        if (error) throw new Error(`Failed to leave family: ${error.message}`);

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      if (memberId) {
        logStep("Removing member", { memberId });

        // Verify user is owner
        const { data: family } = await supabaseClient
          .from("families")
          .select("id")
          .eq("owner_id", user.id)
          .single();

        if (!family) throw new Error("Only family owner can remove members");

        // Can't remove owner
        const { data: membership } = await supabaseClient
          .from("family_memberships")
          .select("role")
          .eq("id", memberId)
          .single();

        if (membership?.role === "owner") {
          throw new Error("Cannot remove family owner");
        }

        const { error } = await supabaseClient
          .from("family_memberships")
          .delete()
          .eq("id", memberId)
          .eq("family_id", family.id);

        if (error) throw new Error(`Failed to remove member: ${error.message}`);

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      throw new Error("Invalid delete request");
    }

    // PATCH - Update family name
    if (req.method === "PATCH") {
      const { name } = await req.json();
      logStep("Updating family name", { name });

      const { data, error } = await supabaseClient
        .from("families")
        .update({ name })
        .eq("owner_id", user.id)
        .select()
        .single();

      if (error) throw new Error(`Failed to update family: ${error.message}`);

      return new Response(JSON.stringify({ success: true, family: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    throw new Error("Method not allowed");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
