import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { ShoppingCart, ExternalLink, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ShoppingItemData {
  ingredient: string;
  category: string;
  isPurchased: boolean;
}

interface BuyAllButtonProps {
  items: ShoppingItemData[];
}

export function BuyAllButton({ items }: BuyAllButtonProps) {
  const { t, language } = useLanguage();
  
  // Get affiliate tag from env
  const affiliateTag = import.meta.env.VITE_AMAZON_AFFILIATE_TAG || '';

  const getAmazonSearchUrl = () => {
    // Create a search query with all ingredients
    const ingredientNames = items.slice(0, 10).map(i => i.ingredient).join(' ');
    const baseUrl = 'https://www.amazon.com.mx/s';
    const searchPrefix = language === 'es' ? 'ingredientes cocina' : 'cooking ingredients';
    const params = new URLSearchParams({
      k: `${searchPrefix} ${ingredientNames}`,
      ...(affiliateTag && { tag: affiliateTag })
    });
    return `${baseUrl}?${params.toString()}`;
  };

  if (items.length === 0) {
    return null;
  }

  // Show setup message if no affiliate tag configured
  if (!affiliateTag) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-sm">
          {t("shopping.affiliateNotConfigured")}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-semibold flex items-center justify-center sm:justify-start gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              {t("shopping.buyAllTitle")}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {t("shopping.buyAllDesc", { count: items.length })}
            </p>
          </div>
          
          <Button 
            className="w-full sm:w-auto gap-2"
            asChild
          >
            <a 
              href={getAmazonSearchUrl()} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              {t("shopping.buyOnAmazon")}
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
