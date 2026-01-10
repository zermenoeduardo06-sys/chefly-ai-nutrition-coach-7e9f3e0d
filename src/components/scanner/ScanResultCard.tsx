import { Flame, Beef, Wheat, Droplets, Leaf, Sparkles, Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { FoodAnalysisResult } from '@/hooks/useFoodScanner';

interface ScanResultCardProps {
  result: FoodAnalysisResult;
  onSave: () => void;
  onNewScan: () => void;
  isSaving: boolean;
  saved: boolean;
}

export function ScanResultCard({ result, onSave, onNewScan, isSaving, saved }: ScanResultCardProps) {
  const { language } = useLanguage();

  const t = {
    save: language === 'es' ? 'Guardar en historial' : 'Save to history',
    saving: language === 'es' ? 'Guardando...' : 'Saving...',
    saved: language === 'es' ? '¡Guardado!' : 'Saved!',
    scanAgain: language === 'es' ? 'Escanear otra' : 'Scan another',
    calories: language === 'es' ? 'kcal' : 'kcal',
    protein: language === 'es' ? 'Proteína' : 'Protein',
    carbs: language === 'es' ? 'Carbos' : 'Carbs',
    fat: language === 'es' ? 'Grasa' : 'Fat',
    fiber: language === 'es' ? 'Fibra' : 'Fiber',
    confidence: language === 'es' ? 'Precisión' : 'Accuracy',
    high: language === 'es' ? 'Alta' : 'High',
    medium: language === 'es' ? 'Media' : 'Medium',
    low: language === 'es' ? 'Baja' : 'Low',
    foods: language === 'es' ? 'Ingredientes detectados' : 'Detected ingredients',
    portion: language === 'es' ? 'Porción' : 'Portion',
    notes: language === 'es' ? 'Notas del chef' : 'Chef notes',
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'from-emerald-500 to-green-500';
      case 'medium': return 'from-amber-500 to-yellow-500';
      case 'low': return 'from-red-500 to-orange-500';
      default: return 'from-muted to-muted';
    }
  };

  const getConfidenceText = (confidence: string) => {
    switch (confidence) {
      case 'high': return t.high;
      case 'medium': return t.medium;
      case 'low': return t.low;
      default: return confidence;
    }
  };

  if (!result.nutrition) return null;

  const macros = [
    { label: t.protein, value: result.nutrition.protein, unit: 'g', icon: Beef, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { label: t.carbs, value: result.nutrition.carbs, unit: 'g', icon: Wheat, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: t.fat, value: result.nutrition.fat, unit: 'g', icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: t.fiber, value: result.nutrition.fiber || 0, unit: 'g', icon: Leaf, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {/* Dish Name & Calories Hero */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-primary via-primary to-orange-500 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10">
          <h3 className="text-2xl font-bold mb-2">{result.dish_name}</h3>
          
          {result.portion_estimate && (
            <p className="text-white/80 text-sm mb-3">{t.portion}: {result.portion_estimate}</p>
          )}
          
          <div className="flex items-end gap-2">
            <Flame className="h-8 w-8" />
            <span className="text-5xl font-black">{Math.round(result.nutrition.calories)}</span>
            <span className="text-xl font-medium mb-1">{t.calories}</span>
          </div>
          
          {/* Confidence badge */}
          <div className="absolute top-4 right-4">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium`}>
              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${getConfidenceColor(result.confidence || 'medium')}`} />
              {getConfidenceText(result.confidence || 'medium')}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Macros Grid */}
      <div className="grid grid-cols-4 gap-2">
        {macros.map((macro, index) => (
          <motion.div
            key={macro.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className={`${macro.bg} rounded-2xl p-3 text-center`}
          >
            <macro.icon className={`h-5 w-5 ${macro.color} mx-auto mb-1`} />
            <div className={`text-lg font-bold ${macro.color}`}>{Math.round(macro.value)}{macro.unit}</div>
            <div className="text-[10px] text-muted-foreground font-medium">{macro.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Ingredients */}
      {result.foods_identified && result.foods_identified.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-muted/50 rounded-2xl p-4"
        >
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            {t.foods}
          </h4>
          <div className="flex flex-wrap gap-2">
            {result.foods_identified.map((food, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.05 }}
                className="px-3 py-1.5 bg-background rounded-full text-sm font-medium shadow-sm"
              >
                {food}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Chef Notes */}
      {result.notes && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/50 rounded-2xl p-4"
        >
          <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-300 mb-2">{t.notes}</h4>
          <p className="text-sm text-amber-600 dark:text-amber-400">{result.notes}</p>
        </motion.div>
      )}

      {/* Action Buttons */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex gap-3 pt-2"
      >
        <Button
          onClick={onNewScan}
          variant="outline"
          size="lg"
          className="flex-1 gap-2 rounded-2xl h-14 text-base font-semibold"
          disabled={isSaving}
        >
          <RefreshCw className="h-5 w-5" />
          {t.scanAgain}
        </Button>
        
        <Button
          onClick={onSave}
          size="lg"
          disabled={saved || isSaving}
          className={`flex-1 gap-2 rounded-2xl h-14 text-base font-semibold shadow-lg transition-all duration-300 ${
            saved 
              ? 'bg-emerald-500 hover:bg-emerald-500' 
              : 'bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90'
          }`}
        >
          {saved ? (
            <>
              <Check className="h-5 w-5" />
              {t.saved}
            </>
          ) : isSaving ? (
            t.saving
          ) : (
            t.save
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
}
