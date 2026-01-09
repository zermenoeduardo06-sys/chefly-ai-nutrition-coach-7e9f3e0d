import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Scale } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

interface WeightTrackerWidgetProps {
  userId?: string;
}

export const WeightTrackerWidget = ({ userId }: WeightTrackerWidgetProps) => {
  const [currentWeight, setCurrentWeight] = useState<number | null>(null);
  const [targetWeight, setTargetWeight] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();
  const { language } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) {
      loadWeightData();
    }
  }, [userId]);

  const loadWeightData = async () => {
    if (!userId) return;
    
    try {
      // Get target weight from user_preferences
      const { data: preferences } = await supabase
        .from("user_preferences")
        .select("weight, target_weight")
        .eq("user_id", userId)
        .single();

      if (preferences) {
        setTargetWeight(preferences.target_weight);
        // Start with the weight from preferences if no measurements exist
        if (preferences.weight) {
          setCurrentWeight(preferences.weight);
        }
      }

      // Get the latest weight from body_measurements
      const { data: latestMeasurement } = await supabase
        .from("body_measurements")
        .select("weight")
        .eq("user_id", userId)
        .not("weight", "is", null)
        .order("measurement_date", { ascending: false })
        .limit(1)
        .single();

      if (latestMeasurement?.weight) {
        setCurrentWeight(latestMeasurement.weight);
      }
    } catch (error) {
      console.error("Error loading weight data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateWeight = async (change: number) => {
    if (!userId || currentWeight === null) return;
    
    const newWeight = Math.max(30, currentWeight + change); // Minimum 30kg
    setUpdating(true);
    
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      
      // Check if there's already a measurement for today
      const { data: existingMeasurement } = await supabase
        .from("body_measurements")
        .select("id")
        .eq("user_id", userId)
        .eq("measurement_date", today)
        .single();

      if (existingMeasurement) {
        // Update existing measurement
        await supabase
          .from("body_measurements")
          .update({ weight: newWeight })
          .eq("id", existingMeasurement.id);
      } else {
        // Create new measurement
        await supabase
          .from("body_measurements")
          .insert({
            user_id: userId,
            measurement_date: today,
            weight: newWeight,
          });
      }

      // Also update weight in user_preferences
      await supabase
        .from("user_preferences")
        .update({ weight: newWeight })
        .eq("user_id", userId);

      setCurrentWeight(newWeight);
      
    } catch (error) {
      console.error("Error updating weight:", error);
      toast({
        variant: "destructive",
        title: language === "es" ? "Error" : "Error",
        description: language === "es" 
          ? "No se pudo actualizar el peso" 
          : "Could not update weight",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDecreaseWeight = () => updateWeight(-0.1);
  const handleIncreaseWeight = () => updateWeight(0.1);

  if (loading) {
    return (
      <Card className="border-border/50 shadow-lg bg-card">
        <CardContent className="p-4">
          <div className="h-24 animate-pulse bg-muted rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (currentWeight === null) {
    return null; // Don't show widget if no weight data
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-base font-semibold text-foreground">
          {language === "es" ? "Valores corporales" : "Body values"}
        </h3>
        <button 
          onClick={() => navigate("/dashboard/progress")}
          className="text-sm font-medium text-primary hover:underline"
        >
          {language === "es" ? "Más" : "More"}
        </button>
      </div>
      
      <Card className="border-border/50 shadow-lg bg-card">
        <CardContent className="p-4">
          <div className="flex flex-col items-center space-y-2">
            {/* Header with icon */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Scale className="h-4 w-4" />
              <span className="text-sm font-medium">
                {language === "es" ? "Peso" : "Weight"}
              </span>
            </div>
            
            {/* Target weight */}
            {targetWeight && (
              <p className="text-xs text-muted-foreground">
                {language === "es" ? "Objetivo:" : "Goal:"} {targetWeight.toFixed(1)} kg
              </p>
            )}
            
            {/* Weight control */}
            <div className="flex items-center gap-4 mt-2">
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full border-2"
                onClick={handleDecreaseWeight}
                disabled={updating || currentWeight <= 30}
              >
                <Minus className="h-5 w-5" />
              </Button>
              
              <div className="text-center min-w-[100px]">
                <span className="text-3xl font-bold text-foreground">
                  {currentWeight.toFixed(1)}
                </span>
                <span className="text-xl font-medium text-muted-foreground ml-1">
                  kg
                </span>
              </div>
              
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full border-2"
                onClick={handleIncreaseWeight}
                disabled={updating}
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
