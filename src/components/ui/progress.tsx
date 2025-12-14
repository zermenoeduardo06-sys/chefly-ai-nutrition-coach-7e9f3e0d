import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  variant?: "default" | "success" | "gamified";
  size?: "sm" | "default" | "lg";
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, variant = "default", size = "default", ...props }, ref) => {
  const sizeClasses = {
    sm: "h-2",
    default: "h-4",
    lg: "h-6",
  };

  const variantClasses = {
    default: "bg-primary",
    success: "bg-secondary",
    gamified: "bg-gradient-to-r from-primary to-primary-hover",
  };

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative w-full overflow-hidden rounded-full bg-muted",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full w-full flex-1 transition-all duration-500 ease-out rounded-full",
          variantClasses[variant]
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
