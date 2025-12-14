import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { AvatarEditor, getAvatarColorById } from "@/components/profile/AvatarEditor";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

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
  const [selectedColor, setSelectedColor] = useState<string>("coral");

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, avatar_url, avatar_background_color")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        setDisplayName(profile.display_name || "User");
        setAvatarUrl(profile.avatar_url);
        setSelectedColor(profile.avatar_background_color || "coral");
      }
      setLoading(false);
    };

    loadProfile();
  }, [navigate]);

  const handleColorSelect = (colorId: string) => {
    setSelectedColor(colorId);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({ avatar_background_color: selectedColor })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: t("avatar.saved"),
        description: t("avatar.savedDesc"),
      });

      navigate(-1);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <AvatarEditor
        displayName={displayName}
        avatarUrl={avatarUrl}
        currentColor={selectedColor}
        onColorSelect={handleColorSelect}
        onUploadClick={() => fileInputRef.current?.click()}
        onSave={handleSave}
        onCancel={() => navigate(-1)}
        uploading={uploading}
        saving={saving}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarUpload}
        className="hidden"
      />
    </>
  );
};

export default AvatarEdit;
