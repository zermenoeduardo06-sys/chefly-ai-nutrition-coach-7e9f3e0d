import { useState, useEffect } from 'react';
import { format, isToday, isYesterday, startOfDay } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { Flame, Trash2, Clock, ImageOff, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card3D } from '@/components/ui/card-3d';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface FoodScan {
  id: string;
  dish_name: string;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  image_url: string | null;
  meal_type: string | null;
  scanned_at: string;
  created_at: string;
}

interface GroupedScans {
  [key: string]: FoodScan[];
}

export function ScanHistory() {
  const { language } = useLanguage();
  const [scans, setScans] = useState<FoodScan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const t = {
    today: language === 'es' ? 'Hoy' : 'Today',
    yesterday: language === 'es' ? 'Ayer' : 'Yesterday',
    noScans: language === 'es' ? 'No hay escaneos aún' : 'No scans yet',
    noScansDesc: language === 'es' 
      ? 'Escanea tu primera comida para verla aquí'
      : 'Scan your first meal to see it here',
    deleteTitle: language === 'es' ? '¿Eliminar escaneo?' : 'Delete scan?',
    deleteDesc: language === 'es' 
      ? 'Esta acción no se puede deshacer'
      : 'This action cannot be undone',
    cancel: language === 'es' ? 'Cancelar' : 'Cancel',
    delete: language === 'es' ? 'Eliminar' : 'Delete',
  };

  const fetchScans = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('food_scans')
        .select('*')
        .eq('user_id', user.id)
        .order('scanned_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setScans(data || []);
    } catch (error) {
      console.error('Error fetching scans:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScans();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      const { error } = await supabase
        .from('food_scans')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;
      
      setScans(prev => prev.filter(s => s.id !== deleteId));
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting scan:', error);
    }
  };

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return t.today;
    if (isYesterday(date)) return t.yesterday;
    return format(date, 'EEEE d MMM', { locale: language === 'es' ? es : enUS });
  };

  const groupedScans = scans.reduce<GroupedScans>((acc, scan) => {
    const dateKey = startOfDay(new Date(scan.scanned_at)).toISOString();
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(scan);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
        ))}
      </div>
    );
  }

  if (scans.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-4 shadow-[0_4px_0_hsl(var(--border)),0_6px_12px_rgba(0,0,0,0.08)]">
          <Camera className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-bold mb-2">{t.noScans}</h3>
        <p className="text-muted-foreground text-sm">{t.noScansDesc}</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {Object.entries(groupedScans).map(([dateKey, dateScans], groupIndex) => (
          <motion.div 
            key={dateKey}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: groupIndex * 0.1 }}
            className="space-y-3"
          >
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide px-1">
              {formatDateLabel(dateKey)}
            </h3>
            
            <div className="space-y-2">
              {dateScans.map((scan, index) => (
                <motion.div
                  key={scan.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: groupIndex * 0.1 + index * 0.05 }}
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 1 }}
                >
                  <Card3D variant="default" className="p-4 flex items-center gap-4">
                    {/* Image or placeholder */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]">
                      {scan.image_url ? (
                        <img 
                          src={scan.image_url} 
                          alt={scan.dish_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageOff className="h-6 w-6 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm truncate">{scan.dish_name}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-sm text-primary font-bold">
                          <Flame className="h-3.5 w-3.5" />
                          {scan.calories || 0} kcal
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {format(new Date(scan.scanned_at), 'HH:mm')}
                        </span>
                      </div>
                      {scan.meal_type && (
                        <span className="inline-block mt-1.5 px-2.5 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full capitalize shadow-[0_1px_0_hsl(var(--primary)/0.2)]">
                          {scan.meal_type}
                        </span>
                      )}
                    </div>
                    
                    {/* Delete button - 3D ghost style */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl flex-shrink-0 shadow-[0_2px_0_hsl(var(--border))] active:translate-y-0.5 active:shadow-none transition-all"
                      onClick={() => setDeleteId(scan.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </Card3D>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{t.deleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>{t.deleteDesc}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">{t.cancel}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="rounded-xl bg-destructive hover:bg-destructive/90"
            >
              {t.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
