import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2, Flame, Beef, Wheat, Droplets, Calendar, Camera, Sparkles, Leaf } from 'lucide-react';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { FoodScanner } from '@/components/FoodScanner';

interface FoodScan {
  id: string;
  dish_name: string;
  foods_identified: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  confidence: string;
  notes: string | null;
  image_url: string | null;
  scanned_at: string;
}

const FoodHistory = () => {
  const [scans, setScans] = useState<FoodScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { toast } = useToast();

  const t = {
    title: language === 'es' ? 'Historial de Escaneos' : 'Scan History',
    subtitle: language === 'es' ? 'Tu registro nutricional diario' : 'Your daily nutrition log',
    back: language === 'es' ? 'Volver' : 'Back',
    noScans: language === 'es' ? '¡Comienza a escanear!' : 'Start scanning!',
    noScansDesc: language === 'es' 
      ? 'Escanea tu comida para llevar un registro de tus calorías y nutrientes'
      : 'Scan your food to track your calories and nutrients',
    scanNow: language === 'es' ? 'Escanear Comida' : 'Scan Food',
    delete: language === 'es' ? 'Eliminar' : 'Delete',
    deleteTitle: language === 'es' ? '¿Eliminar escaneo?' : 'Delete scan?',
    deleteDesc: language === 'es' 
      ? 'Esta acción no se puede deshacer.'
      : 'This action cannot be undone.',
    cancel: language === 'es' ? 'Cancelar' : 'Cancel',
    deleted: language === 'es' ? 'Escaneo eliminado' : 'Scan deleted',
    today: language === 'es' ? 'Hoy' : 'Today',
    yesterday: language === 'es' ? 'Ayer' : 'Yesterday',
    totalToday: language === 'es' ? 'Total de Hoy' : "Today's Total",
  };

  useEffect(() => {
    loadScans();
  }, []);

  const loadScans = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('food_scans')
        .select('*')
        .eq('user_id', user.id)
        .order('scanned_at', { ascending: false });

      if (error) throw error;
      setScans(data || []);
    } catch (error) {
      console.error('Error loading scans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from('food_scans')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;

      setScans(scans.filter(s => s.id !== deleteId));
      toast({ title: t.deleted });
    } catch (error) {
      console.error('Error deleting scan:', error);
    } finally {
      setDeleteId(null);
    }
  };

  const handleScannerClose = (open: boolean) => {
    setShowScanner(open);
    if (!open) {
      loadScans();
    }
  };

  const getTodayStats = () => {
    const today = new Date().toDateString();
    const todayScans = scans.filter(s => new Date(s.scanned_at).toDateString() === today);
    return {
      calories: todayScans.reduce((sum, s) => sum + (s.calories || 0), 0),
      protein: todayScans.reduce((sum, s) => sum + (s.protein || 0), 0),
      carbs: todayScans.reduce((sum, s) => sum + (s.carbs || 0), 0),
      fat: todayScans.reduce((sum, s) => sum + (s.fat || 0), 0),
      count: todayScans.length
    };
  };

  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === now.toDateString()) {
      return t.today;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return t.yesterday;
    }
    return format(date, 'EEEE, d MMMM', { locale: language === 'es' ? es : enUS });
  };

  const groupScansByDate = () => {
    const groups: { [key: string]: FoodScan[] } = {};
    scans.forEach(scan => {
      const dateKey = new Date(scan.scanned_at).toDateString();
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(scan);
    });
    return groups;
  };

  const todayStats = getTodayStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
          <span className="text-muted-foreground text-sm">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background pb-28">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-br from-primary via-primary to-orange-500 pt-safe-top">
        <div className="p-4 pb-6">
          <div className="flex items-center gap-3 mb-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-white">{t.title}</h1>
              <p className="text-white/70 text-sm">{t.subtitle}</p>
            </div>
          </div>

          {/* Today's Stats Summary */}
          {todayStats.count > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/80 text-sm font-medium">{t.totalToday}</span>
                <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                  {todayStats.count} {language === 'es' ? 'comidas' : 'meals'}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{todayStats.calories}</div>
                  <div className="text-white/60 text-xs">kcal</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-white">{todayStats.protein}g</div>
                  <div className="text-white/60 text-xs">Prot</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-white">{todayStats.carbs}g</div>
                  <div className="text-white/60 text-xs">Carbs</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-white">{todayStats.fat}g</div>
                  <div className="text-white/60 text-xs">Grasa</div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {scans.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary/20 to-orange-500/20 rounded-full flex items-center justify-center mb-6">
              <Camera className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-xl font-bold mb-2">{t.noScans}</h2>
            <p className="text-muted-foreground text-sm mb-8 max-w-xs mx-auto">{t.noScansDesc}</p>
            <Button 
              onClick={() => setShowScanner(true)} 
              size="lg"
              className="gap-2 rounded-xl shadow-lg"
            >
              <Sparkles className="h-5 w-5" />
              {t.scanNow}
            </Button>
          </motion.div>
        ) : (
          <AnimatePresence>
            {Object.entries(groupScansByDate()).map(([dateKey, dateScans], groupIdx) => (
              <motion.div 
                key={dateKey} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIdx * 0.1 }}
                className="space-y-3"
              >
                {/* Date Header */}
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-primary/10 rounded-lg">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-foreground capitalize">
                    {formatDateHeader(dateKey)}
                  </span>
                  <div className="flex-1 h-px bg-border/50" />
                </div>
                
                {/* Scan Cards */}
                {dateScans.map((scan, idx) => (
                  <motion.div
                    key={scan.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => setExpandedId(expandedId === scan.id ? null : scan.id)}
                    className="cursor-pointer"
                  >
                    <div className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border/50 hover:shadow-md transition-shadow">
                      <div className="flex gap-0">
                        {/* Image */}
                        {scan.image_url ? (
                          <div className="w-28 h-28 flex-shrink-0 relative">
                            <img 
                              src={scan.image_url} 
                              alt={scan.dish_name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full">
                              {format(new Date(scan.scanned_at), 'HH:mm')}
                            </div>
                          </div>
                        ) : (
                          <div className="w-28 h-28 flex-shrink-0 bg-gradient-to-br from-primary/10 to-orange-500/10 flex items-center justify-center">
                            <Camera className="h-8 w-8 text-primary/40" />
                          </div>
                        )}
                        
                        {/* Content */}
                        <div className="flex-1 p-3 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm line-clamp-1 text-card-foreground">{scan.dish_name}</h3>
                              {scan.foods_identified && scan.foods_identified.length > 0 && (
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {scan.foods_identified.slice(0, 3).join(', ')}
                                </p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteId(scan.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          {/* Nutrition Grid */}
                          <div className="grid grid-cols-4 gap-2 mt-3">
                            <div className="bg-orange-500/10 dark:bg-orange-500/20 rounded-lg p-1.5 text-center">
                              <Flame className="h-3 w-3 mx-auto text-orange-500" />
                              <div className="text-xs font-bold text-orange-500 dark:text-orange-400">{scan.calories}</div>
                            </div>
                            <div className="bg-red-500/10 dark:bg-red-500/20 rounded-lg p-1.5 text-center">
                              <Beef className="h-3 w-3 mx-auto text-red-500" />
                              <div className="text-xs font-bold text-red-500 dark:text-red-400">{scan.protein}g</div>
                            </div>
                            <div className="bg-amber-500/10 dark:bg-amber-500/20 rounded-lg p-1.5 text-center">
                              <Wheat className="h-3 w-3 mx-auto text-amber-500" />
                              <div className="text-xs font-bold text-amber-500 dark:text-amber-400">{scan.carbs}g</div>
                            </div>
                            <div className="bg-blue-500/10 dark:bg-blue-500/20 rounded-lg p-1.5 text-center">
                              <Droplets className="h-3 w-3 mx-auto text-blue-500" />
                              <div className="text-xs font-bold text-blue-500 dark:text-blue-400">{scan.fat}g</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      <AnimatePresence>
                        {expandedId === scan.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 pt-2 border-t border-border/50 space-y-3">
                              {scan.fiber > 0 && (
                                <div className="flex items-center gap-2">
                                  <Leaf className="h-4 w-4 text-green-500" />
                                  <span className="text-sm text-muted-foreground">
                                    {language === 'es' ? 'Fibra' : 'Fiber'}: <strong>{scan.fiber}g</strong>
                                  </span>
                                </div>
                              )}
                              {scan.notes && (
                                <div className="bg-amber-500/10 dark:bg-amber-500/20 rounded-xl p-3 text-sm text-amber-700 dark:text-amber-300">
                                  {scan.notes}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* FAB for new scan */}
      {scans.length > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-24 right-4 z-20"
        >
          <Button
            onClick={() => setShowScanner(true)}
            className="h-14 w-14 rounded-full shadow-lg bg-gradient-to-br from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90"
            size="icon"
          >
            <Camera className="h-6 w-6" />
          </Button>
        </motion.div>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{t.deleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>{t.deleteDesc}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">{t.cancel}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-destructive text-destructive-foreground rounded-xl"
            >
              {t.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Scanner */}
      <FoodScanner open={showScanner} onOpenChange={handleScannerClose} />
    </div>
  );
};

export default FoodHistory;
