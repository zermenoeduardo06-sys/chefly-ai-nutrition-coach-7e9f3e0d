import { useState, useEffect } from "react";
import { Home, TrendingUp, Trophy, Target, MessageCircle, Users, CreditCard, LogOut, DollarSign, Settings, UserPlus, User, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useUserRole } from "@/hooks/useUserRole";
import { useSubscription } from "@/hooks/useSubscription";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { hasRole: isAdmin } = useUserRole("admin");
  const [isAffiliate, setIsAffiliate] = useState(false);
  const [userId, setUserId] = useState<string | undefined>();

  useEffect(() => {
    const checkUserStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);

      const { data } = await supabase
        .from("affiliate_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      setIsAffiliate(!!data);
    };

    checkUserStatus();
  }, []);

  const baseMenuItems = [
    { title: t("sidebar.dashboard"), url: "/dashboard", icon: Home, tourId: "" },
    { title: t("sidebar.profile"), url: "/dashboard/profile", icon: User, tourId: "" },
    { title: t("sidebar.shopping"), url: "/dashboard/shopping", icon: ShoppingCart, tourId: "shopping" },
    { title: t("sidebar.progress"), url: "/dashboard/progress", icon: TrendingUp, tourId: "progress" },
    { title: t("sidebar.achievements"), url: "/dashboard/achievements", icon: Trophy, tourId: "achievements" },
    { title: t("sidebar.challenges"), url: "/dashboard/challenges", icon: Target, tourId: "challenges" },
    { title: t("sidebar.leaderboard"), url: "/dashboard/leaderboard", icon: Users, tourId: "" },
    { title: t("sidebar.friends"), url: "/dashboard/friends", icon: UserPlus, tourId: "friends" },
    { title: t("sidebar.coach"), url: "/chat", icon: MessageCircle, tourId: "" },
    { title: t("sidebar.subscription"), url: "/subscription", icon: CreditCard, tourId: "" },
  ];

  let menuItems = [...baseMenuItems];
  
  if (isAffiliate) {
    menuItems.push({ title: t("sidebar.affiliates"), url: "/affiliates", icon: DollarSign, tourId: "" });
  }

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

  return (
    <Sidebar data-tour="navigation">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "opacity-0" : ""}>
            {t("sidebar.menu")}
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title} data-tour={item.tourId || undefined}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url}>
                      <item.icon className="h-5 w-5" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/admin/affiliates">
                      <Settings className="h-5 w-5" />
                      {!collapsed && <span>{t("sidebar.admin")}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto space-y-4">
          {!collapsed && (
            <div className="px-4">
              <LanguageToggle />
            </div>
          )}
          
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                  <LogOut className="h-5 w-5" />
                  {!collapsed && <span>{t("sidebar.logout")}</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
