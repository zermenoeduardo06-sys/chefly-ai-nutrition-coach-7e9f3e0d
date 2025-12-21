import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface FamilyMember {
  id: string;
  user_id: string;
  role: "owner" | "member";
  joined_at: string;
  profile?: {
    id: string;
    email: string;
    display_name: string | null;
    avatar_config: any;
    avatar_background_color: string | null;
  };
}

interface Family {
  id: string;
  name: string;
  owner_id: string;
  invite_code: string;
  max_members: number;
  created_at: string;
}

interface FamilyData {
  family: Family | null;
  members: FamilyMember[];
  isOwner: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useFamily = (userId: string | undefined) => {
  const [data, setData] = useState<FamilyData>({
    family: null,
    members: [],
    isOwner: false,
    isLoading: true,
    error: null,
  });

  const loadFamily = useCallback(async () => {
    if (!userId) {
      setData(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      setData(prev => ({ ...prev, isLoading: true, error: null }));

      const { data: response, error } = await supabase.functions.invoke("family-management", {
        method: "GET",
      });

      if (error) throw error;

      setData({
        family: response.family || null,
        members: response.members || [],
        isOwner: response.isOwner || false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error loading family:", error);
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Error loading family",
      }));
    }
  }, [userId]);

  useEffect(() => {
    loadFamily();
  }, [loadFamily]);

  const createFamily = async (familyName?: string) => {
    try {
      const { data: response, error } = await supabase.functions.invoke("family-management", {
        body: { action: "create", familyName },
      });

      if (error) throw error;
      await loadFamily();
      return { success: true, family: response.family };
    } catch (error) {
      console.error("Error creating family:", error);
      return { success: false, error: error instanceof Error ? error.message : "Error creating family" };
    }
  };

  const joinFamily = async (inviteCode: string) => {
    try {
      const { data: response, error } = await supabase.functions.invoke("family-management", {
        body: { action: "join", inviteCode },
      });

      if (error) throw error;
      await loadFamily();
      return { success: true, family: response.family };
    } catch (error) {
      console.error("Error joining family:", error);
      return { success: false, error: error instanceof Error ? error.message : "Error joining family" };
    }
  };

  const validateInviteCode = async (inviteCode: string) => {
    try {
      const { data: response, error } = await supabase.functions.invoke("family-management", {
        body: { action: "validate", inviteCode },
      });

      if (error) throw error;
      return response;
    } catch (error) {
      console.error("Error validating invite code:", error);
      return { valid: false };
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase.functions.invoke("family-management", {
        method: "DELETE",
        body: { memberId },
      });

      if (error) throw error;
      await loadFamily();
      return { success: true };
    } catch (error) {
      console.error("Error removing member:", error);
      return { success: false, error: error instanceof Error ? error.message : "Error removing member" };
    }
  };

  const leaveFamily = async () => {
    try {
      const { error } = await supabase.functions.invoke("family-management", {
        method: "DELETE",
        body: { leaveFamily: true },
      });

      if (error) throw error;
      await loadFamily();
      return { success: true };
    } catch (error) {
      console.error("Error leaving family:", error);
      return { success: false, error: error instanceof Error ? error.message : "Error leaving family" };
    }
  };

  const updateFamilyName = async (name: string) => {
    try {
      const { error } = await supabase.functions.invoke("family-management", {
        method: "PATCH",
        body: { name },
      });

      if (error) throw error;
      await loadFamily();
      return { success: true };
    } catch (error) {
      console.error("Error updating family name:", error);
      return { success: false, error: error instanceof Error ? error.message : "Error updating family" };
    }
  };

  return {
    ...data,
    loadFamily,
    createFamily,
    joinFamily,
    validateInviteCode,
    removeMember,
    leaveFamily,
    updateFamilyName,
  };
};
