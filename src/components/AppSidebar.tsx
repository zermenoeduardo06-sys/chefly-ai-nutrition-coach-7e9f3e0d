import { Home, TrendingUp, Trophy, Target, MessageCircle, Users, CreditCard, LogOut, DollarSign, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useUserRole } from "@/hooks/useUserRole";
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

  const menuItems = [
    { title: t("sidebar.dashboard"), url: "/dashboard", icon: Home },
    { title: t("sidebar.progress"), url: "/dashboard/progress", icon: TrendingUp },
    { title: t("sidebar.achievements"), url: "/dashboard/achievements", icon: Trophy },
    { title: t("sidebar.challenges"), url: "/dashboard/challenges", icon: Target },
    { title: t("sidebar.leaderboard"), url: "/dashboard/leaderboard", icon: Users },
    { title: t("sidebar.coach"), url: "/chat", icon: MessageCircle },
    { title: t("sidebar.subscription"), url: "/subscription", icon: CreditCard },
    { title: "Afiliados", url: "/affiliates", icon: DollarSign },
  ];

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente",
      });
      
      navigate("/auth");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "opacity-0" : ""}>
            {t("sidebar.menu")}
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
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
                      {!collapsed && <span>Administración</span>}
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
