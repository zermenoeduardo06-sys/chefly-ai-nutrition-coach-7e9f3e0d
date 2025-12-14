import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface CardGamifiedProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "highlighted" | "completed";
  animated?: boolean;
}

const CardGamified = React.forwardRef<HTMLDivElement, CardGamifiedProps>(
  ({ className, variant = "default", animated = true, children, ...props }, ref) => {
    const variantClasses = {
      default: "border-border bg-card",
      highlighted: "border-primary/30 bg-card shadow-[0_0_20px_hsl(var(--primary)/0.1)]",
      completed: "border-secondary/30 bg-secondary/5",
    };

    if (animated) {
      return (
        <motion.div
          ref={ref}
          className={cn(
            "rounded-2xl border-2 p-4 transition-all duration-200",
            variantClasses[variant],
            className
          )}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border-2 p-4 transition-all duration-200",
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
CardGamified.displayName = "CardGamified";

const CardGamifiedHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-3 mb-3", className)}
    {...props}
  />
));
CardGamifiedHeader.displayName = "CardGamifiedHeader";

const CardGamifiedIcon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: "primary" | "secondary" | "accent" }
>(({ className, variant = "primary", ...props }, ref) => {
  const variantClasses = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    accent: "bg-yellow-500/10 text-yellow-500",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-center w-10 h-10 rounded-xl",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
});
CardGamifiedIcon.displayName = "CardGamifiedIcon";

const CardGamifiedTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-bold text-foreground", className)}
    {...props}
  />
));
CardGamifiedTitle.displayName = "CardGamifiedTitle";

const CardGamifiedContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-muted-foreground", className)} {...props} />
));
CardGamifiedContent.displayName = "CardGamifiedContent";

export {
  CardGamified,
  CardGamifiedHeader,
  CardGamifiedIcon,
  CardGamifiedTitle,
  CardGamifiedContent,
};
