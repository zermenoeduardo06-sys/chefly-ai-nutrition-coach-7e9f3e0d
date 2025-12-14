import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { AMAZON_AFFILIATE_TAG } from "@/config/affiliates";

interface ShoppingItemProps {
  ingredient: string;
  isPurchased: boolean;
  onToggle: () => void;
}

export function ShoppingItem({ ingredient, isPurchased, onToggle }: ShoppingItemProps) {
  
  const getAmazonSearchUrl = (item: string) => {
    const baseUrl = 'https://www.amazon.com.mx/s';
    const params = new URLSearchParams({
      k: item,
      tag: AMAZON_AFFILIATE_TAG
    });
    return `${baseUrl}?${params.toString()}`;
  };

  return (
    <div className={cn(
      "flex items-center gap-2 py-2 px-2 md:px-3 rounded-md transition-colors min-w-0",
      isPurchased ? "bg-muted/50" : "hover:bg-accent/30 active:bg-accent/50"
    )}>
      <Checkbox
        id={`item-${ingredient}`}
        checked={isPurchased}
        onCheckedChange={onToggle}
        className="shrink-0"
      />
      <label 
        htmlFor={`item-${ingredient}`}
        className={cn(
          "text-xs md:text-sm cursor-pointer flex-1 min-w-0 break-words",
          isPurchased && "line-through text-muted-foreground"
        )}
      >
        {ingredient}
      </label>
      
      {!isPurchased && (
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 h-8 w-8 text-muted-foreground hover:text-primary"
          asChild
        >
          <a 
            href={getAmazonSearchUrl(ingredient)} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </Button>
      )}
    </div>
  );
}
