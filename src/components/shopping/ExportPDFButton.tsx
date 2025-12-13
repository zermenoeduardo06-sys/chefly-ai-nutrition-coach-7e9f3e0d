import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { FileDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";

interface ShoppingItemData {
  ingredient: string;
  category: string;
  isPurchased: boolean;
}

interface ExportPDFButtonProps {
  items: ShoppingItemData[];
  weekDate: string;
}

const categoryLabels: Record<string, Record<string, string>> = {
  es: {
    proteins: "Proteínas",
    dairy: "Lácteos",
    vegetables: "Vegetales",
    fruits: "Frutas",
    grains: "Granos y Cereales",
    condiments: "Condimentos y Especias",
    other: "Otros",
  },
  en: {
    proteins: "Proteins",
    dairy: "Dairy",
    vegetables: "Vegetables",
    fruits: "Fruits",
    grains: "Grains & Cereals",
    condiments: "Condiments & Spices",
    other: "Other",
  },
};

export function ExportPDFButton({ items, weekDate }: ExportPDFButtonProps) {
  const { t, language } = useLanguage();
  const { toast } = useToast();

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPosition = 20;
      const lineHeight = 7;
      const marginLeft = 20;
      const maxWidth = pageWidth - 40;

      // Title
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text(t("shopping.title"), pageWidth / 2, yPosition, { align: "center" });
      yPosition += 10;

      // Week date
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`${t("shopping.weekOf")} ${weekDate}`, pageWidth / 2, yPosition, { align: "center" });
      yPosition += 15;

      // Group items by category
      const groupedItems = items.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
      }, {} as Record<string, ShoppingItemData[]>);

      const categoryOrder = ["proteins", "dairy", "vegetables", "fruits", "grains", "condiments", "other"];
      const sortedCategories = Object.keys(groupedItems).sort(
        (a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b)
      );

      // Render each category
      for (const category of sortedCategories) {
        const categoryItems = groupedItems[category];
        
        // Check if we need a new page
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }

        // Category header
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        const categoryLabel = categoryLabels[language]?.[category] || category;
        doc.text(categoryLabel, marginLeft, yPosition);
        yPosition += lineHeight + 2;

        // Items
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        
        for (const item of categoryItems) {
          // Check if we need a new page
          if (yPosition > 280) {
            doc.addPage();
            yPosition = 20;
          }

          // Checkbox indicator
          const checkbox = item.isPurchased ? "[✓]" : "[ ]";
          const text = `${checkbox} ${item.ingredient}`;
          
          // Word wrap for long ingredients
          const lines = doc.splitTextToSize(text, maxWidth);
          for (const line of lines) {
            doc.text(line, marginLeft, yPosition);
            yPosition += lineHeight;
          }
        }

        yPosition += 5; // Space between categories
      }

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(128);
      doc.text("Chefly.AI - Tu coach nutricional con IA", pageWidth / 2, 290, { align: "center" });

      // Save the PDF
      const fileName = `lista-compras-${weekDate.replace(/\s/g, "-")}.pdf`;
      doc.save(fileName);

      toast({
        title: t("shopping.exportSuccess"),
        description: t("shopping.exportSuccessDesc"),
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: t("shopping.exportError"),
      });
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={exportToPDF}
      className="gap-2"
    >
      <FileDown className="h-4 w-4" />
      <span className="hidden sm:inline">{t("shopping.exportPDF")}</span>
    </Button>
  );
}
