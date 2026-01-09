import { BookOpen, TrendingUp, ChefHat, Sparkles, Menu } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useHaptics } from "@/hooks/useHaptics";

const navItems = [
  { icon: BookOpen, path: "/dashboard", color: "text-primary", tourId: "nav-diary", labelEs: "Diario", labelEn: "Diary" },
  { icon: TrendingUp, path: "/dashboard/progress", color: "text-emerald-500", tourId: "nav-progress", labelEs: "Progreso", labelEn: "Progress" },
  { icon: ChefHat, path: "/recipes", color: "text-violet-500", tourId: "nav-recipes", labelEs: "Recetas", labelEn: "Recipes" },
  { icon: Sparkles, path: "/chef-ia", color: "text-amber-500", tourId: "nav-chef", labelEs: "Chef IA", labelEn: "Chef AI" },
  { icon: Menu, path: "/dashboard/more", color: "text-purple-500", tourId: "nav-more", labelEs: "Más", labelEn: "More" },
];

export function MobileBottomNav() {
  const location = useLocation();
  const { language } = useLanguage();
  const { lightImpact } = useHaptics();

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[9999] md:hidden bg-card border-t border-border/50 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="flex items-center justify-around h-[72px] px-1">
        {navItems.map((item) => {
          const active = isActive(item.path);
          const label = language === 'es' ? item.labelEs : item.labelEn;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              data-tour={item.tourId}
              className="flex items-center justify-center flex-1 h-full"
              onClick={() => lightImpact()}
            >
              <motion.div
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-2xl transition-all duration-200",
                  active 
                    ? "bg-primary/10" 
                    : "hover:bg-muted/50"
                )}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <item.icon 
                  className={cn(
                    "h-5 w-5 transition-all duration-200",
                    active ? item.color : "text-muted-foreground"
                  )} 
                  strokeWidth={active ? 2.5 : 2}
                />
                <span className={cn(
                  "text-[10px] font-medium transition-all duration-200",
                  active ? item.color : "text-muted-foreground"
                )}>
                  {label}
                </span>
                {active && (
                  <motion.div 
                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-primary"
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
