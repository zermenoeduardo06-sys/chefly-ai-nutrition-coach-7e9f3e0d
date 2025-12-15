import { Home, ShoppingCart, TrendingUp, MessageCircle, User, Camera } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const navItems = [
  { icon: Home, path: "/dashboard", color: "text-primary", tourId: "nav-home" },
  { icon: ShoppingCart, path: "/dashboard/shopping", color: "text-cyan-500", tourId: "nav-shopping" },
  { icon: Camera, path: "/dashboard/food-history", color: "text-amber-500", tourId: "nav-scan" },
  { icon: TrendingUp, path: "/dashboard/progress", color: "text-secondary", tourId: "nav-progress" },
  { icon: MessageCircle, path: "/chat", color: "text-pink-500", tourId: "nav-chat" },
  { icon: User, path: "/dashboard/profile", color: "text-purple-500", tourId: "nav-profile" },
];

export function MobileBottomNav() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card/80 backdrop-blur-xl border-t-2 border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              data-tour={item.tourId}
              className="flex items-center justify-center flex-1 h-full"
            >
              <motion.div
                className={cn(
                  "relative flex items-center justify-center w-12 h-12 rounded-2xl nav-bounce",
                  active 
                    ? "bg-primary/10" 
                    : "hover:bg-muted/50"
                )}
                whileTap={{ scale: 0.85 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <item.icon 
                  className={cn(
                    "h-6 w-6 transition-all duration-200",
                    active ? item.color : "text-muted-foreground"
                  )} 
                  strokeWidth={active ? 2.5 : 2}
                />
                {active && (
                  <motion.span 
                    className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-primary"
                    layoutId="navIndicator"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.div>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
