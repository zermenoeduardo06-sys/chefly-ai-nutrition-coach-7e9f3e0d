import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { Card3D, Card3DContent, Card3DHeader } from "@/components/ui/card-3d";
import { Loader2, Scale, TrendingUp, Trophy, BarChart3 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Icon3D } from "@/components/ui/icon-3d";
import { cn } from "@/lib/utils";

const Progress = () => {
  const { isBlocked, isLoading } = useTrialGuard();
  const { t, language } = useLanguage();
  const [userId, setUserId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [latestWeight, setLatestWeight] = useState<number | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("nutrition");

  const texts = {
    es: {
      nutrition: "Nutrición",
      weight: "Peso",
      achievements: "Logros",
      stats: "Stats",
      recordMeasurements: "Registrar Medidas",
      recordMeasurementsDesc: "Actualiza tu peso y medidas corporales",
    },
    en: {
      nutrition: "Nutrition",
      weight: "Weight",
      achievements: "Achievements",
      stats: "Stats",
      recordMeasurements: "Record Measurements",
      recordMeasurementsDesc: "Update your weight and body measurements",
    },
  };
  const tx = texts[language];

  const tabs = [
    { id: "nutrition", label: tx.nutrition, icon: TrendingUp },
    { id: "weight", label: tx.weight, icon: Scale },
    { id: "achievements", label: tx.achievements, icon: Trophy },
    { id: "stats", label: tx.stats, icon: BarChart3 },
  ];

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data: latestMeasurement } = await supabase
          .from("body_measurements")
          .select("weight")
          .eq("user_id", user.id)
          .order("measurement_date", { ascending: false })
          .limit(1)
          .single();
        
        if (latestMeasurement?.weight) {
          setLatestWeight(latestMeasurement.weight);
        }
      }
    };
    loadUser();
  }, [refreshTrigger]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isBlocked) {
    return null;
  }

  const handleMeasurementSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-full bg-gradient-to-b from-background to-muted/30 pb-24 lg:pb-6">
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

                <BodyMeasurementCharts 
                  userId={userId} 
                  refreshTrigger={refreshTrigger}
                />
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
