import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInitialAnimation } from "@/hooks/useInitialAnimation";
import { useNavigate } from "react-router-dom";
import { NutritionProgressCharts } from "@/components/NutritionProgressCharts";
import { BodyMeasurementForm } from "@/components/BodyMeasurementForm";
import { BodyMeasurementCharts } from "@/components/BodyMeasurementCharts";
import { WeightMilestones } from "@/components/WeightMilestones";
import { ProgressAchievementsTab } from "@/components/progress/ProgressAchievementsTab";
import { ProgressStatsTab } from "@/components/progress/ProgressStatsTab";
import { ProgressHeader3D } from "@/components/progress/ProgressHeader3D";
import { WeightCard3D } from "@/components/progress/WeightCard3D";
import { useTrialGuard } from "@/hooks/useTrialGuard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card3D, Card3DContent, Card3DHeader } from "@/components/ui/card-3d";
import { Loader2, Scale, TrendingUp, Trophy, BarChart3, User, Camera, Lock, Sparkles, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Icon3D } from "@/components/ui/icon-3d";
import { cn } from "@/lib/utils";
import { useWellness } from "@/hooks/useWellness";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BodyScanCamera } from "@/components/body-scan/BodyScanCamera";
import { BodyScanResultCard } from "@/components/body-scan/BodyScanResultCard";
import { TransformationGallery } from "@/components/body-scan/TransformationGallery";
import { BodyTypeIndicator } from "@/components/body-scan/BodyTypeIndicator";
import { useProgressData } from "@/hooks/useProgressData";
import { Skeleton } from "@/components/ui/skeleton";

