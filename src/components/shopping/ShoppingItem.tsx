import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShoppingItemProps {
  ingredient: string;
  isPurchased: boolean;
  onToggle: () => void;
}

export function ShoppingItem({ ingredient, isPurchased, onToggle }: ShoppingItemProps) {
  // Get affiliate tag from env or use placeholder
  const affiliateTag = import.meta.env.VITE_AMAZON_AFFILIATE_TAG || '';
  
  const getAmazonSearchUrl = (item: string) => {
    const baseUrl = 'https://www.amazon.com.mx/s';
    const params = new URLSearchParams({
      k: item,
      ...(affiliateTag && { tag: affiliateTag })
    });
    return `${baseUrl}?${params.toString()}`;
  };

  return (
    <div className={cn(
      "flex items-center justify-between py-2 px-3 rounded-md transition-colors",
      isPurchased ? "bg-muted/50" : "hover:bg-accent/30"
    )}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Checkbox
          id={`item-${ingredient}`}
          checked={isPurchased}
          onCheckedChange={onToggle}
          className="shrink-0"
        />
        <label 
          htmlFor={`item-${ingredient}`}
          className={cn(
            "text-sm cursor-pointer truncate flex-1",
            isPurchased && "line-through text-muted-foreground"
          )}
        >
          {ingredient}
        </label>
      </div>
      
      {affiliateTag && !isPurchased && (
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0 h-7 px-2 text-xs text-muted-foreground hover:text-primary"
          asChild
        >
          <a 
            href={getAmazonSearchUrl(ingredient)} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        </Button>
      )}
    </div>
  );
}
