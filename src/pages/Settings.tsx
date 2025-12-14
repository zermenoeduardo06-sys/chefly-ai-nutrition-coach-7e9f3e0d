import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { 
  X, 
  ChevronRight, 
  User, 
  Bell, 
  Globe, 
  Shield, 
  CreditCard,
  HelpCircle,
  MessageSquare,
  LogOut,
  Settings as SettingsIcon,
  DollarSign
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { LanguageToggle } from "@/components/LanguageToggle";

interface SettingsItem {
  icon: React.ElementType;
  label: string;
  path?: string;
  onClick?: () => void;
  rightElement?: React.ReactNode;
  variant?: "default" | "destructive" | "highlight";
}

const Settings = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();
  const { hasRole: isAdmin } = useUserRole("admin");
  const [isAffiliate, setIsAffiliate] = useState(false);

  useEffect(() => {
    const checkAffiliateStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("affiliate_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      setIsAffiliate(!!data);
    };

    checkAffiliateStatus();
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: t("sidebar.logoutSuccess"),
        description: t("sidebar.logoutSuccessDesc"),
      });
      
      navigate("/auth");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: error.message,
      });
    }
  };

  const accountItems: SettingsItem[] = [
    { icon: SettingsIcon, label: t("settings.preferences"), path: "/dashboard/settings/preferences" },
    { icon: User, label: t("settings.profile"), path: "/dashboard/settings/profile" },
    { icon: Bell, label: t("settings.notifications"), path: "/dashboard/settings/notifications" },
    { icon: Globe, label: t("settings.language"), rightElement: <LanguageToggle /> },
    { icon: Shield, label: t("settings.privacy"), path: "/privacy" },
  ];

  const subscriptionItems: SettingsItem[] = [
    { icon: CreditCard, label: t("settings.choosePlan"), path: "/subscription", variant: "highlight" },
    ...(isAffiliate ? [{ icon: DollarSign, label: t("sidebar.affiliates"), path: "/affiliates" }] : []),
    ...(isAdmin ? [{ icon: SettingsIcon, label: t("sidebar.admin"), path: "/admin/affiliates" }] : []),
  ];

  const supportItems: SettingsItem[] = [
    { icon: HelpCircle, label: t("settings.helpCenter"), path: "/faq" },
    { icon: MessageSquare, label: t("settings.suggestions"), path: "/faq" },
  ];

  const renderItem = (item: SettingsItem, index: number) => {
    const content = (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.03 }}
        className={`flex items-center justify-between py-4 px-1 ${
          item.variant === "destructive" ? "text-destructive" : ""
        }`}
      >
        <div className="flex items-center gap-3">
          <item.icon className={`h-5 w-5 ${
            item.variant === "highlight" ? "text-primary" : "text-muted-foreground"
          }`} />
          <span className={`font-medium ${
            item.variant === "highlight" ? "text-primary" : ""
          }`}>
            {item.label}
          </span>
        </div>
        {item.rightElement ? (
          item.rightElement
        ) : item.path ? (
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        ) : null}
      </motion.div>
    );

    if (item.path) {
      return (
        <Link key={index} to={item.path} className="block border-b border-border last:border-b-0">
          {content}
        </Link>
      );
    }

    if (item.onClick) {
      return (
        <button key={index} onClick={item.onClick} className="w-full text-left border-b border-border last:border-b-0">
          {content}
        </button>
      );
    }

    return (
      <div key={index} className="border-b border-border last:border-b-0">
        {content}
      </div>
    );
  };

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
            <X className="h-6 w-6 text-muted-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">{t("settings.title")}</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </motion.div>

      {/* Content */}
      <div className="px-4 py-6 space-y-8 pb-24">
        {/* Account Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            {t("settings.account")}
          </h2>
          <div className="bg-card rounded-2xl border border-border px-4">
            {accountItems.map(renderItem)}
          </div>
        </motion.section>

        {/* Subscription Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            {t("settings.subscription")}
          </h2>
          <div className="bg-card rounded-2xl border border-border px-4">
            {subscriptionItems.map(renderItem)}
          </div>
        </motion.section>

        {/* Support Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            {t("settings.support")}
          </h2>
          <div className="bg-card rounded-2xl border border-border px-4 mb-4">
            {supportItems.map(renderItem)}
          </div>
          
          {/* Logout Button */}
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full h-14 rounded-2xl border-2 border-border text-base font-semibold"
          >
            <LogOut className="h-5 w-5 mr-2" />
            {t("settings.logout")}
          </Button>
        </motion.section>

        {/* Legal Links */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-2"
        >
          <Link to="/terms" className="block text-primary font-semibold text-sm uppercase tracking-wide">
            {t("settings.terms")}
          </Link>
          <Link to="/privacy" className="block text-primary font-semibold text-sm uppercase tracking-wide">
            {t("settings.privacyPolicy")}
          </Link>
        </motion.section>
      </div>
    </div>
  );
};

export default Settings;
