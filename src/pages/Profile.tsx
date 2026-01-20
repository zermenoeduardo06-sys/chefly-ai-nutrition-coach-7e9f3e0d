import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useTrialGuard } from "@/hooks/useTrialGuard";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { Button } from "@/components/ui/button";
import ModularAvatar from "@/components/avatar/ModularAvatar";
import { AvatarConfig, defaultAvatarConfig } from "@/components/avatar/AvatarParts";
import { ProfileMenuLinks } from "@/components/profile/ProfileMenuLinks";
import { AiUsageIndicator } from "@/components/AiUsageIndicator";
import { Loader2, Settings, UserPlus, Pencil, Crown, Zap, ChevronRight, Sparkles } from "lucide-react";
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
  avatar_config: AvatarConfig | null;
  created_at: string | null;
}


const Profile = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { isBlocked, isLoading: trialLoading } = useTrialGuard();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [friendsCount, setFriendsCount] = useState(0);
  const { limits } = useSubscriptionLimits(userId);

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      
      setUserId(user.id);

      const [profileRes, statsRes, friendsRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("display_name, avatar_config, created_at")
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
            faceShape: typeof config.faceShape === 'number' ? config.faceShape : 0,
            eyeStyle: typeof config.eyeStyle === 'number' ? config.eyeStyle : (typeof config.eyes === 'number' ? config.eyes : 0),
            eyeColor: typeof config.eyeColor === 'number' ? config.eyeColor : 0,
            eyebrowStyle: typeof config.eyebrowStyle === 'number' ? config.eyebrowStyle : 0,
            hairStyle: typeof config.hairStyle === 'number' ? config.hairStyle : (typeof config.hair === 'number' ? config.hair : 0),
            hairColor: typeof config.hairColor === 'number' ? config.hairColor : 0,
            mouthStyle: typeof config.mouthStyle === 'number' ? config.mouthStyle : 0,
            facialHair: typeof config.facialHair === 'number' ? config.facialHair : -1,
            glasses: typeof config.glasses === 'number' ? config.glasses : -1,
            earrings: typeof config.earrings === 'number' ? config.earrings : -1,
            headwear: typeof config.headwear === 'number' ? config.headwear : -1,
            outfit: typeof config.outfit === 'number' ? config.outfit : 0,
            outfitColor: typeof config.outfitColor === 'number' ? config.outfitColor : (typeof config.body === 'number' ? config.body : 0),
          };
        }
        setProfile({
          display_name: data.display_name,
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
  const avatarConfig = profile?.avatar_config || defaultAvatarConfig;
  const joinDate = profile?.created_at 
    ? format(new Date(profile.created_at), "MMMM yyyy", { locale: language === 'es' ? es : enUS })
    : "";

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header with Settings */}
      <div className="flex items-center justify-end px-4 py-3">
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
        {/* Large Avatar - Only Modular Avatar */}
        <div className="relative mb-4">
          <div className="bg-card rounded-full p-1 border-4 border-primary/20 shadow-lg">
            <ModularAvatar config={avatarConfig} size={104} />
          </div>
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

        {/* Level Badge - Duolingo Style */}
        <div className="flex items-center gap-2 bg-amber-500/10 px-4 py-2 rounded-full mb-5">
          <Crown className="h-5 w-5 text-amber-500" />
          <span className="text-base font-bold text-amber-600">
            {t("dashboard.level")} {stats?.level || 1}
          </span>
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

      {/* Subscription Widget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="px-4 mb-5"
      >
        <Link to="/subscription">
          <div className={`
            relative overflow-hidden rounded-2xl border-2 p-4
            ${limits.isCheflyPlus 
              ? "bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 border-emerald-500/30" 
              : "bg-gradient-to-br from-primary/10 via-secondary/5 to-primary/10 border-primary/30"
            }
          `}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`
                  p-2.5 rounded-xl
                  ${limits.isCheflyPlus 
                    ? "bg-emerald-500/20" 
                    : "bg-primary/20"
                  }
                `}>
                  {limits.isCheflyPlus ? (
                    <Crown className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <Sparkles className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-foreground">
                    {limits.isCheflyPlus 
                      ? "Chefly Plus" 
                      : (language === "es" ? "Plan Gratuito" : "Free Plan")
                    }
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {limits.isCheflyPlus
                      ? (language === "es" ? "Acceso completo activo" : "Full access active")
                      : (language === "es" ? "Desbloquea más funciones" : "Unlock more features")
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!limits.isCheflyPlus && (
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">
                    {language === "es" ? "Mejorar" : "Upgrade"}
                  </span>
                )}
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
            {/* Decorative sparkles for Plus users */}
            {limits.isCheflyPlus && (
              <>
                <div className="absolute top-2 right-10 text-emerald-400/40">
                  <Zap className="h-3 w-3" />
                </div>
                <div className="absolute bottom-2 right-4 text-emerald-400/40">
                  <Sparkles className="h-4 w-4" />
                </div>
              </>
            )}
          </div>
        </Link>
      </motion.div>

      {/* AI Usage Indicator - Only for Plus users */}
      {limits.isCheflyPlus && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="px-4 mb-5"
        >
          <AiUsageIndicator userId={userId} showDetails />
        </motion.div>
      )}

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
