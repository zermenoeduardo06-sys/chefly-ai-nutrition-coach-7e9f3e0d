import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

interface Card3DProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: React.ReactNode;
  variant?: "default" | "elevated" | "glass";
  hover?: boolean;
}

const Card3D = React.forwardRef<HTMLDivElement, Card3DProps>(
  ({ className, variant = "default", hover = true, children, ...props }, ref) => {
    const variants = {
      default: "bg-card border-border/50 shadow-[0_4px_0_hsl(var(--border)),0_8px_20px_rgba(0,0,0,0.1)]",
      elevated: "bg-card border-primary/20 shadow-[0_6px_0_hsl(var(--primary)/0.3),0_12px_30px_rgba(0,0,0,0.15)]",
      glass: "bg-card/80 backdrop-blur-xl border-white/10 shadow-[0_4px_0_rgba(255,255,255,0.05),0_8px_30px_rgba(0,0,0,0.2)]",
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-3xl border-2 transition-all duration-200",
          variants[variant],
          hover && "hover:translate-y-[-2px] hover:shadow-[0_8px_0_hsl(var(--border)),0_16px_40px_rgba(0,0,0,0.12)]",
          className
        )}
        whileTap={hover ? { y: 2, transition: { duration: 0.1 } } : undefined}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
Card3D.displayName = "Card3D";

const Card3DHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-5", className)}
    {...props}
  />
));
Card3DHeader.displayName = "Card3DHeader";

const Card3DContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-5 pt-0", className)} {...props} />
));
Card3DContent.displayName = "Card3DContent";

export { Card3D, Card3DHeader, Card3DContent };
