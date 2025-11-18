import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/30">
      <div className="text-center space-y-8 px-4 max-w-2xl">
        <div className="space-y-4">
          <div className="text-8xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {t("notfound.title")}
          </div>
          <h1 className="text-4xl font-bold">{t("notfound.heading")}</h1>
          <p className="text-xl text-muted-foreground">
            {t("notfound.message")}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => navigate(-1)}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("notfound.goBack")}
          </Button>
          <Button 
            onClick={() => navigate("/")}
            variant="hero"
            size="lg"
            className="gap-2"
          >
            <Home className="w-4 h-4" />
            {t("notfound.goHome")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
