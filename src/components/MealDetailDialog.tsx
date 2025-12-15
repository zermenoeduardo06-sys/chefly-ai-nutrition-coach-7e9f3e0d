import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Flame, Apple, Beef, Cookie, ArrowLeftRight, Lock, Share2, Play } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import jsPDF from "jspdf";
import { useToast } from "@/hooks/use-toast";
import { usePDFExport } from "@/hooks/usePDFExport";
import { StepByStepDialog } from "./StepByStepDialog";

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
  const { exportPDF } = usePDFExport();
  const [stepByStepOpen, setStepByStepOpen] = useState(false);
  
  if (!meal) return null;

  const mealTypeLabel = t(`mealDetail.${meal.meal_type}`) || t(`dashboard.meals.${meal.meal_type}`);

  const loadImageAsBase64 = (url: string): Promise<string | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          // Use higher resolution for better PDF quality (2x scale)
          const scale = 2;
          const targetWidth = 510; // PDF width in points (~170mm * 3)
          const targetHeight = 210; // Max height for image
          
          let width = img.width;
          let height = img.height;
          
          // Calculate aspect ratio and scale to fit
          const aspectRatio = width / height;
          if (width > targetWidth) {
            width = targetWidth;
            height = width / aspectRatio;
          }
          if (height > targetHeight) {
            height = targetHeight;
            width = height * aspectRatio;
          }
          
          // Apply 2x scale for retina-quality output
          canvas.width = width * scale;
          canvas.height = height * scale;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            // Enable image smoothing for better quality
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.scale(scale, scale);
            ctx.drawImage(img, 0, 0, width, height);
            // Use high quality JPEG
            resolve(canvas.toDataURL('image/jpeg', 0.95));
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

      // Export the PDF using native share on mobile
      const fileName = `${meal.name.replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ\s]/g, '').replace(/\s+/g, '_')}.pdf`;
      await exportPDF(doc, fileName);
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
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg max-h-[85vh] overflow-y-auto overflow-x-hidden p-0 rounded-2xl border-2 border-primary/20">
        <div className="p-4 sm:p-6">
          {meal.image_url && (
            <div className="relative -m-4 sm:-m-6 mb-4 h-40 sm:h-56 overflow-hidden rounded-t-2xl">
              <img 
                src={meal.image_url} 
                alt={meal.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4">
                <Badge variant="secondary" className="mb-1.5 backdrop-blur-sm bg-background/80 text-xs">
                  {mealTypeLabel}
                </Badge>
                <DialogTitle className="text-xl sm:text-2xl text-white drop-shadow-lg line-clamp-2">{meal.name}</DialogTitle>
              </div>
              <Button
                variant="secondary"
                size="icon"
                onClick={exportToPDF}
                className="absolute top-3 right-3 h-8 w-8 backdrop-blur-sm bg-background/80 hover:bg-background"
                title={language === 'es' ? "Compartir receta" : "Share recipe"}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          {!meal.image_url && (
            <DialogHeader className="pb-2">
              <div className="flex items-center justify-between gap-2 mb-2">
                <Badge variant="secondary" className="text-xs">{mealTypeLabel}</Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportToPDF}
                  className="gap-1.5 h-8 text-xs"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  PDF
                </Button>
              </div>
              <DialogTitle className="text-xl">{meal.name}</DialogTitle>
            </DialogHeader>
          )}

          <p className="text-muted-foreground text-sm mt-3">{meal.description}</p>

          <Separator className="my-4" />

          {/* Información Nutricional */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
              <Flame className="h-4 w-4 text-primary" />
              {t('mealDetail.nutritionalInfo')}
            </h3>
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-2 text-center">
                <Flame className="h-4 w-4 mx-auto mb-0.5 text-orange-500" />
                <p className="text-lg font-bold">{meal.calories || 0}</p>
                <p className="text-[10px] text-muted-foreground">{t('mealDetail.calories')}</p>
              </div>
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-2 text-center">
                <Beef className="h-4 w-4 mx-auto mb-0.5 text-red-500" />
                <p className="text-lg font-bold">{meal.protein || 0}g</p>
                <p className="text-[10px] text-muted-foreground">{t('mealDetail.protein')}</p>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-2 text-center">
                <Cookie className="h-4 w-4 mx-auto mb-0.5 text-yellow-500" />
                <p className="text-lg font-bold">{meal.carbs || 0}g</p>
                <p className="text-[10px] text-muted-foreground">{t('mealDetail.carbs')}</p>
              </div>
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-2 text-center">
                <Apple className="h-4 w-4 mx-auto mb-0.5 text-green-500" />
                <p className="text-lg font-bold">{meal.fats || 0}g</p>
                <p className="text-[10px] text-muted-foreground">{t('mealDetail.fats')}</p>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Beneficios */}
          <div className="bg-primary/5 border border-primary/10 rounded-xl p-3">
            <h3 className="font-semibold mb-1.5 text-sm text-primary">{t('mealDetail.benefits')}</h3>
            <p className="text-xs text-muted-foreground">{meal.benefits}</p>
          </div>

          {/* Ingredientes */}
          {meal.ingredients && meal.ingredients.length > 0 && (
            <>
              <Separator className="my-4" />
              <div>
                <h3 className="font-semibold mb-2 text-sm">{t('mealDetail.ingredients')}</h3>
                <ul className="space-y-1.5">
                  {meal.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary mt-0.5 shrink-0">•</span>
                      <span className="text-xs break-words min-w-0">{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {/* Preparación */}
          {meal.steps && meal.steps.length > 0 && (
            <>
              <Separator className="my-4" />
              <div>
                <h3 className="font-semibold mb-2 text-sm">{t('mealDetail.steps')}</h3>
                <ol className="space-y-2">
                  {meal.steps.map((step, index) => (
                    <li key={index} className="flex gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                        {index + 1}
                      </span>
                      <span className="text-xs flex-1 min-w-0 break-words">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <Separator className="my-4" />
          <DialogFooter className="flex-col gap-2 p-0">
            {/* Step by Step Button - Primary Action */}
            {meal.steps && meal.steps.length > 0 && (
              <Button
                onClick={() => setStepByStepOpen(true)}
                className="w-full h-12 rounded-xl text-base font-semibold gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-lg"
              >
                <Play className="h-5 w-5" />
                {language === 'es' ? "Ver paso a paso" : "View step by step"}
              </Button>
            )}
            
            <div className="flex gap-2 w-full">
              {meal.image_url && (
                <Button
                  variant="outline"
                  onClick={exportToPDF}
                  className="flex-1 gap-2 h-10 rounded-xl"
                >
                  <Share2 className="h-4 w-4" />
                  PDF
                </Button>
              )}
              {onSwapMeal && (
                <Button
                  variant="outline"
                  onClick={() => onSwapMeal(meal.id)}
                  disabled={!canSwap}
                  className="flex-1 h-10 rounded-xl"
                >
                  {!canSwap && <Lock className="mr-1 h-4 w-4" />}
                  <ArrowLeftRight className="mr-1 h-4 w-4" />
                  {t('mealDetail.swapMeal')}
                </Button>
              )}
            </div>
          </DialogFooter>
        </div>

        {/* Step by Step Dialog */}
        {meal.steps && meal.steps.length > 0 && (
          <StepByStepDialog
            open={stepByStepOpen}
            onOpenChange={setStepByStepOpen}
            steps={meal.steps}
            mealName={meal.name}
            mealImage={meal.image_url}
            ingredients={meal.ingredients}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
