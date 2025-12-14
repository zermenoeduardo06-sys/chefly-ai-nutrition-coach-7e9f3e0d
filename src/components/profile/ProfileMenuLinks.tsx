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
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { useUserRole } from "@/hooks/useUserRole";
import { motion } from "framer-motion";

interface MenuItem {
  icon: React.ElementType;
  labelKey: string;
  path?: string;
  onClick?: () => void;
  variant?: "default" | "destructive";
  badge?: string;
  iconColor?: string;
  iconBg?: string;
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
        { icon: Trophy, labelKey: "sidebar.achievements", path: "/dashboard/achievements", iconColor: "text-yellow-500", iconBg: "bg-yellow-500/10" },
        { icon: Target, labelKey: "sidebar.challenges", path: "/dashboard/challenges", iconColor: "text-primary", iconBg: "bg-primary/10" },
        { icon: Users, labelKey: "sidebar.leaderboard", path: "/dashboard/leaderboard", iconColor: "text-blue-500", iconBg: "bg-blue-500/10" },
        { icon: UserPlus, labelKey: "sidebar.friends", path: "/dashboard/friends", iconColor: "text-green-500", iconBg: "bg-green-500/10" },
      ],
    },
    {
      title: t("profile.menuSection.account"),
      items: [
        { icon: CreditCard, labelKey: "sidebar.subscription", path: "/subscription", iconColor: "text-purple-500", iconBg: "bg-purple-500/10" },
        ...(isAffiliate ? [{ icon: DollarSign, labelKey: "sidebar.affiliates", path: "/affiliates", iconColor: "text-emerald-500", iconBg: "bg-emerald-500/10" }] : []),
        ...(isAdmin ? [{ icon: Settings, labelKey: "sidebar.admin", path: "/admin/affiliates", iconColor: "text-slate-500", iconBg: "bg-slate-500/10" }] : []),
      ],
    },
    {
      title: t("profile.menuSection.support"),
      items: [
        { icon: HelpCircle, labelKey: "profile.faq", path: "/faq", iconColor: "text-secondary", iconBg: "bg-secondary/10" },
        { icon: LogOut, labelKey: "sidebar.logout", onClick: handleLogout, variant: "destructive" as const, iconColor: "text-destructive", iconBg: "bg-destructive/10" },
      ],
    },
  ];

  return (
    <div className="space-y-5">
      {menuSections.map((section, sectionIndex) => (
        <motion.div 
          key={sectionIndex} 
          className="space-y-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + sectionIndex * 0.1 }}
        >
          <h3 className="text-sm font-semibold text-muted-foreground px-1 uppercase tracking-wide">
            {section.title}
          </h3>
          <div className="bg-card rounded-2xl border-2 border-border overflow-hidden divide-y divide-border">
            {section.items.map((item, itemIndex) => {
              const content = (
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "flex items-center justify-between px-4 py-4 transition-all",
                    item.variant === "destructive" 
                      ? "hover:bg-destructive/5" 
                      : "hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2.5 rounded-xl",
                      item.iconBg || "bg-muted"
                    )}>
                      <item.icon className={cn("h-5 w-5", item.iconColor || "text-foreground")} />
                    </div>
                    <span className={cn(
                      "font-medium text-base",
                      item.variant === "destructive" && "text-destructive"
                    )}>
                      {t(item.labelKey as any)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full font-semibold">
                        {item.badge}
                      </span>
                    )}
                    {item.path && (
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </motion.div>
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
          </div>
        </motion.div>
      ))}
    </div>
  );
}
