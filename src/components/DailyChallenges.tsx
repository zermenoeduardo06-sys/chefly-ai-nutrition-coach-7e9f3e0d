import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Target, Trophy, Loader2, RefreshCw, Flame, Droplets, Clock, Apple, TrendingUp, Zap, Star, Sparkles, Check } from "lucide-react";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import mascotFire from "@/assets/mascot-fire.png";

interface Challenge {
  id: string;
  title: string;
  description: string;
  challenge_type: string;
  target_value: number;
  points_reward: number;
  bonus_description: string;
  expires_at: string;
}

interface ChallengeProgress {
  challenge_id: string;
  progress: number;
  is_completed: boolean;
}

const challengeIcons: { [key: string]: any } = {
  meal_variety: Apple,
  protein_goal: TrendingUp,
  hydration: Droplets,
  meal_timing: Clock,
  calorie_target: Target,
  streak_bonus: Flame,
};

const challengeColors: { [key: string]: string } = {
  meal_variety: "from-green-400 to-emerald-500",
  protein_goal: "from-blue-400 to-cyan-500",
  hydration: "from-cyan-400 to-teal-500",
  meal_timing: "from-purple-400 to-violet-500",
  calorie_target: "from-orange-400 to-amber-500",
  streak_bonus: "from-red-400 to-orange-500",
};

