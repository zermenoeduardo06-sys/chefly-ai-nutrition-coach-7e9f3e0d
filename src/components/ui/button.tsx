import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        hero: "bg-gradient-to-r from-primary to-primary-hover text-primary-foreground hover:shadow-[0_8px_30px_rgb(255,99,71,0.3)] transform hover:scale-[1.02]",
        // Duolingo-style 3D button
        duolingo: "bg-primary text-primary-foreground shadow-[0_4px_0_hsl(16_90%_45%)] btn-3d hover:brightness-105 active:translate-y-[2px] active:shadow-[0_2px_0_hsl(16_90%_45%)]",
        duolingoSecondary: "bg-secondary text-secondary-foreground shadow-[0_4px_0_hsl(142_60%_35%)] btn-3d hover:brightness-105 active:translate-y-[2px] active:shadow-[0_2px_0_hsl(142_60%_35%)]",
        duolingoOutline: "bg-background border-2 border-border text-foreground shadow-[0_4px_0_hsl(var(--border))] btn-3d hover:border-primary active:translate-y-[2px] active:shadow-[0_2px_0_hsl(var(--border))]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-2xl px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
