import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Crown, Award, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTrialGuard } from "@/hooks/useTrialGuard";
import { getAvatarColor, getInitials } from "@/lib/avatarColors";
interface LeaderboardEntry {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  total_points: number;
  level: number;
  current_streak: number;
  achievements_count: number;
}

const Leaderboard = () => {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const { isBlocked, isLoading: trialLoading } = useTrialGuard();

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    setCurrentUserId(user.id);
    setLoading(true);

    try {
      // Get user stats with profiles
      const { data: stats } = await supabase
        .from("user_stats")
        .select(`
          user_id,
          total_points,
          level,
          current_streak
        `)
        .order("total_points", { ascending: false })
        .limit(100);

      if (!stats) {
        setLoading(false);
        return;
      }

      // Get profiles for each user
      const userIds = stats.map(s => s.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .in("id", userIds);

      // Get achievement counts for each user
      const { data: achievementCounts } = await supabase
        .from("user_achievements")
        .select("user_id")
        .in("user_id", userIds);

      // Count achievements per user
      const achievementsByUser = (achievementCounts || []).reduce((acc, curr) => {
        acc[curr.user_id] = (acc[curr.user_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Combine all data
      const leaderboardData: LeaderboardEntry[] = stats.map(stat => {
        const profile = profiles?.find(p => p.id === stat.user_id);
        return {
          user_id: stat.user_id,
          display_name: profile?.display_name || null,
          avatar_url: profile?.avatar_url || null,
          total_points: stat.total_points,
          level: stat.level,
          current_streak: stat.current_streak,
          achievements_count: achievementsByUser[stat.user_id] || 0,
        };
      });

      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error("Error loading leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 1:
        return <Medal className="h-6 w-6 text-slate-400" />;
      case 2:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>;
    }
  };


  const getDisplayName = (entry: LeaderboardEntry) => {
    return entry.display_name ? `@${entry.display_name}` : "Usuario Anónimo";
  };

  if (loading || trialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        <main className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
      </div>
    );
  }

  if (isBlocked) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Tabla de Clasificación</h1>
          </div>
          <p className="text-muted-foreground">
            Compara tu progreso con otros usuarios de NutriCoach
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Top 100 Usuarios
            </CardTitle>
            <CardDescription>
              Clasificación basada en puntos totales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-3">
                {leaderboard.map((entry, index) => {
                  const isCurrentUser = entry.user_id === currentUserId;
                  return (
                    <Card
                      key={entry.user_id}
                      className={`transition-all ${
                        isCurrentUser
                          ? "border-primary shadow-lg bg-primary/5"
                          : "hover:shadow-md"
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          {/* Rank */}
                          <div className="flex items-center justify-center w-12">
                            {getRankIcon(index)}
                          </div>

                          {/* Avatar */}
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={entry.avatar_url || undefined} alt={getDisplayName(entry)} />
                            <AvatarFallback className={`${getAvatarColor(entry.display_name || entry.user_id)} text-white font-semibold`}>
                              {getInitials(entry.display_name)}
                            </AvatarFallback>
                          </Avatar>

                          {/* User Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className={`font-semibold truncate ${isCurrentUser ? "text-primary" : ""}`}>
                                {getDisplayName(entry)}
                              </p>
                              {isCurrentUser && (
                                <Badge variant="default" className="text-xs">Tú</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                              <span>Nivel {entry.level}</span>
                              <span>•</span>
                              <span>{entry.achievements_count} logros</span>
                              <span>•</span>
                              <span>{entry.current_streak} días de racha</span>
                            </div>
                          </div>

                          {/* Points */}
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-primary font-bold text-xl">
                              <Trophy className="h-5 w-5" />
                              {entry.total_points.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">puntos</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Leaderboard;
