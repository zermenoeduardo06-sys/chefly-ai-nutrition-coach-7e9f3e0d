import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// Ya no bloqueamos usuarios - el plan gratuito es permanente
export const useTrialGuard = () => {
  const [isBlocked, setIsBlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      // Con el modelo freemium, nunca bloqueamos acceso
      setIsBlocked(false);
      setIsLoading(false);
    } catch (error) {
      console.error("Error checking auth:", error);
      setIsLoading(false);
    }
  };

  return { isBlocked, isLoading };
};
