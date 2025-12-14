import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Target, Trophy, Loader2, RefreshCw, Flame, Droplets, Clock, Apple, TrendingUp, Zap } from "lucide-react";
import confetti from "canvas-confetti";

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

export const DailyChallenges = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [progress, setProgress] = useState<Map<string, ChallengeProgress>>(new Map());
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setLoading(true);
    try {
      // Load active challenges
      const { data: challengesData } = await supabase
        .from("daily_challenges")
        .select("*")
        .eq("user_id", user.id)
        .gte("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (challengesData && challengesData.length > 0) {
        setChallenges(challengesData);

        // Load progress for each challenge
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
        // No challenges found, generate new ones
        await generateChallenges();
      }
    } catch (error: any) {
      console.error("Error loading challenges:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los desafíos",
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
          title: "¡Desafíos generados!",
          description: "Tienes 3 nuevos desafíos diarios",
        });
      }
    } catch (error: any) {
      console.error("Error generating challenges:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron generar los desafíos",
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
        title: "Ya completaste este desafío",
        description: "¡Sigue así! 🎉",
      });
      return;
    }

    try {
      // Mark challenge as completed
      const { error: progressError } = await supabase
        .from("user_daily_challenges")
        .upsert({
          user_id: user.id,
          challenge_id: challenge.id,
          progress: challenge.target_value,
          is_completed: true,
        });

      if (progressError) throw progressError;

      // Award points
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

      // Update local state
      setProgress(prev => {
        const newMap = new Map(prev);
        newMap.set(challenge.id, {
          challenge_id: challenge.id,
          progress: challenge.target_value,
          is_completed: true,
        });
        return newMap;
      });

      // Celebration
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF6347'],
      });

      toast({
        title: "🎉 ¡Desafío Completado!",
        description: `+${challenge.points_reward} puntos. ${challenge.bonus_description}`,
        duration: 5000,
      });
    } catch (error: any) {
      console.error("Error completing challenge:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo completar el desafío",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Desafíos Diarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Target className="h-5 w-5" />
              Desafíos Diarios
            </CardTitle>
            <CardDescription className="text-sm">
              Completa desafíos para ganar puntos extra
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={generateChallenges}
            disabled={generating || challenges.length > 0}
            className="w-full sm:w-auto touch-target"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Generando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Nuevos desafíos
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-3 md:p-6 pt-0">
        {challenges.length === 0 ? (
          <div className="text-center py-8">
            <Target className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              No hay desafíos activos
            </p>
            <Button onClick={generateChallenges} disabled={generating} className="touch-target">
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Generando...
                </>
              ) : (
                "Generar desafíos"
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {challenges.map((challenge) => {
              const IconComponent = challengeIcons[challenge.challenge_type] || Zap;
              const challengeProgress = progress.get(challenge.id);
              const isCompleted = challengeProgress?.is_completed || false;
              const currentProgress = challengeProgress?.progress || 0;
              const progressPercent = (currentProgress / challenge.target_value) * 100;

              return (
                <Card 
                  key={challenge.id} 
                  className={`border-border/50 ${isCompleted ? 'bg-green-500/5 border-green-500/30' : ''}`}
                >
                  <CardContent className="p-3 md:p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isCompleted 
                          ? 'bg-green-500/20' 
                          : 'bg-gradient-to-br from-primary/20 to-secondary/20'
                      }`}>
                        {isCompleted ? (
                          <Trophy className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                        ) : (
                          <IconComponent className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className={`font-semibold text-sm md:text-base ${isCompleted ? 'line-through opacity-60' : ''}`}>
                              {challenge.title}
                            </h4>
                            <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                              {challenge.description}
                            </p>
                          </div>
                          <Badge variant={isCompleted ? "default" : "secondary"} className="shrink-0 text-xs">
                            +{challenge.points_reward}
                          </Badge>
                        </div>

                        {!isCompleted && (
                          <>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Progreso</span>
                                <span>{currentProgress}/{challenge.target_value}</span>
                              </div>
                              <Progress value={progressPercent} className="h-1.5 md:h-2" />
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <p className="text-[10px] md:text-xs text-primary truncate">
                                💎 {challenge.bonus_description}
                              </p>
                              <Button 
                                size="sm" 
                                onClick={() => completeChallenge(challenge)}
                                disabled={isCompleted}
                                className="text-xs h-8 px-3 touch-target"
                              >
                                Completar
                              </Button>
                            </div>
                          </>
                        )}

                        {isCompleted && (
                          <div className="flex items-center gap-2 text-xs md:text-sm text-green-600">
                            <Trophy className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            <span>¡Desafío completado!</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            <div className="text-[10px] md:text-xs text-muted-foreground text-center pt-2">
              Los desafíos se renuevan cada día a las 12:00 AM
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
