import { Flame, Star, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MobileStatsBarProps {
  streak: number;
  points: number;
  level: number;
}

export function MobileStatsBar({ streak, points, level }: MobileStatsBarProps) {
  const stats = [
    {
      icon: Flame,
      value: streak,
      color: "text-primary",
      bgColor: "bg-primary/10",
      label: "streak",
    },
    {
      icon: Star,
      value: points,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      label: "points",
    },
    {
      icon: Trophy,
      value: level,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
      label: "level",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-around py-3 px-4 bg-card/50 backdrop-blur-sm rounded-2xl border-2 border-border md:hidden"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.1, type: "spring", stiffness: 500 }}
          className="flex items-center gap-2"
        >
          <div className={cn("p-2 rounded-xl", stat.bgColor)}>
            <stat.icon className={cn("h-5 w-5", stat.color)} />
          </div>
          <span className="font-bold text-lg text-foreground">{stat.value}</span>
        </motion.div>
      ))}
    </motion.div>
  );
}
