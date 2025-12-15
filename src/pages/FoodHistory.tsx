import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Trash2, Flame, Beef, Wheat, Droplets, Calendar, Camera } from 'lucide-react';
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
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { toast } = useToast();

  const t = {
    title: language === 'es' ? 'Historial de Escaneos' : 'Scan History',
    back: language === 'es' ? 'Volver' : 'Back',
    noScans: language === 'es' ? 'No tienes escaneos guardados' : 'No saved scans',
    noScansDesc: language === 'es' 
      ? 'Escanea tu comida para ver la información nutricional y guardarla aquí'
      : 'Scan your food to see nutritional info and save it here',
    scanNow: language === 'es' ? 'Escanear Ahora' : 'Scan Now',
    delete: language === 'es' ? 'Eliminar' : 'Delete',
    deleteTitle: language === 'es' ? '¿Eliminar escaneo?' : 'Delete scan?',
    deleteDesc: language === 'es' 
      ? 'Esta acción no se puede deshacer. El escaneo será eliminado permanentemente.'
      : 'This action cannot be undone. The scan will be permanently deleted.',
    cancel: language === 'es' ? 'Cancelar' : 'Cancel',
    deleted: language === 'es' ? 'Escaneo eliminado' : 'Scan deleted',
    today: language === 'es' ? 'Hoy' : 'Today',
    yesterday: language === 'es' ? 'Ayer' : 'Yesterday',
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === now.toDateString()) {
      return `${t.today}, ${format(date, 'HH:mm')}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `${t.yesterday}, ${format(date, 'HH:mm')}`;
    }
    return format(date, 'PPp', { locale: language === 'es' ? es : enUS });
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

  const handleScannerClose = (open: boolean) => {
    setShowScanner(open);
    if (!open) {
      // Reload scans after closing scanner
      loadScans();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50 pt-safe-top">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">{t.title}</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {scans.length === 0 ? (
          <div className="text-center py-12">
            <Camera className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-lg font-semibold mb-2">{t.noScans}</h2>
            <p className="text-muted-foreground text-sm mb-6">{t.noScansDesc}</p>
            <Button onClick={() => setShowScanner(true)} className="gap-2">
              <Camera className="h-4 w-4" />
              {t.scanNow}
            </Button>
          </div>
        ) : (
          <AnimatePresence>
            {Object.entries(groupScansByDate()).map(([dateKey, dateScans]) => (
              <div key={dateKey} className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(dateKey), 'PPPP', { locale: language === 'es' ? es : enUS })}</span>
                </div>
                
                {dateScans.map((scan, idx) => (
                  <motion.div
                    key={scan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex gap-3">
                          {/* Image */}
                          {scan.image_url && (
                            <div className="w-24 h-24 flex-shrink-0">
                              <img 
                                src={scan.image_url} 
                                alt={scan.dish_name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          
                          {/* Content */}
                          <div className="flex-1 py-3 pr-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold text-sm line-clamp-1">{scan.dish_name}</h3>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(scan.scanned_at), 'HH:mm')}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => setDeleteId(scan.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            {/* Nutrition Grid */}
                            <div className="grid grid-cols-4 gap-1 mt-2">
                              <div className="text-center">
                                <Flame className="h-3 w-3 mx-auto text-orange-500" />
                                <div className="text-xs font-bold">{scan.calories}</div>
                              </div>
                              <div className="text-center">
                                <Beef className="h-3 w-3 mx-auto text-red-500" />
                                <div className="text-xs font-bold">{scan.protein}g</div>
                              </div>
                              <div className="text-center">
                                <Wheat className="h-3 w-3 mx-auto text-amber-500" />
                                <div className="text-xs font-bold">{scan.carbs}g</div>
                              </div>
                              <div className="text-center">
                                <Droplets className="h-3 w-3 mx-auto text-blue-500" />
                                <div className="text-xs font-bold">{scan.fat}g</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ))}
          </AnimatePresence>
        )}

        {/* FAB for new scan */}
        {scans.length > 0 && (
          <Button
            onClick={() => setShowScanner(true)}
            className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-lg"
            size="icon"
          >
            <Camera className="h-6 w-6" />
          </Button>
        )}
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.deleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>{t.deleteDesc}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
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
