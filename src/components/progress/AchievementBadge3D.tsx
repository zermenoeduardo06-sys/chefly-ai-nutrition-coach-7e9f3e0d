import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  points_reward: number;
}

interface AchievementBadge3DProps {
  achievement: Achievement;
  isUnlocked: boolean;
  index?: number;
}

export function AchievementBadge3D({
  achievement,
  isUnlocked,
  index = 0,
}: AchievementBadge3DProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotateY: -30 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      transition={{ 
        delay: index * 0.05, 
        duration: 0.4,
        type: "spring",
        stiffness: 200,
      }}
      whileHover={isUnlocked ? { scale: 1.05, y: -2 } : undefined}
      whileTap={isUnlocked ? { scale: 0.98 } : undefined}
      className={cn(
        "relative rounded-2xl p-4 border-2 transition-all duration-300",
        isUnlocked
          ? "bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-orange-500/10 border-amber-500/40 shadow-[0_4px_0_hsl(38_92%_40%/0.3),0_8px_20px_rgba(0,0,0,0.1)]"
          : "bg-muted/30 border-border/30 opacity-60 grayscale"
      )}
    >
      {/* Glow effect for unlocked */}
      {isUnlocked && (
        <motion.div
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-400/20 to-transparent pointer-events-none"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      <div className="relative flex flex-col items-center text-center gap-2">
        {/* Icon container */}
        <div
          className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center text-2xl",
            isUnlocked
              ? "bg-gradient-to-br from-amber-400 to-orange-500 shadow-[0_4px_0_hsl(30_90%_35%),0_6px_15px_rgba(0,0,0,0.15)]"
              : "bg-muted shadow-[0_2px_0_hsl(var(--border))]"
          )}
        >
          {isUnlocked ? (
            <motion.span
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: index * 0.05 + 0.2, type: "spring" }}
            >
              {achievement.icon}
            </motion.span>
          ) : (
            <Lock className="w-6 h-6 text-muted-foreground" />
          )}
        </div>

        {/* Title */}
        <h4
          className={cn(
            "text-sm font-bold leading-tight",
            isUnlocked ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {achievement.title}
        </h4>

        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {achievement.description}
        </p>

        {/* Points badge */}
        <motion.div
          className={cn(
            "px-3 py-1 rounded-full text-xs font-bold",
            isUnlocked
              ? "bg-amber-500 text-white shadow-[0_2px_0_hsl(38_92%_35%)]"
              : "bg-muted text-muted-foreground"
          )}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.05 + 0.3, type: "spring" }}
        >
          +{achievement.points_reward} XP
        </motion.div>
      </div>

      {/* Shimmer effect for unlocked badges */}
      {isUnlocked && (
        <motion.div
          className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none"
          initial={{ x: "-100%" }}
          animate={{ x: "200%" }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
        >
          <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />
        </motion.div>
      )}
    </motion.div>
  );
}
