import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import WeeklyCheckInDialog from "./WeeklyCheckInDialog";
import { useWeeklyCheckIn, WeeklyCheckInData } from "@/hooks/useWeeklyCheckIn";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WeeklyCheckInBannerProps {
  userId: string;
  onPlanGenerated?: () => void;
}

const WeeklyCheckInBanner = ({ userId, onPlanGenerated }: WeeklyCheckInBannerProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { language } = useLanguage();
  
  const {
    isCheckInDue,
    isLoading,
    canAccessCheckIn,
    checkInData,
    setCheckInData,
    submitCheckIn,
  } = useWeeklyCheckIn(userId);

  const t = {
    es: {
      title: "¡Es hora de tu Check-In Semanal!",
      desc: "Ajustemos tus recetas según cómo te fue esta semana",
      button: "Comenzar Check-In",
      generating: "Generando tu plan...",
    },
    en: {
      title: "Time for your Weekly Check-In!",
      desc: "Let's adjust your recipes based on how your week went",
      button: "Start Check-In",
      generating: "Generating your plan...",
    },
  };

  const texts = t[language];

  const handleSubmit = async (): Promise<boolean> => {
    const success = await submitCheckIn();
    
    if (success) {
      // Generate new meal plan with check-in data
      try {
        toast.loading(texts.generating, { id: "generating-plan" });
        
        const { error } = await supabase.functions.invoke("generate-meal-plan", {
          body: {
            userId,
            forceNew: true,
            language,
            weeklyCheckIn: {
              weightChange: checkInData.weightChange,
              energyLevel: checkInData.energyLevel,
              recipePreferences: checkInData.recipePreferences,
              customRecipePreference: checkInData.customRecipePreference,
              availableIngredients: checkInData.availableIngredients,
              weeklyGoals: checkInData.weeklyGoals,
            },
          },
        });

        toast.dismiss("generating-plan");

        if (error) {
          console.error("Error generating plan:", error);
          toast.error(language === "es" ? "Error al generar el plan" : "Error generating plan");
        } else {
          onPlanGenerated?.();
        }
      } catch (err) {
        toast.dismiss("generating-plan");
        console.error("Error:", err);
      }
    }
    
    return success;
  };

  const handleUpgrade = () => {
    setDialogOpen(false);
    navigate("/pricing");
  };

  // Don't show if loading or check-in not due
  if (isLoading || !isCheckInDue) {
    return null;
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20 p-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  {texts.title}
                  <Sparkles className="w-4 h-4 text-primary" />
                </h3>
                <p className="text-sm text-muted-foreground">{texts.desc}</p>
              </div>
            </div>
            <Button onClick={() => setDialogOpen(true)} className="gap-2">
              {texts.button}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </motion.div>

      <WeeklyCheckInDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        checkInData={checkInData}
        setCheckInData={setCheckInData}
        onSubmit={handleSubmit}
        canAccess={canAccessCheckIn}
        onUpgrade={handleUpgrade}
      />
    </>
  );
};

export default WeeklyCheckInBanner;
