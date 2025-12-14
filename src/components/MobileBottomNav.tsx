import { Home, ShoppingCart, TrendingUp, MessageCircle, User } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

const navItems = [
  { icon: Home, labelKey: "sidebar.dashboard", path: "/dashboard" },
  { icon: ShoppingCart, labelKey: "sidebar.shopping", path: "/dashboard/shopping" },
  { icon: TrendingUp, labelKey: "sidebar.progress", path: "/dashboard/progress" },
  { icon: MessageCircle, labelKey: "sidebar.coach", path: "/chat" },
  { icon: User, labelKey: "sidebar.profile", path: "/dashboard/profile" },
];

export function MobileBottomNav() {
  const location = useLocation();
  const { t } = useLanguage();

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card/95 backdrop-blur-lg border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full min-w-[64px] py-2 transition-all duration-200 touch-target",
                active 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground active:scale-95"
              )}
            >
              <div className={cn(
                "relative p-2 rounded-xl transition-all duration-200",
                active && "bg-primary/10"
              )}>
                <item.icon 
                  className={cn(
                    "h-5 w-5 transition-transform duration-200",
                    active && "scale-110"
                  )} 
                />
                {active && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </div>
              <span className={cn(
                "text-[10px] font-medium mt-0.5 truncate max-w-full",
                active && "text-primary"
              )}>
                {t(item.labelKey as any)}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
