import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { MessageCircle } from "lucide-react";

interface ShoppingItem {
  ingredient: string;
  category: string;
  isPurchased: boolean;
}

interface ShareWhatsAppButtonProps {
  items: ShoppingItem[];
  weekDate: string;
}

const categoryNames: Record<string, { es: string; en: string }> = {
  proteins: { es: "🥩 Proteínas", en: "🥩 Proteins" },
  dairy: { es: "🥛 Lácteos", en: "🥛 Dairy" },
  vegetables: { es: "🥬 Verduras", en: "🥬 Vegetables" },
  fruits: { es: "🍎 Frutas", en: "🍎 Fruits" },
  grains: { es: "🌾 Granos", en: "🌾 Grains" },
  condiments: { es: "🧂 Condimentos", en: "🧂 Condiments" },
  other: { es: "📦 Otros", en: "📦 Other" },
};

export function ShareWhatsAppButton({ items, weekDate }: ShareWhatsAppButtonProps) {
  const { t, language } = useLanguage();

  const generateWhatsAppText = () => {
    const title = language === 'es' 
      ? `🛒 *Lista de Compras - Semana del ${weekDate}*`
      : `🛒 *Shopping List - Week of ${weekDate}*`;

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

    let text = `${title}\n\n`;

    sortedCategories.forEach(category => {
      const categoryName = categoryNames[category]?.[language] || category;
      text += `*${categoryName}*\n`;
      
      groupedItems[category].forEach(item => {
        const checkbox = item.isPurchased ? '✅' : '⬜';
        text += `${checkbox} ${item.ingredient}\n`;
      });
      
      text += '\n';
    });

    const footer = language === 'es'
      ? '📱 Generado con Chefly AI'
      : '📱 Generated with Chefly AI';
    
    text += footer;

    return text;
  };

  const handleShare = () => {
    const text = generateWhatsAppText();
    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      className="gap-2"
    >
      <MessageCircle className="h-4 w-4" />
      <span className="hidden sm:inline">{t("shopping.shareWhatsApp")}</span>
    </Button>
  );
}