export const DailyChallenges = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [progress, setProgress] = useState<Map<string, ChallengeProgress>>(new Map());
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();
  const { language } = useLanguage();

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setLoading(true);
    try {
      const { data: challengesData } = await supabase
        .from("daily_challenges")
        .select("*")
        .eq("user_id", user.id)
        .gte("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (challengesData && challengesData.length > 0) {
        setChallenges(challengesData);

        const { data: progressData } = await supabase
          .from("user_daily_challenges")
          .select("*")
          .eq("user_id", user.id)
          .in("challenge_id", challengesData.map(c => c.id));

        if (progressData) {
          const progressMap = new Map();
          progressData.forEach(p => {
            progressMap.set(p.challenge_id, {
              challenge_id: p.challenge_id,
              progress: p.progress,
              is_completed: p.is_completed,
            });
          });
          setProgress(progressMap);
        }
      } else {
        await generateChallenges();
      }
    } catch (error: any) {
      console.error("Error loading challenges:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: language === "es" ? "No se pudieron cargar los desafíos" : "Could not load challenges",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateChallenges = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-daily-challenges", {
        body: { userId: user.id },
      });

      if (error) throw error;

      if (data?.challenges) {
        setChallenges(data.challenges);
        toast({
          title: language === "es" ? "¡Desafíos generados!" : "Challenges generated!",
          description: language === "es" ? "Tienes 3 nuevos desafíos diarios" : "You have 3 new daily challenges",
        });
      }
    } catch (error: any) {
      console.error("Error generating challenges:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: language === "es" ? "No se pudieron generar los desafíos" : "Could not generate challenges",
      });
    } finally {
      setGenerating(false);
    }
  };

  const completeChallenge = async (challenge: Challenge) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const currentProgress = progress.get(challenge.id);
    if (currentProgress?.is_completed) {
      toast({
        title: language === "es" ? "Ya completaste este desafío" : "You already completed this challenge",
        description: "🎉",
      });
      return;
    }

    try {
      const { error: progressError } = await supabase
        .from("user_daily_challenges")
        .upsert({
          user_id: user.id,
          challenge_id: challenge.id,
          progress: challenge.target_value,
          is_completed: true,
        });

      if (progressError) throw progressError;

      const { data: stats } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (stats) {
        const newPoints = stats.total_points + challenge.points_reward;
        const newLevel = Math.floor(newPoints / 100) + 1;

        await supabase
          .from("user_stats")
          .update({
            total_points: newPoints,
            level: newLevel,
          })
          .eq("user_id", user.id);
      }

      setProgress(prev => {
        const newMap = new Map(prev);
        newMap.set(challenge.id, {
          challenge_id: challenge.id,
          progress: challenge.target_value,
          is_completed: true,
        });
        return newMap;
      });

      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF6347'],
      });

      toast({
        title: language === "es" ? "🎉 ¡Desafío Completado!" : "🎉 Challenge Completed!",
        description: `+${challenge.points_reward} ${language === "es" ? "puntos" : "points"}`,
        duration: 5000,
      });
    } catch (error: any) {
      console.error("Error completing challenge:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: language === "es" ? "No se pudo completar el desafío" : "Could not complete challenge",
      });
    }
  };

  const completedCount = Array.from(progress.values()).filter(p => p.is_completed).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-6">
      {/* Hero Header with safe area */}
      <div className="relative bg-gradient-to-br from-primary via-primary/80 to-secondary overflow-hidden pt-safe-top">
        {/* Sparkle decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div 
            className="absolute top-8 left-8"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="h-5 w-5 text-white/60" />
          </motion.div>
          <motion.div 
            className="absolute top-12 right-12"
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
          >
            <Star className="h-4 w-4 text-white/50" />
          </motion.div>
        </div>

        <div className="relative px-4 pt-4 pb-8">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex justify-center mb-2">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3">
                <Target className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">
              {language === "es" ? "Desafíos Diarios" : "Daily Challenges"}
            </h1>
            <p className="text-white/80 text-sm">
              {language === "es" ? "Completa desafíos para ganar puntos" : "Complete challenges to earn points"}
            </p>
          </motion.div>

          {/* Progress stats */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center mt-4"
          >
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3 flex items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{completedCount}</p>
                <p className="text-xs text-white/70">{language === "es" ? "Completados" : "Completed"}</p>
              </div>
              <div className="w-px h-8 bg-white/30" />
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{challenges.length}</p>
                <p className="text-xs text-white/70">{language === "es" ? "Hoy" : "Today"}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Challenges List */}
      <div className="px-4 pt-6 space-y-4 max-w-lg mx-auto">
        {challenges.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="bg-muted/50 rounded-3xl p-8">
              <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-6">
                {language === "es" ? "No hay desafíos activos" : "No active challenges"}
              </p>
              <Button 
                onClick={generateChallenges} 
                disabled={generating}
                variant="duolingo"
                className="h-12 px-8"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    {language === "es" ? "Generando..." : "Generating..."}
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5 mr-2" />
                    {language === "es" ? "Generar desafíos" : "Generate challenges"}
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        ) : (
          <>
            {challenges.map((challenge, index) => {
              const IconComponent = challengeIcons[challenge.challenge_type] || Zap;
              const colorGradient = challengeColors[challenge.challenge_type] || "from-primary to-secondary";
              const challengeProgress = progress.get(challenge.id);
              const isCompleted = challengeProgress?.is_completed || false;
              const currentProgress = challengeProgress?.progress || 0;
              const progressPercent = (currentProgress / challenge.target_value) * 100;

              return (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                >
                  <div className={`
                    bg-card border-2 rounded-2xl overflow-hidden transition-all
                    ${isCompleted 
                      ? "border-green-500/50 bg-gradient-to-r from-green-500/10 to-emerald-500/10" 
                      : "border-border"
                    }
                  `}>
                    <div className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <motion.div 
                          className={`
                            w-14 h-14 rounded-2xl flex items-center justify-center shrink-0
                            bg-gradient-to-br ${isCompleted ? "from-green-400 to-emerald-500" : colorGradient}
                            shadow-lg
                          `}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {isCompleted ? (
                            <Check className="w-7 h-7 text-white" />
                          ) : (
                            <IconComponent className="w-7 h-7 text-white" />
                          )}
                        </motion.div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className={`font-bold text-base ${isCompleted ? "text-green-600 line-through" : "text-foreground"}`}>
                              {challenge.title}
                            </h4>
                            <span className={`
                              text-xs font-bold px-2.5 py-1 rounded-full shrink-0
                              ${isCompleted 
                                ? "bg-green-500 text-white" 
                                : "bg-primary/10 text-primary"
                              }
                            `}>
                              +{challenge.points_reward}
                            </span>
                          </div>
                          
                          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                            {challenge.description}
                          </p>

                          {!isCompleted ? (
                            <>
                              {/* Progress bar */}
                              <div className="space-y-1.5 mb-3">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground">
                                    {language === "es" ? "Progreso" : "Progress"}
                                  </span>
                                  <span className="font-semibold text-foreground">
                                    {currentProgress}/{challenge.target_value}
                                  </span>
                                </div>
                                <Progress value={progressPercent} variant="gamified" className="h-2.5" />
                              </div>

                              {/* Complete button */}
                              <Button 
                                onClick={() => completeChallenge(challenge)}
                                variant="duolingo"
                                className="w-full h-10 text-sm font-bold"
                              >
                                <Trophy className="h-4 w-4 mr-2" />
                                {language === "es" ? "COMPLETAR" : "COMPLETE"}
                              </Button>
                            </>
                          ) : (
                            <div className="flex items-center gap-2 text-green-600">
                              <Trophy className="h-4 w-4" />
                              <span className="text-sm font-semibold">
                                {language === "es" ? "¡Desafío completado!" : "Challenge completed!"}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Refresh button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="pt-2"
            >
              <Button
                variant="duolingoOutline"
                onClick={generateChallenges}
                disabled={generating || challenges.length > 0}
                className="w-full h-11"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {language === "es" ? "Generando..." : "Generating..."}
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {language === "es" ? "Nuevos desafíos" : "New challenges"}
                  </>
                )}
              </Button>
            </motion.div>

            {/* Info text */}
            <p className="text-xs text-center text-muted-foreground">
              {language === "es" 
                ? "Los desafíos se renuevan cada día a las 12:00 AM"
                : "Challenges reset every day at 12:00 AM"}
            </p>
          </>
        )}
      </div>

      {/* Mascot decoration */}
      <motion.div 
        className="fixed bottom-24 right-4 md:bottom-8 md:right-8 pointer-events-none"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 0.3, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <img src={mascotFire} alt="" className="h-20 w-20 opacity-50" />
      </motion.div>
    </div>
  );
};
