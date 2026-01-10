import { useState } from "react";

// Ya no bloqueamos usuarios - el plan gratuito es permanente
// Este hook ahora es pasivo y no navega (la navegación la maneja Dashboard)
export const useTrialGuard = () => {
  // Con el modelo freemium, nunca bloqueamos acceso
  // Este hook existe solo por compatibilidad con código existente
  const [isBlocked] = useState(false);
  const [isLoading] = useState(false);

  return { isBlocked, isLoading };
};
