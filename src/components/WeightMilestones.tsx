import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Trophy, Target, CheckCircle2, Star, Loader2, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Card3D, Card3DContent, Card3DHeader } from "@/components/ui/card-3d";
import { Icon3D } from "@/components/ui/icon-3d";

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

      const { data: existingMilestones } = await supabase
        .from("weight_milestones")
        .select("*")
        .eq("user_id", userId)
        .order("milestone_number", { ascending: true });

      if (existingMilestones && existingMilestones.length > 0) {
        setMilestones(existingMilestones);
      } else {
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
        const { error } = await supabase
          .from("weight_milestones")
          .update({ achieved_at: new Date().toISOString() })
          .eq("id", milestone.id);

        if (!error) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#10b981", "#34d399", "#6ee7b7"],
          });
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
      <Card3D variant="default" className="p-6">
        <div className="flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </Card3D>
    );
  }

  if (!targetWeight || !startingWeight || milestones.length === 0) {
    return null;
  }

  const progress = calculateProgress();
  const achievedCount = milestones.filter((m) => m.achieved_at).length;
  const nextMilestone = milestones.find((m) => !m.achieved_at);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card3D variant="default" className="overflow-hidden">
        <Card3DHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon3D icon={Target} color="primary" size="md" />
              <h3 className="text-lg font-bold">
                {language === "es" ? "Tu Camino" : "Your Journey"}
              </h3>
            </div>
            <motion.div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30"
              whileHover={{ scale: 1.05 }}
            >
              <Trophy className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-bold text-amber-600">
                {achievedCount}/{milestones.length}
              </span>
            </motion.div>
          </div>
        </Card3DHeader>

        <Card3DContent className="space-y-4">
          {/* Main progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground font-medium">{startingWeight} kg</span>
              <span className="font-bold text-primary">{targetWeight} kg</span>
            </div>
            <div className="relative">
              <div className="h-4 bg-muted rounded-full overflow-hidden shadow-inner">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
              {/* Milestone markers */}
              <div className="absolute inset-0 flex items-center pointer-events-none px-1">
                {MILESTONE_PERCENTAGES.slice(0, -1).map((pct) => (
                  <div
                    key={pct}
                    className="absolute h-6 w-1 bg-background/80 rounded shadow"
                    style={{ left: `${pct}%`, transform: "translateX(-50%)" }}
                  />
                ))}
              </div>
            </div>
            {currentWeight && (
              <p className="text-center text-sm text-muted-foreground">
                {language === "es" ? "Peso actual" : "Current weight"}: 
                <span className="font-bold text-foreground ml-1">{currentWeight} kg</span>
              </p>
            )}
          </div>

          {/* Next milestone highlight */}
          {nextMilestone && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary/20 shadow-[0_2px_0_hsl(var(--primary)/0.1)]"
            >
              <div className="flex items-center gap-2 text-sm">
                <Star className="h-5 w-5 text-primary" />
                <span className="font-medium">
                  {language === "es" ? "Próxima meta" : "Next milestone"}:
                </span>
                <span className="text-primary font-bold">
                  {nextMilestone.milestone_weight} kg ({nextMilestone.percentage}%)
                </span>
              </div>
            </motion.div>
          )}

          {/* Milestone badges grid */}
          <div className="grid grid-cols-5 gap-2">
            <AnimatePresence>
              {milestones.map((milestone, index) => {
                const isAchieved = !!milestone.achieved_at;
                return (
                  <motion.div
                    key={milestone.id}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative flex flex-col items-center p-2 rounded-xl transition-all ${
                      isAchieved
                        ? "bg-gradient-to-br from-emerald-500/20 to-green-500/10 border-2 border-emerald-500/40 shadow-[0_3px_0_hsl(160_80%_30%/0.3)]"
                        : "bg-muted/50 border-2 border-border/30 opacity-60"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center mb-1 ${
                        isAchieved
                          ? "bg-gradient-to-br from-emerald-400 to-green-500 shadow-[0_2px_0_hsl(160_80%_25%)]"
                          : "bg-muted"
                      }`}
                    >
                      {isAchieved ? (
                        <CheckCircle2 className="h-5 w-5 text-white" />
                      ) : (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <span className={`text-xs font-bold ${isAchieved ? "text-emerald-600" : "text-muted-foreground"}`}>
                      {milestone.percentage}%
                    </span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Celebration message when all completed */}
          {achievedCount === milestones.length && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-green-500/20 border-2 border-emerald-500/30 text-center shadow-[0_4px_0_hsl(160_80%_30%/0.2)]"
            >
              <Trophy className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
              <p className="font-bold text-emerald-600">
                {language === "es" ? "¡Felicidades! Alcanzaste tu meta 🎉" : "Congratulations! You reached your goal 🎉"}
              </p>
            </motion.div>
          )}
        </Card3DContent>
      </Card3D>
    </motion.div>
  );
};
