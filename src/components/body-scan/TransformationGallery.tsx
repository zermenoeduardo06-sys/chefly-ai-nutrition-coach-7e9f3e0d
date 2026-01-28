import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card3D, Card3DContent, Card3DHeader } from "@/components/ui/card-3d";
import { Icon3D } from "@/components/ui/icon-3d";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Images, 
  ChevronLeft, 
  ChevronRight, 
  TrendingDown, 
  TrendingUp,
  Minus,
  Calendar,
  Expand
} from "lucide-react";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import type { BodyScan } from "@/hooks/useWellness";

interface TransformationGalleryProps {
  scans: BodyScan[];
  onScanSelect?: (scan: BodyScan) => void;
}

export function TransformationGallery({ scans, onScanSelect }: TransformationGalleryProps) {
  const { language } = useLanguage();
  const locale = language === 'es' ? es : enUS;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [compareIndex, setCompareIndex] = useState<number | null>(scans.length > 1 ? scans.length - 1 : null);
  const [viewMode, setViewMode] = useState<'single' | 'compare'>('compare');

  const texts = {
    es: {
      title: 'Tu Transformación',
      noScans: 'Aún no tienes escaneos',
      startScan: 'Hacer primer escaneo',
      compare: 'Comparar',
      single: 'Individual',
      before: 'Antes',
      after: 'Ahora',
      change: 'Cambio',
      bodyFat: 'Grasa',
      days: 'días',
    },
    en: {
      title: 'Your Transformation',
      noScans: 'No scans yet',
      startScan: 'Take first scan',
      compare: 'Compare',
      single: 'Single',
      before: 'Before',
      after: 'Now',
      change: 'Change',
      bodyFat: 'Fat',
      days: 'days',
    },
  };
  const t = texts[language];

  if (scans.length === 0) {
    return (
      <Card3D variant="default">
        <Card3DContent className="py-8 text-center">
          <Images className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">{t.noScans}</p>
        </Card3DContent>
      </Card3D>
    );
  }

  const currentScan = scans[selectedIndex];
  const compareScan = compareIndex !== null ? scans[compareIndex] : null;

  // Calculate difference if comparing
  let fatDifference: number | null = null;
  let daysDifference: number | null = null;
  if (currentScan && compareScan) {
    const currentAvg = ((currentScan.estimated_body_fat_min || 0) + (currentScan.estimated_body_fat_max || 0)) / 2;
    const compareAvg = ((compareScan.estimated_body_fat_min || 0) + (compareScan.estimated_body_fat_max || 0)) / 2;
    fatDifference = currentAvg - compareAvg;
    
    const currentDate = new Date(currentScan.scanned_at);
    const compareDate = new Date(compareScan.scanned_at);
    daysDifference = Math.floor((currentDate.getTime() - compareDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  const navigateScan = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    } else if (direction === 'next' && selectedIndex < scans.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  return (
    <Card3D variant="default">
      <Card3DHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon3D icon={Images} color="emerald" size="md" />
            <h3 className="font-bold">{t.title}</h3>
          </div>
          
          {scans.length > 1 && (
            <div className="flex bg-muted rounded-full p-1">
              <button
                onClick={() => setViewMode('single')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  viewMode === 'single' ? 'bg-card shadow-sm' : 'text-muted-foreground'
                }`}
              >
                {t.single}
              </button>
              <button
                onClick={() => setViewMode('compare')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  viewMode === 'compare' ? 'bg-card shadow-sm' : 'text-muted-foreground'
                }`}
              >
                {t.compare}
              </button>
            </div>
          )}
        </div>
      </Card3DHeader>
      <Card3DContent className="space-y-4">
        {/* Image comparison view */}
        <div className="relative">
          {viewMode === 'compare' && scans.length > 1 ? (
            <div className="grid grid-cols-2 gap-2">
              {/* Before (older) */}
              <div className="space-y-2">
                <div className="aspect-[3/4] rounded-xl overflow-hidden bg-muted relative">
                  <img
                    src={compareScan?.image_url || scans[scans.length - 1].image_url}
                    alt="Before"
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-2 left-2 bg-black/70 text-white">
                    {t.before}
                  </Badge>
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  {format(new Date(compareScan?.scanned_at || scans[scans.length - 1].scanned_at), 'PP', { locale })}
                </p>
              </div>
              
              {/* After (current) */}
              <div className="space-y-2">
                <div className="aspect-[3/4] rounded-xl overflow-hidden bg-muted relative">
                  <img
                    src={currentScan.image_url}
                    alt="After"
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
                    {t.after}
                  </Badge>
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  {format(new Date(currentScan.scanned_at), 'PP', { locale })}
                </p>
              </div>
            </div>
          ) : (
            /* Single view with navigation */
            <div className="relative">
              <motion.div
                key={selectedIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="aspect-[3/4] rounded-xl overflow-hidden bg-muted"
              >
                <img
                  src={currentScan.image_url}
                  alt={`Scan ${selectedIndex + 1}`}
                  className="w-full h-full object-cover"
                  onClick={() => onScanSelect?.(currentScan)}
                />
              </motion.div>
              
              {/* Navigation arrows */}
              {scans.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigateScan('prev')}
                    disabled={selectedIndex === 0}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 disabled:opacity-30"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigateScan('next')}
                    disabled={selectedIndex === scans.length - 1}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 disabled:opacity-30"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </>
              )}
              
              {/* Scan info */}
              <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                <Badge className="bg-black/70 text-white">
                  {format(new Date(currentScan.scanned_at), 'PP', { locale })}
                </Badge>
                <Badge className="bg-black/70 text-white">
                  {currentScan.estimated_body_fat_min?.toFixed(0)}-{currentScan.estimated_body_fat_max?.toFixed(0)}%
                </Badge>
              </div>
            </div>
          )}
        </div>

        {/* Difference stats (compare mode) */}
        {viewMode === 'compare' && fatDifference !== null && daysDifference !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-6 p-3 bg-muted/50 rounded-xl"
          >
            <div className="text-center">
              <div className={`flex items-center justify-center gap-1 ${
                fatDifference < 0 ? 'text-emerald-500' : fatDifference > 0 ? 'text-rose-500' : 'text-muted-foreground'
              }`}>
                {fatDifference < 0 ? <TrendingDown className="h-4 w-4" /> : fatDifference > 0 ? <TrendingUp className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                <span className="text-lg font-bold">{Math.abs(fatDifference).toFixed(1)}%</span>
              </div>
              <span className="text-xs text-muted-foreground">{t.bodyFat}</span>
            </div>
            
            <div className="h-8 w-px bg-border" />
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-lg font-bold">{Math.abs(daysDifference)}</span>
              </div>
              <span className="text-xs text-muted-foreground">{t.days}</span>
            </div>
          </motion.div>
        )}

        {/* Thumbnail timeline */}
        {scans.length > 2 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {scans.map((scan, index) => (
              <button
                key={scan.id}
                onClick={() => {
                  if (viewMode === 'compare') {
                    // In compare mode, click sets the "before" image
                    setCompareIndex(index);
                  } else {
                    setSelectedIndex(index);
                  }
                }}
                className={`flex-shrink-0 w-12 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                  selectedIndex === index 
                    ? 'border-primary' 
                    : compareIndex === index 
                      ? 'border-emerald-500' 
                      : 'border-transparent'
                }`}
              >
                <img
                  src={scan.image_url}
                  alt={`Scan ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </Card3DContent>
    </Card3D>
  );
}
