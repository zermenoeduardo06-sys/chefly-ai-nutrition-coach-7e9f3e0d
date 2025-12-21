import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { User, Star, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface MealAdaptation {
  id: string;
  member_user_id: string;
  member_name?: string;
  adaptation_score: number;
  adaptation_notes: string;
  variant_instructions: string;
  is_best_match: boolean;
}

interface MealMemberAdaptationsProps {
  adaptations: MealAdaptation[];
  compact?: boolean;
}

export const MealMemberAdaptations = ({ adaptations, compact = false }: MealMemberAdaptationsProps) => {
  const { language } = useLanguage();
  
  if (!adaptations || adaptations.length === 0) {
    return null;
  }

  // Sort by score descending
  const sortedAdaptations = [...adaptations].sort((a, b) => b.adaptation_score - a.adaptation_score);
  const bestMatch = sortedAdaptations[0];

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="secondary" 
              className="gap-1 bg-primary/10 text-primary hover:bg-primary/20 cursor-help text-xs"
            >
              <Star className="h-3 w-3 fill-current" />
              {language === 'es' ? 'Ideal para' : 'Best for'}: {bestMatch?.member_name}
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="text-sm">{bestMatch?.adaptation_notes}</p>
            {bestMatch?.variant_instructions && (
              <p className="text-xs text-muted-foreground mt-1">
                💡 {bestMatch.variant_instructions}
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="space-y-2 mt-3 p-3 bg-muted/30 rounded-lg">
      <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
        <Sparkles className="h-3 w-3" />
        {language === 'es' ? 'Adaptaciones por miembro' : 'Member adaptations'}
      </h4>
      
      <div className="space-y-2">
        {sortedAdaptations.map((adaptation) => (
          <div 
            key={adaptation.id} 
            className={`flex items-start gap-2 p-2 rounded-md ${
              adaptation.is_best_match 
                ? 'bg-primary/10 border border-primary/20' 
                : 'bg-background/50'
            }`}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <User className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              <span className="font-medium text-sm truncate">
                {adaptation.member_name}
              </span>
              {adaptation.is_best_match && (
                <Star className="h-3.5 w-3.5 text-primary fill-primary flex-shrink-0" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-primary h-full rounded-full transition-all"
                    style={{ width: `${adaptation.adaptation_score}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground font-mono">
                  {adaptation.adaptation_score}%
                </span>
              </div>
              
              {adaptation.adaptation_notes && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {adaptation.adaptation_notes}
                </p>
              )}
              
              {adaptation.variant_instructions && (
                <p className="text-xs text-primary/80 mt-1 flex items-start gap-1">
                  <span>💡</span>
                  <span>{adaptation.variant_instructions}</span>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Compact badge for meal cards
export const MealBestMatchBadge = ({ adaptations }: { adaptations?: MealAdaptation[] }) => {
  const { language } = useLanguage();
  
  if (!adaptations || adaptations.length === 0) {
    return null;
  }

  const bestMatch = adaptations.find(a => a.is_best_match);
  if (!bestMatch) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 text-primary text-xs font-medium">
            <Star className="h-3 w-3 fill-current" />
            <span className="truncate max-w-[100px]">
              {language === 'es' ? 'Para' : 'For'} {bestMatch.member_name}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[200px]">
          <p className="text-sm font-medium mb-1">
            {language === 'es' ? 'Más adaptado para' : 'Best suited for'} {bestMatch.member_name}
          </p>
          <p className="text-xs text-muted-foreground">{bestMatch.adaptation_notes}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
