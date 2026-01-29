import { useState, useEffect } from 'react';
import { Camera, Flame, TrendingUp, Calendar, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Stat3DCard } from '@/components/progress/Stat3DCard';
import { Card3D } from '@/components/ui/card-3d';
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
    totalScans: language === 'es' ? 'Escaneos' : 'Scans',
    avgCalories: language === 'es' ? 'Promedio' : 'Average',
    scanStreak: language === 'es' ? 'Racha' : 'Streak',
    thisWeek: language === 'es' ? 'Esta semana' : 'This week',
    noData: language === 'es' ? 'Sin datos aún' : 'No data yet',
    goalHint: language === 'es' ? '¡Mantén tu racha activa!' : 'Keep your streak alive!',
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
            <Skeleton key={i} className="h-32 rounded-3xl" />
          ))}
        </div>
        <Skeleton className="h-48 rounded-3xl" />
      </div>
    );
  }

  if (!stats) return null;

  const maxCount = Math.max(...stats.weeklyScans.map(d => d.count), 1);
  const todayScans = stats.weeklyScans.find(d => isSameDay(d.date, new Date()))?.count || 0;
  const scansRemaining = Math.max(0, 3 - todayScans);

  return (
    <div className="space-y-6">
      {/* Stats Cards - Using Stat3DCard */}
      <div className="grid grid-cols-3 gap-3">
        <Stat3DCard
          icon={Camera}
          value={stats.totalScans}
          label={t.totalScans}
          color="primary"
          delay={0}
        />
        <Stat3DCard
          icon={Flame}
          value={stats.avgCalories}
          label={t.avgCalories}
          color="amber"
          suffix=" kcal"
          delay={0.1}
        />
        <Stat3DCard
          icon={TrendingUp}
          value={stats.currentStreak}
          label={t.scanStreak}
          color="emerald"
          suffix={language === 'es' ? ' días' : ' days'}
          delay={0.2}
        />
      </div>

      {/* Weekly Activity - 3D Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card3D variant="default" className="p-5">
          <h3 className="text-sm font-bold mb-5 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            {t.thisWeek}
          </h3>
          
          <div className="flex items-end justify-between gap-2 h-28">
            {stats.weeklyScans.map((day, index) => {
              const isToday = isSameDay(day.date, new Date());
              const barHeight = Math.max((day.count / maxCount) * 100, day.count > 0 ? 25 : 15);
              
              return (
                <motion.div
                  key={index}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.4 + index * 0.05, duration: 0.4 }}
                  className="flex-1 flex flex-col items-center gap-2"
                  style={{ transformOrigin: 'bottom' }}
                >
                  <div className="relative w-full flex justify-center" style={{ height: '70px' }}>
                    {day.count > 0 && (
                      <motion.span 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 + index * 0.05 }}
                        className="absolute -top-5 text-xs font-bold text-primary"
                      >
                        {day.count}
                      </motion.span>
                    )}
                    <div 
                      className={`w-8 rounded-t-xl transition-all ${
                        day.count > 0 
                          ? 'bg-gradient-to-t from-primary to-primary/60 shadow-[0_3px_0_hsl(var(--primary)/0.4)]' 
                          : 'bg-muted shadow-[0_2px_0_hsl(var(--border))]'
                      } ${isToday ? 'ring-2 ring-primary/30' : ''}`}
                      style={{ 
                        height: `${barHeight}%`,
                        position: 'absolute',
                        bottom: 0
                      }}
                    />
                  </div>
                  <span className={`text-[10px] font-bold ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                    {format(day.date, 'EEE', { locale: language === 'es' ? es : enUS }).slice(0, 1).toUpperCase()}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </Card3D>
      </motion.div>

      {/* Achievement hint - 3D Glass Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card3D variant="glass" className="p-4 flex items-center gap-4 bg-gradient-to-r from-primary/5 to-amber-500/5">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shadow-[0_4px_0_hsl(var(--primary)/0.2)]">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Target className="h-7 w-7 text-primary" />
            </motion.div>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold">
              {scansRemaining > 0 
                ? (language === 'es' 
                    ? `¡Escanea ${scansRemaining} comida${scansRemaining > 1 ? 's' : ''} más hoy!`
                    : `Scan ${scansRemaining} more meal${scansRemaining > 1 ? 's' : ''} today!`)
                : (language === 'es' ? '¡Meta diaria completada! 🎉' : 'Daily goal completed! 🎉')
              }
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{t.goalHint}</p>
          </div>
        </Card3D>
      </motion.div>
    </div>
  );
}
