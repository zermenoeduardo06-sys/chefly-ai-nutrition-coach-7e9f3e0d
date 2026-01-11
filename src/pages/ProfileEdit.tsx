import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/avatarColors";
import { getAvatarColorById } from "@/components/profile/AvatarEditor";
import { ArrowLeft, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { DeleteAccountDialog } from "@/components/DeleteAccountDialog";

const ProfileEdit = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarBgColor, setAvatarBgColor] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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
        .select("display_name, avatar_url, avatar_background_color")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        setDisplayName(profile.display_name || "");
        setAvatarUrl(profile.avatar_url);
        setAvatarBgColor(profile.avatar_background_color);
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

  const avatarColorClass = getAvatarColorById(avatarBgColor);

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
        className="sticky top-0 z-50 bg-background border-b border-border"
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
        {/* Avatar Section - Links to Avatar Editor */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
        >
          <Link to="/dashboard/settings/avatar" className="relative mb-4 group">
            <Avatar className="h-28 w-28 border-4 border-primary/30 transition-transform group-hover:scale-105">
              <AvatarImage src={avatarUrl || undefined} alt={displayName} />
              <AvatarFallback className={`${avatarColorClass} text-white text-3xl font-bold`}>
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-full transition-colors flex items-center justify-center">
              <span className="text-white opacity-0 group-hover:opacity-100 font-semibold text-sm">
                {t("common.edit")}
              </span>
            </div>
          </Link>
          <Link
            to="/dashboard/settings/avatar"
            className="text-primary font-semibold text-sm uppercase tracking-wide"
          >
            {t("profile.changeAvatar")}
          </Link>
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
            onClick={() => setDeleteDialogOpen(true)}
            className="w-full h-14 rounded-2xl text-base font-semibold text-destructive border-2 border-border hover:bg-destructive/10"
          >
            {t("profile.deleteAccount")}
          </Button>
        </motion.div>
      </div>

      {/* Delete Account Dialog */}
      <DeleteAccountDialog 
        open={deleteDialogOpen} 
        onOpenChange={setDeleteDialogOpen} 
      />
    </div>
  );
};

export default ProfileEdit;
