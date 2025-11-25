import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useUserRole(role: "admin" | "moderator" | "user") {
  const [hasRole, setHasRole] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkRole();
  }, [role]);

  const checkRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setHasRole(false);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", role)
        .single();

      setHasRole(!error && !!data);
    } catch (error) {
      setHasRole(false);
    } finally {
      setLoading(false);
    }
  };

  return { hasRole, loading };
}
