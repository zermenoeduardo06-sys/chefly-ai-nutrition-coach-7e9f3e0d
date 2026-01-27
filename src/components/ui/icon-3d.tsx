import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface Icon3DProps {
  icon: LucideIcon;
  color?: "primary" | "secondary" | "amber" | "sky" | "rose" | "emerald";
  size?: "sm" | "md" | "lg" | "xl";
  animate?: boolean;
  className?: string;
}

const colorVariants = {
  primary: {
    bg: "bg-gradient-to-br from-primary/20 to-primary/10",
    icon: "text-primary",
    shadow: "shadow-[0_4px_0_hsl(var(--primary)/0.3),0_6px_12px_rgba(0,0,0,0.1)]",
    glow: "shadow-[0_0_20px_hsl(var(--primary)/0.3)]",
  },
  secondary: {
    bg: "bg-gradient-to-br from-secondary/20 to-secondary/10",
    icon: "text-secondary",
    shadow: "shadow-[0_4px_0_hsl(var(--secondary)/0.3),0_6px_12px_rgba(0,0,0,0.1)]",
    glow: "shadow-[0_0_20px_hsl(var(--secondary)/0.3)]",
  },
  amber: {
    bg: "bg-gradient-to-br from-amber-500/20 to-amber-400/10",
    icon: "text-amber-500",
    shadow: "shadow-[0_4px_0_hsl(38_92%_35%/0.4),0_6px_12px_rgba(0,0,0,0.1)]",
    glow: "shadow-[0_0_20px_hsl(38_92%_50%/0.3)]",
  },
  sky: {
    bg: "bg-gradient-to-br from-sky-500/20 to-sky-400/10",
    icon: "text-sky-500",
    shadow: "shadow-[0_4px_0_hsl(200_90%_35%/0.4),0_6px_12px_rgba(0,0,0,0.1)]",
    glow: "shadow-[0_0_20px_hsl(200_90%_50%/0.3)]",
  },
  rose: {
    bg: "bg-gradient-to-br from-rose-500/20 to-rose-400/10",
    icon: "text-rose-500",
    shadow: "shadow-[0_4px_0_hsl(350_90%_35%/0.4),0_6px_12px_rgba(0,0,0,0.1)]",
    glow: "shadow-[0_0_20px_hsl(350_90%_50%/0.3)]",
  },
  emerald: {
    bg: "bg-gradient-to-br from-emerald-500/20 to-emerald-400/10",
    icon: "text-emerald-500",
    shadow: "shadow-[0_4px_0_hsl(160_80%_30%/0.4),0_6px_12px_rgba(0,0,0,0.1)]",
    glow: "shadow-[0_0_20px_hsl(160_80%_45%/0.3)]",
  },
};

const sizeVariants = {
  sm: { container: "w-10 h-10", icon: "h-5 w-5" },
  md: { container: "w-12 h-12", icon: "h-6 w-6" },
  lg: { container: "w-14 h-14", icon: "h-7 w-7" },
  xl: { container: "w-16 h-16", icon: "h-8 w-8" },
};

export function Icon3D({
  icon: Icon,
  color = "primary",
  size = "md",
  animate = false,
  className,
}: Icon3DProps) {
  const colorStyles = colorVariants[color];
  const sizeStyles = sizeVariants[size];

  return (
    <motion.div
      className={cn(
        "rounded-2xl flex items-center justify-center",
        sizeStyles.container,
        colorStyles.bg,
        colorStyles.shadow,
        animate && "hover:scale-105",
        className
      )}
      animate={animate ? { y: [0, -2, 0] } : undefined}
      transition={animate ? { repeat: Infinity, duration: 2, ease: "easeInOut" } : undefined}
    >
      <Icon className={cn(sizeStyles.icon, colorStyles.icon)} strokeWidth={2.5} />
    </motion.div>
  );
}
