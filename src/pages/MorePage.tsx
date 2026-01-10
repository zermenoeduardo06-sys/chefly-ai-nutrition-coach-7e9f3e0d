import { motion } from "framer-motion";
import { 
  User, 
  Crown, 
  Users, 
  Home, 
  Settings, 
  HelpCircle,
  ChevronRight,
  LogOut,
  Bell,
  FileText,
  Shield,
  Mail,
  Star,
  UserPlus,
  Utensils,
  Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import ModularAvatar from "@/components/avatar/ModularAvatar";

const texts = {
  es: {
    profile: "Perfil",
    editProfile: "Editar",
    editAvatar: "Avatar",
    subscription: "Suscripción",
    cheflyPlus: "Chefly Plus",
    freePlan: "Plan Gratuito",
    upgrade: "Mejorar",
    manage: "Gestionar",
    social: "Social",
    friends: "Amigos",
    settings: "Ajustes",
    allSettings: "Toda la configuración",
    preferences: "Preferencias nutricionales",
    notifications: "Notificaciones",
    support: "Soporte",
    faq: "Preguntas frecuentes",
    contact: "Contacto",
    terms: "Términos y condiciones",
    privacy: "Política de privacidad",
    logout: "Cerrar sesión",
    level: "Nivel",
    memberSince: "Miembro desde",
  },
  en: {
    profile: "Profile",
    editProfile: "Edit",
    editAvatar: "Avatar",
    subscription: "Subscription",
    cheflyPlus: "Chefly Plus",
    freePlan: "Free Plan",
    upgrade: "Upgrade",
    manage: "Manage",
    social: "Social",
    friends: "Friends",
    settings: "Settings",
    allSettings: "All settings",
    preferences: "Nutrition preferences",
    notifications: "Notifications",
    support: "Support",
    faq: "FAQ",
    contact: "Contact",
    terms: "Terms & conditions",
    privacy: "Privacy policy",
    logout: "Sign out",
    level: "Level",
    memberSince: "Member since",
  },
};

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  badge?: string;
  badgeVariant?: "default" | "premium";
  showArrow?: boolean;
}

function MenuItem({ icon, label, onClick, badge, badgeVariant = "default", showArrow = true }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between px-4 tablet:px-6 py-3.5 tablet:py-4 hover:bg-muted/50 active:bg-muted transition-colors"
    >
      <div className="flex items-center gap-3">
        <span className="text-muted-foreground">{icon}</span>
        <span className="text-foreground text-sm tablet:text-base">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {badge && (
          <Badge 
            variant="secondary" 
            className={badgeVariant === "premium" 
              ? "bg-amber-500/20 text-amber-400 border-0 text-xs tablet:text-sm" 
              : "bg-muted text-muted-foreground border-0 text-xs tablet:text-sm"
            }
          >
            {badgeVariant === "premium" && <Crown className="h-3 w-3 mr-1" />}
            {badge}
          </Badge>
        )}
        {showArrow && <ChevronRight className="h-4 w-4 tablet:h-5 tablet:w-5 text-muted-foreground" />}
      </div>
    </button>
  );
}

interface MenuSectionProps {
  title: string;
  children: React.ReactNode;
}

function MenuSection({ title, children }: MenuSectionProps) {
  return (
    <div>
      <h3 className="text-xs tablet:text-sm font-semibold text-muted-foreground uppercase tracking-wider px-4 tablet:px-6 py-2 mb-1">
        {title}
      </h3>
      <Card className="border-border/50 overflow-hidden divide-y divide-border/50">
        {children}
      </Card>
    </div>
  );
}

