import { Award, Medal, Crown, Star, Gem } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";

const TIER_ICONS = {
  bronce: Award,
  plata: Medal,
  oro: Crown,
  platino: Star,
  diamante: Gem,
};

const TIER_COLORS = {
  bronce: "#CD7F32",
  plata: "#C0C0C0",
  oro: "#FFD700",
  platino: "#E5E4E2",
  diamante: "#B9F2FF",
};

interface AffiliateTierBadgeProps {
  tier: keyof typeof TIER_ICONS;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
}

export function AffiliateTierBadge({ tier, showIcon = true, size = "md" }: AffiliateTierBadgeProps) {
  const { t } = useLanguage();
  const Icon = TIER_ICONS[tier];
  const color = TIER_COLORS[tier];
  const name = t(`affiliateTier.${tier}`);

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <Badge
      variant="outline"
      className={`${sizeClasses[size]} font-semibold`}
      style={{
        borderColor: color,
        color: color,
        backgroundColor: `${color}10`,
      }}
    >
      {showIcon && <Icon className={`${iconSizes[size]} mr-1`} />}
      {name}
    </Badge>
  );
}
