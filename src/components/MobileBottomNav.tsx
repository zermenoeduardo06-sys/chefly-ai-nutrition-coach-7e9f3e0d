import { BookOpen, TrendingUp, ChefHat, Sparkles, Heart } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useHaptics } from "@/hooks/useHaptics";
import { useAuth } from "@/contexts/AuthContext";
import { usePrefetch } from "@/hooks/usePrefetch";

const navItems = [
  { icon: BookOpen, path: "/dashboard", color: "text-primary", tourId: "nav-diary", labelEs: "Diario", labelEn: "Diary" },
  { icon: ChefHat, path: "/recipes", color: "text-violet-500", tourId: "nav-recipes", labelEs: "Recetas", labelEn: "Recipes" },
  { icon: TrendingUp, path: "/dashboard/progress", color: "text-emerald-500", tourId: "nav-progress", labelEs: "Progreso", labelEn: "Progress", isCenter: true },
  { icon: Sparkles, path: "/chef-ia", color: "text-amber-500", tourId: "nav-chef", labelEs: "Chef IA", labelEn: "Chef AI" },
  { icon: Heart, path: "/dashboard/wellness", color: "text-pink-500", tourId: "nav-wellness", labelEs: "Bienestar", labelEn: "Wellness" },
];

export function MobileBottomNav() {
  const location = useLocation();
  const { language } = useLanguage();
  const { lightImpact } = useHaptics();
  const { user } = useAuth();
  const { prefetchProgress, prefetchWellness, prefetchRecipes } = usePrefetch(user?.id);

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[9999] lg:hidden"
      style={{ 
        height: 'calc(76px + env(safe-area-inset-bottom, 0px))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        transform: 'translateZ(0)',
        WebkitTransform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
      }}
    >
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-card/85 backdrop-blur-xl border-t border-white/10 shadow-[0_-8px_32px_rgba(0,0,0,0.12)]" />
      
      <div className="relative flex items-center justify-around h-[76px] px-2 tablet:px-6 max-w-2xl mx-auto">
        {navItems.map((item) => {
          const active = isActive(item.path);
          const label = language === 'es' ? item.labelEs : item.labelEn;
          const isCenter = item.isCenter;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              data-tour={item.tourId}
              className="flex items-center justify-center flex-1 h-full"
              onClick={() => lightImpact()}
              onMouseEnter={() => {
                if (item.path === "/dashboard/progress") prefetchProgress();
                if (item.path === "/dashboard/wellness") prefetchWellness();
                if (item.path === "/recipes") prefetchRecipes();
              }}
              onTouchStart={() => {
                if (item.path === "/dashboard/progress") prefetchProgress();
                if (item.path === "/dashboard/wellness") prefetchWellness();
                if (item.path === "/recipes") prefetchRecipes();
              }}
            >
              <motion.div
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1 transition-all duration-200",
                  isCenter ? "px-4 py-2" : "px-3 py-2",
                  active && !isCenter && "bg-primary/10 rounded-2xl",
                )}
                whileTap={{ scale: 0.92 }}
                animate={active && !isCenter ? { y: -2 } : { y: 0 }}
                transition={{ type: "tween", duration: 0.1 }}
              >
                {/* Active indicator dot */}
                {active && !isCenter && (
                  <motion.div
                    layoutId="activeTab"
                    initial={false}
                    transition={{ type: "spring", stiffness: 700, damping: 35 }}
                    className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary"
                  />
                )}
                {/* Center elevated button (Progreso) */}
                {isCenter ? (
                  <motion.div
                    className={cn(
                      "flex items-center justify-center w-14 h-14 tablet:w-16 tablet:h-16 rounded-2xl -mt-4",
                      active 
                        ? "bg-gradient-to-b from-primary to-primary-hover shadow-[0_4px_0_hsl(82_80%_35%),0_8px_24px_hsl(82_80%_50%/0.4)]" 
                        : "bg-gradient-to-b from-violet-500 to-violet-600 shadow-[0_4px_0_hsl(270_60%_35%),0_8px_20px_rgba(139,92,246,0.3)]"
                    )}
                    whileTap={{ scale: 0.95 }}
                  >
                    <item.icon 
                      className="h-7 w-7 tablet:h-8 tablet:w-8 text-white" 
                      strokeWidth={2.5}
                    />
                  </motion.div>
                ) : (
                  <div
                    className={cn(
                      "flex items-center justify-center w-12 h-12 tablet:w-14 tablet:h-14 rounded-2xl transition-all duration-200",
                      active 
                        ? "bg-gradient-to-b from-primary/20 to-primary/10 shadow-[0_2px_0_hsl(var(--primary)/0.2)]" 
                        : "bg-transparent"
                    )}
                  >
                    <item.icon 
                      className={cn(
                        "h-6 w-6 tablet:h-7 tablet:w-7 transition-all duration-200",
                        active ? item.color : "text-muted-foreground"
                      )} 
                      strokeWidth={active ? 2.5 : 2}
                    />
                  </div>
                )}
                
                {/* Label - only show for non-center items */}
                {!isCenter && (
                  <span className={cn(
                    "text-[11px] tablet:text-xs font-medium transition-all duration-200",
                    active ? item.color : "text-muted-foreground"
                  )}>
                    {label}
                  </span>
                )}
                
                {/* Center label below elevated button */}
                {isCenter && (
                  <span className={cn(
                    "text-[11px] tablet:text-xs font-semibold mt-1",
                    active ? "text-primary" : "text-violet-400"
                  )}>
                    {label}
                  </span>
                )}
              </motion.div>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
