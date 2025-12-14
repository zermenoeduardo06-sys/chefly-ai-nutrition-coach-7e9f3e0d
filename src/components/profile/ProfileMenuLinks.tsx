import { Link } from "react-router-dom";
import { 
  Trophy, 
  Target, 
  Users, 
  UserPlus, 
  CreditCard, 
  Settings,
  ChevronRight,
  DollarSign,
  LogOut,
  HelpCircle
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { useUserRole } from "@/hooks/useUserRole";

interface MenuItem {
  icon: React.ElementType;
  labelKey: string;
  path?: string;
  onClick?: () => void;
  variant?: "default" | "destructive";
  badge?: string;
}

export function ProfileMenuLinks() {
  const { t } = useLanguage();
  const navigate = useNavigate();
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

  const menuSections: { title: string; items: MenuItem[] }[] = [
    {
      title: t("profile.menuSection.activity"),
      items: [
        { icon: Trophy, labelKey: "sidebar.achievements", path: "/dashboard/achievements" },
        { icon: Target, labelKey: "sidebar.challenges", path: "/dashboard/challenges" },
        { icon: Users, labelKey: "sidebar.leaderboard", path: "/dashboard/leaderboard" },
        { icon: UserPlus, labelKey: "sidebar.friends", path: "/dashboard/friends" },
      ],
    },
    {
      title: t("profile.menuSection.account"),
      items: [
        { icon: CreditCard, labelKey: "sidebar.subscription", path: "/subscription" },
        ...(isAffiliate ? [{ icon: DollarSign, labelKey: "sidebar.affiliates", path: "/affiliates" }] : []),
        ...(isAdmin ? [{ icon: Settings, labelKey: "sidebar.admin", path: "/admin/affiliates" }] : []),
      ],
    },
    {
      title: t("profile.menuSection.support"),
      items: [
        { icon: HelpCircle, labelKey: "profile.faq", path: "/faq" },
        { icon: LogOut, labelKey: "sidebar.logout", onClick: handleLogout, variant: "destructive" as const },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {menuSections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground px-1">
            {section.title}
          </h3>
          <Card className="overflow-hidden divide-y divide-border">
            {section.items.map((item, itemIndex) => {
              const content = (
                <div
                  className={cn(
                    "flex items-center justify-between px-4 py-3.5 transition-colors active-scale touch-target",
                    item.variant === "destructive" 
                      ? "text-destructive hover:bg-destructive/10" 
                      : "hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{t(item.labelKey as any)}</span>
                  </div>
                  {item.badge && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                  {item.path && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                </div>
              );

              if (item.path) {
                return (
                  <Link key={itemIndex} to={item.path} className="block">
                    {content}
                  </Link>
                );
              }

              return (
                <button 
                  key={itemIndex} 
                  onClick={item.onClick} 
                  className="w-full text-left"
                >
                  {content}
                </button>
              );
            })}
          </Card>
        </div>
      ))}
    </div>
  );
}
