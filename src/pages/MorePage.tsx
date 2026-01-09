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
  Palette,
  FileText,
  Shield,
  Mail,
  Star,
  UserPlus
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
    editProfile: "Editar perfil",
    subscription: "Suscripción",
    cheflyPlus: "Chefly Plus",
    freePlan: "Plan Gratuito",
    upgrade: "Mejorar",
    social: "Social",
    friends: "Amigos",
    family: "Familia",
    settings: "Ajustes",
    preferences: "Preferencias nutricionales",
    notifications: "Notificaciones",
    appearance: "Apariencia",
    support: "Soporte",
    faq: "Preguntas frecuentes",
    contact: "Contacto",
    terms: "Términos y condiciones",
    privacy: "Política de privacidad",
    logout: "Cerrar sesión",
    level: "Nivel",
  },
  en: {
    profile: "Profile",
    editProfile: "Edit profile",
    subscription: "Subscription",
    cheflyPlus: "Chefly Plus",
    freePlan: "Free Plan",
    upgrade: "Upgrade",
    social: "Social",
    friends: "Friends",
    family: "Family",
    settings: "Settings",
    preferences: "Nutrition preferences",
    notifications: "Notifications",
    appearance: "Appearance",
    support: "Support",
    faq: "FAQ",
    contact: "Contact",
    terms: "Terms & conditions",
    privacy: "Privacy policy",
    logout: "Sign out",
    level: "Level",
  },
};

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  badge?: string;
  badgeVariant?: "default" | "premium";
  delay?: number;
}

function MenuItem({ icon, label, onClick, badge, badgeVariant = "default", delay = 0 }: MenuItemProps) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      onClick={onClick}
      className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <span className="text-muted-foreground">{icon}</span>
        <span className="text-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {badge && (
          <Badge 
            variant="secondary" 
            className={badgeVariant === "premium" 
              ? "bg-amber-500/20 text-amber-400 border-0" 
              : "bg-muted text-muted-foreground border-0"
            }
          >
            {badgeVariant === "premium" && <Crown className="h-3 w-3 mr-1" />}
            {badge}
          </Badge>
        )}
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </motion.button>
  );
}

interface MenuSectionProps {
  title: string;
  children: React.ReactNode;
  delay?: number;
}

function MenuSection({ title, children, delay = 0 }: MenuSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2">
        {title}
      </h3>
      <Card className="border-border/50 overflow-hidden">
        {children}
      </Card>
    </motion.div>
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
  
  const { subscribed } = useSubscription(userId);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setUserId(user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, avatar_config")
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
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success(language === 'es' ? "Sesión cerrada" : "Signed out");
    navigate("/auth");
  };

  return (
    <div className="min-h-full bg-background pb-8">
      {/* Profile header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 pt-6 pb-4"
      >
        <Card className="p-4 border-border/50">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-muted flex items-center justify-center">
              {avatarConfig ? (
                <ModularAvatar config={avatarConfig} size={64} />
              ) : (
                <User className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-foreground">{displayName}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="bg-primary/20 text-primary border-0">
                  <Star className="h-3 w-3 mr-1" />
                  {t.level} {level}
                </Badge>
                {subscribed && (
                  <Badge variant="secondary" className="bg-amber-500/20 text-amber-400 border-0">
                    <Crown className="h-3 w-3 mr-1" />
                    Plus
                  </Badge>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard/settings/profile")}
            >
              {t.editProfile}
            </Button>
          </div>
        </Card>
      </motion.div>

      <div className="px-4 space-y-4">
        {/* Subscription */}
        <MenuSection title={t.subscription} delay={0.1}>
          <MenuItem
            icon={<Crown className="h-5 w-5" />}
            label={subscribed ? t.cheflyPlus : t.freePlan}
            onClick={() => navigate("/subscription")}
            badge={!subscribed ? t.upgrade : undefined}
            badgeVariant="premium"
            delay={0.15}
          />
        </MenuSection>

        {/* Social */}
        <MenuSection title={t.social} delay={0.2}>
          <MenuItem
            icon={<UserPlus className="h-5 w-5" />}
            label={t.friends}
            onClick={() => navigate("/dashboard/friends")}
            badge="Plus"
            badgeVariant="premium"
            delay={0.25}
          />
          <Separator />
          <MenuItem
            icon={<Home className="h-5 w-5" />}
            label={t.family}
            onClick={() => navigate("/family")}
            badge="Plus"
            badgeVariant="premium"
            delay={0.3}
          />
        </MenuSection>

        {/* Settings */}
        <MenuSection title={t.settings} delay={0.35}>
          <MenuItem
            icon={<Settings className="h-5 w-5" />}
            label={t.preferences}
            onClick={() => navigate("/dashboard/settings/preferences")}
            delay={0.4}
          />
          <Separator />
          <MenuItem
            icon={<Bell className="h-5 w-5" />}
            label={t.notifications}
            onClick={() => navigate("/dashboard/settings/notifications")}
            delay={0.45}
          />
        </MenuSection>

        {/* Support */}
        <MenuSection title={t.support} delay={0.5}>
          <MenuItem
            icon={<HelpCircle className="h-5 w-5" />}
            label={t.faq}
            onClick={() => navigate("/faq")}
            delay={0.55}
          />
          <Separator />
          <MenuItem
            icon={<Mail className="h-5 w-5" />}
            label={t.contact}
            onClick={() => navigate("/dashboard/settings/contact")}
            delay={0.6}
          />
          <Separator />
          <MenuItem
            icon={<FileText className="h-5 w-5" />}
            label={t.terms}
            onClick={() => navigate("/terms")}
            delay={0.65}
          />
          <Separator />
          <MenuItem
            icon={<Shield className="h-5 w-5" />}
            label={t.privacy}
            onClick={() => navigate("/privacy")}
            delay={0.7}
          />
        </MenuSection>

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.3 }}
          className="pt-4"
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
