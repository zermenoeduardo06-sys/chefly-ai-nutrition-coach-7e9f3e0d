import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Camera, History, BarChart3, ArrowLeft, Crown, Lock, Zap, Sparkles, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import { useFoodScanner } from '@/hooks/useFoodScanner';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ScannerCamera } from '@/components/scanner/ScannerCamera';
import { ScanResultCard } from '@/components/scanner/ScanResultCard';
import { ScanHistory } from '@/components/scanner/ScanHistory';
import { ScannerStats } from '@/components/scanner/ScannerStats';
import { ScanCelebration } from '@/components/scanner/ScanCelebration';
import ScannerFoodSearch from '@/components/scanner/ScannerFoodSearch';
import mascotLime from '@/assets/mascot-lime.png';

export default function FoodScannerPage() {
  const navigate = useNavigate();
  const { mealType } = useParams<{ mealType?: string }>();
  const [searchParams] = useSearchParams();
  const selectedDate = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const { language } = useLanguage();
  const { toast } = useToast();
  
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState('scan');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  
  const { subscribed, isLoading: subLoading } = useSubscription(userId);
  const { limits, refreshLimits } = useSubscriptionLimits(userId);
  const { analyzeFood, isAnalyzing, result, clearResult } = useFoodScanner();

  const validMealType = mealType && ['breakfast', 'lunch', 'dinner', 'snack'].includes(mealType) 
    ? mealType 
    : 'lunch';

  const t = {
    title: language === 'es' ? 'Escáner IA' : 'AI Scanner',
    scan: language === 'es' ? 'Escanear' : 'Scan',
    search: language === 'es' ? 'Buscar' : 'Search',
    history: language === 'es' ? 'Historial' : 'History',
    stats: language === 'es' ? 'Estadísticas' : 'Stats',
    back: language === 'es' ? 'Volver' : 'Back',
    limitReached: language === 'es' ? 'Función Premium' : 'Premium Feature',
    upgradeDesc: language === 'es' 
      ? 'El escáner de comida con IA es exclusivo de Chefly Plus'
      : 'AI food scanner is exclusive to Chefly Plus',
    upgrade: language === 'es' ? 'Obtener Chefly Plus' : 'Get Chefly Plus',
    unlimited: language === 'es' ? 'Escaneos ilimitados' : 'Unlimited scans',
    scansLeft: language === 'es' ? 'Premium requerido' : 'Premium required',
    aiPowered: language === 'es' ? 'IA Avanzada' : 'Advanced AI',
  };

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      setUserId(user.id);
    };
    getUser();
  }, [navigate]);

  const handleImageCapture = async (base64: string) => {
    if (!limits.canScanFood) {
      toast({
        title: t.limitReached,
        description: t.upgradeDesc,
        variant: 'destructive',
      });
      return;
    }
    
    setPreviewImage(base64);
    await analyzeFood(base64);
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
    if (!result || !result.success || !result.nutrition || !userId) return;

    setIsSaving(true);
    try {
      let imageUrl: string | null = null;

      if (previewImage) {
        const blob = base64ToBlob(previewImage);
        const fileName = `${userId}/${Date.now()}.jpg`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('food-scans')
          .upload(fileName, blob, {
            contentType: 'image/jpeg',
            upsert: false
          });

        if (!uploadError && uploadData) {
          const { data: { publicUrl } } = supabase.storage
            .from('food-scans')
            .getPublicUrl(uploadData.path);
          imageUrl = publicUrl;
        }
      }

      const { error } = await supabase
        .from('food_scans')
        .insert({
          user_id: userId,
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
          meal_type: validMealType || null,
        });

      if (error) throw error;

      setSaved(true);
      setShowCelebration(true);
      refreshLimits();
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

  const handleCelebrationComplete = () => {
    setShowCelebration(false);
    setActiveTab('history');
    handleNewScan();
  };

  const handleFoodAdded = () => {
    // Switch to history tab after adding food
    setActiveTab('history');
    refreshLimits();
  };

  const canScan = limits.canScanFood || subscribed;
  const isFullyLoaded = userId && !subLoading;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center justify-between p-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="rounded-xl"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold flex items-center gap-2">
                {t.title}
                <span className="flex items-center gap-1 text-[10px] text-primary bg-primary/10 rounded-full px-2 py-0.5 font-semibold">
                  <Sparkles className="h-2.5 w-2.5" />
                  {t.aiPowered}
                </span>
              </h1>
            </div>
          </div>
          
          {/* Scan counter badge */}
          {isFullyLoaded && (
            <div className="flex items-center gap-2">
              {limits.isCheflyPlus ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-primary/20 to-orange-500/20 rounded-full">
                  <Crown className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs text-primary font-semibold">{t.unlimited}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-full">
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                  <span className="text-xs text-muted-foreground font-medium">
                    {t.scansLeft}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-2xl mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-12 rounded-2xl bg-muted/50 p-1">
            <TabsTrigger 
              value="scan" 
              className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium text-xs"
            >
              <Camera className="h-4 w-4 mr-1" />
              {t.scan}
            </TabsTrigger>
            <TabsTrigger 
              value="search" 
              className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium text-xs"
            >
              <Search className="h-4 w-4 mr-1" />
              {t.search}
            </TabsTrigger>
            <TabsTrigger 
              value="history"
              className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium text-xs"
            >
              <History className="h-4 w-4 mr-1" />
              {t.history}
            </TabsTrigger>
            <TabsTrigger 
              value="stats"
              className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium text-xs"
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              {t.stats}
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <AnimatePresence mode="wait">
              <TabsContent value="scan" className="mt-0">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Limit Reached State */}
                  {isFullyLoaded && !canScan && !previewImage && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/30 dark:via-orange-950/30 dark:to-yellow-950/30 rounded-3xl p-8 shadow-lg border border-amber-200/50 dark:border-amber-800/50"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-200/50 to-transparent rounded-bl-full" />
                      <div className="relative text-center">
                        <motion.div 
                          className="w-24 h-24 mx-auto bg-gradient-to-br from-amber-200 to-orange-200 dark:from-amber-800 dark:to-orange-800 rounded-3xl flex items-center justify-center mb-6 shadow-lg"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Lock className="h-12 w-12 text-amber-600 dark:text-amber-400" />
                        </motion.div>
                        
                        <h3 className="text-xl font-bold text-amber-800 dark:text-amber-200 mb-2">{t.limitReached}</h3>
                        <p className="text-amber-700 dark:text-amber-300 text-sm mb-6">{t.upgradeDesc}</p>
                        
                        <Button
                          onClick={() => navigate('/premium-paywall')}
                          size="lg"
                          className="gap-2 rounded-2xl shadow-lg px-8 h-14 font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
                        >
                          <Crown className="h-5 w-5" />
                          {t.upgrade}
                        </Button>
                      </div>
                      
                      <img 
                        src={mascotLime} 
                        alt="Chefly" 
                        className="absolute -bottom-4 -right-4 w-28 h-28 object-contain opacity-50"
                      />
                    </motion.div>
                  )}

                  {/* Scanner UI */}
                  {(canScan || previewImage) && (
                    <>
                      {!result?.success ? (
                        <ScannerCamera
                          onImageCapture={handleImageCapture}
                          isAnalyzing={isAnalyzing}
                          previewImage={previewImage}
                        />
                      ) : (
                        <ScanResultCard
                          result={result}
                          onSave={handleSave}
                          onNewScan={handleNewScan}
                          isSaving={isSaving}
                          saved={saved}
                        />
                      )}
                    </>
                  )}
                </motion.div>
              </TabsContent>

              <TabsContent value="search" className="mt-0">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="min-h-[400px]"
                >
                  {userId && (
                    <ScannerFoodSearch
                      mealType={validMealType}
                      selectedDate={selectedDate}
                      userId={userId}
                      onFoodAdded={handleFoodAdded}
                    />
                  )}
                </motion.div>
              </TabsContent>

              <TabsContent value="history" className="mt-0">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <ScanHistory />
                </motion.div>
              </TabsContent>

              <TabsContent value="stats" className="mt-0">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <ScannerStats />
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </div>
        </Tabs>
      </div>

      {/* Celebration Overlay */}
      <ScanCelebration
        show={showCelebration}
        calories={result?.nutrition?.calories || 0}
        dishName={result?.dish_name || ''}
        onComplete={handleCelebrationComplete}
      />
    </div>
  );
}
