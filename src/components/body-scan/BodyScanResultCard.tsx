import { motion } from "framer-motion";
import { Card3D, Card3DContent, Card3DHeader } from "@/components/ui/card-3d";
import { Icon3D } from "@/components/ui/icon-3d";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  User, 
  Target, 
  TrendingUp, 
  TrendingDown,
  Minus,
  Lightbulb,
  ChevronRight,
  Calendar,
  Sparkles 
} from "lucide-react";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import type { BodyScan } from "@/hooks/useWellness";

interface BodyScanResultCardProps {
  scan: BodyScan;
  previousScan?: BodyScan | null;
  onViewHistory?: () => void;
  onNewScan?: () => void;
}

const bodyTypeInfo = {
  es: {
    ectomorfo: { name: 'Ectomorfo', desc: 'Cuerpo delgado con metabolismo rápido' },
    mesomorfo: { name: 'Mesomorfo', desc: 'Cuerpo atlético que gana músculo fácilmente' },
    endomorfo: { name: 'Endomorfo', desc: 'Cuerpo robusto con tendencia a almacenar grasa' },
    combinado: { name: 'Combinado', desc: 'Mezcla de características de varios tipos' },
  },
  en: {
    ectomorph: { name: 'Ectomorph', desc: 'Lean body with fast metabolism' },
    mesomorph: { name: 'Mesomorph', desc: 'Athletic body that gains muscle easily' },
    endomorph: { name: 'Endomorph', desc: 'Robust body with tendency to store fat' },
    combined: { name: 'Combined', desc: 'Mix of characteristics from various types' },
  },
};

const categoryColors: { [key: string]: string } = {
  bajo: 'text-sky-500',
  low: 'text-sky-500',
  saludable: 'text-emerald-500',
  healthy: 'text-emerald-500',
  moderado: 'text-amber-500',
  moderate: 'text-amber-500',
  alto: 'text-rose-500',
  high: 'text-rose-500',
};

