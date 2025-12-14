import { ShoppingCategory } from "./ShoppingCategory";
import { ExportPDFButton } from "./ExportPDFButton";
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
    <div className="space-y-4 overflow-x-hidden">
      {/* Header stats */}
      <Card>
        <CardContent className="p-3 md:p-4">
          <div className="flex flex-col gap-3">
            {/* Date row */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-xs md:text-sm truncate">
                {t("shopping.weekOf")} {formattedDate}
              </span>
            </div>
            
            {/* Actions row */}
            <div className="flex items-center justify-between gap-2">
              <Badge variant="secondary" className="gap-1 shrink-0 text-xs">
                <CheckCircle2 className="h-3 w-3" />
                {purchasedCount}/{totalCount}
              </Badge>
              
              <div className="flex items-center gap-1">
                <ExportPDFButton items={items} weekDate={formattedDate} />
                
                {purchasedCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={onClearPurchased}
                    className="text-muted-foreground hover:text-destructive h-8 px-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="hidden sm:inline ml-1">{t("shopping.clearPurchased")}</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <div className="grid gap-3 md:gap-4">
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
