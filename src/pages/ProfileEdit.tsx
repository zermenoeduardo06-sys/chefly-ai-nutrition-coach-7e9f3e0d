import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarColor, getInitials } from "@/lib/avatarColors";
import { ArrowLeft, Loader2, Camera } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const ProfileEdit = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      setEmail(user.email || "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        setDisplayName(profile.display_name || "");
        setAvatarUrl(profile.avatar_url);
      }
      setLoading(false);
    };

    loadProfile();
  }, [navigate]);

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

      navigate(-1);
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

  const avatarColor = getAvatarColor(displayName || "user");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 bg-background border-b border-border pt-safe-top"
      >
        <div className="flex items-center justify-between px-4 py-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="h-6 w-6 text-muted-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">{t("settings.profile")}</h1>
          <div className="w-10" />
        </div>
      </motion.div>

      {/* Content */}
      <div className="px-4 py-8 space-y-8 pb-24">
        {/* Avatar Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
        >
          <div className="relative mb-4">
            <Avatar className="h-28 w-28 border-4 border-primary/30">
              <AvatarImage src={avatarUrl || undefined} alt={displayName} />
              <AvatarFallback className={`${avatarColor} text-white text-3xl font-bold`}>
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            {uploading && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="text-primary font-semibold text-sm uppercase tracking-wide"
          >
            {t("profile.changeAvatar")}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
          />
        </motion.div>

        {/* Form Fields */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base font-semibold">
              {t("profile.name")}
            </Label>
            <Input
              id="name"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                setError(null);
              }}
              placeholder={t("profile.namePlaceholder")}
              className={`h-14 rounded-2xl text-base bg-muted/50 border-border ${error ? "border-destructive" : ""}`}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username" className="text-base font-semibold">
              {t("profile.username")}
            </Label>
            <Input
              id="username"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                setError(null);
              }}
              className="h-14 rounded-2xl text-base bg-muted/50 border-border"
            />
            <p className="text-xs text-muted-foreground">{t("profile.nicknameHint")}</p>
          </div>

          {/* Email (read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-base font-semibold">
              {t("profile.email")}
            </Label>
            <Input
              id="email"
              value={email}
              readOnly
              className="h-14 rounded-2xl text-base bg-muted/50 border-border text-muted-foreground"
            />
          </div>
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            onClick={handleSave}
            disabled={saving}
            variant="duolingo"
            className="w-full h-14 text-base font-semibold"
          >
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                {t("common.loading")}
              </>
            ) : (
              t("profile.saveChanges")
            )}
          </Button>
        </motion.div>

        {/* Delete Account */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            variant="outline"
            className="w-full h-14 rounded-2xl text-base font-semibold text-destructive border-2 border-border hover:bg-destructive/10"
          >
            {t("profile.deleteAccount")}
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileEdit;
