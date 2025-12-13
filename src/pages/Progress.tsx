import { useState, useEffect } from "react";
import { CaloriesProgressArc } from "@/components/CaloriesProgressArc";
import { NutritionProgressCharts } from "@/components/NutritionProgressCharts";
import { BodyMeasurementForm } from "@/components/BodyMeasurementForm";
import { BodyMeasurementCharts } from "@/components/BodyMeasurementCharts";
import { useTrialGuard } from "@/hooks/useTrialGuard";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Scale, TrendingDown } from "lucide-react";

const Progress = () => {
  const { isBlocked, isLoading } = useTrialGuard();
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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingDown className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Tu Progreso</h1>
        </div>

        <Tabs defaultValue="nutrition" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="nutrition">Nutrición</TabsTrigger>
            <TabsTrigger value="body">
              <Scale className="mr-2 h-4 w-4" />
              Medidas Corporales
            </TabsTrigger>
          </TabsList>

          <TabsContent value="nutrition" className="mt-6 space-y-6">
            <CaloriesProgressArc />
            <NutritionProgressCharts />
          </TabsContent>

          <TabsContent value="body" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Registrar Medidas</CardTitle>
                <CardDescription>
                  Registra tu peso y medidas corporales para hacer seguimiento de tu progreso
                </CardDescription>
              </CardHeader>
              <CardContent>
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
