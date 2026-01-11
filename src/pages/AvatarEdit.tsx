import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, X, Camera } from "lucide-react";
import { motion } from "framer-motion";
import AvatarBuilder from "@/components/avatar/AvatarBuilder";
import ModularAvatar from "@/components/avatar/ModularAvatar";
import { AvatarConfig, defaultAvatarConfig } from "@/components/avatar/AvatarParts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getInitials } from "@/lib/avatarColors";

const AvatarEdit = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(defaultAvatarConfig);
  const [avatarMode, setAvatarMode] = useState<"modular" | "photo">("modular");

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, avatar_url, avatar_config")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        setDisplayName(profile.display_name || "User");
        setAvatarUrl(profile.avatar_url);
        if (profile.avatar_config && typeof profile.avatar_config === 'object') {
          const config = profile.avatar_config as Record<string, unknown>;
          setAvatarConfig({
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
          });
        }
        // Set mode based on whether user has a photo or uses modular
        setAvatarMode(profile.avatar_url ? "photo" : "modular");
      }
      setLoading(false);
    };

    loadProfile();
  }, [navigate]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const updateData: any = { avatar_config: avatarConfig };
      
      // If using modular avatar, clear the photo URL
      if (avatarMode === "modular") {
        updateData.avatar_url = null;
      }

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: t("avatar.saved"),
        description: t("avatar.savedDesc"),
      });

      navigate("/dashboard/more");
    } catch (err: any) {
      console.error("Error saving avatar:", err);
      toast({
        variant: "destructive",
        title: t("profile.error"),
        description: err.message,
      });
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
      setAvatarMode("photo");

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

  const handleRemovePhoto = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", user.id);

      if (error) throw error;

      setAvatarUrl(null);
      setAvatarMode("modular");
    } catch (err: any) {
      console.error("Error removing photo:", err);
    }
  };

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
          <button onClick={() => navigate("/dashboard/more")} className="p-2 -ml-2">
            <X className="h-6 w-6 text-muted-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">{t("avatar.editTitle")}</h1>
          <Button onClick={handleSave} disabled={saving} size="sm">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "OK"}
          </Button>
        </div>
      </motion.div>

      {/* Content */}
      <div className="px-4 py-6 pb-24">
        <Tabs value={avatarMode} onValueChange={(v) => setAvatarMode(v as "modular" | "photo")} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="modular">{t("avatar.createAvatar")}</TabsTrigger>
            <TabsTrigger value="photo">{t("avatar.uploadPhoto")}</TabsTrigger>
          </TabsList>

          <TabsContent value="modular" className="space-y-6">
            <AvatarBuilder config={avatarConfig} onChange={setAvatarConfig} />
          </TabsContent>

          <TabsContent value="photo" className="space-y-6">
            {/* Photo Preview */}
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="relative">
                {avatarUrl ? (
                  <motion.img
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-40 h-40 rounded-full object-cover border-4 border-primary"
                  />
                ) : (
                  <div className="w-40 h-40 rounded-full bg-primary flex items-center justify-center text-4xl font-bold text-primary-foreground">
                    {getInitials(displayName)}
                  </div>
                )}
                
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-white" />
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  variant="outline"
                  className="gap-2"
                >
                  <Camera className="w-4 h-4" />
                  {avatarUrl ? t("avatar.changePhoto") : t("avatar.uploadPhoto")}
                </Button>
                
                {avatarUrl && (
                  <Button
                    onClick={handleRemovePhoto}
                    variant="ghost"
                    className="text-destructive"
                  >
                    {t("avatar.removePhoto")}
                  </Button>
                )}
              </div>

              <p className="text-sm text-muted-foreground text-center">
                {t("avatar.photoHint")}
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarUpload}
        className="hidden"
      />
    </div>
  );
};

export default AvatarEdit;
