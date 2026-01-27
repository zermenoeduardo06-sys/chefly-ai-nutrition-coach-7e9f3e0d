import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { Loader2, Scale, Ruler } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card3D, Card3DContent, Card3DHeader } from "@/components/ui/card-3d";
import { Icon3D } from "@/components/ui/icon-3d";
import { motion } from "framer-motion";

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
      <Card3D variant="default" className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Card3D>
    );
  }

  if (measurements.length === 0) {
    return (
      <Card3D variant="default" className="p-6">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-muted-foreground mb-2">{t('progress.noMeasurements')}</p>
          <p className="text-sm text-muted-foreground">
            {t('progress.startRecording')}
          </p>
        </div>
      </Card3D>
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
        <div className="bg-card border-2 border-border p-3 rounded-2xl shadow-lg">
          <p className="font-bold mb-2 text-foreground">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card3D variant="default">
        <Card3DHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon3D icon={Ruler} color="secondary" size="md" />
              <div>
                <h3 className="text-lg font-bold">{t('progress.bodyProgress')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('progress.bodyProgressDesc')}
                  {weightChange && (
                    <span className={`ml-2 font-bold ${parseFloat(weightChange) >= 0 ? 'text-orange-500' : 'text-emerald-500'}`}>
                      ({parseFloat(weightChange) >= 0 ? '+' : ''}{weightChange} kg)
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </Card3DHeader>
        <Card3DContent>
          <Tabs defaultValue="weight" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-muted/50 rounded-xl">
              <TabsTrigger 
                value="weight" 
                className="rounded-lg font-semibold data-[state=active]:bg-card data-[state=active]:shadow-[0_2px_0_hsl(var(--border))]"
              >
                <Scale className="h-4 w-4 mr-2" />
                {t('progress.tabWeight')}
              </TabsTrigger>
              <TabsTrigger 
                value="measurements"
                className="rounded-lg font-semibold data-[state=active]:bg-card data-[state=active]:shadow-[0_2px_0_hsl(var(--border))]"
              >
                <Ruler className="h-4 w-4 mr-2" />
                {t('progress.tabMeasurements')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="weight" className="mt-6">
              {weightData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={weightData}>
                    <defs>
                      <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                    <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey={t('progress.tabWeight')}
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      fill="url(#weightGradient)"
                      dot={{ fill: "hsl(var(--primary))", r: 5, strokeWidth: 2, stroke: "hsl(var(--background))" }}
                      activeDot={{ r: 7, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {t('progress.noWeightData')}
                </div>
              )}
            </TabsContent>

            <TabsContent value="measurements" className="mt-6">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={bodyMeasurementsData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                  <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: 16 }} />
                  <Line type="monotone" dataKey={t('bodyMeasurements.neck')} stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey={t('bodyMeasurements.chest')} stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey={t('bodyMeasurements.waist')} stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey={t('bodyMeasurements.hips')} stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey={t('bodyMeasurements.arms')} stroke="#06b6d4" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey={t('bodyMeasurements.thighs')} stroke="#84cc16" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </Card3DContent>
      </Card3D>
    </motion.div>
  );
};
