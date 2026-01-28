import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card3D, Card3DContent, Card3DHeader } from "@/components/ui/card-3d";
import { Icon3D } from "@/components/ui/icon-3d";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { BarChart3, TrendingUp, TrendingDown, Minus, Calendar } from "lucide-react";
import { format, subDays, startOfDay, isSameDay } from "date-fns";
import { es, enUS } from "date-fns/locale";
import type { MoodLog } from "@/hooks/useWellness";

const moodEmojis: { [key: number]: string } = {
  5: '😊',
  4: '🙂',
  3: '😐',
  2: '😔',
  1: '😫',
};

const moodColors: { [key: number]: string } = {
  5: 'bg-emerald-500',
  4: 'bg-lime-500',
  3: 'bg-yellow-500',
  2: 'bg-orange-500',
  1: 'bg-red-500',
};

interface MoodHistoryChartProps {
  moods: MoodLog[];
  averageMood: number;
  trend: 'up' | 'down' | 'stable';
  daysToShow?: number;
}

export function MoodHistoryChart({ 
  moods, 
  averageMood, 
  trend,
  daysToShow = 7 
}: MoodHistoryChartProps) {
  const { language } = useLanguage();
  const locale = language === 'es' ? es : enUS;

  const texts = {
    es: {
      title: 'Tu Semana',
      average: 'Promedio',
      trend: 'Tendencia',
      trendUp: 'Mejorando',
      trendDown: 'Bajando',
      trendStable: 'Estable',
      noData: 'Sin registro',
    },
    en: {
      title: 'Your Week',
      average: 'Average',
      trend: 'Trend',
      trendUp: 'Improving',
      trendDown: 'Declining',
      trendStable: 'Stable',
      noData: 'No log',
    },
  };
  const t = texts[language];

  // Generate last N days with mood data
  const chartData = useMemo(() => {
    const days = [];
    const today = startOfDay(new Date());
    
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = subDays(today, i);
      const moodForDay = moods.find(m => isSameDay(new Date(m.logged_at), date));
      
      days.push({
        date,
        dayName: format(date, 'EEE', { locale }).charAt(0).toUpperCase() + format(date, 'EEE', { locale }).slice(1, 3),
        isToday: i === 0,
        mood: moodForDay?.mood_score || null,
        factors: moodForDay?.factors || [],
      });
    }
    
    return days;
  }, [moods, daysToShow, locale]);

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendText = trend === 'up' ? t.trendUp : trend === 'down' ? t.trendDown : t.trendStable;
  const trendColor = trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-rose-500' : 'text-muted-foreground';

  return (
    <Card3D variant="default">
      <Card3DHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon3D icon={BarChart3} color="primary" size="md" />
            <h3 className="font-bold">{t.title}</h3>
          </div>
          <div className="flex items-center gap-2">
            {averageMood > 0 && (
              <Badge variant="secondary" className="text-xs">
                {t.average}: {averageMood.toFixed(1)} {moodEmojis[Math.round(averageMood)]}
              </Badge>
            )}
          </div>
        </div>
      </Card3DHeader>
      <Card3DContent>
        {/* Chart bars */}
        <div className="flex items-end justify-between gap-2 h-32 mb-4">
          {chartData.map((day, index) => (
            <motion.div
              key={day.date.toISOString()}
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ delay: index * 0.05 }}
              className="flex flex-col items-center gap-1 flex-1"
              style={{ transformOrigin: 'bottom' }}
            >
              {/* Mood emoji or placeholder */}
              <div className="text-lg h-7 flex items-center justify-center">
                {day.mood ? moodEmojis[day.mood] : '–'}
              </div>
              
              {/* Bar */}
              <div className="relative w-full h-20 bg-muted/50 rounded-t-lg overflow-hidden">
                {day.mood && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(day.mood / 5) * 100}%` }}
                    transition={{ delay: index * 0.05 + 0.2, type: "spring", stiffness: 100 }}
                    className={`absolute bottom-0 w-full rounded-t-lg ${moodColors[day.mood]}`}
                  />
                )}
              </div>
              
              {/* Day name */}
              <span className={`text-xs font-medium ${day.isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                {day.dayName}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Trend indicator */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <span className="text-sm text-muted-foreground">{t.trend}</span>
          <div className={`flex items-center gap-1.5 ${trendColor}`}>
            <TrendIcon className="h-4 w-4" />
            <span className="text-sm font-medium">{trendText}</span>
          </div>
        </div>
      </Card3DContent>
    </Card3D>
  );
}
