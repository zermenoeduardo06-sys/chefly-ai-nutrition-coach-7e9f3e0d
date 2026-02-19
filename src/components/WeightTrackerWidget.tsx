import { useState, useEffect } from "react";
import { Card3D, Card3DContent } from "@/components/ui/card-3d";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Scale, TrendingDown, TrendingUp, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useInvalidateProgressData } from "@/hooks/useProgressData";
import { Skeleton } from "@/components/ui/skeleton";

interface WeightTrackerWidgetProps {
  userId?: string;
}

type TrendDirection = "toward-goal" | "away-from-goal" | "at-goal" | null;

export const WeightTrackerWidget = ({ userId }: WeightTrackerWidgetProps) => {
  const [currentWeight, setCurrentWeight] = useState<number | null>(null);
  const [targetWeight, setTargetWeight] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [lastChange, setLastChange] = useState<number>(0);
  const [showTrend, setShowTrend] = useState(false);
  const { toast } = useToast();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const invalidateProgressData = useInvalidateProgressData();

  useEffect(() => {
    if (userId) {
      loadWeightData();
    }
  }, [userId]);

  const loadWeightData = async () => {
    if (!userId) return;
    
    try {
      const { data: preferences } = await supabase
        .from("user_preferences")
        .select("weight, target_weight")
        .eq("user_id", userId)
        .single();

      if (preferences) {
        setTargetWeight(preferences.target_weight);
        if (preferences.weight) {
          setCurrentWeight(preferences.weight);
        }
      }

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

  const getTrendDirection = (change: number): TrendDirection => {
    if (!targetWeight || currentWeight === null) return null;
    
    const needsToLose = currentWeight > targetWeight;
    const needsToGain = currentWeight < targetWeight;
    const atGoal = Math.abs(currentWeight - targetWeight) < 0.1;
    
    if (atGoal) return "at-goal";
    if ((needsToLose && change < 0) || (needsToGain && change > 0)) {
      return "toward-goal";
    }
    return "away-from-goal";
  };

  const updateWeight = async (change: number) => {
    if (!userId || currentWeight === null) return;
    
    const newWeight = Math.max(30, currentWeight + change);
    setUpdating(true);
    setLastChange(change);
    
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      
      const { data: existingMeasurement } = await supabase
        .from("body_measurements")
        .select("id")
        .eq("user_id", userId)
        .eq("measurement_date", today)
        .single();

      if (existingMeasurement) {
        await supabase
          .from("body_measurements")
          .update({ weight: newWeight })
          .eq("id", existingMeasurement.id);
      } else {
        await supabase
          .from("body_measurements")
          .insert({
            user_id: userId,
            measurement_date: today,
            weight: newWeight,
          });
      }

      await supabase
        .from("user_preferences")
        .update({ weight: newWeight })
        .eq("user_id", userId);

      setCurrentWeight(newWeight);
      invalidateProgressData();
      setShowTrend(true);
      setTimeout(() => setShowTrend(false), 1500);
      
    } catch (error) {
      console.error("Error updating weight:", error);
      toast({
        variant: "destructive",
        title: "Error",
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

  const trendDirection = getTrendDirection(lastChange);

  const TrendIndicator = () => {
    if (!showTrend || !trendDirection) return null;

    const isTowardGoal = trendDirection === "toward-goal";
    const isAtGoal = trendDirection === "at-goal";
    const isDecreasing = lastChange < 0;

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: -10 }}
          className={`absolute -top-1 right-0 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            isAtGoal
              ? "bg-primary/20 text-primary"
              : isTowardGoal
                ? "bg-green-500/20 text-green-500"
                : "bg-orange-500/20 text-orange-500"
          }`}
        >
          {isAtGoal ? (
            <><Check className="h-3 w-3" /><span>{language === "es" ? "¡Meta!" : "Goal!"}</span></>
          ) : isDecreasing ? (
            <><TrendingDown className="h-3 w-3" /><span>{isTowardGoal ? (language === "es" ? "¡Bien!" : "Great!") : "-0.1"}</span></>
          ) : (
            <><TrendingUp className="h-3 w-3" /><span>{isTowardGoal ? (language === "es" ? "¡Bien!" : "Great!") : "+0.1"}</span></>
          )}
        </motion.div>
      </AnimatePresence>
    );
  };

  const getProgressInfo = () => {
    if (!targetWeight || currentWeight === null) return null;
    
    const difference = Math.abs(currentWeight - targetWeight);
    const isAtGoal = difference < 0.1;
    const needsToLose = currentWeight > targetWeight;
    
    if (isAtGoal) {
      return {
        text: language === "es" ? "¡Meta alcanzada!" : "Goal reached!",
        color: "text-primary",
        icon: <Check className="h-3 w-3" />,
      };
    }
    
    return {
      text: `${difference.toFixed(1)} kg ${needsToLose 
        ? (language === "es" ? "por bajar" : "to lose") 
        : (language === "es" ? "por subir" : "to gain")}`,
      color: "text-muted-foreground",
      icon: needsToLose ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />,
    };
  };

  const progressInfo = getProgressInfo();

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Card3D variant="default" hover={false}>
          <Card3DContent className="p-4">
            <div className="h-24 animate-pulse bg-muted rounded-lg" />
          </Card3DContent>
        </Card3D>
      </div>
    );
  }

  if (currentWeight === null) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <h3 className="section-header">
          {language === "es" ? "Peso" : "Weight"}
        </h3>
        <button 
          onClick={() => navigate("/dashboard/progress")}
          className="text-sm font-medium text-primary hover:underline"
        >
          {language === "es" ? "Más" : "More"}
        </button>
      </div>
      
      <Card3D variant="default" hover={false}>
        <Card3DContent className="p-4">
          <div className="flex flex-col items-center space-y-2 relative">
            <TrendIndicator />
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <Scale className="h-4 w-4" />
              <span className="text-sm font-medium">
                {language === "es" ? "Peso actual" : "Current weight"}
              </span>
            </div>
            
            {targetWeight && (
              <p className="text-xs text-muted-foreground">
                {language === "es" ? "Objetivo:" : "Goal:"} {targetWeight.toFixed(1)} kg
              </p>
            )}
            
            <div className="flex items-center gap-4 mt-2">
              <Button
                variant="modern3dOutline"
                size="icon"
                className="h-12 w-12 rounded-xl"
                onClick={handleDecreaseWeight}
                disabled={updating || currentWeight <= 30}
              >
                <Minus className="h-5 w-5" />
              </Button>
              
              <motion.div 
                className="text-center min-w-[100px]"
                key={currentWeight}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <span className="text-3xl font-bold text-foreground">
                  {currentWeight.toFixed(1)}
                </span>
                <span className="text-xl font-medium text-muted-foreground ml-1">
                  kg
                </span>
              </motion.div>
              
              <Button
                variant="modern3dOutline"
                size="icon"
                className="h-12 w-12 rounded-xl"
                onClick={handleIncreaseWeight}
                disabled={updating}
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>

            {progressInfo && (
              <motion.div 
                className={`flex items-center gap-1 text-xs ${progressInfo.color}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {progressInfo.icon}
                <span>{progressInfo.text}</span>
              </motion.div>
            )}
          </div>
        </Card3DContent>
      </Card3D>
    </div>
  );
};
