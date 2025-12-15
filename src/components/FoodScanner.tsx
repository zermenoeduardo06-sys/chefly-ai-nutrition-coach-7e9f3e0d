import { useState, useRef } from 'react';
import { Camera, Upload, Loader2, Utensils, Flame, Beef, Wheat, Droplets, Save, Check, Sparkles, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFoodScanner } from '@/hooks/useFoodScanner';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FoodScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FoodScanner({ open, onOpenChange }: FoodScannerProps) {
  const { language } = useLanguage();
  const { toast } = useToast();
  const { analyzeFood, isAnalyzing, result, clearResult } = useFoodScanner();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
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
    setSaved(false);
    onOpenChange(false);
  };

  const handleNewScan = () => {
    setPreviewImage(null);
    clearResult();
    setSaved(false);
  };

  // Convert base64 to blob for upload
  const base64ToBlob = (base64: string): Blob => {
    const parts = base64.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }
    return new Blob([uInt8Array], { type: contentType });
  };

  const handleSave = async () => {
    if (!result || !result.success || !result.nutrition) return;

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let imageUrl: string | null = null;

      // Upload image to Storage if we have a preview
      if (previewImage) {
        const blob = base64ToBlob(previewImage);
        const fileName = `${user.id}/${Date.now()}.jpg`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('food-scans')
          .upload(fileName, blob, {
            contentType: 'image/jpeg',
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('food-scans')
            .getPublicUrl(uploadData.path);
          imageUrl = publicUrl;
        }
      }

      const { error } = await supabase
        .from('food_scans')
        .insert({
          user_id: user.id,
          dish_name: result.dish_name || 'Unknown',
          foods_identified: result.foods_identified || [],
          portion_estimate: result.portion_estimate,
          calories: result.nutrition.calories || 0,
          protein: result.nutrition.protein || 0,
          carbs: result.nutrition.carbs || 0,
          fat: result.nutrition.fat || 0,
          fiber: result.nutrition.fiber || 0,
          confidence: result.confidence || 'medium',
          notes: result.notes,
          image_url: imageUrl,
        });

      if (error) throw error;

      setSaved(true);
      toast({
        title: language === 'es' ? '¡Guardado!' : 'Saved!',
        description: language === 'es' 
          ? 'El escaneo se agregó a tu historial'
          : 'The scan was added to your history',
      });
    } catch (error) {
      console.error('Error saving scan:', error);
      toast({
        title: language === 'es' ? 'Error' : 'Error',
        description: language === 'es' ? 'No se pudo guardar el escaneo' : 'Could not save the scan',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const t = {
    title: language === 'es' ? 'Escáner de Comida' : 'Food Scanner',
    takePhoto: language === 'es' ? 'Cámara' : 'Camera',
    uploadImage: language === 'es' ? 'Galería' : 'Gallery',
    analyzing: language === 'es' ? 'Analizando tu comida...' : 'Analyzing your food...',
    scanAgain: language === 'es' ? 'Nueva foto' : 'New photo',
    save: language === 'es' ? 'Guardar' : 'Save',
    saving: language === 'es' ? 'Guardando...' : 'Saving...',
    saved: language === 'es' ? '¡Guardado!' : 'Saved!',
    calories: language === 'es' ? 'kcal' : 'kcal',
    protein: language === 'es' ? 'Proteína' : 'Protein',
    carbs: language === 'es' ? 'Carbos' : 'Carbs',
    fat: language === 'es' ? 'Grasa' : 'Fat',
    fiber: language === 'es' ? 'Fibra' : 'Fiber',
    confidence: language === 'es' ? 'Precisión' : 'Accuracy',
    high: language === 'es' ? 'Alta' : 'High',
    medium: language === 'es' ? 'Media' : 'Medium',
    low: language === 'es' ? 'Baja' : 'Low',
    foods: language === 'es' ? 'Identificados' : 'Identified',
    portion: language === 'es' ? 'Porción' : 'Portion',
    notes: language === 'es' ? 'Notas' : 'Notes',
    instructions: language === 'es' 
      ? 'Toma una foto de tu comida y obtén la información nutricional al instante'
      : 'Take a photo of your food and get nutritional info instantly',
    aiPowered: language === 'es' ? 'Powered by AI' : 'Powered by AI',
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'bg-green-500';
      case 'medium': return 'bg-amber-500';
      case 'low': return 'bg-red-500';
      default: return 'bg-muted';
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
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto p-0 gap-0 border-0 bg-gradient-to-b from-primary/5 to-background">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-primary via-primary to-orange-500 p-6 pb-8 rounded-t-lg">
          <div className="absolute top-3 right-3">
            <span className="flex items-center gap-1 text-xs text-white/80 bg-white/20 rounded-full px-2 py-1">
              <Sparkles className="h-3 w-3" />
              {t.aiPowered}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <div className="p-3 bg-white/20 rounded-2xl">
              <Utensils className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{t.title}</h2>
              <p className="text-white/80 text-sm">{t.instructions}</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4 -mt-4">
          {/* Preview Image or Upload Area */}
          {previewImage ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative rounded-2xl overflow-hidden shadow-lg border-4 border-white bg-white"
            >
              <img 
                src={previewImage} 
                alt="Food preview" 
                className="w-full h-52 object-cover"
              />
              {isAnalyzing && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                      <div className="h-16 w-16 rounded-full border-4 border-white/30 border-t-white animate-spin" />
                      <Utensils className="h-6 w-6 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <span className="text-white font-medium">{t.analyzing}</span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 shadow-lg border-2 border-dashed border-primary/30"
            >
              <div className="text-center">
                <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Camera className="h-10 w-10 text-primary" />
                </div>
                
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={() => cameraInputRef.current?.click()}
                    size="lg"
                    className="gap-2 rounded-xl shadow-md"
                  >
                    <Camera className="h-5 w-5" />
                    {t.takePhoto}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2 rounded-xl border-2"
                  >
                    <Upload className="h-5 w-5" />
                    {t.uploadImage}
                  </Button>
                </div>
              </div>
            </motion.div>
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
                className="space-y-3"
              >
                {/* Dish Name & Confidence */}
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-foreground">{result.dish_name}</h3>
                      {result.portion_estimate && (
                        <p className="text-sm text-muted-foreground mt-0.5">{result.portion_estimate}</p>
                      )}
                    </div>
                    {result.confidence && (
                      <span className={`text-xs text-white font-medium px-2.5 py-1 rounded-full ${getConfidenceColor(result.confidence)}`}>
                        {getConfidenceText(result.confidence)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Nutrition Grid - Calories prominent */}
                {result.nutrition && (
                  <div className="grid grid-cols-4 gap-2">
                    {/* Calories - Full width highlight */}
                    <div className="col-span-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-4 flex items-center justify-between shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-xl">
                          <Flame className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <div className="text-white/80 text-xs font-medium">Calorías</div>
                          <div className="text-3xl font-bold text-white">{result.nutrition.calories}</div>
                        </div>
                      </div>
                      <span className="text-white/80 text-lg font-medium">kcal</span>
                    </div>

                    {/* Macros */}
                    <div className="bg-red-50 rounded-xl p-3 text-center border border-red-100">
                      <Beef className="h-5 w-5 mx-auto text-red-500 mb-1" />
                      <div className="text-lg font-bold text-red-600">{result.nutrition.protein}g</div>
                      <div className="text-[10px] text-red-500/80 font-medium">{t.protein}</div>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-3 text-center border border-amber-100">
                      <Wheat className="h-5 w-5 mx-auto text-amber-500 mb-1" />
                      <div className="text-lg font-bold text-amber-600">{result.nutrition.carbs}g</div>
                      <div className="text-[10px] text-amber-500/80 font-medium">{t.carbs}</div>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-100">
                      <Droplets className="h-5 w-5 mx-auto text-blue-500 mb-1" />
                      <div className="text-lg font-bold text-blue-600">{result.nutrition.fat}g</div>
                      <div className="text-[10px] text-blue-500/80 font-medium">{t.fat}</div>
                    </div>
                    <div className="bg-green-50 rounded-xl p-3 text-center border border-green-100">
                      <Leaf className="h-5 w-5 mx-auto text-green-500 mb-1" />
                      <div className="text-lg font-bold text-green-600">{result.nutrition.fiber || 0}g</div>
                      <div className="text-[10px] text-green-500/80 font-medium">{t.fiber}</div>
                    </div>
                  </div>
                )}

                {/* Foods Identified */}
                {result.foods_identified && result.foods_identified.length > 0 && (
                  <div className="bg-white rounded-2xl p-4 shadow-sm">
                    <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">{t.foods}</div>
                    <div className="flex flex-wrap gap-2">
                      {result.foods_identified.map((food, idx) => (
                        <motion.span 
                          key={idx} 
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          className="bg-primary/10 text-primary text-sm px-3 py-1.5 rounded-full font-medium"
                        >
                          {food}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {result.notes && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                    <div className="text-xs font-semibold text-amber-700 mb-1 uppercase tracking-wide">{t.notes}</div>
                    <div className="text-sm text-amber-800">{result.notes}</div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button 
                    onClick={handleSave} 
                    disabled={isSaving || saved}
                    size="lg"
                    className={`flex-1 gap-2 rounded-xl shadow-md text-base ${saved ? 'bg-green-500 hover:bg-green-500' : ''}`}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        {t.saving}
                      </>
                    ) : saved ? (
                      <>
                        <Check className="h-5 w-5" />
                        {t.saved}
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5" />
                        {t.save}
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={handleNewScan} 
                    variant="outline" 
                    size="lg"
                    className="gap-2 rounded-xl border-2"
                  >
                    <Camera className="h-5 w-5" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error State */}
          {result && !result.success && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center"
            >
              <p className="text-red-600 text-sm mb-4">{result.error}</p>
              <Button onClick={handleNewScan} variant="outline" className="gap-2 rounded-xl">
                <Camera className="h-4 w-4" />
                {t.scanAgain}
              </Button>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
