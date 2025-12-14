import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useTrialGuard } from "@/hooks/useTrialGuard";
import { useLanguage } from "@/contexts/LanguageContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/avatarColors";
import ModularAvatar from "@/components/avatar/ModularAvatar";
import { AvatarConfig, defaultAvatarConfig } from "@/components/avatar/AvatarParts";
import { ProfileMenuLinks } from "@/components/profile/ProfileMenuLinks";
import { Loader2, Settings, UserPlus, Flame, Star, Trophy, Zap, Calendar, Sparkles, Pencil } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";

interface UserStats {
  current_streak: number;
  total_points: number;
  level: number;
  meals_completed: number;
}

interface ProfileData {
  display_name: string | null;
  avatar_url: string | null;
  avatar_config: AvatarConfig | null;
  created_at: string | null;
}

const Profile = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { isBlocked, isLoading: trialLoading } = useTrialGuard();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [friendsCount, setFriendsCount] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const [profileRes, statsRes, friendsRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("display_name, avatar_url, avatar_config, created_at")
          .eq("id", user.id)
          .maybeSingle(),
        supabase
          .from("user_stats")
          .select("current_streak, total_points, level, meals_completed")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("friendships")
          .select("id")
          .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
          .eq("status", "accepted")
      ]);

      if (profileRes.data) {
        const data = profileRes.data;
        let avatarConfig: AvatarConfig | null = null;
        if (data.avatar_config && typeof data.avatar_config === 'object') {
          const config = data.avatar_config as Record<string, unknown>;
          avatarConfig = {
            skinTone: typeof config.skinTone === 'number' ? config.skinTone : 0,
            body: typeof config.body === 'number' ? config.body : 0,
            eyes: typeof config.eyes === 'number' ? config.eyes : 0,
            hair: typeof config.hair === 'number' ? config.hair : 0,
            glasses: typeof config.glasses === 'number' ? config.glasses : -1,
            accessory: typeof config.accessory === 'number' ? config.accessory : -1,
          };
        }
        setProfile({
          display_name: data.display_name,
          avatar_url: data.avatar_url,
          avatar_config: avatarConfig,
          created_at: data.created_at,
        });
      }
      if (statsRes.data) {
        setStats(statsRes.data);
      }
      setFriendsCount(friendsRes.data?.length || 0);
      setLoading(false);
    };

    loadData();
  }, [navigate]);

  if (loading || trialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isBlocked) {
    return null;
  }

  const displayName = profile?.display_name || "User";
  const hasPhoto = !!profile?.avatar_url;
  const avatarConfig = profile?.avatar_config || defaultAvatarConfig;
  const joinYear = profile?.created_at 
    ? format(new Date(profile.created_at), "yyyy", { locale: language === 'es' ? es : enUS })
    : new Date().getFullYear().toString();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header Section - Duolingo Style */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-b from-muted/50 to-background"
      >
        {/* Top Bar with Name and Settings */}
        <div className="flex items-center justify-between px-4 py-4 pt-safe-top">
          <h1 className="text-2xl font-bold text-foreground">{displayName}</h1>
          <Link to="/dashboard/settings">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-muted">
              <Settings className="h-6 w-6 text-muted-foreground" />
            </Button>
          </Link>
        </div>

        {/* Large Avatar - Duolingo Style */}
        <div className="flex flex-col items-center pb-4">
          <motion.div 
            className="relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          >
            {/* Avatar Glow Effect */}
            <div className="absolute -inset-4 bg-gradient-radial from-primary/20 via-secondary/10 to-transparent rounded-full blur-2xl" />
            
            {hasPhoto ? (
              <div className="relative">
                <Avatar className="h-36 w-36 border-4 border-card shadow-xl">
                  <AvatarImage src={profile?.avatar_url || undefined} alt={displayName} />
                  <AvatarFallback className="bg-primary text-white text-4xl font-bold">
                    {getInitials(displayName)}
                  </AvatarFallback>
                </Avatar>
                <Link 
                  to="/dashboard/settings/avatar" 
                  className="absolute -bottom-1 -right-1 bg-card rounded-full p-2 border-2 border-border shadow-md hover:bg-muted transition-colors"
                >
                  <Pencil className="h-4 w-4 text-muted-foreground" />
                </Link>
              </div>
            ) : (
              <div className="relative">
                <div className="bg-card rounded-full p-1 border-2 border-border shadow-xl">
                  <ModularAvatar config={avatarConfig} size={140} />
                </div>
                <Link 
                  to="/dashboard/settings/avatar" 
                  className="absolute -bottom-1 -right-1 bg-card rounded-full p-2 border-2 border-border shadow-md hover:bg-muted transition-colors"
                >
                  <Pencil className="h-4 w-4 text-muted-foreground" />
                </Link>
              </div>
            )}
          </motion.div>
        </div>

        {/* Username and Join Date */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center pb-4"
        >
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-wide">
            @{displayName.toUpperCase()} · {t("profile.joinedIn").toUpperCase()} {joinYear}
          </p>
        </motion.div>

        {/* Quick Stats Row - Duolingo Style */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex justify-center gap-6 pb-5 px-4"
        >
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{stats?.meals_completed || 0}</p>
            <p className="text-xs text-muted-foreground">{t("profile.mealsCompleted")}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{friendsCount}</p>
            <p className="text-xs text-muted-foreground">{t("profile.following")}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{friendsCount}</p>
            <p className="text-xs text-muted-foreground">{t("profile.followers")}</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Main Content */}
      <div className="px-4 space-y-4">
        {/* Add Friends Button - Duolingo Style */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-3"
        >
          <Link to="/dashboard/friends" className="flex-1">
            <Button 
              variant="outline" 
              className="w-full h-14 rounded-2xl border-2 border-border text-base font-bold gap-2 uppercase tracking-wide hover:bg-muted/50"
            >
              <UserPlus className="h-5 w-5" />
              {t("profile.addFriends")}
            </Button>
          </Link>
        </motion.div>

        {/* Complete Profile Card - Show if no display name */}
        {!profile?.display_name && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-card rounded-2xl border-2 border-primary/30 p-5 relative overflow-hidden"
          >
            <div className="absolute top-2 right-2 opacity-20">
              <Sparkles className="h-16 w-16 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">
              {t("profile.completeProfile")}
            </h3>
            <p className="text-sm text-primary font-semibold uppercase mb-4">
              {t("profile.stepsRemaining")}
            </p>
            <Link to="/dashboard/settings/profile">
              <Button variant="duolingo" className="w-full h-12 font-bold uppercase text-base">
                {t("profile.completeNow")}
              </Button>
            </Link>
          </motion.div>
        )}

        {/* Stats Grid - Duolingo Style */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 gap-3"
        >
          {/* Streak */}
          <div className="bg-card rounded-2xl p-4 border-2 border-border">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-3 rounded-xl">
                <Flame className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats?.current_streak || 0}</p>
                <p className="text-xs text-muted-foreground">{t("dashboard.streak")}</p>
              </div>
            </div>
          </div>

          {/* XP */}
          <div className="bg-card rounded-2xl p-4 border-2 border-border">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-500/10 p-3 rounded-xl">
                <Star className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats?.total_points || 0}</p>
                <p className="text-xs text-muted-foreground">XP</p>
              </div>
            </div>
          </div>

          {/* Level */}
          <div className="bg-card rounded-2xl p-4 border-2 border-border">
            <div className="flex items-center gap-3">
              <div className="bg-amber-600/10 p-3 rounded-xl">
                <Trophy className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats?.level || 1}</p>
                <p className="text-xs text-muted-foreground">{t("dashboard.level")}</p>
              </div>
            </div>
          </div>

          {/* Meals */}
          <div className="bg-card rounded-2xl p-4 border-2 border-border">
            <div className="flex items-center gap-3">
              <div className="bg-green-500/10 p-3 rounded-xl">
                <Zap className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats?.meals_completed || 0}</p>
                <p className="text-xs text-muted-foreground">{t("dashboard.mealsCompleted")}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Summary Card - Duolingo Style */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-card rounded-2xl border-2 border-border p-5"
        >
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-4">
            {t("profile.summary")}
          </h3>
          <div className="grid grid-cols-2 gap-y-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔥</span>
              <div>
                <p className="text-base font-bold text-foreground">{stats?.current_streak || 0} {t("profile.days")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <p className="text-base font-bold text-foreground">{stats?.total_points || 0} XP</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🥉</span>
              <div>
                <p className="text-base font-bold text-foreground">{t("profile.bronze")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏆</span>
              <div>
                <p className="text-base font-bold text-foreground">0 {t("profile.timesTop3")}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Profile Menu Links */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <ProfileMenuLinks />
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