export default function MorePage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = texts[language];
  
  const [userId, setUserId] = useState<string>();
  const [displayName, setDisplayName] = useState<string>("");
  const [avatarConfig, setAvatarConfig] = useState<any>(null);
  const [level, setLevel] = useState(1);
  const [memberSince, setMemberSince] = useState<string>("");
  
  const { subscribed } = useSubscription(userId);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      
      setUserId(user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, avatar_config, created_at")
        .eq("id", user.id)
        .single();

      if (profile) {
        setDisplayName(profile.display_name || user.email?.split("@")[0] || "Usuario");
        if (profile.avatar_config) {
          setAvatarConfig(typeof profile.avatar_config === 'string' 
            ? JSON.parse(profile.avatar_config) 
            : profile.avatar_config
          );
        }
        if (profile.created_at) {
          const date = new Date(profile.created_at);
          setMemberSince(date.toLocaleDateString(language === 'es' ? 'es-MX' : 'en-US', { 
            month: 'short', 
            year: 'numeric' 
          }));
        }
      }

      const { data: stats } = await supabase
        .from("user_stats")
        .select("level")
        .eq("user_id", user.id)
        .single();

      if (stats) {
        setLevel(stats.level);
      }
    };

    fetchUserData();
  }, [navigate, language]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success(language === 'es' ? "Sesión cerrada" : "Signed out");
    navigate("/auth");
  };

  return (
    <div className="min-h-full bg-background pb-28 lg:pb-6">
      {/* Profile header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 tablet:px-6 pt-6 pb-4 max-w-2xl mx-auto"
      >
        <Card className="p-4 tablet:p-6 border-border/50 bg-gradient-to-br from-card to-muted/20">
          <div className="flex items-center gap-4">
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate("/dashboard/avatar")}
            >
              <div className="w-18 h-18 tablet:w-24 tablet:h-24 rounded-full overflow-hidden bg-muted flex items-center justify-center ring-2 ring-primary/20">
                {avatarConfig ? (
                  <ModularAvatar config={avatarConfig} size={72} />
                ) : (
                  <User className="h-9 w-9 tablet:h-12 tablet:w-12 text-muted-foreground" />
                )}
              </div>
              {subscribed && (
                <div className="absolute -bottom-1 -right-1 bg-amber-500 rounded-full p-1.5 shadow-lg">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
              )}
            </motion.div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg tablet:text-xl font-bold text-foreground truncate">{displayName}</h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant="secondary" className="bg-primary/20 text-primary border-0 text-xs">
                  <Star className="h-3 w-3 mr-1" />
                  {t.level} {level}
                </Badge>
                {memberSince && (
                  <span className="text-xs text-muted-foreground">
                    {t.memberSince} {memberSince}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Quick actions */}
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => navigate("/dashboard/settings/profile")}
            >
              <User className="h-4 w-4 mr-1.5" />
              {t.editProfile}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => navigate("/dashboard/avatar")}
            >
              <Sparkles className="h-4 w-4 mr-1.5" />
              {t.editAvatar}
            </Button>
          </div>
        </Card>
      </motion.div>

      <div className="px-4 tablet:px-6 space-y-4 max-w-2xl mx-auto">
        {/* Subscription */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <MenuSection title={t.subscription}>
            <MenuItem
              icon={<Crown className="h-5 w-5" />}
              label={subscribed ? t.cheflyPlus : t.freePlan}
              onClick={() => navigate("/subscription")}
              badge={subscribed ? t.manage : t.upgrade}
              badgeVariant={subscribed ? "default" : "premium"}
            />
          </MenuSection>
        </motion.div>

        {/* Social */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <MenuSection title={t.social}>
            <MenuItem
              icon={<UserPlus className="h-5 w-5" />}
              label={t.friends}
              onClick={() => navigate("/dashboard/friends")}
              badge="Plus"
              badgeVariant="premium"
            />
          </MenuSection>
        </motion.div>

        {/* Settings */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <MenuSection title={t.settings}>
            <MenuItem
              icon={<Settings className="h-5 w-5" />}
              label={t.allSettings}
              onClick={() => navigate("/dashboard/settings")}
            />
            <MenuItem
              icon={<Utensils className="h-5 w-5" />}
              label={t.preferences}
              onClick={() => navigate("/dashboard/settings/preferences")}
            />
            <MenuItem
              icon={<Bell className="h-5 w-5" />}
              label={t.notifications}
              onClick={() => navigate("/dashboard/settings/notifications")}
            />
          </MenuSection>
        </motion.div>

        {/* Support */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <MenuSection title={t.support}>
            <MenuItem
              icon={<HelpCircle className="h-5 w-5" />}
              label={t.faq}
              onClick={() => navigate("/faq")}
            />
            <MenuItem
              icon={<Mail className="h-5 w-5" />}
              label={t.contact}
              onClick={() => navigate("/dashboard/settings/contact")}
            />
            <MenuItem
              icon={<FileText className="h-5 w-5" />}
              label={t.terms}
              onClick={() => navigate("/terms")}
            />
            <MenuItem
              icon={<Shield className="h-5 w-5" />}
              label={t.privacy}
              onClick={() => navigate("/privacy")}
            />
          </MenuSection>
        </motion.div>

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="pt-2"
        >
          <Button
            variant="outline"
            className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            {t.logout}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
