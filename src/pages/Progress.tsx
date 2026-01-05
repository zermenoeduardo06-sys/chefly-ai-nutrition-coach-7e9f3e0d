import { useState, useEffect } from "react";
import { NutritionProgressCharts } from "@/components/NutritionProgressCharts";
import { BodyMeasurementForm } from "@/components/BodyMeasurementForm";
import { BodyMeasurementCharts } from "@/components/BodyMeasurementCharts";
import { useTrialGuard } from "@/hooks/useTrialGuard";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Scale, TrendingDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Progress = () => {
  const { isBlocked, isLoading } = useTrialGuard();
  const { t } = useLanguage();
  const [userId, setUserId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 pt-safe-top pb-24 md:pb-6">
      <main className="container mx-auto px-4 py-4 md:py-6 space-y-4 md:space-y-6">
        <div className="flex items-center gap-2 mb-4 md:mb-6">
          <TrendingDown className="h-6 w-6 md:h-8 md:w-8 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold">{t('progress.title')}</h1>
        </div>

        <Tabs defaultValue="nutrition" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-11">
            <TabsTrigger value="nutrition" className="text-sm md:text-base">
              {t('progress.tabNutrition')}
            </TabsTrigger>
            <TabsTrigger value="body" className="text-sm md:text-base">
              <Scale className="mr-1.5 md:mr-2 h-4 w-4" />
              <span className="hidden sm:inline">{t('progress.tabBody')}</span>
              <span className="sm:hidden">{t('progress.tabWeight')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="nutrition" className="mt-4 md:mt-6">
            <NutritionProgressCharts />
          </TabsContent>

          <TabsContent value="body" className="mt-4 md:mt-6 space-y-4 md:space-y-6">
            <Card>
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-base md:text-lg">{t('progress.recordMeasurements')}</CardTitle>
                <CardDescription className="text-sm">
                  {t('progress.recordMeasurementsDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
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
        </Tabs>
      </main>
    </div>
  );
};

export default Progress;