export function BodyScanResultCard({ 
  scan, 
  previousScan,
  onViewHistory,
  onNewScan,
}: BodyScanResultCardProps) {
  const { language } = useLanguage();
  const locale = language === 'es' ? es : enUS;

  const texts = {
    es: {
      title: 'Resultados del Análisis',
      bodyFat: 'Grasa Corporal Estimada',
      bodyType: 'Tipo de Cuerpo',
      distribution: 'Distribución',
      recommendations: 'Recomendaciones',
      viewHistory: 'Ver Historial',
      newScan: 'Nuevo Escaneo',
      vsLast: 'vs último',
      confidence: 'Confianza',
      central: 'Central',
      peripheral: 'Periférica',
      uniform: 'Uniforme',
      scannedOn: 'Escaneado el',
      high: 'Alta',
      medium: 'Media',
      low: 'Baja',
    },
    en: {
      title: 'Analysis Results',
      bodyFat: 'Estimated Body Fat',
      bodyType: 'Body Type',
      distribution: 'Distribution',
      recommendations: 'Recommendations',
      viewHistory: 'View History',
      newScan: 'New Scan',
      vsLast: 'vs last',
      confidence: 'Confidence',
      central: 'Central',
      peripheral: 'Peripheral',
      uniform: 'Uniform',
      scannedOn: 'Scanned on',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
    },
  };
  const t = texts[language];

  const bodyFatMin = scan.estimated_body_fat_min || 0;
  const bodyFatMax = scan.estimated_body_fat_max || 0;
  const bodyFatAvg = (bodyFatMin + bodyFatMax) / 2;
  
  // Calculate change from previous scan
  let fatChange: number | null = null;
  if (previousScan?.estimated_body_fat_min && previousScan?.estimated_body_fat_max) {
    const prevAvg = (previousScan.estimated_body_fat_min + previousScan.estimated_body_fat_max) / 2;
    fatChange = bodyFatAvg - prevAvg;
  }

  const bodyTypeKey = scan.body_type?.toLowerCase() || 'combinado';
  const bodyTypeData = language === 'es' 
    ? bodyTypeInfo.es[bodyTypeKey as keyof typeof bodyTypeInfo.es]
    : bodyTypeInfo.en[bodyTypeKey as keyof typeof bodyTypeInfo.en];

  const distributionText = scan.fat_distribution === 'central' 
    ? t.central 
    : scan.fat_distribution === 'peripheral' 
      ? t.peripheral 
      : t.uniform;

  const confidenceText = scan.confidence === 'high' 
    ? t.high 
    : scan.confidence === 'low' 
      ? t.low 
      : t.medium;

  const categoryColor = categoryColors[scan.body_fat_category?.toLowerCase() || ''] || 'text-muted-foreground';

  return (
    <Card3D variant="elevated">
      <Card3DHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon3D icon={User} color="primary" size="md" />
            <div>
              <h3 className="font-bold">{t.title}</h3>
              <p className="text-xs text-muted-foreground">
                {t.scannedOn} {format(new Date(scan.scanned_at), 'PPP', { locale })}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {t.confidence}: {confidenceText}
          </Badge>
        </div>
      </Card3DHeader>
      <Card3DContent className="space-y-4">
        {/* Body Fat Estimate */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-muted/50 rounded-xl space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t.bodyFat}</span>
            {fatChange !== null && (
              <div className={`flex items-center gap-1 text-xs ${fatChange < 0 ? 'text-emerald-500' : fatChange > 0 ? 'text-rose-500' : 'text-muted-foreground'}`}>
                {fatChange < 0 ? <TrendingDown className="h-3 w-3" /> : fatChange > 0 ? <TrendingUp className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                {Math.abs(fatChange).toFixed(1)}% {t.vsLast}
              </div>
            )}
          </div>
          
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${categoryColor}`}>
              {bodyFatMin.toFixed(0)}-{bodyFatMax.toFixed(0)}%
            </span>
            <span className={`text-sm ${categoryColor}`}>
              {scan.body_fat_category}
            </span>
          </div>
          
          {/* Visual bar */}
          <div className="relative h-3 bg-gradient-to-r from-sky-500 via-emerald-500 via-amber-500 to-rose-500 rounded-full overflow-hidden">
            <motion.div
              initial={{ left: 0 }}
              animate={{ left: `${Math.min(bodyFatAvg * 2, 100)}%` }}
              transition={{ delay: 0.3, type: "spring" }}
              className="absolute top-0 bottom-0 w-3 bg-white rounded-full shadow-lg border-2 border-gray-800 -translate-x-1/2"
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>5%</span>
            <span>15%</span>
            <span>25%</span>
            <span>35%+</span>
          </div>
        </motion.div>

        {/* Body Type & Distribution */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="p-3 bg-muted/50 rounded-xl"
          >
            <span className="text-xs text-muted-foreground">{t.bodyType}</span>
            <p className="font-semibold mt-1">{bodyTypeData?.name || scan.body_type}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{bodyTypeData?.desc}</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="p-3 bg-muted/50 rounded-xl"
          >
            <span className="text-xs text-muted-foreground">{t.distribution}</span>
            <p className="font-semibold mt-1">{distributionText}</p>
          </motion.div>
        </div>

        {/* Recommendations */}
        {scan.recommendations && scan.recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium">{t.recommendations}</span>
            </div>
            <div className="space-y-2">
              {scan.recommendations.slice(0, 3).map((rec, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-amber-500/10 rounded-lg">
                  <Sparkles className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{rec}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* AI Notes */}
        {scan.ai_notes && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="p-3 bg-primary/10 rounded-xl"
          >
            <p className="text-sm text-foreground">{scan.ai_notes}</p>
          </motion.div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          {onViewHistory && (
            <Button
              variant="outline"
              size="sm"
              onClick={onViewHistory}
              className="flex-1"
            >
              <Calendar className="h-4 w-4 mr-2" />
              {t.viewHistory}
            </Button>
          )}
          {onNewScan && (
            <Button
              size="sm"
              onClick={onNewScan}
              className="flex-1"
            >
              {t.newScan}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </Card3DContent>
    </Card3D>
  );
}
