import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Friend } from "@/hooks/useFriendships";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Trophy, Flame, Target, Star, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { getAvatarColor, getInitials } from "@/lib/avatarColors";

interface UserStats {
  total_points: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  meals_completed: number;
}

interface FriendStatsComparisonProps {
  friend: Friend;
  currentUserId: string;
}

export function FriendStatsComparison({ friend, currentUserId }: FriendStatsComparisonProps) {
  const { t } = useLanguage();
  const [myStats, setMyStats] = useState<UserStats | null>(null);
  const [friendStats, setFriendStats] = useState<UserStats | null>(null);
  const [myProfile, setMyProfile] = useState<{ display_name: string | null; avatar_url: string | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [myStatsRes, friendStatsRes, myProfileRes] = await Promise.all([
          supabase.from("user_stats").select("*").eq("user_id", currentUserId).single(),
          supabase.from("user_stats").select("*").eq("user_id", friend.friendId).single(),
          supabase.from("profiles").select("display_name, avatar_url").eq("id", currentUserId).single(),
        ]);

        if (myStatsRes.data) setMyStats(myStatsRes.data);
        if (friendStatsRes.data) setFriendStats(friendStatsRes.data);
        if (myProfileRes.data) setMyProfile(myProfileRes.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [currentUserId, friend.friendId]);

  const myAvatarColor = getAvatarColor(myProfile?.display_name || currentUserId);
  const friendAvatarColor = getAvatarColor(friend.displayName || friend.friendId);

  const getComparisonIcon = (myValue: number, friendValue: number) => {
    if (myValue > friendValue) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (myValue < friendValue) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getProgressColor = (myValue: number, friendValue: number) => {
    const total = myValue + friendValue;
    if (total === 0) return 50;
    return (myValue / total) * 100;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!myStats || !friendStats) {
    return (
      <Card className="bg-muted/30">
        <CardContent className="py-6 text-center text-muted-foreground">
          {t("friends.noStatsAvailable")}
        </CardContent>
      </Card>
    );
  }

  const stats = [
    {
      label: t("friends.stats.points"),
      icon: Trophy,
      myValue: myStats.total_points,
      friendValue: friendStats.total_points,
      color: "text-yellow-500",
    },
    {
      label: t("friends.stats.level"),
      icon: Star,
      myValue: myStats.level,
      friendValue: friendStats.level,
      color: "text-purple-500",
    },
    {
      label: t("friends.stats.streak"),
      icon: Flame,
      myValue: myStats.current_streak,
      friendValue: friendStats.current_streak,
      color: "text-orange-500",
    },
    {
      label: t("friends.stats.longestStreak"),
      icon: Target,
      myValue: myStats.longest_streak,
      friendValue: friendStats.longest_streak,
      color: "text-blue-500",
    },
    {
      label: t("friends.stats.mealsCompleted"),
      icon: Target,
      myValue: myStats.meals_completed,
      friendValue: friendStats.meals_completed,
      color: "text-green-500",
    },
  ];

  const myDisplayName = myProfile?.display_name || t("friends.you");
  const friendDisplayName = friend.displayName || t("friends.anonymous");

  return (
    <Card className="bg-gradient-to-br from-card to-card/80 border-primary/20">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>{t("friends.statsComparison")}</span>
          <Badge variant="outline" className="text-xs">VS</Badge>
        </CardTitle>
        
        {/* Avatars Header */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <Avatar className="h-10 w-10 border-2 border-primary">
              <AvatarImage src={myProfile?.avatar_url || undefined} />
              <AvatarFallback className={`${myAvatarColor} text-white text-sm`}>
                {getInitials(myProfile?.display_name)}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium text-sm text-foreground">{myDisplayName}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-foreground">{friendDisplayName}</span>
            <Avatar className="h-10 w-10 border-2 border-muted">
              <AvatarImage src={friend.avatarUrl || undefined} />
              <AvatarFallback className={`${friendAvatarColor} text-white text-sm`}>
                {getInitials(friend.displayName)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {stats.map((stat) => (
          <div key={stat.label} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                <span className="text-muted-foreground">{stat.label}</span>
              </div>
              {getComparisonIcon(stat.myValue, stat.friendValue)}
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold w-12 text-right text-primary">
                {stat.myValue}
              </span>
              <Progress 
                value={getProgressColor(stat.myValue, stat.friendValue)} 
                className="flex-1 h-2"
              />
              <span className="text-sm font-bold w-12 text-muted-foreground">
                {stat.friendValue}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
