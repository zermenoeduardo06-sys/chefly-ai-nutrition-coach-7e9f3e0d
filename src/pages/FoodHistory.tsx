import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2, Flame, Beef, Wheat, Droplets, Calendar, Camera, Sparkles, Leaf, ChevronDown, Clock, TrendingUp, Utensils, Plus, Zap, Filter, SunMedium, Moon, Coffee, Target } from 'lucide-react';
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
import cheflyMascot from '@/assets/chefly-mascot.png';

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
  portion_estimate?: string | null;
}

type MealTypeFilter = 'all' | 'breakfast' | 'lunch' | 'dinner';
type SourceFilter = 'all' | 'scanned' | 'meal_plan';

const FoodHistory = () => {
  const [scans, setScans] = useState<FoodScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [mealTypeFilter, setMealTypeFilter] = useState<MealTypeFilter>('all');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { toast } = useToast();

  const t = {
    title: language === 'es' ? 'Mi Historial' : 'My History',
    subtitle: language === 'es' ? 'Registro nutricional' : 'Nutrition log',
    back: language === 'es' ? 'Volver' : 'Back',
    noScans: language === 'es' ? '¡Comienza a escanear!' : 'Start scanning!',
    noScansDesc: language === 'es' 
      ? 'Escanea tu comida para llevar un registro de tus calorías y macros'
      : 'Scan your food to track your calories and macros',
    scanNow: language === 'es' ? 'Escanear Ahora' : 'Scan Now',
    delete: language === 'es' ? 'Eliminar' : 'Delete',
    deleteTitle: language === 'es' ? '¿Eliminar escaneo?' : 'Delete scan?',
    deleteDesc: language === 'es' 
      ? 'Esta acción no se puede deshacer.'
      : 'This action cannot be undone.',
    cancel: language === 'es' ? 'Cancelar' : 'Cancel',
    deleted: language === 'es' ? 'Escaneo eliminado' : 'Scan deleted',
    today: language === 'es' ? 'Hoy' : 'Today',
    yesterday: language === 'es' ? 'Ayer' : 'Yesterday',
    totalToday: language === 'es' ? 'Consumo de Hoy' : "Today's Intake",
    meals: language === 'es' ? 'comidas' : 'meals',
    protein: language === 'es' ? 'Proteína' : 'Protein',
    carbs: language === 'es' ? 'Carbos' : 'Carbs',
    fat: language === 'es' ? 'Grasa' : 'Fat',
    fiber: language === 'es' ? 'Fibra' : 'Fiber',
    viewMore: language === 'es' ? 'Ver más' : 'View more',
    filters: language === 'es' ? 'Filtros' : 'Filters',
    all: language === 'es' ? 'Todos' : 'All',
    breakfast: language === 'es' ? 'Desayuno' : 'Breakfast',
    lunch: language === 'es' ? 'Comida' : 'Lunch',
    dinner: language === 'es' ? 'Cena' : 'Dinner',
    scanned: language === 'es' ? 'Escaneado' : 'Scanned',
    mealPlan: language === 'es' ? 'Del Plan' : 'From Plan',
    mealType: language === 'es' ? 'Tipo' : 'Type',
    source: language === 'es' ? 'Origen' : 'Source',
    noResults: language === 'es' ? 'No hay resultados' : 'No results',
    noResultsDesc: language === 'es' 
      ? 'Prueba cambiando los filtros'
      : 'Try changing the filters',
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

  // Determine if scan is from daily challenge
  const isFromDailyChallenge = (scan: FoodScan) => {
    return scan.notes?.includes('[DAILY_CHALLENGE]');
  };

  // Determine if scan is from meal plan based on notes
  const isFromMealPlan = (scan: FoodScan) => {
    if (isFromDailyChallenge(scan)) return false;
    return scan.notes?.includes('plan') || scan.notes?.includes('Plan');
  };

  // Guess meal type based on time of day
  const getMealType = (scan: FoodScan): 'breakfast' | 'lunch' | 'dinner' => {
    const hour = new Date(scan.scanned_at).getHours();
    if (hour >= 5 && hour < 11) return 'breakfast';
    if (hour >= 11 && hour < 16) return 'lunch';
    return 'dinner';
  };

  // Filter scans based on selected filters
  const filteredScans = scans.filter(scan => {
    // Filter by meal type
    if (mealTypeFilter !== 'all') {
      const scanMealType = getMealType(scan);
      if (scanMealType !== mealTypeFilter) return false;
    }
    
    // Filter by source
    if (sourceFilter !== 'all') {
      const fromPlan = isFromMealPlan(scan);
      if (sourceFilter === 'meal_plan' && !fromPlan) return false;
      if (sourceFilter === 'scanned' && fromPlan) return false;
    }
    
    return true;
  });

  const groupScansByDate = () => {
    const groups: { [key: string]: FoodScan[] } = {};
    filteredScans.forEach(scan => {
      const dateKey = new Date(scan.scanned_at).toDateString();
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(scan);
    });
    return groups;
  };

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case 'high': return { color: 'bg-emerald-500', text: language === 'es' ? 'Alta' : 'High' };
      case 'medium': return { color: 'bg-amber-500', text: language === 'es' ? 'Media' : 'Medium' };
      case 'low': return { color: 'bg-red-500', text: language === 'es' ? 'Baja' : 'Low' };
      default: return { color: 'bg-muted', text: confidence };
    }
  };

  const activeFiltersCount = (mealTypeFilter !== 'all' ? 1 : 0) + (sourceFilter !== 'all' ? 1 : 0);

  const todayStats = getTodayStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="h-14 w-14 rounded-full border-[3px] border-primary/20 border-t-primary"
          />
          <span className="text-muted-foreground text-sm font-medium">
            {language === 'es' ? 'Cargando historial...' : 'Loading history...'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Premium Header */}
      <div className="relative overflow-hidden">
        {/* Safe area background extension for notch - extends primary color to top */}
        <div className="absolute top-0 left-0 right-0 h-[env(safe-area-inset-top,0px)] bg-primary z-20" />
        
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-orange-500">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
          <motion.div 
            className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div 
            className="absolute bottom-0 left-10 w-32 h-32 bg-orange-400/20 rounded-full blur-2xl"
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, delay: 1 }}
          />
        </div>
        
        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-6 z-10">
          <svg viewBox="0 0 1440 54" fill="none" preserveAspectRatio="none" className="w-full h-full">
            <path d="M0 54V0C240 40 480 50 720 45C960 40 1200 20 1440 0V54H0Z" className="fill-background" />
          </svg>
        </div>

        <div className="relative z-10 pt-safe-top px-4 pb-8">
          {/* Nav */}
          <div className="flex items-center justify-between py-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="text-white hover:bg-white/20 rounded-xl"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/80 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 font-medium flex items-center gap-1">
                <Zap className="h-3 w-3" />
                AI Scanner
              </span>
            </div>
          </div>

          {/* Title Section */}
          <div className="flex items-center gap-4 mt-2">
            <motion.div 
              className="relative"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <img src={cheflyMascot} alt="Chefly" className="h-10 w-10 object-contain" />
              </div>
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold text-white">{t.title}</h1>
              <p className="text-white/70 text-sm">{t.subtitle}</p>
            </div>
          </div>

          {/* Today's Stats Summary Card */}
          {todayStats.count > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-5 bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/10"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-white/80" />
                  <span className="text-white/90 text-sm font-semibold">{t.totalToday}</span>
                </div>
                <span className="bg-white/25 text-white text-xs px-2.5 py-1 rounded-full font-medium">
                  {todayStats.count} {t.meals}
                </span>
              </div>
              
              {/* Calories Hero */}
              <div className="flex items-center gap-4 mb-4">
              <div className="p-2.5 bg-white/20 rounded-xl">
                  <Flame className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-3xl font-black text-white">{todayStats.calories}</div>
                  <div className="text-white/60 text-xs">{language === 'es' ? 'kcal consumidas' : 'kcal consumed'}</div>
                </div>
              </div>

              {/* Macros */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white/10 rounded-xl p-2.5 text-center">
                  <div className="text-lg font-bold text-white">{todayStats.protein}g</div>
                  <div className="text-white/50 text-[10px] uppercase tracking-wider">{t.protein}</div>
                </div>
                <div className="bg-white/10 rounded-xl p-2.5 text-center">
                  <div className="text-lg font-bold text-white">{todayStats.carbs}g</div>
                  <div className="text-white/50 text-[10px] uppercase tracking-wider">{t.carbs}</div>
                </div>
                <div className="bg-white/10 rounded-xl p-2.5 text-center">
                  <div className="text-lg font-bold text-white">{todayStats.fat}g</div>
                  <div className="text-white/50 text-[10px] uppercase tracking-wider">{t.fat}</div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <div className="px-4 py-2 space-y-5">
        {/* Filters Section */}
        {scans.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {/* Filter Toggle Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="w-full justify-between rounded-xl border-border/50 bg-card/50 backdrop-blur-sm"
            >
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-primary" />
                <span className="font-medium">{t.filters}</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </div>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>

            {/* Filter Options */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-card rounded-2xl border border-border/50 p-4 space-y-4">
                    {/* Meal Type Filter */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t.mealType}</label>
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          size="sm"
                          variant={mealTypeFilter === 'all' ? 'default' : 'outline'}
                          onClick={() => setMealTypeFilter('all')}
                          className="rounded-xl text-xs h-9"
                        >
                          {t.all}
                        </Button>
                        <Button
                          size="sm"
                          variant={mealTypeFilter === 'breakfast' ? 'default' : 'outline'}
                          onClick={() => setMealTypeFilter('breakfast')}
                          className="rounded-xl text-xs h-9 gap-1.5"
                        >
                          <Coffee className="h-3.5 w-3.5" />
                          {t.breakfast}
                        </Button>
                        <Button
                          size="sm"
                          variant={mealTypeFilter === 'lunch' ? 'default' : 'outline'}
                          onClick={() => setMealTypeFilter('lunch')}
                          className="rounded-xl text-xs h-9 gap-1.5"
                        >
                          <SunMedium className="h-3.5 w-3.5" />
                          {t.lunch}
                        </Button>
                        <Button
                          size="sm"
                          variant={mealTypeFilter === 'dinner' ? 'default' : 'outline'}
                          onClick={() => setMealTypeFilter('dinner')}
                          className="rounded-xl text-xs h-9 gap-1.5"
                        >
                          <Moon className="h-3.5 w-3.5" />
                          {t.dinner}
                        </Button>
                      </div>
                    </div>

                    {/* Source Filter */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t.source}</label>
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          size="sm"
                          variant={sourceFilter === 'all' ? 'default' : 'outline'}
                          onClick={() => setSourceFilter('all')}
                          className="rounded-xl text-xs h-9"
                        >
                          {t.all}
                        </Button>
                        <Button
                          size="sm"
                          variant={sourceFilter === 'scanned' ? 'default' : 'outline'}
                          onClick={() => setSourceFilter('scanned')}
                          className="rounded-xl text-xs h-9 gap-1.5"
                        >
                          <Camera className="h-3.5 w-3.5" />
                          {t.scanned}
                        </Button>
                        <Button
                          size="sm"
                          variant={sourceFilter === 'meal_plan' ? 'default' : 'outline'}
                          onClick={() => setSourceFilter('meal_plan')}
                          className="rounded-xl text-xs h-9 gap-1.5"
                        >
                          <Utensils className="h-3.5 w-3.5" />
                          {t.mealPlan}
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {scans.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <motion.div 
              className="w-28 h-28 mx-auto bg-gradient-to-br from-primary/20 via-primary/10 to-orange-500/20 rounded-3xl flex items-center justify-center mb-6 shadow-inner"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              <Camera className="h-14 w-14 text-primary" />
            </motion.div>
            <h2 className="text-xl font-bold mb-2 text-foreground">{t.noScans}</h2>
            <p className="text-muted-foreground text-sm mb-8 max-w-xs mx-auto leading-relaxed">{t.noScansDesc}</p>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                onClick={() => setShowScanner(true)} 
                size="lg"
                className="gap-2 rounded-2xl shadow-xl px-8 h-14 font-bold bg-gradient-to-r from-primary to-orange-500"
              >
                <Sparkles className="h-5 w-5" />
                {t.scanNow}
              </Button>
            </motion.div>
          </motion.div>
        ) : filteredScans.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 mx-auto bg-muted/50 rounded-2xl flex items-center justify-center mb-4">
              <Filter className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">{t.noResults}</h3>
            <p className="text-muted-foreground text-sm mb-4">{t.noResultsDesc}</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setMealTypeFilter('all');
                setSourceFilter('all');
              }}
              className="rounded-xl"
            >
              {language === 'es' ? 'Limpiar filtros' : 'Clear filters'}
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
                <div className="flex items-center gap-3 px-1">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-bold text-foreground capitalize">
                    {formatDateHeader(dateKey)}
                  </span>
                  <div className="flex-1 h-px bg-gradient-to-r from-border/50 to-transparent" />
                  <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                    {dateScans.length}
                  </span>
                </div>
                
                {/* Scan Cards */}
                <div className="space-y-3">
                  {dateScans.map((scan, idx) => (
                    <motion.div
                      key={scan.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      transition={{ delay: idx * 0.05 }}
                      layout
                    >
                      <div 
                        className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border/50 hover:shadow-lg hover:border-primary/20 transition-all duration-300"
                        onClick={() => setExpandedId(expandedId === scan.id ? null : scan.id)}
                      >
                        <div className="flex gap-0">
                          {/* Image Section */}
                          <div className="relative w-28 h-28 flex-shrink-0">
                            {scan.image_url ? (
                              <>
                                <img 
                                  src={scan.image_url} 
                                  alt={scan.dish_name}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                              </>
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-primary/10 to-orange-500/10 flex items-center justify-center">
                                <Utensils className="h-8 w-8 text-primary/30" />
                              </div>
                            )}
                            {/* Time Badge */}
                            <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Clock className="h-2.5 w-2.5" />
                              {format(new Date(scan.scanned_at), 'HH:mm')}
                            </div>
                            {/* Source Badge */}
                            <div className={`absolute top-2 left-2 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 ${
                              isFromDailyChallenge(scan) 
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                                : isFromMealPlan(scan) 
                                  ? 'bg-secondary/90' 
                                  : 'bg-primary/90'
                            }`}>
                              {isFromDailyChallenge(scan) ? (
                                <>
                                  <Target className="h-2.5 w-2.5" />
                                  <span>{language === 'es' ? 'Desafío' : 'Challenge'}</span>
                                </>
                              ) : isFromMealPlan(scan) ? (
                                <>
                                  <Utensils className="h-2.5 w-2.5" />
                                  <span>{language === 'es' ? 'Plan' : 'Plan'}</span>
                                </>
                              ) : (
                                <>
                                  <Camera className="h-2.5 w-2.5" />
                                  <span>{language === 'es' ? 'AI' : 'AI'}</span>
                                </>
                              )}
                            </div>
                          </div>
                          
                          {/* Content Section */}
                          <div className="flex-1 p-3 min-w-0 flex flex-col">
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-sm line-clamp-1 text-foreground">{scan.dish_name}</h3>
                                {scan.foods_identified && scan.foods_identified.length > 0 && (
                                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                    {scan.foods_identified.slice(0, 3).join(' • ')}
                                  </p>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex-shrink-0 rounded-lg"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteId(scan.id);
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                            
                            {/* Nutrition Pills */}
                            <div className="flex items-center gap-1.5 mt-auto pt-2">
                              <div className="flex items-center gap-1 bg-orange-500/15 text-orange-600 dark:text-orange-400 rounded-lg px-2 py-1">
                                <Flame className="h-3 w-3" />
                                <span className="text-xs font-bold">{scan.calories}</span>
                              </div>
                              <div className="flex items-center gap-1 bg-red-500/15 text-red-600 dark:text-red-400 rounded-lg px-2 py-1">
                                <span className="text-xs font-bold">{scan.protein}g</span>
                              </div>
                              <div className="flex items-center gap-1 bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded-lg px-2 py-1">
                                <span className="text-xs font-bold">{scan.carbs}g</span>
                              </div>
                              <div className="flex items-center gap-1 bg-blue-500/15 text-blue-600 dark:text-blue-400 rounded-lg px-2 py-1">
                                <span className="text-xs font-bold">{scan.fat}g</span>
                              </div>
                              <motion.div
                                animate={{ rotate: expandedId === scan.id ? 180 : 0 }}
                                className="ml-auto"
                              >
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              </motion.div>
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
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4 pt-2 border-t border-border/50 space-y-3">
                                {/* Confidence Badge */}
                                {scan.confidence && (
                                  <div className="flex items-center gap-2">
                                    <span className={`text-[10px] text-white font-bold px-2 py-0.5 rounded-full ${getConfidenceBadge(scan.confidence).color}`}>
                                      {getConfidenceBadge(scan.confidence).text}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {language === 'es' ? 'Precisión del análisis' : 'Analysis accuracy'}
                                    </span>
                                  </div>
                                )}

                                {/* Fiber */}
                                {scan.fiber > 0 && (
                                  <div className="flex items-center gap-2 bg-green-500/10 rounded-xl p-2.5">
                                    <Leaf className="h-4 w-4 text-green-500" />
                                    <span className="text-sm text-green-700 dark:text-green-400">
                                      {t.fiber}: <strong>{scan.fiber}g</strong>
                                    </span>
                                  </div>
                                )}

                                {/* Notes */}
                                {scan.notes && (
                                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl p-3 border border-amber-200/50 dark:border-amber-800/50">
                                    <div className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1">
                                      {language === 'es' ? 'Notas del análisis' : 'Analysis notes'}
                                    </div>
                                    <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">{scan.notes}</p>
                                  </div>
                                )}

                                {/* All Foods */}
                                {scan.foods_identified && scan.foods_identified.length > 0 && (
                                  <div>
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                      {language === 'es' ? 'Ingredientes detectados' : 'Detected ingredients'}
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                      {scan.foods_identified.map((food, i) => (
                                        <span 
                                          key={i}
                                          className="bg-primary/10 text-primary text-xs px-2.5 py-1 rounded-full font-medium"
                                        >
                                          {food}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* FAB for new scan */}
      {scans.length > 0 && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.3 }}
          className="fixed bottom-24 right-4 z-20"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => setShowScanner(true)}
              className="h-14 w-14 rounded-2xl shadow-2xl bg-gradient-to-br from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 border-0"
              size="icon"
            >
              <Plus className="h-7 w-7" />
            </Button>
          </motion.div>
          {/* Pulse ring */}
          <div className="absolute inset-0 rounded-2xl bg-primary/30 animate-ping pointer-events-none" style={{ animationDuration: '2s' }} />
        </motion.div>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl border-0 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg">{t.deleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>{t.deleteDesc}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl border-2">{t.cancel}</AlertDialogCancel>
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
