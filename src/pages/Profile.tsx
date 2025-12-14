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
import { Loader2, Settings, UserPlus, Flame, Zap, Pencil } from "lucide-react";
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
  const joinDate = profile?.created_at 
    ? format(new Date(profile.created_at), "MMMM yyyy", { locale: language === 'es' ? es : enUS })
    : "";

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header with Settings */}
      <div className="flex items-center justify-end px-4 py-3 pt-safe-top">
        <Link to="/dashboard/settings">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
            <Settings className="h-6 w-6 text-muted-foreground" />
          </Button>
        </Link>
      </div>

      {/* Avatar Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center px-6 pb-6"
      >
        {/* Large Avatar */}
        <div className="relative mb-4">
          {hasPhoto ? (
            <Avatar className="h-28 w-28 border-4 border-primary/20 shadow-lg">
              <AvatarImage src={profile?.avatar_url || undefined} alt={displayName} />
              <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="bg-card rounded-full p-1 border-4 border-primary/20 shadow-lg">
              <ModularAvatar config={avatarConfig} size={104} />
            </div>
          )}
          <Link 
            to="/dashboard/settings/avatar" 
            className="absolute -bottom-1 -right-1 bg-primary rounded-full p-2 shadow-md hover:bg-primary/90 transition-colors"
          >
            <Pencil className="h-4 w-4 text-primary-foreground" />
          </Link>
        </div>

        {/* Name */}
        <h1 className="text-2xl font-bold text-foreground mb-1">{displayName}</h1>
        
        {/* Join Date */}
        <p className="text-sm text-muted-foreground mb-4">
          {t("profile.joinedIn")} {joinDate}
        </p>

        {/* Stats Pills - Duolingo Style */}
        <div className="flex items-center gap-2 mb-5">
          <div className="flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-full">
            <Flame className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold text-primary">{stats?.current_streak || 0}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-yellow-500/10 px-3 py-1.5 rounded-full">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-bold text-yellow-600">{stats?.total_points || 0} XP</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 w-full max-w-xs">
          <Link to="/dashboard/friends" className="flex-1">
            <Button 
              variant="outline" 
              className="w-full h-11 rounded-xl border-2 font-semibold gap-2"
            >
              <UserPlus className="h-4 w-4" />
              {t("profile.addFriends")}
            </Button>
          </Link>
          <Link to="/dashboard/settings/profile">
            <Button 
              variant="ghost" 
              size="icon"
              className="h-11 w-11 rounded-xl border-2 border-border"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="px-4 mb-4"
      >
        <div className="bg-card rounded-2xl border-2 border-border p-4">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
            {t("profile.statistics")}
          </h3>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <p className="text-lg font-bold text-foreground">{stats?.current_streak || 0}</p>
              <p className="text-[10px] text-muted-foreground uppercase">{t("dashboard.streak")}</p>
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{stats?.total_points || 0}</p>
              <p className="text-[10px] text-muted-foreground uppercase">XP</p>
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{stats?.level || 1}</p>
              <p className="text-[10px] text-muted-foreground uppercase">{t("dashboard.level")}</p>
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{friendsCount}</p>
              <p className="text-[10px] text-muted-foreground uppercase">{t("profile.friends")}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Menu Links */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="px-4"
      >
        <ProfileMenuLinks />
      </motion.div>
    </div>
  );
};

export default Profile;
