import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

interface LockedFeatureProps {
  children: React.ReactNode;
  isLocked: boolean;
  message?: string;
}

export const LockedFeature = ({ children, isLocked, message }: LockedFeatureProps) => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  if (!isLocked) {
    return <>{children}</>;
  }

  const defaultMessage = language === "es" 
    ? "Mejora tu plan para acceder a esta función" 
    : "Upgrade your plan to access this feature";

  return (
    <div className="relative">
      <div className="opacity-40 pointer-events-none blur-[1px]">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm rounded-lg">
        <div className="flex flex-col items-center gap-3 p-4 text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <Lock className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground max-w-[200px]">
            {message || defaultMessage}
          </p>
          <Button 
            size="sm" 
            onClick={() => navigate("/pricing")}
            className="mt-1"
          >
            {language === "es" ? "Mejorar Plan" : "Upgrade Plan"}
          </Button>
        </div>
      </div>
    </div>
  );
};
