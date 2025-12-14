import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Camera, Loader2, Save, Flame, Star, Trophy, Zap } from "lucide-react";
import { getAvatarColor, getInitials } from "@/lib/avatarColors";
import { motion } from "framer-motion";

interface ProfileSettingsProps {
  onUpdate?: () => void;
}

interface UserStats {
  current_streak: number;
  total_points: number;
  level: number;
  meals_completed: number;
}

export function ProfileSettings({ onUpdate }: ProfileSettingsProps) {
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [profileRes, statsRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("display_name, avatar_url")
          .eq("id", user.id)
          .maybeSingle(),
        supabase
          .from("user_stats")
          .select("current_streak, total_points, level, meals_completed")
          .eq("user_id", user.id)
          .maybeSingle()
      ]);

      if (profileRes.data) {
        setDisplayName(profileRes.data.display_name || "");
        setAvatarUrl(profileRes.data.avatar_url);
      }
      if (statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (err) {
      console.error("Error loading profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const checkNicknameAvailability = async (nickname: string, userId: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("display_name", nickname)
      .neq("id", userId)
      .maybeSingle();

    return !data && !error;
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      setError(t("profile.nicknameRequired"));
      return;
    }

    const nicknameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!nicknameRegex.test(displayName.trim())) {
      setError(t("profile.nicknameInvalid"));
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const isAvailable = await checkNicknameAvailability(displayName.trim(), user.id);
      if (!isAvailable) {
        setError(t("profile.nicknameTaken"));
        setSaving(false);
        return;
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ display_name: displayName.trim() })
        .eq("id", user.id);

      if (updateError) throw updateError;

      toast({
        title: t("profile.saved"),
        description: t("profile.savedDesc"),
      });

      onUpdate?.();
    } catch (err: any) {
      console.error("Error saving profile:", err);
      if (err.code === "23505") {
        setError(t("profile.nicknameTaken"));
      } else {
        toast({
          variant: "destructive",
          title: t("profile.error"),
          description: err.message,
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: t("profile.error"),
        description: t("profile.invalidFileType"),
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: t("profile.error"),
        description: t("profile.fileTooLarge"),
      });
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const avatarUrlWithCacheBust = `${publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrlWithCacheBust })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setAvatarUrl(avatarUrlWithCacheBust);

      toast({
        title: t("profile.avatarUploaded"),
        description: t("profile.avatarUploadedDesc"),
      });

      onUpdate?.();
    } catch (err: any) {
      console.error("Error uploading avatar:", err);
      toast({
        variant: "destructive",
        title: t("profile.error"),
        description: err.message,
      });
    } finally {
      setUploading(false);
    }
  };

  const avatarColor = getAvatarColor(displayName || 'user');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statItems = [
    { icon: Flame, value: stats?.current_streak || 0, label: t("dashboard.streak"), color: "text-primary", bg: "bg-primary/10" },
    { icon: Star, value: stats?.total_points || 0, label: t("dashboard.points"), color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { icon: Trophy, value: stats?.level || 1, label: t("dashboard.level"), color: "text-secondary", bg: "bg-secondary/10" },
    { icon: Zap, value: stats?.meals_completed || 0, label: t("dashboard.mealsCompleted"), color: "text-green-500", bg: "bg-green-500/10" },
  ];

  return (
    <div className="space-y-6">
      {/* Avatar Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-primary/20 via-secondary/10 to-background rounded-3xl p-6 relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/20 rounded-full blur-2xl" />
        </div>

        <div className="relative flex flex-col items-center gap-4">
          {/* Large Avatar */}
          <motion.div 
            className="relative"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="absolute -inset-2 bg-gradient-to-r from-primary to-secondary rounded-full opacity-50 blur-lg animate-pulse" />
            <Avatar className="h-28 w-28 border-4 border-background shadow-xl relative">
              <AvatarImage src={avatarUrl || undefined} alt={displayName} />
              <AvatarFallback className={`${avatarColor} text-white text-3xl font-bold`}>
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <Button
              size="icon"
              variant="duolingo"
              className="absolute -bottom-1 -right-1 h-10 w-10 rounded-full shadow-lg"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Camera className="h-5 w-5" />
              )}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </motion.div>

          {/* Username display */}
          {displayName && (
            <motion.h2 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-bold text-foreground"
            >
              @{displayName}
            </motion.h2>
          )}
        </div>
      </motion.div>

      {/* Stats Grid - Duolingo Style */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-3"
      >
        {statItems.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`${stat.bg} rounded-2xl p-4 border-2 border-border/50 shadow-sm`}
          >
            <div className="flex items-center gap-3">
              <div className={`${stat.bg} p-2 rounded-xl`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Nickname Edit Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-2xl border-2 border-border p-5 space-y-4"
      >
        <div className="space-y-2">
          <Label htmlFor="nickname" className="text-base font-semibold">{t("profile.nickname")}</Label>
          <Input
            id="nickname"
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.target.value);
              setError(null);
            }}
            placeholder={t("profile.nicknamePlaceholder")}
            className={`h-12 rounded-xl text-base ${error ? "border-destructive" : ""}`}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <p className="text-xs text-muted-foreground">{t("profile.nicknameHint")}</p>
        </div>

        <Button 
          onClick={handleSave} 
          disabled={saving} 
          variant="duolingo"
          className="w-full h-12 text-base font-semibold gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              {t("common.loading")}
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              {t("profile.saveChanges")}
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
}
