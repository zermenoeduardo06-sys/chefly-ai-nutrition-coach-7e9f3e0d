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
import { Loader2, Settings, UserPlus, Flame, Star, Trophy, Zap, Calendar, Sparkles } from "lucide-react";
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

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const [profileRes, statsRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("display_name, avatar_url, avatar_config, created_at")
          .eq("id", user.id)
          .maybeSingle(),
        supabase
          .from("user_stats")
          .select("current_streak, total_points, level, meals_completed")
          .eq("user_id", user.id)
          .maybeSingle()
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
  const joinDate = profile?.created_at 
    ? format(new Date(profile.created_at), "yyyy", { locale: language === 'es' ? es : enUS })
    : new Date().getFullYear().toString();

  const statItems = [
    { icon: Flame, value: stats?.current_streak || 0, label: t("dashboard.streak"), color: "text-primary", bg: "bg-primary/10" },
    { icon: Star, value: stats?.total_points || 0, label: "XP", color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { icon: Trophy, value: `Nivel ${stats?.level || 1}`, label: t("dashboard.level"), color: "text-amber-600", bg: "bg-amber-600/10", isLevel: true },
    { icon: Zap, value: stats?.meals_completed || 0, label: t("dashboard.mealsCompleted"), color: "text-green-500", bg: "bg-green-500/10" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Settings Button */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-muted/30 pt-safe-top"
      >
        <div className="flex items-center justify-between px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground">{displayName}</h1>
          <Link to="/dashboard/settings">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
              <Settings className="h-6 w-6 text-muted-foreground" />
            </Button>
          </Link>
        </div>

        {/* Large Avatar Section - Duolingo Style */}
        <div className="flex flex-col items-center pb-6">
          <motion.div 
            className="relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          >
            <div className="absolute -inset-3 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-full blur-xl" />
            {hasPhoto ? (
              <Avatar className="h-32 w-32 border-4 border-primary/50 shadow-2xl relative">
                <AvatarImage src={profile?.avatar_url || undefined} alt={displayName} />
                <AvatarFallback className="bg-primary text-white text-4xl font-bold">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="relative">
                <ModularAvatar config={avatarConfig} size={140} />
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Profile Info Section */}
      <div className="px-4 pb-6 -mt-2">
        {/* Username and Join Date */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-6"
        >
          <p className="text-muted-foreground text-sm flex items-center justify-center gap-2">
            <span className="font-medium">@{displayName}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {t("profile.joinedIn")} {joinDate}
            </span>
          </p>
        </motion.div>

        {/* Stats Grid - Duolingo Style */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 gap-3 mb-6"
        >
          {statItems.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-card rounded-2xl p-4 border-2 border-border shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className={`${stat.bg} p-2.5 rounded-xl`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">
                    {stat.isLevel ? stats?.level || 1 : stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.isLevel ? t("dashboard.level") : stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Add Friends Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <Link to="/dashboard/friends">
            <Button 
              variant="outline" 
              className="w-full h-14 rounded-2xl border-2 border-border text-base font-semibold gap-2 hover:bg-muted/50"
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
            transition={{ delay: 0.5 }}
            className="bg-card rounded-2xl border-2 border-border p-5 mb-6 relative overflow-hidden"
          >
            <div className="absolute top-3 right-3">
              <Sparkles className="h-12 w-12 text-primary/20" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">
              {t("profile.completeProfile")}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t("profile.completeProfileDesc")}
            </p>
            <Link to="/dashboard/settings/profile">
              <Button variant="duolingo" className="w-full h-12 font-semibold">
                {t("profile.completeNow")}
              </Button>
            </Link>
          </motion.div>
        )}

        {/* Quick Stats Summary */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card rounded-2xl border-2 border-border p-5"
        >
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            {t("profile.summary")}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔥</span>
              <div>
                <p className="text-lg font-bold">{stats?.current_streak || 0} {t("profile.days")}</p>
                <p className="text-xs text-muted-foreground">{t("dashboard.streak")}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <div>
                <p className="text-lg font-bold">{stats?.total_points || 0} XP</p>
                <p className="text-xs text-muted-foreground">{t("dashboard.points")}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🥉</span>
              <div>
                <p className="text-lg font-bold">{t("profile.bronze")}</p>
                <p className="text-xs text-muted-foreground">{t("profile.league")}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏆</span>
              <div>
                <p className="text-lg font-bold">0 {t("profile.times")}</p>
                <p className="text-xs text-muted-foreground">Top 3</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
