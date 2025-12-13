import { ShoppingCategory } from "./ShoppingCategory";
import { BuyAllButton } from "./BuyAllButton";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Trash2, Calendar, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";

interface ShoppingItem {
  ingredient: string;
  category: string;
  isPurchased: boolean;
}

interface MealPlanInfo {
  id: string;
  week_start_date: string;
}

interface ShoppingListViewProps {
  items: ShoppingItem[];
  mealPlan: MealPlanInfo | null;
  onTogglePurchased: (ingredient: string) => void;
  onClearPurchased: () => void;
  onNavigateToDashboard: () => void;
}

export function ShoppingListView({ 
  items, 
  mealPlan, 
  onTogglePurchased, 
  onClearPurchased,
  onNavigateToDashboard 
}: ShoppingListViewProps) {
  const { t, language } = useLanguage();

  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ShoppingItem[]>);

  const categoryOrder = ['proteins', 'dairy', 'vegetables', 'fruits', 'grains', 'condiments', 'other'];
  const sortedCategories = Object.keys(groupedItems).sort(
    (a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b)
  );

  const purchasedCount = items.filter(i => i.isPurchased).length;
  const totalCount = items.length;
  const unpurchasedItems = items.filter(i => !i.isPurchased);

  if (!mealPlan) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 text-center">
          <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t("shopping.noMealPlan")}</h3>
          <p className="text-muted-foreground mb-4">{t("shopping.noMealPlanDesc")}</p>
          <Button onClick={onNavigateToDashboard}>
            {t("shopping.generatePlan")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 text-center">
          <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t("shopping.noItems")}</h3>
          <p className="text-muted-foreground">{t("shopping.noItemsDesc")}</p>
        </CardContent>
      </Card>
    );
  }

  const weekDate = new Date(mealPlan.week_start_date + 'T00:00:00');
  const formattedDate = format(weekDate, "d 'de' MMMM", { 
    locale: language === 'es' ? es : enUS 
  });

  return (
    <div className="space-y-4">
      {/* Header stats */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">
                {t("shopping.weekOf")} {formattedDate}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                {purchasedCount}/{totalCount} {t("shopping.purchased")}
              </Badge>
              
              {purchasedCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={onClearPurchased}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  {t("shopping.clearPurchased")}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Buy All Button */}
      <BuyAllButton items={unpurchasedItems} />

      {/* Categories */}
      <div className="grid gap-4">
        {sortedCategories.map(category => (
          <ShoppingCategory
            key={category}
            category={category}
            items={groupedItems[category]}
            onTogglePurchased={onTogglePurchased}
          />
        ))}
      </div>
    </div>
  );
}
