import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Trophy, Target, CheckCircle2, Star, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

interface Milestone {
  id: string;
  milestone_number: number;
  starting_weight: number;
  target_weight: number;
  milestone_weight: number;
  percentage: number;
  achieved_at: string | null;
}

interface WeightMilestonesProps {
  userId: string;
  currentWeight?: number;
}

const MILESTONE_PERCENTAGES = [10, 25, 50, 75, 100];

export const WeightMilestones = ({ userId, currentWeight }: WeightMilestonesProps) => {
  const { language } = useLanguage();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [targetWeight, setTargetWeight] = useState<number | null>(null);
  const [startingWeight, setStartingWeight] = useState<number | null>(null);

  useEffect(() => {
    loadMilestones();
  }, [userId]);

  useEffect(() => {
    if (currentWeight && milestones.length > 0) {
      checkMilestoneProgress(currentWeight);
    }
  }, [currentWeight, milestones]);

  const loadMilestones = async () => {
    try {
      // Get user preferences to check if they have a target weight
      const { data: prefs } = await supabase
        .from("user_preferences")
        .select("weight, target_weight, goal")
        .eq("user_id", userId)
        .single();

      if (!prefs?.target_weight || !prefs?.weight) {
        setLoading(false);
        return;
      }

      setTargetWeight(prefs.target_weight);
      setStartingWeight(prefs.weight);

      // Load existing milestones
      const { data: existingMilestones } = await supabase
        .from("weight_milestones")
        .select("*")
        .eq("user_id", userId)
        .order("milestone_number", { ascending: true });

      if (existingMilestones && existingMilestones.length > 0) {
        setMilestones(existingMilestones);
      } else {
        // Create milestones if they don't exist
        await createMilestones(prefs.weight, prefs.target_weight, prefs.goal);
      }
    } catch (error) {
      console.error("Error loading milestones:", error);
    } finally {
      setLoading(false);
    }
  };

  const createMilestones = async (start: number, target: number, goal: string) => {
    const isLosingWeight = goal === "lose_fat" || start > target;
    const totalChange = Math.abs(start - target);

    const newMilestones: Omit<Milestone, "id">[] = MILESTONE_PERCENTAGES.map((percentage, index) => {
      const changeAmount = (totalChange * percentage) / 100;
      const milestoneWeight = isLosingWeight ? start - changeAmount : start + changeAmount;

      return {
        user_id: userId,
        milestone_number: index + 1,
        starting_weight: start,
        target_weight: target,
        milestone_weight: Math.round(milestoneWeight * 10) / 10,
        percentage,
        achieved_at: null,
      };
    });

    const { data, error } = await supabase
      .from("weight_milestones")
      .insert(newMilestones as any)
      .select();

    if (!error && data) {
      setMilestones(data);
    }
  };

  const checkMilestoneProgress = async (weight: number) => {
    if (!startingWeight || !targetWeight) return;

    const isLosingWeight = startingWeight > targetWeight;

    for (const milestone of milestones) {
      if (milestone.achieved_at) continue;

      const achieved = isLosingWeight
        ? weight <= milestone.milestone_weight
        : weight >= milestone.milestone_weight;

      if (achieved) {
        // Update milestone as achieved
        const { error } = await supabase
          .from("weight_milestones")
          .update({ achieved_at: new Date().toISOString() })
          .eq("id", milestone.id);

        if (!error) {
          // Celebrate!
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#10b981", "#34d399", "#6ee7b7"],
          });

          // Reload milestones
          loadMilestones();
        }
      }
    }
  };

  const calculateProgress = (): number => {
    if (!startingWeight || !targetWeight || !currentWeight) return 0;
    const totalChange = Math.abs(startingWeight - targetWeight);
    const currentChange = Math.abs(startingWeight - currentWeight);
    return Math.min((currentChange / totalChange) * 100, 100);
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!targetWeight || !startingWeight || milestones.length === 0) {
    return null; // Don't show if no weight goal set
  }

  const progress = calculateProgress();
  const achievedCount = milestones.filter((m) => m.achieved_at).length;
  const nextMilestone = milestones.find((m) => !m.achieved_at);

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-primary/5 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg">
              {language === "es" ? "Tu Camino" : "Your Journey"}
            </CardTitle>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Trophy className="h-3 w-3" />
            {achievedCount}/{milestones.length}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {startingWeight} kg
            </span>
            <span className="font-medium text-primary">
              {targetWeight} kg
            </span>
          </div>
          <div className="relative">
            <Progress value={progress} className="h-3" />
            {/* Milestone markers */}
            <div className="absolute inset-0 flex items-center pointer-events-none">
              {MILESTONE_PERCENTAGES.slice(0, -1).map((pct) => (
                <div
                  key={pct}
                  className="absolute h-5 w-0.5 bg-muted-foreground/30 rounded"
                  style={{ left: `${pct}%` }}
                />
              ))}
            </div>
          </div>
          {currentWeight && (
            <p className="text-center text-sm text-muted-foreground">
              {language === "es" ? "Peso actual" : "Current weight"}: <span className="font-semibold text-foreground">{currentWeight} kg</span>
            </p>
          )}
        </div>

        {/* Next milestone highlight */}
        {nextMilestone && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-lg bg-primary/10 border border-primary/20"
          >
            <div className="flex items-center gap-2 text-sm">
              <Star className="h-4 w-4 text-primary" />
              <span className="font-medium">
                {language === "es" ? "Próxima meta" : "Next milestone"}:
              </span>
              <span className="text-primary font-bold">
                {nextMilestone.milestone_weight} kg ({nextMilestone.percentage}%)
              </span>
            </div>
          </motion.div>
        )}

        {/* Milestone list */}
        <div className="space-y-2">
          <AnimatePresence>
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                  milestone.achieved_at
                    ? "bg-green-500/10 border border-green-500/20"
                    : "bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  {milestone.achieved_at ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
                  )}
                  <span className={`text-sm ${milestone.achieved_at ? "text-green-600 font-medium" : "text-muted-foreground"}`}>
                    {milestone.percentage}% - {milestone.milestone_weight} kg
                  </span>
                </div>
                {milestone.achieved_at && (
                  <Badge variant="outline" className="text-green-600 border-green-500/30 text-xs">
                    ✓ {language === "es" ? "Logrado" : "Done"}
                  </Badge>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Celebration message when all completed */}
        {achievedCount === milestones.length && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-center"
          >
            <Trophy className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="font-semibold text-green-600">
              {language === "es" ? "¡Felicidades! Alcanzaste tu meta 🎉" : "Congratulations! You reached your goal 🎉"}
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};
