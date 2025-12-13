import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ShoppingItem } from "./ShoppingItem";
import { useLanguage } from "@/contexts/LanguageContext";
import { ChevronDown, Beef, Milk, Carrot, Apple, Wheat, Droplet, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShoppingItemData {
  ingredient: string;
  category: string;
  isPurchased: boolean;
}

interface ShoppingCategoryProps {
  category: string;
  items: ShoppingItemData[];
  onTogglePurchased: (ingredient: string) => void;
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  proteins: Beef,
  dairy: Milk,
  vegetables: Carrot,
  fruits: Apple,
  grains: Wheat,
  condiments: Droplet,
  other: Package,
};

const categoryColors: Record<string, string> = {
  proteins: "text-red-500",
  dairy: "text-blue-500",
  vegetables: "text-green-500",
  fruits: "text-orange-500",
  grains: "text-amber-500",
  condiments: "text-purple-500",
  other: "text-muted-foreground",
};

export function ShoppingCategory({ category, items, onTogglePurchased }: ShoppingCategoryProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(true);

  const Icon = categoryIcons[category] || Package;
  const colorClass = categoryColors[category] || "text-muted-foreground";
  
  const purchasedCount = items.filter(i => i.isPurchased).length;
  const allPurchased = purchasedCount === items.length;

  return (
    <Card className={cn(allPurchased && "opacity-60")}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors py-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <Icon className={cn("h-5 w-5", colorClass)} />
                <span>{t(`shopping.category.${category}`)}</span>
                <span className="text-sm text-muted-foreground font-normal">
                  ({purchasedCount}/{items.length})
                </span>
              </CardTitle>
              <ChevronDown className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                isOpen && "rotate-180"
              )} />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0 pb-3 px-4">
            <div className="grid gap-1">
              {items.map((item) => (
                <ShoppingItem
                  key={item.ingredient}
                  ingredient={item.ingredient}
                  isPurchased={item.isPurchased}
                  onToggle={() => onTogglePurchased(item.ingredient)}
                />
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
