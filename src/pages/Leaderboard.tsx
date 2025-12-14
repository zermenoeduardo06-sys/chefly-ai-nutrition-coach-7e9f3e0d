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
import { useLanguage } from "@/contexts/LanguageContext";
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
  const { t } = useLanguage();
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
    return entry.display_name ? `@${entry.display_name}` : t('leaderboard.anonymousUser');
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
      <main className="container mx-auto px-4 py-4 md:py-6">
        <div className="mb-4 md:mb-6">
          <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
            <Trophy className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold">{t('leaderboard.title')}</h1>
          </div>
          <p className="text-sm md:text-base text-muted-foreground">
            {t('leaderboard.subtitle')}
          </p>
        </div>

        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Award className="h-4 w-4 md:h-5 md:w-5" />
              {t('leaderboard.top100')}
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              {t('leaderboard.rankingDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-2 md:p-6 pt-0">
            <ScrollArea className="h-[500px] md:h-[600px]">
              <div className="space-y-2 md:space-y-3 pr-2 md:pr-4">
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
                      <CardContent className="p-3 md:p-4">
                        <div className="flex items-center gap-2 md:gap-4">
                          {/* Rank */}
                          <div className="flex items-center justify-center w-8 md:w-12 flex-shrink-0">
                            {getRankIcon(index)}
                          </div>

                          {/* Avatar */}
                          <Avatar className="h-10 w-10 md:h-12 md:w-12 flex-shrink-0">
                            <AvatarImage src={entry.avatar_url || undefined} alt={getDisplayName(entry)} />
                            <AvatarFallback className={`${getAvatarColor(entry.display_name || entry.user_id)} text-white font-semibold text-sm`}>
                              {getInitials(entry.display_name)}
                            </AvatarFallback>
                          </Avatar>

                          {/* User Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 md:gap-2">
                              <p className={`font-semibold truncate text-sm md:text-base ${isCurrentUser ? "text-primary" : ""}`}>
                                {getDisplayName(entry)}
                              </p>
                              {isCurrentUser && (
                                <Badge variant="default" className="text-[10px] md:text-xs px-1.5">{t('leaderboard.you')}</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 md:gap-3 mt-0.5 md:mt-1 text-xs md:text-sm text-muted-foreground">
                              <span className="hidden sm:inline">{t('leaderboard.level')} {entry.level}</span>
                              <span className="sm:hidden">Nv.{entry.level}</span>
                              <span className="hidden sm:inline">•</span>
                              <span className="hidden sm:inline">{entry.achievements_count} {t('leaderboard.achievements')}</span>
                              <span>🔥{entry.current_streak}</span>
                            </div>
                          </div>

                          {/* Points */}
                          <div className="text-right flex-shrink-0">
                            <div className="flex items-center gap-1 text-primary font-bold text-base md:text-xl">
                              <Trophy className="h-4 w-4 md:h-5 md:w-5" />
                              {entry.total_points.toLocaleString()}
                            </div>
                            <p className="text-[10px] md:text-xs text-muted-foreground">{t('leaderboard.points')}</p>
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
