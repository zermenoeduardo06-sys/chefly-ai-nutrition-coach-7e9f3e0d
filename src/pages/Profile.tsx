import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useTrialGuard } from "@/hooks/useTrialGuard";
import { useLanguage } from "@/contexts/LanguageContext";
import { ProfileSettings } from "@/components/profile/ProfileSettings";
import { User, Loader2 } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isBlocked, isLoading: trialLoading } = useTrialGuard();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setLoading(false);
    };
    checkAuth();
  }, [navigate]);

  if (loading || trialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isBlocked) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4 md:p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
            <User className="h-7 w-7 text-primary" />
            {t("sidebar.profile")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("profile.description")}
          </p>
        </div>

        {/* Profile Settings */}
        <ProfileSettings />
      </div>
    </div>
  );
};

export default Profile;
