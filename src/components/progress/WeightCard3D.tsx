import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Scale, TrendingDown, TrendingUp, Target, Minus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card3D } from "@/components/ui/card-3d";
import { Icon3D } from "@/components/ui/icon-3d";

interface WeightCard3DProps {
  userId: string;
}

interface WeightData {
  current: number | null;
  target: number | null;
  start: number | null;
  history: number[];
}

export function WeightCard3D({ userId }: WeightCard3DProps) {
  const { language } = useLanguage();
  const [data, setData] = useState<WeightData>({
    current: null,
    target: null,
    start: null,
    history: [],
  });
  const [loading, setLoading] = useState(true);

  const texts = {
    es: {
      currentWeight: "Peso Actual",
      target: "Meta",
      start: "Inicio",
      noData: "Sin datos",
      kg: "kg",
      change: "Cambio",
    },
    en: {
      currentWeight: "Current Weight",
      target: "Target",
      start: "Start",
      noData: "No data",
      kg: "kg",
      change: "Change",
    },
  };
  const t = texts[language];

  useEffect(() => {
    if (!userId) return;
    loadWeightData();
  }, [userId]);

  const loadWeightData = async () => {
    try {
      // Get user preferences for target
      const { data: prefs } = await supabase
        .from("user_preferences")
        .select("weight, target_weight")
        .eq("user_id", userId)
        .single();

      // Get latest measurements
      const { data: measurements } = await supabase
        .from("body_measurements")
        .select("weight, measurement_date")
        .eq("user_id", userId)
        .order("measurement_date", { ascending: false })
        .limit(7);

      const history = measurements
        ?.filter((m) => m.weight != null)
        .map((m) => m.weight as number)
        .reverse() || [];

      setData({
        current: measurements?.[0]?.weight ?? prefs?.weight ?? null,
        target: prefs?.target_weight ?? null,
        start: prefs?.weight ?? null,
        history,
      });
    } catch (error) {
      console.error("Error loading weight data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card3D variant="elevated" className="p-6 animate-pulse">
        <div className="h-32 bg-muted/50 rounded-xl" />
      </Card3D>
    );
  }

  if (!data.current) {
    return null;
  }

  const change = data.start ? +(data.current - data.start).toFixed(1) : 0;
  const isLoss = change < 0;
  const isGain = change > 0;
  const toGoal = data.target ? +(data.current - data.target).toFixed(1) : null;

  // Simple sparkline
  const maxWeight = Math.max(...data.history, data.current || 0);
  const minWeight = Math.min(...data.history.filter(w => w > 0), data.current || 100);
  const range = maxWeight - minWeight || 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card3D variant="elevated" className="p-5">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <Icon3D icon={Scale} color="sky" size="xl" animate />

          {/* Main content */}
          <div className="flex-1">
            <p className="text-sm text-muted-foreground font-medium mb-1">
              {t.currentWeight}
            </p>
            <div className="flex items-baseline gap-2">
              <motion.span
                className="text-4xl font-black text-foreground"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                {data.current}
              </motion.span>
              <span className="text-lg text-muted-foreground">{t.kg}</span>
            </div>

            {/* Change indicator */}
            {data.start && (
              <div className="flex items-center gap-2 mt-2">
                <div
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                    isLoss
                      ? "bg-emerald-500/20 text-emerald-600"
                      : isGain
                      ? "bg-orange-500/20 text-orange-600"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isLoss ? (
                    <TrendingDown className="w-3 h-3" />
                  ) : isGain ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <Minus className="w-3 h-3" />
                  )}
                  {isGain && "+"}
                  {change} {t.kg}
                </div>
                <span className="text-xs text-muted-foreground">
                  {t.change}
                </span>
              </div>
            )}
          </div>

          {/* Sparkline */}
          {data.history.length >= 2 && (
            <div className="w-20 h-12 flex items-end gap-0.5">
              {data.history.slice(-7).map((weight, i) => {
                const height = ((weight - minWeight) / range) * 100;
                return (
                  <motion.div
                    key={i}
                    className="flex-1 bg-primary/30 rounded-t-sm"
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(height, 10)}%` }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Target section */}
        {data.target && toGoal !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                {t.target}: <span className="font-bold text-foreground">{data.target} {t.kg}</span>
              </span>
            </div>
            <span
              className={`text-sm font-bold ${
                Math.abs(toGoal) < 0.5
                  ? "text-emerald-500"
                  : toGoal > 0
                  ? "text-amber-500"
                  : "text-primary"
              }`}
            >
              {toGoal > 0 ? `-${toGoal}` : `+${Math.abs(toGoal)}`} {t.kg}
            </span>
          </motion.div>
        )}
      </Card3D>
    </motion.div>
  );
}
