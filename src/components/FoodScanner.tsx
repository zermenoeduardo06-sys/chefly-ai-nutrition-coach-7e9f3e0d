import { useState, useRef } from 'react';
import { Camera, Upload, Loader2, Utensils, Flame, Beef, Wheat, Droplets, Save, Check, Sparkles, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFoodScanner } from '@/hooks/useFoodScanner';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import cheflyMascot from '@/assets/chefly-mascot.png';
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
          calories: Math.round(result.nutrition.calories || 0),
          protein: Math.round(result.nutrition.protein || 0),
          carbs: Math.round(result.nutrition.carbs || 0),
          fat: Math.round(result.nutrition.fat || 0),
          fiber: Math.round(result.nutrition.fiber || 0),
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
      <DialogContent className="w-[90vw] sm:w-[384px] max-w-[384px] max-h-[80vh] overflow-y-auto overflow-x-hidden p-0 gap-0 border-0 rounded-3xl bg-gradient-to-b from-background to-muted/30 shadow-2xl">
        {/* Header with Mascot */}
        <div className="relative bg-gradient-to-br from-primary via-primary to-orange-500 p-5 pb-6 rounded-t-3xl overflow-visible">
          <div className="absolute top-4 right-12">
            <span className="flex items-center gap-1 text-xs text-white/90 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 font-medium">
              <Sparkles className="h-3 w-3" />
              {t.aiPowered}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <motion.img 
              src={cheflyMascot} 
              alt="Chefly" 
              className="h-20 w-20 object-contain drop-shadow-lg"
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">{t.title}</h2>
              <p className="text-white/90 text-sm mt-0.5">{t.instructions}</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Preview Image or Upload Area */}
          {previewImage ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative rounded-3xl overflow-hidden shadow-xl ring-4 ring-white bg-white"
            >
              <img 
                src={previewImage} 
                alt="Food preview" 
                className="w-full h-56 object-cover"
              />
              {isAnalyzing && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-black/40 backdrop-blur-sm flex items-center justify-center"
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <div className="h-20 w-20 rounded-full border-4 border-white/20 border-t-white animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                          <Utensils className="h-7 w-7 text-white" />
                        </div>
                      </div>
                    </div>
                    <span className="text-white font-semibold text-lg">{t.analyzing}</span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 shadow-lg border-2 border-dashed border-primary/40"
            >
              <div className="text-center">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center mb-5 shadow-inner">
                  <Camera className="h-12 w-12 text-primary" />
                </div>
                
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={() => cameraInputRef.current?.click()}
                    size="lg"
                    className="gap-2 rounded-2xl shadow-lg px-6 h-12 font-semibold"
                  >
                    <Camera className="h-5 w-5" />
                    {t.takePhoto}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2 rounded-2xl border-2 px-6 h-12 font-semibold hover:bg-muted/50"
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
                <div className="bg-white rounded-3xl p-5 shadow-md border border-border/50">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground">{result.dish_name}</h3>
                      {result.portion_estimate && (
                        <p className="text-sm text-muted-foreground mt-1">{result.portion_estimate}</p>
                      )}
                    </div>
                    {result.confidence && (
                      <span className={`text-xs text-white font-semibold px-3 py-1.5 rounded-full shadow-sm ${getConfidenceColor(result.confidence)}`}>
                        {getConfidenceText(result.confidence)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Nutrition Grid - Calories prominent */}
                {result.nutrition && (
                  <div className="space-y-3">
                    {/* Calories - Full width highlight */}
                    <div className="bg-gradient-to-r from-orange-500 via-orange-500 to-amber-400 rounded-3xl p-5 flex items-center justify-between shadow-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/25 backdrop-blur-sm rounded-2xl shadow-inner">
                          <Flame className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <div className="text-white/90 text-sm font-medium">Calorías</div>
                          <div className="text-4xl font-bold text-white tracking-tight">{result.nutrition.calories}</div>
                        </div>
                      </div>
                      <span className="text-white/90 text-xl font-semibold">kcal</span>
                    </div>

                    {/* Macros */}
                    <div className="grid grid-cols-4 gap-2">
                      <div className="bg-gradient-to-b from-red-50 to-red-100/50 rounded-2xl p-3 text-center border border-red-100 shadow-sm">
                        <div className="w-10 h-10 mx-auto bg-red-100 rounded-xl flex items-center justify-center mb-2">
                          <Beef className="h-5 w-5 text-red-500" />
                        </div>
                        <div className="text-xl font-bold text-red-600">{result.nutrition.protein}g</div>
                        <div className="text-[10px] text-red-500 font-semibold mt-0.5">{t.protein}</div>
                      </div>
                      <div className="bg-gradient-to-b from-amber-50 to-amber-100/50 rounded-2xl p-3 text-center border border-amber-100 shadow-sm">
                        <div className="w-10 h-10 mx-auto bg-amber-100 rounded-xl flex items-center justify-center mb-2">
                          <Wheat className="h-5 w-5 text-amber-500" />
                        </div>
                        <div className="text-xl font-bold text-amber-600">{result.nutrition.carbs}g</div>
                        <div className="text-[10px] text-amber-500 font-semibold mt-0.5">{t.carbs}</div>
                      </div>
                      <div className="bg-gradient-to-b from-blue-50 to-blue-100/50 rounded-2xl p-3 text-center border border-blue-100 shadow-sm">
                        <div className="w-10 h-10 mx-auto bg-blue-100 rounded-xl flex items-center justify-center mb-2">
                          <Droplets className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="text-xl font-bold text-blue-600">{result.nutrition.fat}g</div>
                        <div className="text-[10px] text-blue-500 font-semibold mt-0.5">{t.fat}</div>
                      </div>
                      <div className="bg-gradient-to-b from-green-50 to-green-100/50 rounded-2xl p-3 text-center border border-green-100 shadow-sm">
                        <div className="w-10 h-10 mx-auto bg-green-100 rounded-xl flex items-center justify-center mb-2">
                          <Leaf className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="text-xl font-bold text-green-600">{result.nutrition.fiber || 0}g</div>
                        <div className="text-[10px] text-green-500 font-semibold mt-0.5">{t.fiber}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Foods Identified */}
                {result.foods_identified && result.foods_identified.length > 0 && (
                  <div className="bg-white rounded-3xl p-5 shadow-md border border-border/50">
                    <div className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">{t.foods}</div>
                    <div className="flex flex-wrap gap-2">
                      {result.foods_identified.map((food, idx) => (
                        <motion.span 
                          key={idx} 
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          className="bg-gradient-to-r from-primary/15 to-primary/10 text-primary text-sm px-4 py-2 rounded-full font-semibold border border-primary/20"
                        >
                          {food}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {result.notes && (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 rounded-3xl p-5 shadow-sm">
                    <div className="text-xs font-bold text-amber-700 mb-2 uppercase tracking-wider">{t.notes}</div>
                    <div className="text-sm text-amber-800 leading-relaxed">{result.notes}</div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-3">
                  <Button 
                    onClick={handleSave} 
                    disabled={isSaving || saved}
                    size="lg"
                    className={`flex-1 gap-2 rounded-2xl shadow-lg text-base h-14 font-semibold transition-all ${
                      saved 
                        ? 'bg-green-500 hover:bg-green-500 shadow-green-200' 
                        : 'shadow-primary/30'
                    }`}
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
                    className="gap-2 rounded-2xl border-2 h-14 w-14 p-0 hover:bg-muted/50"
                  >
                    <Camera className="h-6 w-6" />
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
              className="bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200 rounded-3xl p-8 text-center shadow-sm"
            >
              <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Utensils className="h-8 w-8 text-red-400" />
              </div>
              <p className="text-red-600 text-sm mb-5 font-medium">{result.error}</p>
              <Button onClick={handleNewScan} className="gap-2 rounded-2xl px-6 h-12">
                <Camera className="h-5 w-5" />
                {t.scanAgain}
              </Button>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
