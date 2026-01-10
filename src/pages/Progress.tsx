import { useState, useEffect } from "react";
import { NutritionProgressCharts } from "@/components/NutritionProgressCharts";
import { BodyMeasurementForm } from "@/components/BodyMeasurementForm";
import { BodyMeasurementCharts } from "@/components/BodyMeasurementCharts";
import { WeightMilestones } from "@/components/WeightMilestones";
import { ProgressAchievementsTab } from "@/components/progress/ProgressAchievementsTab";
import { ProgressStatsTab } from "@/components/progress/ProgressStatsTab";
import { useTrialGuard } from "@/hooks/useTrialGuard";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Scale, TrendingUp, Trophy, BarChart3 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Progress = () => {
  const { isBlocked, isLoading } = useTrialGuard();
  const { t, language } = useLanguage();
  const [userId, setUserId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [latestWeight, setLatestWeight] = useState<number | undefined>(undefined);

  const texts = {
    es: {
      title: "Mi Progreso",
      nutrition: "Nutrición",
      weight: "Peso",
      achievements: "Logros",
      stats: "Estadísticas",
      recordMeasurements: "Registrar Medidas",
      recordMeasurementsDesc: "Actualiza tu peso y medidas corporales",
    },
    en: {
      title: "My Progress",
      nutrition: "Nutrition",
      weight: "Weight",
      achievements: "Achievements",
      stats: "Statistics",
      recordMeasurements: "Record Measurements",
      recordMeasurementsDesc: "Update your weight and body measurements",
    },
  };
  const tx = texts[language];

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        // Load latest weight from body measurements
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
      <main className="container mx-auto px-4 tablet:px-6 py-4 tablet:py-6 space-y-4 tablet:space-y-6 max-w-3xl">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-6 w-6 tablet:h-7 tablet:w-7 text-primary" />
          <h1 className="text-2xl tablet:text-3xl font-bold">{tx.title}</h1>
        </div>

        <Tabs defaultValue="nutrition" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-11 tablet:h-12">
            <TabsTrigger value="nutrition" className="text-xs tablet:text-sm px-1">
              <TrendingUp className="h-4 w-4 mr-1 hidden sm:inline" />
              {tx.nutrition}
            </TabsTrigger>
            <TabsTrigger value="weight" className="text-xs tablet:text-sm px-1">
              <Scale className="h-4 w-4 mr-1 hidden sm:inline" />
              {tx.weight}
            </TabsTrigger>
            <TabsTrigger value="achievements" className="text-xs tablet:text-sm px-1">
              <Trophy className="h-4 w-4 mr-1 hidden sm:inline" />
              {tx.achievements}
            </TabsTrigger>
            <TabsTrigger value="stats" className="text-xs tablet:text-sm px-1">
              <BarChart3 className="h-4 w-4 mr-1 hidden sm:inline" />
              {tx.stats}
            </TabsTrigger>
          </TabsList>

          {/* Nutrition Tab */}
          <TabsContent value="nutrition" className="mt-4 space-y-4">
            <NutritionProgressCharts />
          </TabsContent>

          {/* Weight Tab */}
          <TabsContent value="weight" className="mt-4 space-y-4">
            {userId && (
              <WeightMilestones 
                userId={userId} 
                currentWeight={latestWeight}
              />
            )}

            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-base">{tx.recordMeasurements}</CardTitle>
                <CardDescription className="text-sm">
                  {tx.recordMeasurementsDesc}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {userId && (
                  <BodyMeasurementForm 
                    userId={userId} 
                    onSuccess={handleMeasurementSuccess}
                  />
                )}
              </CardContent>
            </Card>

            {userId && (
              <BodyMeasurementCharts 
                userId={userId} 
                refreshTrigger={refreshTrigger}
              />
            )}
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="mt-4">
            {userId && <ProgressAchievementsTab userId={userId} />}
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="mt-4">
            {userId && <ProgressStatsTab userId={userId} />}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Progress;