const Progress = () => {
  const shouldAnimate = useInitialAnimation();
  const { isBlocked, isLoading: trialLoading } = useTrialGuard();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("nutrition");
  
  // Body scan states
  const [showCamera, setShowCamera] = useState(false);
  const [scanType, setScanType] = useState<'front' | 'side'>('front');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Use AuthContext for immediate user access
  const { user: authUser, isLoading: authLoading } = useAuth();
  const userId = authUser?.id || null;

  const subscription = useSubscription(userId || undefined);
  const wellness = useWellness(userId || undefined);

  const texts = {
    es: {
      nutrition: "Nutrición",
      weight: "Peso",
      body: "Cuerpo",
      achievements: "Logros",
      stats: "Stats",
      recordMeasurements: "Registrar Medidas",
      recordMeasurementsDesc: "Actualiza tu peso y medidas corporales",
      startScan: 'Escanear Cuerpo',
      scanLimit: 'escaneos este mes',
      scanLimitReached: 'Límite de escaneos alcanzado',
      premiumRequired: 'Función Premium',
      upgradeText: 'Desbloquea el escáner corporal con IA para estimar tu composición corporal',
      upgrade: 'Obtener Chefly Plus',
      analyzing: 'Analizando tu cuerpo...',
      scanSuccess: '¡Análisis completado!',
      scanError: 'Error al analizar la imagen',
      noScansYet: 'Aún no tienes escaneos',
      firstScanPrompt: 'Toma tu primera foto para obtener una estimación de tu composición corporal',
    },
    en: {
      nutrition: "Nutrition",
      weight: "Weight",
      body: "Body",
      achievements: "Achievements",
      stats: "Stats",
      recordMeasurements: "Record Measurements",
      recordMeasurementsDesc: "Update your weight and body measurements",
      startScan: 'Scan Body',
      scanLimit: 'scans this month',
      scanLimitReached: 'Scan limit reached',
      premiumRequired: 'Premium Feature',
      upgradeText: 'Unlock AI body scanner to estimate your body composition',
      upgrade: 'Get Chefly Plus',
      analyzing: 'Analyzing your body...',
      scanSuccess: 'Analysis complete!',
      scanError: 'Error analyzing image',
      noScansYet: 'No scans yet',
      firstScanPrompt: 'Take your first photo to get a body composition estimate',
    },
  };
  const tx = texts[language];

  const tabs = [
    { id: "nutrition", label: tx.nutrition, icon: TrendingUp },
    { id: "weight", label: tx.weight, icon: Scale },
    { id: "body", label: tx.body, icon: User },
    { id: "achievements", label: tx.achievements, icon: Trophy },
    { id: "stats", label: tx.stats, icon: BarChart3 },
  ];

  // Import useProgressData for cached weight
  const { latestWeight, refetchWeight } = useProgressData(userId || undefined);

  const handleMeasurementSuccess = () => {
    refetchWeight();
  };

  // Skeleton-first: show skeleton only on initial auth load
  if (authLoading) {
    return (
      <div className="min-h-full bg-gradient-to-b from-background to-muted/30 pb-24 lg:pb-6">
        <main className="container mx-auto px-4 tablet:px-6 py-4 tablet:py-6 space-y-5 max-w-3xl">
          <Skeleton className="h-12 w-full rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
        </main>
      </div>
    );
  }

  if (isBlocked) {
    return null;
  }

  const handleCapture = async (imageData: string) => {
    if (!userId) return;
    setIsAnalyzing(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // Upload image to storage first
      const fileName = `${userId}/${Date.now()}.jpg`;
      const base64Data = imageData.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('food-scans')
        .upload(`body-scans/${fileName}`, blob, {
          contentType: 'image/jpeg',
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('food-scans')
        .getPublicUrl(`body-scans/${fileName}`);

      // Call AI analysis
      const response = await supabase.functions.invoke('analyze-body-composition', {
        body: {
          image: imageData,
          language,
          scanType,
        },
      });

      if (response.error) throw new Error(response.error.message);

      const { analysis } = response.data;

      // Save to database
      const savedScan = await wellness.saveBodyScan({
        image_url: publicUrl,
        scan_type: scanType,
        estimated_body_fat_min: analysis.estimated_body_fat_min,
        estimated_body_fat_max: analysis.estimated_body_fat_max,
        body_fat_category: analysis.body_fat_category,
        body_type: analysis.body_type,
        fat_distribution: analysis.fat_distribution,
        ai_notes: analysis.ai_notes,
        recommendations: analysis.recommendations,
        raw_analysis: analysis.raw_analysis,
        confidence: analysis.confidence,
      });

      if (savedScan) {
        toast({
          title: tx.scanSuccess,
        });
        setShowCamera(false);
      }
    } catch (error) {
      console.error("Scan error:", error);
      toast({
        variant: "destructive",
        title: tx.scanError,
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const monthlyScansCount = wellness.getMonthlyBodyScansCount();
  const monthlyScansLimit = 3;
  const canScan = subscription.isCheflyPlus && monthlyScansCount < monthlyScansLimit;

  return (
    <div className="min-h-full bg-gradient-to-b from-background to-muted/30 pb-24 lg:pb-6">
      {/* Camera overlay for body scan */}
      <AnimatePresence>
        {showCamera && (
          <BodyScanCamera
            onCapture={handleCapture}
            onClose={() => setShowCamera(false)}
            scanType={scanType}
            onChangeScanType={setScanType}
            isAnalyzing={isAnalyzing}
          />
        )}
      </AnimatePresence>

      <main className="container mx-auto px-4 tablet:px-6 py-4 tablet:py-6 space-y-5 max-w-3xl">

        {/* Custom 3D Tabs */}
        <div className="flex gap-2 p-1.5 bg-muted/50 rounded-2xl overflow-x-auto">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 min-w-[70px] flex flex-col items-center gap-1 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all",
                activeTab === tab.id
                  ? "bg-card text-primary shadow-[0_4px_0_hsl(var(--border)),0_6px_15px_rgba(0,0,0,0.1)]"
                  : "text-muted-foreground hover:text-foreground"
              )}
              whileTap={{ scale: 0.97, y: 2 }}
            >
              <tab.icon className={cn(
                "h-5 w-5 transition-colors",
                activeTab === tab.id ? "text-primary" : "text-muted-foreground"
              )} />
              <span className="hidden sm:inline">{tab.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Tab content with animations */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Nutrition Tab */}
            {activeTab === "nutrition" && (
              <div className="space-y-4">
                <NutritionProgressCharts />
              </div>
            )}

            {/* Weight Tab */}
            {activeTab === "weight" && userId && (
              <div className="space-y-4">
                <WeightCard3D userId={userId} />
                
                <WeightMilestones 
                  userId={userId} 
                  currentWeight={latestWeight}
                />

                <Card3D variant="default">
                  <Card3DHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <Icon3D icon={Scale} color="sky" size="md" />
                      <div>
                        <h3 className="text-lg font-bold">{tx.recordMeasurements}</h3>
                        <p className="text-sm text-muted-foreground">{tx.recordMeasurementsDesc}</p>
                      </div>
                    </div>
                  </Card3DHeader>
                  <Card3DContent>
                    <BodyMeasurementForm 
                      userId={userId} 
                      onSuccess={handleMeasurementSuccess}
                    />
                  </Card3DContent>
                </Card3D>

                <BodyMeasurementCharts userId={userId} />
              </div>
            )}

            {/* Body Tab */}
            {activeTab === "body" && userId && (
              <div className="space-y-4">
                {/* Premium gate for non-subscribers */}
                {!subscription.isCheflyPlus ? (
                  <Card3D variant="elevated">
                    <Card3DContent className="p-6">
                      <div className="flex flex-col items-center text-center space-y-4">
                        <div className="p-4 bg-amber-500/20 rounded-2xl">
                          <Lock className="h-8 w-8 text-amber-500" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg flex items-center justify-center gap-2">
                            {tx.premiumRequired}
                            <Badge className="bg-amber-500/20 text-amber-500 border-0">
                              <Sparkles className="h-3 w-3 mr-1" />
                              Plus
                            </Badge>
                          </h3>
                          <p className="text-sm text-muted-foreground mt-2">
                            {tx.upgradeText}
                          </p>
                        </div>
                        <Button
                          className="bg-amber-500 hover:bg-amber-600 text-white"
                          onClick={() => navigate('/premium-paywall')}
                        >
                          {tx.upgrade}
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </Card3DContent>
                  </Card3D>
                ) : (
                  <>
                    {/* Scan button */}
                    <Card3D variant="elevated">
                      <Card3DContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Icon3D icon={Camera} color="primary" size="md" />
                            <div>
                              <h3 className="font-bold">{tx.startScan}</h3>
                              <p className="text-xs text-muted-foreground">
                                {monthlyScansCount}/{monthlyScansLimit} {tx.scanLimit}
                              </p>
                            </div>
                          </div>
                          <Button
                            onClick={() => setShowCamera(true)}
                            disabled={!canScan}
                            size="sm"
                          >
                            {canScan ? (
                              <>
                                <Camera className="h-4 w-4 mr-2" />
                                {language === 'es' ? 'Escanear' : 'Scan'}
                              </>
                            ) : (
                              tx.scanLimitReached
                            )}
                          </Button>
                        </div>
                      </Card3DContent>
                    </Card3D>

                    {/* Latest result or empty state */}
                    {wellness.latestBodyScan ? (
                      <>
                        <BodyScanResultCard
                          scan={wellness.latestBodyScan}
                          previousScan={wellness.bodyScans[1]}
                          onNewScan={() => setShowCamera(true)}
                        />
                        
                        {wellness.latestBodyScan.body_type && (
                          <Card3D variant="default">
                            <Card3DContent className="p-4 flex items-center justify-center">
                              <BodyTypeIndicator 
                                bodyType={wellness.latestBodyScan.body_type} 
                                size="lg"
                              />
                            </Card3DContent>
                          </Card3D>
                        )}

                        {wellness.bodyScans.length > 1 && (
                          <TransformationGallery scans={wellness.bodyScans} />
                        )}
                      </>
                    ) : (
                      <Card3D variant="default">
                        <Card3DContent className="p-8 text-center">
                          <User className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                          <h3 className="font-bold mb-2">{tx.noScansYet}</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            {tx.firstScanPrompt}
                          </p>
                          <Button onClick={() => setShowCamera(true)}>
                            <Camera className="h-4 w-4 mr-2" />
                            {tx.startScan}
                          </Button>
                        </Card3DContent>
                      </Card3D>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Achievements Tab */}
            {activeTab === "achievements" && userId && (
              <ProgressAchievementsTab userId={userId} />
            )}

            {/* Stats Tab */}
            {activeTab === "stats" && userId && (
              <ProgressStatsTab userId={userId} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Progress;
