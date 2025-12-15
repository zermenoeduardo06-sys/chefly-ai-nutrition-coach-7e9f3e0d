import { useState, useRef } from 'react';
import { Camera, Upload, X, Loader2, Utensils, Flame, Beef, Wheat, Droplets } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFoodScanner, FoodAnalysisResult } from '@/hooks/useFoodScanner';
import { motion, AnimatePresence } from 'framer-motion';
import { Capacitor } from '@capacitor/core';

interface FoodScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FoodScanner({ open, onOpenChange }: FoodScannerProps) {
  const { language } = useLanguage();
  const { analyzeFood, isAnalyzing, result, clearResult } = useFoodScanner();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setPreviewImage(base64);
      await analyzeFood(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleClose = () => {
    setPreviewImage(null);
    clearResult();
    onOpenChange(false);
  };

  const handleNewScan = () => {
    setPreviewImage(null);
    clearResult();
  };

  const t = {
    title: language === 'es' ? 'Escáner de Comida' : 'Food Scanner',
    takePhoto: language === 'es' ? 'Tomar Foto' : 'Take Photo',
    uploadImage: language === 'es' ? 'Subir Imagen' : 'Upload Image',
    analyzing: language === 'es' ? 'Analizando...' : 'Analyzing...',
    scanAgain: language === 'es' ? 'Escanear Otra' : 'Scan Another',
    calories: language === 'es' ? 'Calorías' : 'Calories',
    protein: language === 'es' ? 'Proteína' : 'Protein',
    carbs: language === 'es' ? 'Carbohidratos' : 'Carbs',
    fat: language === 'es' ? 'Grasa' : 'Fat',
    fiber: language === 'es' ? 'Fibra' : 'Fiber',
    confidence: language === 'es' ? 'Confianza' : 'Confidence',
    high: language === 'es' ? 'Alta' : 'High',
    medium: language === 'es' ? 'Media' : 'Medium',
    low: language === 'es' ? 'Baja' : 'Low',
    foods: language === 'es' ? 'Alimentos identificados' : 'Foods identified',
    portion: language === 'es' ? 'Porción estimada' : 'Estimated portion',
    notes: language === 'es' ? 'Notas' : 'Notes',
    instructions: language === 'es' 
      ? 'Toma una foto clara de tu comida para obtener información nutricional estimada'
      : 'Take a clear photo of your food to get estimated nutritional information',
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const getConfidenceText = (confidence: string) => {
    switch (confidence) {
      case 'high': return t.high;
      case 'medium': return t.medium;
      case 'low': return t.low;
      default: return confidence;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-primary" />
            {t.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview Image or Upload Area */}
          {previewImage ? (
            <div className="relative rounded-xl overflow-hidden">
              <img 
                src={previewImage} 
                alt="Food preview" 
                className="w-full h-48 object-cover"
              />
              {isAnalyzing && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-sm font-medium">{t.analyzing}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="border-2 border-dashed border-muted-foreground/30 rounded-xl p-6 text-center">
              <Utensils className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground mb-4">{t.instructions}</p>
              
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={() => cameraInputRef.current?.click()}
                  className="gap-2"
                >
                  <Camera className="h-4 w-4" />
                  {t.takePhoto}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {t.uploadImage}
                </Button>
              </div>
            </div>
          )}

          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Results */}
          <AnimatePresence>
            {result && result.success && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {/* Dish Name */}
                <div className="text-center">
                  <h3 className="text-lg font-bold text-foreground">{result.dish_name}</h3>
                  {result.confidence && (
                    <span className={`text-xs ${getConfidenceColor(result.confidence)}`}>
                      {t.confidence}: {getConfidenceText(result.confidence)}
                    </span>
                  )}
                </div>

                {/* Nutrition Grid */}
                {result.nutrition && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-orange-500/10 rounded-xl p-3 text-center">
                      <Flame className="h-5 w-5 mx-auto text-orange-500 mb-1" />
                      <div className="text-xl font-bold text-orange-500">{result.nutrition.calories}</div>
                      <div className="text-xs text-muted-foreground">{t.calories}</div>
                    </div>
                    <div className="bg-red-500/10 rounded-xl p-3 text-center">
                      <Beef className="h-5 w-5 mx-auto text-red-500 mb-1" />
                      <div className="text-xl font-bold text-red-500">{result.nutrition.protein}g</div>
                      <div className="text-xs text-muted-foreground">{t.protein}</div>
                    </div>
                    <div className="bg-amber-500/10 rounded-xl p-3 text-center">
                      <Wheat className="h-5 w-5 mx-auto text-amber-500 mb-1" />
                      <div className="text-xl font-bold text-amber-500">{result.nutrition.carbs}g</div>
                      <div className="text-xs text-muted-foreground">{t.carbs}</div>
                    </div>
                    <div className="bg-blue-500/10 rounded-xl p-3 text-center">
                      <Droplets className="h-5 w-5 mx-auto text-blue-500 mb-1" />
                      <div className="text-xl font-bold text-blue-500">{result.nutrition.fat}g</div>
                      <div className="text-xs text-muted-foreground">{t.fat}</div>
                    </div>
                  </div>
                )}

                {/* Foods Identified */}
                {result.foods_identified && result.foods_identified.length > 0 && (
                  <div className="bg-muted/50 rounded-xl p-3">
                    <div className="text-xs font-medium text-muted-foreground mb-1">{t.foods}</div>
                    <div className="flex flex-wrap gap-1">
                      {result.foods_identified.map((food, idx) => (
                        <span key={idx} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                          {food}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Portion Estimate */}
                {result.portion_estimate && (
                  <div className="bg-muted/50 rounded-xl p-3">
                    <div className="text-xs font-medium text-muted-foreground mb-1">{t.portion}</div>
                    <div className="text-sm">{result.portion_estimate}</div>
                  </div>
                )}

                {/* Notes */}
                {result.notes && (
                  <div className="bg-muted/50 rounded-xl p-3">
                    <div className="text-xs font-medium text-muted-foreground mb-1">{t.notes}</div>
                    <div className="text-sm text-muted-foreground">{result.notes}</div>
                  </div>
                )}

                {/* Scan Again Button */}
                <Button onClick={handleNewScan} variant="outline" className="w-full gap-2">
                  <Camera className="h-4 w-4" />
                  {t.scanAgain}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error State */}
          {result && !result.success && (
            <div className="text-center py-4">
              <p className="text-destructive text-sm mb-4">{result.error}</p>
              <Button onClick={handleNewScan} variant="outline" className="gap-2">
                <Camera className="h-4 w-4" />
                {t.scanAgain}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
