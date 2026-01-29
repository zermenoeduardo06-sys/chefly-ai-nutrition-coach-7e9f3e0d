import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Camera, History, BarChart3, ArrowLeft, Crown, Lock, Zap, Sparkles, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import { AiUsageIndicator } from '@/components/AiUsageIndicator';
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
import { createScanTimestamp, getLocalDateString } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'scan', icon: Camera },
  { id: 'search', icon: Search },
  { id: 'history', icon: History },
  { id: 'stats', icon: BarChart3 },
];

export default function FoodScannerPage() {
  const navigate = useNavigate();
  const { mealType } = useParams<{ mealType?: string }>();
  const [searchParams] = useSearchParams();
  // CRITICAL: Use getLocalDateString() instead of toISOString() to preserve local date
  const selectedDate = searchParams.get('date') || getLocalDateString();
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
    stats: language === 'es' ? 'Stats' : 'Stats',
    back: language === 'es' ? 'Volver' : 'Back',
    limitReached: language === 'es' ? 'Función Premium' : 'Premium Feature',
    upgradeDesc: language === 'es' 
      ? 'El escáner de comida con IA es exclusivo de Chefly Plus'
      : 'AI food scanner is exclusive to Chefly Plus',
    upgrade: language === 'es' ? 'Obtener Chefly Plus' : 'Get Chefly Plus',
    unlimited: language === 'es' ? 'Escáner IA' : 'AI Scanner',
    scansLeft: language === 'es' ? 'Premium requerido' : 'Premium required',
    aiPowered: language === 'es' ? 'IA Avanzada' : 'Advanced AI',
  };

  const tabLabels: Record<string, string> = {
    scan: t.scan,
    search: t.search,
    history: t.history,
    stats: t.stats,
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

      const scannedAt = createScanTimestamp(selectedDate);

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
          scanned_at: scannedAt,
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
    setActiveTab('history');
    refreshLimits();
  };

  const canScan = limits.canScanFood || subscribed;
  const isFullyLoaded = userId && !subLoading;

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Glassmorphism 3D */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border/30 shadow-[0_4px_20px_rgba(0,0,0,0.08)]"
      >
        <div className="flex items-center justify-between p-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="rounded-2xl h-10 w-10 bg-muted/50 hover:bg-muted shadow-[0_2px_0_hsl(var(--border)),0_4px_8px_rgba(0,0,0,0.05)]"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold flex items-center gap-2">
                {t.title}
              </h1>
            </div>
          </div>
          
          {/* AI Badge 3D pill */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2"
          >
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 rounded-full shadow-[0_2px_0_hsl(var(--primary)/0.2),0_4px_8px_rgba(0,0,0,0.05)]">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary">{t.aiPowered}</span>
            </div>
            
            {isFullyLoaded && limits.isCheflyPlus && (
              <AiUsageIndicator userId={userId} compact />
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Tabs - 3D Floating Style */}
      <div className="max-w-2xl mx-auto px-4 pt-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-muted/50 rounded-2xl p-1.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]"
        >
          <div className="grid grid-cols-4 gap-1">
            {tabs.map((tab, index) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "relative flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-semibold transition-all duration-200",
                    isActive 
                      ? "text-primary-foreground" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  whileTap={{ scale: 0.97 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-primary rounded-xl shadow-[0_4px_0_hsl(var(--primary)/0.4),0_6px_12px_rgba(0,0,0,0.15)]"
                      transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <motion.div
                      animate={isActive ? { scale: [1, 1.15, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      <Icon className="h-4 w-4" />
                    </motion.div>
                    <span className="hidden xs:inline">{tabLabels[tab.id]}</span>
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Tab Content */}
        <div className="mt-6 pb-8">
          <AnimatePresence mode="wait">
            {activeTab === 'scan' && (
              <motion.div
                key="scan"
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
                    className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/30 dark:via-orange-950/30 dark:to-yellow-950/30 rounded-3xl p-8 shadow-[0_6px_0_hsl(38_92%_50%/0.3),0_12px_30px_rgba(0,0,0,0.1)] border-2 border-amber-200/50 dark:border-amber-800/50"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-200/50 to-transparent rounded-bl-full" />
                    <div className="relative text-center">
                      <motion.div 
                        className="w-24 h-24 mx-auto bg-gradient-to-br from-amber-200 to-orange-200 dark:from-amber-800 dark:to-orange-800 rounded-3xl flex items-center justify-center mb-6 shadow-[0_6px_0_hsl(38_92%_40%/0.4),0_10px_20px_rgba(0,0,0,0.15)]"
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
                        className="gap-2 rounded-2xl shadow-[0_4px_0_hsl(38_92%_40%),0_8px_16px_rgba(0,0,0,0.2)] px-8 h-14 font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 active:translate-y-1 active:shadow-[0_2px_0_hsl(38_92%_40%)] transition-all"
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
            )}

            {activeTab === 'search' && (
              <motion.div
                key="search"
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
            )}

            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <ScanHistory />
              </motion.div>
            )}

            {activeTab === 'stats' && (
              <motion.div
                key="stats"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <ScannerStats />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
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
