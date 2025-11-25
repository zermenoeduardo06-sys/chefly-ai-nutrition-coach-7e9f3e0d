import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const AFFILIATE_CODE_KEY = "affiliate_code";
const REFERRAL_STORED_KEY = "affiliate_referral_stored";

export const useAffiliateTracking = () => {
  useEffect(() => {
    const trackAffiliate = async () => {
      // Obtener código de afiliado de la URL
      const urlParams = new URLSearchParams(window.location.search);
      const affiliateCode = urlParams.get("ref");

      if (affiliateCode) {
        console.log("Affiliate code detected:", affiliateCode);
        
        // Guardar en localStorage para usar después en checkout
        localStorage.setItem(AFFILIATE_CODE_KEY, affiliateCode);
        
        // Verificar si ya registramos este click
        const alreadyStored = localStorage.getItem(REFERRAL_STORED_KEY);
        
        if (!alreadyStored) {
          try {
            // Registrar click en el backend
            const { data, error } = await supabase.functions.invoke("track-affiliate-click", {
              body: {
                affiliateCode: affiliateCode,
                referrerUrl: document.referrer || "direct",
                landingPage: window.location.href,
              },
            });

            if (error) {
              console.error("Error tracking affiliate click:", error);
            } else {
              console.log("Affiliate click tracked successfully:", data);
              // Marcar como registrado
              localStorage.setItem(REFERRAL_STORED_KEY, "true");
              
              // Expirar marca después de 24 horas
              setTimeout(() => {
                localStorage.removeItem(REFERRAL_STORED_KEY);
              }, 24 * 60 * 60 * 1000);
            }
          } catch (err) {
            console.error("Exception tracking affiliate:", err);
          }
        }
      }
    };

    trackAffiliate();
  }, []);

  // Función para obtener el código guardado
  const getStoredAffiliateCode = (): string | null => {
    return localStorage.getItem(AFFILIATE_CODE_KEY);
  };

  // Limpiar código después de conversión
  const clearAffiliateCode = () => {
    localStorage.removeItem(AFFILIATE_CODE_KEY);
    localStorage.removeItem(REFERRAL_STORED_KEY);
  };

  return {
    getStoredAffiliateCode,
    clearAffiliateCode,
  };
};
