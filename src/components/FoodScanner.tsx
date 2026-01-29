import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Loader2, Utensils, Flame, Beef, Wheat, Droplets, Save, Check, Sparkles, Leaf, Lock, Crown, X, Scan, Zap, ChefHat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFoodScanner } from '@/hooks/useFoodScanner';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import mascotLime from '@/assets/mascot-lime.png';
import { InfoTooltip } from '@/components/InfoTooltip';
import { useInvalidateFoodIntake } from '@/hooks/useDailyFoodIntake';

interface FoodScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mealType?: string;
  selectedDate?: string; // YYYY-MM-DD format
  onSaveSuccess?: () => void;
}

export function FoodScanner({ open, onOpenChange, mealType, selectedDate, onSaveSuccess }: FoodScannerProps) {
  const { language } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { analyzeFood, isAnalyzing, result, clearResult } = useFoodScanner();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { limits, refreshLimits } = useSubscriptionLimits(userId);
  const invalidateFoodIntake = useInvalidateFoodIntake();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    if (open) getUser();
  }, [open]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!limits.canScanFood) {
      toast({
        title: language === 'es' ? 'Límite alcanzado' : 'Limit reached',
        description: language === 'es' 
          ? 'Ya usaste tu escaneo gratuito de hoy. Mejora a Chefly Plus para acceso premium.'
          : 'You already used your free scan today. Upgrade to Chefly Plus for premium access.',
        variant: 'destructive',
      });
      return;
    }

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

      // Construct scanned_at using selectedDate (or now if not provided)
      const now = new Date();
      let scannedAt: Date;
      if (selectedDate) {
        const [year, month, day] = selectedDate.split('-').map(Number);
        scannedAt = new Date(year, month - 1, day, now.getHours(), now.getMinutes(), now.getSeconds());
      } else {
        scannedAt = now;
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
          meal_type: mealType || null,
          scanned_at: scannedAt.toISOString(),
        });

      if (error) throw error;

      setSaved(true);
      refreshLimits();
      invalidateFoodIntake();
      onSaveSuccess?.();
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
    title: language === 'es' ? 'Escáner AI' : 'AI Scanner',
    subtitle: language === 'es' ? 'Nutrición instantánea' : 'Instant nutrition',
    takePhoto: language === 'es' ? 'Cámara' : 'Camera',
    uploadImage: language === 'es' ? 'Galería' : 'Gallery',
    analyzing: language === 'es' ? 'Analizando...' : 'Analyzing...',
    scanAgain: language === 'es' ? 'Escanear otra' : 'Scan another',
    save: language === 'es' ? 'Guardar en historial' : 'Save to history',
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
    foods: language === 'es' ? 'Ingredientes detectados' : 'Detected ingredients',
    portion: language === 'es' ? 'Porción' : 'Portion',
    notes: language === 'es' ? 'Notas del chef' : 'Chef notes',
    instructions: language === 'es' 
      ? 'Toma o sube una foto de tu comida'
      : 'Take or upload a photo of your food',
    aiPowered: language === 'es' ? 'IA Avanzada' : 'Advanced AI',
    limitReached: language === 'es' ? 'Límite alcanzado' : 'Limit reached',
    limitDesc: language === 'es' 
      ? 'Ya usaste tu escaneo gratuito de hoy'
      : 'You already used your free scan today',
    upgradeForUnlimited: language === 'es' 
      ? 'Desbloquea escaneos ilimitados'
      : 'Unlock unlimited scans',
    upgrade: language === 'es' ? 'Obtener Plus' : 'Get Plus',
    scansToday: language === 'es' ? 'usado hoy' : 'used today',
    scansTodayPlural: language === 'es' ? 'usados hoy' : 'used today',
    unlimited: language === 'es' ? 'Ilimitado' : 'Unlimited',
    tryAgain: language === 'es' ? 'Intentar de nuevo' : 'Try again',
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'from-emerald-500 to-green-500';
      case 'medium': return 'from-amber-500 to-yellow-500';
      case 'low': return 'from-red-500 to-orange-500';
      default: return 'from-muted to-muted';
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
      <DialogContent className="w-[95vw] sm:w-[420px] max-w-[420px] max-h-[90vh] overflow-y-auto overflow-x-hidden p-0 gap-0 border-0 rounded-[2rem] bg-background shadow-2xl">
        {/* Glassmorphism Header */}
        <div className="relative overflow-hidden">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-orange-500">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_50%)]" />
            <motion.div 
              className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
          </div>
          
          {/* Header content */}
          <div className="relative z-10 px-6 pt-8 pb-8">
            <div className="flex items-start gap-4">
              <motion.div 
                className="relative"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <img src={mascotLime} alt="Chefly" className="h-12 w-12 object-contain" />
                </div>
                <motion.div 
                  className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full flex items-center justify-center shadow-lg"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Zap className="h-3 w-3 text-white" />
                </motion.div>
              </motion.div>
              
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-bold text-white">{t.title}</h2>
                  <span className="flex items-center gap-1 text-[10px] text-white/90 bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5 font-semibold">
                    <Sparkles className="h-2.5 w-2.5" />
                    {t.aiPowered}
                  </span>
                  <InfoTooltip 
                    titleKey="tooltip.scanner.title"
                    contentKey="tooltip.scanner.content"
                    iconSize={14}
                    className="text-white/70 hover:text-white hover:bg-white/20"
                  />
                </div>
                <p className="text-white/80 text-sm">{t.instructions}</p>
              </div>
            </div>
          </div>

          {/* Wave decoration */}
          <div className="absolute bottom-0 left-0 right-0 h-6">
            <svg viewBox="0 0 1440 54" fill="none" preserveAspectRatio="none" className="w-full h-full">
              <path d="M0 54V0C240 40 480 50 720 45C960 40 1200 20 1440 0V54H0Z" className="fill-background" />
            </svg>
          </div>
        </div>

        <div className="px-5 pb-6 pt-2 space-y-4">
          {/* Preview Image or Upload Area */}
          <AnimatePresence mode="wait">
            {previewImage ? (
              <motion.div 
                key="preview"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="relative rounded-3xl overflow-hidden shadow-2xl ring-1 ring-border/50"
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
                    className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-black/40 backdrop-blur-sm flex items-center justify-center"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <motion.div 
                        className="relative"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <div className="h-16 w-16 rounded-full border-[3px] border-white/20 border-t-white" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            <Scan className="h-7 w-7 text-white" />
                          </motion.div>
                        </div>
                      </motion.div>
                      <span className="text-white font-semibold">{t.analyzing}</span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ) : !limits.canScanFood ? (
              /* Limit Reached State */
              <motion.div 
                key="limit"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/30 dark:via-orange-950/30 dark:to-yellow-950/30 rounded-3xl p-6 shadow-lg border border-amber-200/50 dark:border-amber-800/50"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-200/50 to-transparent rounded-bl-full" />
                <div className="relative text-center">
                  <motion.div 
                    className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-200 to-orange-200 dark:from-amber-800 dark:to-orange-800 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Lock className="h-10 w-10 text-amber-600 dark:text-amber-400" />
                  </motion.div>
                  
                  <h3 className="text-lg font-bold text-amber-800 dark:text-amber-200 mb-2">{t.limitReached}</h3>
                  <p className="text-amber-700 dark:text-amber-300 text-sm mb-4">{t.upgradeForUnlimited}</p>
                  
                  <Button
                    onClick={() => {
                      handleClose();
                      navigate('/pricing');
                    }}
                    size="lg"
                    className="gap-2 rounded-2xl shadow-lg px-8 h-12 font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
                  >
                    <Crown className="h-5 w-5" />
                    {t.upgrade}
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="relative overflow-hidden bg-gradient-to-br from-muted/50 to-muted/30 rounded-3xl p-8 border-2 border-dashed border-primary/30 hover:border-primary/50 transition-colors"
              >
                {/* Decorative elements */}
                <div className="absolute top-4 right-4 opacity-10">
                  <ChefHat className="h-24 w-24 text-primary" />
                </div>
                
                <div className="relative text-center">
                  <motion.div 
                    className="w-20 h-20 mx-auto bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mb-4 shadow-inner"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Camera className="h-10 w-10 text-primary" />
                  </motion.div>

                  {/* Show scan count for free users */}
                  {limits.isFreePlan && (
                    <div className="inline-flex items-center gap-2 bg-muted rounded-full px-4 py-1.5 mb-4">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <span className="text-xs text-muted-foreground font-medium">
                        {limits.foodScansUsed}/{limits.dailyFoodScanLimit} {t.scansToday}
                      </span>
                    </div>
                  )}
                  {limits.isCheflyPlus && (
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/20 to-orange-500/20 rounded-full px-4 py-1.5 mb-4">
                      <Crown className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs text-primary font-semibold">{t.unlimited}</span>
                    </div>
                  )}
                  
                  <div className="flex gap-3 justify-center">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={() => cameraInputRef.current?.click()}
                        size="lg"
                        className="gap-2 rounded-2xl shadow-lg px-6 h-12 font-semibold bg-gradient-to-r from-primary to-primary/90"
                      >
                        <Camera className="h-5 w-5" />
                        {t.takePhoto}
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => fileInputRef.current?.click()}
                        className="gap-2 rounded-2xl border-2 px-6 h-12 font-semibold hover:bg-primary/5"
                      >
                        <Upload className="h-5 w-5" />
                        {t.uploadImage}
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
                <div className="bg-card rounded-2xl p-4 shadow-md border border-border/50">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground">{result.dish_name}</h3>
                      {result.portion_estimate && (
                        <p className="text-sm text-muted-foreground mt-0.5">{result.portion_estimate}</p>
                      )}
                    </div>
                    {result.confidence && (
                      <span className={`text-xs text-white font-bold px-3 py-1.5 rounded-full shadow-sm bg-gradient-to-r ${getConfidenceColor(result.confidence)}`}>
                        {getConfidenceText(result.confidence)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Nutrition Grid - Modern Cards */}
                {result.nutrition && (
                  <div className="space-y-3">
                    {/* Calories - Hero Card */}
                    <motion.div 
                      className="bg-gradient-to-r from-orange-500 via-orange-500 to-amber-400 rounded-2xl p-4 flex items-center justify-between shadow-xl relative overflow-hidden"
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                      <div className="flex items-center gap-4 relative">
                        <div className="p-3 bg-white/25 backdrop-blur-sm rounded-xl">
                          <Flame className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <div className="text-white/80 text-xs font-medium uppercase tracking-wider">{language === 'es' ? 'Calorías' : 'Calories'}</div>
                          <div className="text-3xl font-black text-white">{result.nutrition.calories}</div>
                        </div>
                      </div>
                      <span className="text-white/80 text-lg font-bold relative">kcal</span>
                    </motion.div>

                    {/* Macros Grid */}
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { icon: Beef, value: result.nutrition.protein, label: t.protein, color: 'red' },
                        { icon: Wheat, value: result.nutrition.carbs, label: t.carbs, color: 'amber' },
                        { icon: Droplets, value: result.nutrition.fat, label: t.fat, color: 'blue' },
                        { icon: Leaf, value: result.nutrition.fiber || 0, label: t.fiber, color: 'green' },
                      ].map((macro, idx) => (
                        <motion.div
                          key={macro.label}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className={`bg-${macro.color}-50 dark:bg-${macro.color}-950/30 rounded-xl p-3 text-center border border-${macro.color}-100 dark:border-${macro.color}-900/50`}
                          style={{
                            backgroundColor: `var(--${macro.color}-50, hsl(var(--muted)))`,
                          }}
                        >
                          <div 
                            className="w-9 h-9 mx-auto rounded-lg flex items-center justify-center mb-1.5"
                            style={{
                              backgroundColor: `var(--${macro.color}-100, hsl(var(--muted)))`,
                            }}
                          >
                            <macro.icon className={`h-4 w-4 text-${macro.color}-500`} />
                          </div>
                          <div className={`text-lg font-bold text-${macro.color}-600 dark:text-${macro.color}-400`}>{macro.value}g</div>
                          <div className={`text-[9px] text-${macro.color}-500 font-semibold uppercase tracking-wide`}>{macro.label}</div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Foods Identified */}
                {result.foods_identified && result.foods_identified.length > 0 && (
                  <motion.div 
                    className="bg-card rounded-2xl p-4 shadow-md border border-border/50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
                      <Utensils className="h-3.5 w-3.5" />
                      {t.foods}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.foods_identified.map((food, idx) => (
                        <motion.span 
                          key={idx} 
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 + idx * 0.05 }}
                          className="bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-full font-semibold shadow-sm"
                        >
                          {food}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Notes */}
                {result.notes && (
                  <motion.div 
                    className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200/50 dark:border-amber-800/50 rounded-2xl p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="text-xs font-bold text-amber-700 dark:text-amber-300 mb-2 uppercase tracking-wider flex items-center gap-2">
                      <ChefHat className="h-3.5 w-3.5" />
                      {t.notes}
                    </div>
                    <div className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">{result.notes}</div>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <motion.div className="flex-1" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                    <Button 
                      onClick={handleSave} 
                      disabled={isSaving || saved}
                      size="lg"
                      className={`w-full gap-2 rounded-xl shadow-lg text-sm h-12 font-bold transition-all ${
                        saved 
                          ? 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-500 hover:to-green-500' 
                          : 'bg-gradient-to-r from-primary to-primary/90'
                      }`}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {t.saving}
                        </>
                      ) : saved ? (
                        <>
                          <Check className="h-4 w-4" />
                          {t.saved}
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          {t.save}
                        </>
                      )}
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      onClick={handleNewScan} 
                      variant="outline" 
                      size="lg"
                      className="gap-2 rounded-xl border-2 h-12 w-12 p-0"
                    >
                      <Camera className="h-5 w-5" />
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error State */}
          {result && !result.success && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-red-900/20 border border-red-200 dark:border-red-800/50 rounded-2xl p-6 text-center"
            >
              <motion.div 
                className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/50 rounded-2xl flex items-center justify-center mb-4"
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
              >
                <Utensils className="h-8 w-8 text-red-400" />
              </motion.div>
              <p className="text-red-600 dark:text-red-400 text-sm mb-4 font-medium">{result.error}</p>
              <Button onClick={handleNewScan} className="gap-2 rounded-xl px-6 h-10">
                <Camera className="h-4 w-4" />
                {t.tryAgain}
              </Button>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
