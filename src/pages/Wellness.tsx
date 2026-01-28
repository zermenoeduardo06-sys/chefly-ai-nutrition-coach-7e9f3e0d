import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useWellness } from "@/hooks/useWellness";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";

// Components
import { MoodCheckInWidget } from "@/components/wellness/MoodCheckInWidget";
import { MoodHistoryChart } from "@/components/wellness/MoodHistoryChart";
import { MoodInsightsCard } from "@/components/wellness/MoodInsightsCard";
import { WellnessTips } from "@/components/wellness/WellnessTips";
import { BodyScanCamera } from "@/components/body-scan/BodyScanCamera";
import { BodyScanResultCard } from "@/components/body-scan/BodyScanResultCard";
import { TransformationGallery } from "@/components/body-scan/TransformationGallery";
import { BodyTypeIndicator } from "@/components/body-scan/BodyTypeIndicator";
import { Card3D, Card3DContent, Card3DHeader } from "@/components/ui/card-3d";
import { Icon3D } from "@/components/ui/icon-3d";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Heart, User, Sparkles, Brain, Camera, Lock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const Wellness = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { toast } = useToast();
  
  const [userId, setUserId] = useState<string>();
  const [activeTab, setActiveTab] = useState<'mood' | 'body' | 'insights'>('mood');
  const [showCamera, setShowCamera] = useState(false);
  const [scanType, setScanType] = useState<'front' | 'side'>('front');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  const subscription = useSubscription(userId);
  const wellness = useWellness(userId);

  const texts = {
    es: {
      title: 'Bienestar',
      moodTab: 'Ánimo',
      bodyTab: 'Cuerpo',
      insightsTab: 'Insights',
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
      title: 'Wellness',
      moodTab: 'Mood',
      bodyTab: 'Body',
      insightsTab: 'Insights',
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
  const t = texts[language];

  const tabs = [
    { id: 'mood' as const, label: t.moodTab, icon: Heart },
    { id: 'body' as const, label: t.bodyTab, icon: User },
    { id: 'insights' as const, label: t.insightsTab, icon: Brain },
  ];

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUserId(user.id);
    };
    checkAuth();
  }, [navigate]);

  const handleMoodSubmit = async (score: number, factors: string[], note?: string) => {
    const success = await wellness.logMood(score, factors, note);
    if (success) {
      toast({
        title: language === 'es' ? '¡Ánimo registrado!' : 'Mood logged!',
        description: language === 'es' ? 'Sigue registrando para ver patrones' : 'Keep logging to see patterns',
      });
    }
    return success;
  };

  const handleCapture = async (imageData: string) => {
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
        .from('food-scans') // Reusing existing bucket
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
          title: t.scanSuccess,
        });
        setShowCamera(false);
      }
    } catch (error) {
      console.error("Scan error:", error);
      toast({
        variant: "destructive",
        title: t.scanError,
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateInsights = async () => {
    if (!userId) return;
    
    setIsGeneratingInsights(true);
    try {
      const response = await supabase.functions.invoke('analyze-mood-patterns', {
        body: { language },
      });

      if (response.error) throw new Error(response.error.message);

      await wellness.refetch();
      
      toast({
        title: language === 'es' ? '¡Insights generados!' : 'Insights generated!',
      });
    } catch (error) {
      console.error("Error generating insights:", error);
      toast({
        variant: "destructive",
        title: language === 'es' ? 'Error al generar insights' : 'Error generating insights',
      });
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const monthlyScansCount = wellness.getMonthlyBodyScansCount();
  const monthlyScansLimit = 3;
  const canScan = subscription.isCheflyPlus && monthlyScansCount < monthlyScansLimit;

  if (wellness.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-background to-muted/30 pb-24 lg:pb-6">
      {/* Camera overlay */}
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
        {/* Custom Tabs */}
        <div className="flex gap-2 p-1.5 bg-muted/50 rounded-2xl">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all",
                activeTab === tab.id
                  ? "bg-card text-primary shadow-[0_4px_0_hsl(var(--border)),0_6px_15px_rgba(0,0,0,0.1)]"
                  : "text-muted-foreground hover:text-foreground"
              )}
              whileTap={{ scale: 0.97, y: 2 }}
            >
              <tab.icon className={cn(
                "h-4 w-4 transition-colors",
                activeTab === tab.id ? "text-primary" : "text-muted-foreground"
              )} />
              <span>{tab.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Mood Tab */}
            {activeTab === 'mood' && (
              <>
                <MoodCheckInWidget
                  onSubmit={handleMoodSubmit}
                  existingMood={wellness.todaysMood}
                />
                
                <MoodHistoryChart
                  moods={wellness.weeklyMoods}
                  averageMood={wellness.averageMood}
                  trend={wellness.moodTrend}
                />
                
                <WellnessTips
                  moodScore={wellness.todaysMood?.mood_score}
                  factors={wellness.todaysMood?.factors}
                />
              </>
            )}

            {/* Body Tab */}
            {activeTab === 'body' && (
              <>
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
                            {t.premiumRequired}
                            <Badge className="bg-amber-500/20 text-amber-500 border-0">
                              <Sparkles className="h-3 w-3 mr-1" />
                              Plus
                            </Badge>
                          </h3>
                          <p className="text-sm text-muted-foreground mt-2">
                            {t.upgradeText}
                          </p>
                        </div>
                        <Button
                          className="bg-amber-500 hover:bg-amber-600 text-white"
                          onClick={() => navigate('/premium-paywall')}
                        >
                          {t.upgrade}
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
                              <h3 className="font-bold">{t.startScan}</h3>
                              <p className="text-xs text-muted-foreground">
                                {monthlyScansCount}/{monthlyScansLimit} {t.scanLimit}
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
                              t.scanLimitReached
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
                          <h3 className="font-bold mb-2">{t.noScansYet}</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            {t.firstScanPrompt}
                          </p>
                          <Button onClick={() => setShowCamera(true)}>
                            <Camera className="h-4 w-4 mr-2" />
                            {t.startScan}
                          </Button>
                        </Card3DContent>
                      </Card3D>
                    )}
                  </>
                )}
              </>
            )}

            {/* Insights Tab */}
            {activeTab === 'insights' && (
              <>
                <MoodInsightsCard
                  insights={wellness.insights}
                  isCheflyPlus={subscription.isCheflyPlus}
                  onGenerateInsights={handleGenerateInsights}
                  isGenerating={isGeneratingInsights}
                  onMarkAsRead={wellness.markInsightAsRead}
                />
                
                <WellnessTips
                  moodScore={wellness.todaysMood?.mood_score}
                  factors={wellness.todaysMood?.factors}
                />
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Wellness;
