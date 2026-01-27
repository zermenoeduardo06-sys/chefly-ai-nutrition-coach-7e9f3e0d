import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Card3D } from "@/components/ui/card-3d";
import { Icon3D } from "@/components/ui/icon-3d";
import { useEffect, useState } from "react";

interface Stat3DCardProps {
  icon: LucideIcon;
  value: number | string;
  label: string;
  color?: "primary" | "secondary" | "amber" | "sky" | "rose" | "emerald";
  animate?: boolean;
  suffix?: string;
  delay?: number;
}

export function Stat3DCard({
  icon,
  value,
  label,
  color = "primary",
  animate = true,
  suffix = "",
  delay = 0,
}: Stat3DCardProps) {
  const [displayValue, setDisplayValue] = useState<number | string>(typeof value === "number" ? 0 : value);
  
  useEffect(() => {
    if (animate && typeof value === "number" && value > 0) {
      const duration = 1000;
      const steps = 30;
      const stepDuration = duration / steps;
      const increment = value / steps;
      
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, stepDuration);

      return () => clearInterval(timer);
    } else {
      setDisplayValue(value);
    }
  }, [value, animate]);

  const formatValue = (val: number | string): string => {
    if (typeof val === "number") {
      if (val >= 1000) {
        return (val / 1000).toFixed(1) + "k";
      }
      return val.toLocaleString();
    }
    return val;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
    >
      <Card3D variant="default" className="p-4 h-full">
        <div className="flex flex-col items-center text-center gap-3">
          <Icon3D icon={icon} color={color} size="lg" animate />
          
          <div>
            <motion.p
              className="text-3xl font-black text-foreground"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: delay + 0.2, type: "spring", stiffness: 200 }}
            >
              {formatValue(displayValue)}{suffix}
            </motion.p>
            <p className="text-sm text-muted-foreground font-medium mt-1">{label}</p>
          </div>
        </div>
      </Card3D>
    </motion.div>
  );
}
