import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Measurement {
  measurement_date: string;
  weight: number | null;
  neck: number | null;
  chest: number | null;
  waist: number | null;
  hips: number | null;
  arms: number | null;
  thighs: number | null;
}

interface BodyMeasurementChartsProps {
  userId: string;
  refreshTrigger: number;
}

export const BodyMeasurementCharts = ({ userId, refreshTrigger }: BodyMeasurementChartsProps) => {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, language } = useLanguage();
  const dateLocale = language === 'es' ? es : enUS;

  useEffect(() => {
    loadMeasurements();
  }, [userId, refreshTrigger]);

  const loadMeasurements = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("body_measurements")
        .select("*")
        .eq("user_id", userId)
        .order("measurement_date", { ascending: true });

      if (error) throw error;

      setMeasurements(data || []);
    } catch (error) {
      console.error("Error loading measurements:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (measurements.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-muted-foreground mb-2">{t('progress.noMeasurements')}</p>
          <p className="text-sm text-muted-foreground">
            {t('progress.startRecording')}
          </p>
        </CardContent>
      </Card>
    );
  }

  const weightData = measurements.filter(m => m.weight !== null).map(m => ({
    date: format(new Date(m.measurement_date), "dd/MM", { locale: dateLocale }),
    [t('progress.tabWeight')]: m.weight,
  }));

  const bodyMeasurementsData = measurements.map(m => ({
    date: format(new Date(m.measurement_date), "dd/MM", { locale: dateLocale }),
    [t('bodyMeasurements.neck')]: m.neck,
    [t('bodyMeasurements.chest')]: m.chest,
    [t('bodyMeasurements.waist')]: m.waist,
    [t('bodyMeasurements.hips')]: m.hips,
    [t('bodyMeasurements.arms')]: m.arms,
    [t('bodyMeasurements.thighs')]: m.thighs,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border p-3 rounded-lg shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value?.toFixed(1)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const latestMeasurement = measurements[measurements.length - 1];
  const firstMeasurement = measurements[0];
  const weightChange = latestMeasurement.weight && firstMeasurement.weight
    ? (latestMeasurement.weight - firstMeasurement.weight).toFixed(1)
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('progress.bodyProgress')}</CardTitle>
        <CardDescription>
          {t('progress.bodyProgressDesc')}
          {weightChange && (
            <span className={`ml-2 font-semibold ${parseFloat(weightChange) >= 0 ? 'text-orange-500' : 'text-green-500'}`}>
              ({parseFloat(weightChange) >= 0 ? '+' : ''}{weightChange} kg)
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="weight" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="weight">{t('progress.tabWeight')}</TabsTrigger>
            <TabsTrigger value="measurements">{t('progress.tabMeasurements')}</TabsTrigger>
          </TabsList>

          <TabsContent value="weight" className="mt-6">
            {weightData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weightData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey={t('progress.tabWeight')}
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", r: 4 }}
                    name={`${t('progress.tabWeight')} (kg)`}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {t('progress.noWeightData')}
              </div>
            )}
          </TabsContent>

          <TabsContent value="measurements" className="mt-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={bodyMeasurementsData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey={t('bodyMeasurements.neck')} stroke="#8884d8" strokeWidth={2} />
                <Line type="monotone" dataKey={t('bodyMeasurements.chest')} stroke="#82ca9d" strokeWidth={2} />
                <Line type="monotone" dataKey={t('bodyMeasurements.waist')} stroke="#ffc658" strokeWidth={2} />
                <Line type="monotone" dataKey={t('bodyMeasurements.hips')} stroke="#ff8042" strokeWidth={2} />
                <Line type="monotone" dataKey={t('bodyMeasurements.arms')} stroke="#a4de6c" strokeWidth={2} />
                <Line type="monotone" dataKey={t('bodyMeasurements.thighs')} stroke="#d0ed57" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
