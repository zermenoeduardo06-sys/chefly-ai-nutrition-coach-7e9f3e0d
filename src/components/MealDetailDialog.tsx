import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Flame, Apple, Beef, Cookie, ArrowLeftRight, Lock, Download } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import jsPDF from "jspdf";
import { useToast } from "@/hooks/use-toast";

interface Meal {
  id: string;
  name: string;
  description: string;
  benefits: string;
  meal_type: string;
  ingredients?: string[];
  steps?: string[];
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  image_url?: string;
}

interface MealDetailDialogProps {
  meal: Meal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwapMeal?: (mealId: string) => void;
  canSwap?: boolean;
}

export function MealDetailDialog({ 
  meal, 
  open, 
  onOpenChange, 
  onSwapMeal,
  canSwap = true
}: MealDetailDialogProps) {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  
  if (!meal) return null;

  const mealTypeLabel = t(`mealDetail.${meal.meal_type}`) || t(`dashboard.meals.${meal.meal_type}`);

  const loadImageAsBase64 = (url: string): Promise<string | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const maxWidth = 170; // PDF width minus margins
          const maxHeight = 80;
          
          let width = img.width;
          let height = img.height;
          
          // Scale to fit
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.8));
          } else {
            resolve(null);
          }
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  };

  const exportToPDF = async () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      let yPosition = 20;

      // Colors
      const primaryColor = [16, 185, 129] as const; // Emerald green
      const textColor = [51, 51, 51] as const;
      const mutedColor = [107, 114, 128] as const;

      // Try to load the image
      let imageBase64: string | null = null;
      let imageHeight = 0;
      
      if (meal.image_url) {
        toast({
          title: language === 'es' ? "Generando PDF..." : "Generating PDF...",
          description: language === 'es' ? "Cargando imagen..." : "Loading image...",
        });
        imageBase64 = await loadImageAsBase64(meal.image_url);
      }

      if (imageBase64) {
        // Add image at the top
        const imgProps = doc.getImageProperties(imageBase64);
        const imgWidth = contentWidth;
        imageHeight = (imgProps.height * imgWidth) / imgProps.width;
        imageHeight = Math.min(imageHeight, 70); // Max height for image
        
        doc.addImage(imageBase64, 'JPEG', margin, yPosition, imgWidth, imageHeight);
        
        yPosition = yPosition + imageHeight + 10;
        
        // Header banner below image
        doc.setFillColor(...primaryColor);
        doc.rect(margin, yPosition - 5, contentWidth, 25, 'F');
        
        // Meal type badge
        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);
        doc.text(mealTypeLabel.toUpperCase(), margin + 5, yPosition + 3);
        
        // Meal name
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text(meal.name, margin + 5, yPosition + 13, { maxWidth: contentWidth - 10 });
        
        yPosition = yPosition + 28;
      } else {
        // Header without image - green banner
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, pageWidth, 45, 'F');

        // Meal type badge
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.text(mealTypeLabel.toUpperCase(), margin, yPosition);
        yPosition += 8;

        // Meal name
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text(meal.name, margin, yPosition + 8, { maxWidth: contentWidth });
        yPosition = 55;
      }

      // Description
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...mutedColor);
      const descLines = doc.splitTextToSize(meal.description, contentWidth);
      doc.text(descLines, margin, yPosition);
      yPosition += descLines.length * 5 + 10;

      // Nutritional info section
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...textColor);
      doc.text(language === 'es' ? "Información Nutricional" : "Nutritional Information", margin, yPosition);
      yPosition += 8;

      // Nutrition boxes
      const boxWidth = (contentWidth - 15) / 4;
      const nutritionData = [
        { label: language === 'es' ? 'Calorías' : 'Calories', value: `${meal.calories || 0}` },
        { label: language === 'es' ? 'Proteína' : 'Protein', value: `${meal.protein || 0}g` },
        { label: language === 'es' ? 'Carbos' : 'Carbs', value: `${meal.carbs || 0}g` },
        { label: language === 'es' ? 'Grasas' : 'Fats', value: `${meal.fats || 0}g` },
      ];

      nutritionData.forEach((item, index) => {
        const boxX = margin + index * (boxWidth + 5);
        doc.setFillColor(245, 245, 245);
        doc.roundedRect(boxX, yPosition, boxWidth, 22, 3, 3, 'F');
        
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...primaryColor);
        doc.text(item.value, boxX + boxWidth / 2, yPosition + 10, { align: 'center' });
        
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...mutedColor);
        doc.text(item.label, boxX + boxWidth / 2, yPosition + 17, { align: 'center' });
      });
      yPosition += 32;

      // Benefits section
      if (meal.benefits) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...textColor);
        doc.text(language === 'es' ? "Beneficios" : "Benefits", margin, yPosition);
        yPosition += 7;
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...mutedColor);
        const benefitLines = doc.splitTextToSize(meal.benefits, contentWidth);
        doc.text(benefitLines, margin, yPosition);
        yPosition += benefitLines.length * 5 + 10;
      }

      // Ingredients section
      if (meal.ingredients && meal.ingredients.length > 0) {
        // Check if we need a new page
        if (yPosition > 240) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...textColor);
        doc.text(language === 'es' ? "Ingredientes" : "Ingredients", margin, yPosition);
        yPosition += 8;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...textColor);

        meal.ingredients.forEach((ingredient) => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.setFillColor(...primaryColor);
          doc.circle(margin + 2, yPosition - 1.5, 1.5, 'F');
          
          const ingredientLines = doc.splitTextToSize(ingredient, contentWidth - 10);
          doc.text(ingredientLines, margin + 8, yPosition);
          yPosition += ingredientLines.length * 5 + 3;
        });
        yPosition += 5;
      }

      // Steps section
      if (meal.steps && meal.steps.length > 0) {
        // Check if we need a new page
        if (yPosition > 240) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...textColor);
        doc.text(language === 'es' ? "Preparación" : "Preparation Steps", margin, yPosition);
        yPosition += 10;

        meal.steps.forEach((step, index) => {
          if (yPosition > 260) {
            doc.addPage();
            yPosition = 20;
          }

          // Step number circle
          doc.setFillColor(...primaryColor);
          doc.circle(margin + 4, yPosition, 4, 'F');
          doc.setFontSize(9);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(255, 255, 255);
          doc.text(`${index + 1}`, margin + 4, yPosition + 1, { align: 'center' });

          // Step text
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...textColor);
          const stepLines = doc.splitTextToSize(step, contentWidth - 15);
          doc.text(stepLines, margin + 12, yPosition + 1);
          yPosition += stepLines.length * 5 + 8;
        });
      }

      // Footer on all pages
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        const footerY = doc.internal.pageSize.getHeight() - 10;
        doc.setFontSize(8);
        doc.setTextColor(...mutedColor);
        doc.text("Chefly.AI - Tu Coach Nutricional", pageWidth / 2, footerY, { align: 'center' });
      }

      // Save the PDF
      const fileName = `${meal.name.replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ\s]/g, '').replace(/\s+/g, '_')}.pdf`;
      doc.save(fileName);

      toast({
        title: language === 'es' ? "¡Receta exportada!" : "Recipe exported!",
        description: language === 'es' ? "Tu receta se descargó como PDF" : "Your recipe was downloaded as PDF",
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        variant: "destructive",
        title: language === 'es' ? "Error" : "Error",
        description: language === 'es' ? "No se pudo exportar la receta" : "Could not export recipe",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg max-h-[90vh] overflow-y-auto mx-4 sm:mx-0">
        {meal.image_url && (
          <div className="relative -mt-6 -mx-6 mb-4 h-48 sm:h-64 overflow-hidden rounded-t-lg">
            <img 
              src={meal.image_url} 
              alt={meal.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            <div className="absolute bottom-4 left-6 right-6">
              <Badge variant="secondary" className="mb-2 backdrop-blur-sm bg-background/80">
                {mealTypeLabel}
              </Badge>
              <DialogTitle className="text-3xl text-white drop-shadow-lg">{meal.name}</DialogTitle>
            </div>
            {/* PDF Export button on image */}
            <Button
              variant="secondary"
              size="icon"
              onClick={exportToPDF}
              className="absolute top-4 right-4 backdrop-blur-sm bg-background/80 hover:bg-background"
              title={language === 'es' ? "Exportar receta a PDF" : "Export recipe to PDF"}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        {!meal.image_url && (
          <DialogHeader>
            <div className="flex items-center justify-between mb-2">
              <Badge variant="secondary">{mealTypeLabel}</Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={exportToPDF}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                PDF
              </Button>
            </div>
            <DialogTitle className="text-2xl">{meal.name}</DialogTitle>
          </DialogHeader>
        )}

        <p className="text-muted-foreground">{meal.description}</p>

        <Separator />

        {/* Información Nutricional */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Flame className="h-5 w-5 text-primary" />
            {t('mealDetail.nutritionalInfo')}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-secondary/20 rounded-lg p-3 text-center">
              <Flame className="h-5 w-5 mx-auto mb-1 text-orange-500" />
              <p className="text-2xl font-bold">{meal.calories || 0}</p>
              <p className="text-xs text-muted-foreground">{t('mealDetail.calories')}</p>
            </div>
            <div className="bg-secondary/20 rounded-lg p-3 text-center">
              <Beef className="h-5 w-5 mx-auto mb-1 text-red-500" />
              <p className="text-2xl font-bold">{meal.protein || 0}g</p>
              <p className="text-xs text-muted-foreground">{t('mealDetail.protein')}</p>
            </div>
            <div className="bg-secondary/20 rounded-lg p-3 text-center">
              <Cookie className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
              <p className="text-2xl font-bold">{meal.carbs || 0}g</p>
              <p className="text-xs text-muted-foreground">{t('mealDetail.carbs')}</p>
            </div>
            <div className="bg-secondary/20 rounded-lg p-3 text-center">
              <Apple className="h-5 w-5 mx-auto mb-1 text-green-500" />
              <p className="text-2xl font-bold">{meal.fats || 0}g</p>
              <p className="text-xs text-muted-foreground">{t('mealDetail.fats')}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Beneficios */}
        <div>
          <h3 className="font-semibold mb-2">{t('mealDetail.benefits')}</h3>
          <p className="text-sm text-muted-foreground">{meal.benefits}</p>
        </div>

        {/* Ingredientes */}
        {meal.ingredients && meal.ingredients.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="font-semibold mb-3">{t('mealDetail.ingredients')}</h3>
              <ul className="space-y-2">
                {meal.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span className="text-sm">{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {/* Preparación */}
        {meal.steps && meal.steps.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="font-semibold mb-3">{t('mealDetail.steps')}</h3>
              <ol className="space-y-3">
                {meal.steps.map((step, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </span>
                    <span className="text-sm flex-1">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <Separator />
        <DialogFooter className="flex-col sm:flex-row gap-2">
          {/* PDF Export button in footer for image-having meals */}
          {meal.image_url && (
            <Button
              variant="outline"
              onClick={exportToPDF}
              className="w-full sm:w-auto gap-2"
            >
              <Download className="h-4 w-4" />
              {language === 'es' ? "Exportar PDF" : "Export PDF"}
            </Button>
          )}
          {onSwapMeal && (
            <Button
              variant="outline"
              onClick={() => onSwapMeal(meal.id)}
              disabled={!canSwap}
              className="w-full sm:w-auto"
            >
              {!canSwap && <Lock className="mr-2 h-4 w-4" />}
              <ArrowLeftRight className="mr-2 h-4 w-4" />
              {t('mealDetail.swapMeal')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
