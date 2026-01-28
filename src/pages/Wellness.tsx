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
import { Loader2, Heart, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

const Wellness = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { toast } = useToast();
  
  const [userId, setUserId] = useState<string>();
  const [activeTab, setActiveTab] = useState<'mood' | 'insights'>('mood');
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  const subscription = useSubscription(userId);
  const wellness = useWellness(userId);

  const texts = {
    es: {
      title: 'Bienestar',
      moodTab: 'Ánimo',
      insightsTab: 'Insights',
    },
    en: {
      title: 'Wellness',
      moodTab: 'Mood',
      insightsTab: 'Insights',
    },
  };
  const t = texts[language];

  const tabs = [
    { id: 'mood' as const, label: t.moodTab, icon: Heart },
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

  if (wellness.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-background to-muted/30 pb-24 lg:pb-6">
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
