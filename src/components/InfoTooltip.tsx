import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface InfoTooltipProps {
  titleKey: string;
  contentKey: string;
  className?: string;
  iconSize?: number;
  data?: Record<string, string | number>;
}

export function InfoTooltip({ 
  titleKey, 
  contentKey, 
  className,
  iconSize = 14,
  data 
}: InfoTooltipProps) {
  const { t } = useLanguage();
  
  const title = t(titleKey, data);
  const content = t(contentKey, data);

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button 
            type="button"
            className={cn(
              "inline-flex items-center justify-center rounded-full p-0.5 text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
              className
            )}
            aria-label={title}
          >
            <HelpCircle size={iconSize} />
          </button>
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          align="center"
          className="max-w-[280px] p-3 shadow-lg"
        >
          <div className="space-y-1.5">
            <p className="font-semibold text-sm text-foreground">{title}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{content}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
