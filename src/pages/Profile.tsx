import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useTrialGuard } from "@/hooks/useTrialGuard";
import { useLanguage } from "@/contexts/LanguageContext";
import { ProfileSettings } from "@/components/profile/ProfileSettings";
import { ProfileMenuLinks } from "@/components/profile/ProfileMenuLinks";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Loader2, Globe } from "lucide-react";
import { motion } from "framer-motion";

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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 pb-24 md:pb-6">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Profile Settings with Avatar */}
        <ProfileSettings />

        {/* Language Toggle - Mobile only */}
        <motion.div 
          className="md:hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="bg-card rounded-2xl border-2 border-border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/10">
                  <Globe className="h-5 w-5 text-indigo-500" />
                </div>
                <span className="font-medium text-base">
                  {t("profile.language")}
                </span>
              </div>
              <LanguageToggle />
            </div>
          </div>
        </motion.div>

        {/* Menu Links - Mobile only */}
        <div className="md:hidden">
          <ProfileMenuLinks />
        </div>

        {/* Desktop: Show minimal info */}
        <div className="hidden md:block text-center text-sm text-muted-foreground pt-4">
          {t("profile.desktopHint")}
        </div>
      </div>
    </div>
  );
};

export default Profile;
