import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Languages } from "lucide-react";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
      <Languages className="h-4 w-4 text-muted-foreground" />
      <Button
        variant={language === "es" ? "default" : "ghost"}
        size="sm"
        onClick={() => setLanguage("es")}
        className="h-8 px-3"
      >
        ES
      </Button>
      <Button
        variant={language === "en" ? "default" : "ghost"}
        size="sm"
        onClick={() => setLanguage("en")}
        className="h-8 px-3"
      >
        EN
      </Button>
    </div>
  );
}
