import { useState, useEffect } from 'react';
import { Camera, Flame, TrendingUp, Calendar, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { startOfWeek, endOfWeek, format, eachDayOfInterval, isSameDay } from 'date-fns';
import { es, enUS } from 'date-fns/locale';

interface ScanStats {
  totalScans: number;
  avgCalories: number;
  currentStreak: number;
  weeklyScans: { date: Date; count: number }[];
}

export function ScannerStats() {
  const { language } = useLanguage();
  const [stats, setStats] = useState<ScanStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const t = {
    totalScans: language === 'es' ? 'Escaneos totales' : 'Total scans',
    avgCalories: language === 'es' ? 'Promedio calorías' : 'Avg calories',
    scanStreak: language === 'es' ? 'Racha de días' : 'Day streak',
    thisWeek: language === 'es' ? 'Esta semana' : 'This week',
    noData: language === 'es' ? 'Sin datos aún' : 'No data yet',
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: scans, error } = await supabase
          .from('food_scans')
          .select('calories, scanned_at')
          .eq('user_id', user.id)
          .order('scanned_at', { ascending: false });

        if (error) throw error;

        // Calculate stats
        const totalScans = scans?.length || 0;
        const avgCalories = totalScans > 0
          ? Math.round(scans.reduce((sum, s) => sum + (s.calories || 0), 0) / totalScans)
          : 0;

        // Calculate streak
        let currentStreak = 0;
        const today = new Date();
        const scanDates = [...new Set(scans?.map(s => 
          format(new Date(s.scanned_at), 'yyyy-MM-dd')
        ))];
        
        for (let i = 0; i < 365; i++) {
          const checkDate = new Date(today);
          checkDate.setDate(checkDate.getDate() - i);
          const dateStr = format(checkDate, 'yyyy-MM-dd');
          
          if (scanDates.includes(dateStr)) {
            currentStreak++;
          } else if (i > 0) {
            break;
          }
        }

        // Calculate weekly scans
        const weekStart = startOfWeek(today, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
        const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
        
        const weeklyScans = daysOfWeek.map(day => ({
          date: day,
          count: scans?.filter(s => isSameDay(new Date(s.scanned_at), day)).length || 0
        }));

        setStats({ totalScans, avgCalories, currentStreak, weeklyScans });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    { 
      label: t.totalScans, 
      value: stats.totalScans, 
      icon: Camera, 
      color: 'text-primary', 
      bg: 'bg-primary/10' 
    },
    { 
      label: t.avgCalories, 
      value: stats.avgCalories, 
      unit: 'kcal',
      icon: Flame, 
      color: 'text-orange-500', 
      bg: 'bg-orange-500/10' 
    },
    { 
      label: t.scanStreak, 
      value: stats.currentStreak, 
      unit: language === 'es' ? 'días' : 'days',
      icon: TrendingUp, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-500/10' 
    },
  ];

  const maxCount = Math.max(...stats.weeklyScans.map(d => d.count), 1);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${stat.bg} rounded-2xl p-4 text-center`}
          >
            <stat.icon className={`h-6 w-6 ${stat.color} mx-auto mb-2`} />
            <div className={`text-2xl font-bold ${stat.color}`}>
              {stat.value}
              {stat.unit && <span className="text-xs font-medium ml-1">{stat.unit}</span>}
            </div>
            <div className="text-[10px] text-muted-foreground font-medium mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Weekly Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card rounded-2xl p-5 border border-border/50"
      >
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          {t.thisWeek}
        </h3>
        
        <div className="flex items-end justify-between gap-2 h-24">
          {stats.weeklyScans.map((day, index) => (
            <motion.div
              key={index}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 0.4 + index * 0.05, duration: 0.3 }}
              className="flex-1 flex flex-col items-center gap-2"
              style={{ transformOrigin: 'bottom' }}
            >
              <div className="relative w-full flex justify-center" style={{ height: '60px' }}>
                <div 
                  className={`w-8 rounded-t-lg ${day.count > 0 ? 'bg-gradient-to-t from-primary to-primary/60' : 'bg-muted'}`}
                  style={{ 
                    height: `${Math.max((day.count / maxCount) * 100, day.count > 0 ? 20 : 10)}%`,
                    position: 'absolute',
                    bottom: 0
                  }}
                />
                {day.count > 0 && (
                  <span className="absolute -top-5 text-xs font-medium text-primary">
                    {day.count}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground font-medium">
                {format(day.date, 'EEE', { locale: language === 'es' ? es : enUS }).slice(0, 1).toUpperCase()}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Achievement hint */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-primary/10 to-orange-500/10 rounded-2xl p-4 flex items-center gap-3"
      >
        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
          <Target className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">
            {language === 'es' 
              ? `¡Escanea ${3 - (stats.weeklyScans.find(d => isSameDay(d.date, new Date()))?.count || 0)} comidas más hoy!`
              : `Scan ${3 - (stats.weeklyScans.find(d => isSameDay(d.date, new Date()))?.count || 0)} more meals today!`
            }
          </p>
          <p className="text-xs text-muted-foreground">
            {language === 'es' ? 'Mantén tu racha activa' : 'Keep your streak alive'}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
