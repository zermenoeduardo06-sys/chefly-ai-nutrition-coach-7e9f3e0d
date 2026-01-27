import { useState, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, ImagePlus, X, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import mascotLime from '@/assets/mascot-lime.png';

interface Meal {
  id: string;
  name: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  ingredients?: string[];
}

interface MealPhotoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meal: Meal | null;
  selectedDate?: string; // YYYY-MM-DD format
  onPhotoSaved: (mealId: string) => void;
}

export function MealPhotoDialog({ open, onOpenChange, meal, selectedDate, onPhotoSaved }: MealPhotoDialogProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const { language } = useLanguage();
  const { toast } = useToast();

  const t = {
    title: language === 'es' ? '¡Toma una foto!' : 'Take a photo!',
    subtitle: language === 'es' ? 'Fotografía tu comida para completarla' : 'Photograph your meal to complete it',
    camera: language === 'es' ? 'Cámara' : 'Camera',
    gallery: language === 'es' ? 'Galería' : 'Gallery',
    confirm: language === 'es' ? 'Confirmar y Completar' : 'Confirm & Complete',
    retake: language === 'es' ? 'Tomar otra' : 'Retake',
    saving: language === 'es' ? 'Guardando...' : 'Saving...',
    success: language === 'es' ? '¡Comida registrada!' : 'Meal logged!',
    successDesc: language === 'es' ? 'Se guardó en tu historial' : 'Saved to your history',
    error: language === 'es' ? 'Error al guardar' : 'Error saving',
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleClose = () => {
    setPreview(null);
    onOpenChange(false);
  };

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

  const handleConfirm = async () => {
    if (!preview || !meal) return;

    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No user');
      }

      // Upload image to storage
      const blob = base64ToBlob(preview);
      const fileName = `${user.id}/${Date.now()}_meal.jpg`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('food-scans')
        .upload(fileName, blob, { contentType: 'image/jpeg' });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('food-scans')
        .getPublicUrl(fileName);

      // Construct scanned_at using selectedDate (or now if not provided)
      const now = new Date();
      let scannedAt: Date;
      if (selectedDate) {
        const [year, month, day] = selectedDate.split('-').map(Number);
        scannedAt = new Date(year, month - 1, day, now.getHours(), now.getMinutes(), now.getSeconds());
      } else {
        scannedAt = now;
      }

      // Save to food_scans with meal nutrition data (no AI)
      // IMPORTANT: Round ALL numeric values to integers to prevent "22P02" errors
      const { error: insertError } = await supabase
        .from('food_scans')
        .insert({
          user_id: user.id,
          dish_name: meal.name || 'Unknown meal',
          foods_identified: meal.ingredients || [],
          calories: Math.round(Number(meal.calories) || 0),
          protein: Math.round(Number(meal.protein) || 0),
          carbs: Math.round(Number(meal.carbs) || 0),
          fat: Math.round(Number(meal.fats) || 0),
          fiber: 0,
          confidence: 'high',
          notes: language === 'es' ? 'Comida del plan semanal' : 'Meal from weekly plan',
          image_url: publicUrl,
          portion_estimate: language === 'es' ? '1 porción' : '1 serving',
          scanned_at: scannedAt.toISOString(),
        });

      if (insertError) throw insertError;

      toast({
        title: t.success,
        description: t.successDesc,
      });

      // Trigger the meal completion
      onPhotoSaved(meal.id);
      handleClose();

    } catch (error) {
      console.error('Error saving meal photo:', error);
      toast({
        variant: 'destructive',
        title: t.error,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-background border-0 rounded-3xl">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-primary via-primary/95 to-orange-500 p-5 pb-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
          
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 text-white/80 hover:text-white hover:bg-white/20 rounded-xl z-10"
            onClick={handleClose}
          >
            <X className="h-5 w-5" />
          </Button>

          <div className="relative z-10 flex items-center gap-3">
            <motion.div 
              className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <img src={mascotLime} alt="Chefly" className="h-9 w-9 object-contain" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold text-white">{t.title}</h2>
              <p className="text-white/70 text-sm">{t.subtitle}</p>
            </div>
          </div>

          {meal && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 bg-white/15 backdrop-blur-sm rounded-xl p-3 border border-white/10"
            >
              <p className="text-white font-semibold text-sm line-clamp-1">{meal.name}</p>
              {meal.calories && (
                <p className="text-white/60 text-xs mt-0.5">{meal.calories} kcal</p>
              )}
            </motion.div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <AnimatePresence mode="wait">
            {!preview ? (
              <motion.div
                key="buttons"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-2 gap-3"
              >
                <Button
                  variant="outline"
                  className="h-24 flex-col gap-2 rounded-2xl border-2 border-dashed border-primary/30 hover:border-primary hover:bg-primary/5"
                  onClick={() => cameraRef.current?.click()}
                >
                  <Camera className="h-8 w-8 text-primary" />
                  <span className="text-sm font-medium">{t.camera}</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-24 flex-col gap-2 rounded-2xl border-2 border-dashed border-primary/30 hover:border-primary hover:bg-primary/5"
                  onClick={() => galleryRef.current?.click()}
                >
                  <ImagePlus className="h-8 w-8 text-primary" />
                  <span className="text-sm font-medium">{t.gallery}</span>
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="space-y-4"
              >
                <div className="relative rounded-2xl overflow-hidden aspect-square">
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl h-12"
                    onClick={() => setPreview(null)}
                    disabled={saving}
                  >
                    {t.retake}
                  </Button>
                  <Button
                    className="flex-1 rounded-xl h-12 bg-gradient-to-r from-primary to-orange-500 gap-2"
                    onClick={handleConfirm}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t.saving}
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        {t.confirm}
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Hidden file inputs */}
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileSelect}
        />
        <input
          ref={galleryRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
      </DialogContent>
    </Dialog>
  );
}
