import { Flame, Beef, Wheat, Droplets, Leaf, Sparkles, Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { FoodAnalysisResult } from '@/hooks/useFoodScanner';
import { Card3D } from '@/components/ui/card-3d';
import { useEffect, useState } from 'react';

interface ScanResultCardProps {
  result: FoodAnalysisResult;
  onSave: () => void;
  onNewScan: () => void;
  isSaving: boolean;
  saved: boolean;
}

// Animated counter for calories
function AnimatedCalories({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  
  useEffect(() => {
    const duration = 800;
    const steps = 30;
    const stepDuration = duration / steps;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(current));
      }
    }, stepDuration);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return <span>{display}</span>;
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
    { label: t.protein, value: result.nutrition.protein, unit: 'g', icon: Beef, color: 'text-rose-500', bg: 'bg-rose-500/10', shadow: 'shadow-[0_3px_0_hsl(350_90%_50%/0.3)]' },
    { label: t.carbs, value: result.nutrition.carbs, unit: 'g', icon: Wheat, color: 'text-amber-500', bg: 'bg-amber-500/10', shadow: 'shadow-[0_3px_0_hsl(38_92%_50%/0.3)]' },
    { label: t.fat, value: result.nutrition.fat, unit: 'g', icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-500/10', shadow: 'shadow-[0_3px_0_hsl(200_90%_50%/0.3)]' },
    { label: t.fiber, value: result.nutrition.fiber || 0, unit: 'g', icon: Leaf, color: 'text-emerald-500', bg: 'bg-emerald-500/10', shadow: 'shadow-[0_3px_0_hsl(160_80%_40%/0.3)]' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {/* Dish Name & Calories Hero - 3D Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card3D variant="elevated" hover={false} className="bg-gradient-to-br from-primary via-primary to-orange-500 p-6 text-white relative overflow-hidden border-0">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10">
            <h3 className="text-2xl font-black mb-2">{result.dish_name}</h3>
            
            {result.portion_estimate && (
              <p className="text-white/80 text-sm mb-4">{t.portion}: {result.portion_estimate}</p>
            )}
            
            <div className="flex items-end gap-2">
              <Flame className="h-9 w-9" />
              <span className="text-5xl font-black">
                <AnimatedCalories value={Math.round(result.nutrition.calories)} />
              </span>
              <span className="text-xl font-semibold mb-1">{t.calories}</span>
            </div>
            
            {/* Confidence badge - 3D pill */}
            <div className="absolute top-4 right-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-sm font-semibold shadow-[0_2px_0_rgba(255,255,255,0.2)]">
                <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${getConfidenceColor(result.confidence || 'medium')}`} />
                {getConfidenceText(result.confidence || 'medium')}
              </div>
            </div>
          </div>
        </Card3D>
      </motion.div>

      {/* Macros Grid - Individual 3D Cards */}
      <div className="grid grid-cols-4 gap-2">
        {macros.map((macro, index) => (
          <motion.div
            key={macro.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.08 }}
            whileHover={{ y: -2 }}
            whileTap={{ y: 1 }}
            className={`${macro.bg} ${macro.shadow} rounded-2xl p-3 text-center border border-border/30`}
          >
            <macro.icon className={`h-5 w-5 ${macro.color} mx-auto mb-1.5`} />
            <div className={`text-lg font-black ${macro.color}`}>
              {Math.round(macro.value)}<span className="text-xs font-semibold">{macro.unit}</span>
            </div>
            <div className="text-[10px] text-muted-foreground font-semibold">{macro.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Ingredients - 3D Pills */}
      {result.foods_identified && result.foods_identified.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card3D variant="default" className="p-4">
            <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              {t.foods}
            </h4>
            <div className="flex flex-wrap gap-2">
              {result.foods_identified.map((food, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.04 }}
                  className="px-3 py-1.5 bg-muted rounded-full text-sm font-medium shadow-[0_2px_0_hsl(var(--border)),0_3px_6px_rgba(0,0,0,0.05)]"
                >
                  {food}
                </motion.span>
              ))}
            </div>
          </Card3D>
        </motion.div>
      )}

      {/* Chef Notes - 3D Card */}
      {result.notes && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card3D variant="glass" className="p-4 bg-amber-50/80 dark:bg-amber-950/30 border-amber-200/50 dark:border-amber-800/50">
            <h4 className="text-sm font-bold text-amber-700 dark:text-amber-300 mb-2">{t.notes}</h4>
            <p className="text-sm text-amber-600 dark:text-amber-400">{result.notes}</p>
          </Card3D>
        </motion.div>
      )}

      {/* Action Buttons - 3D Style - Stacked on mobile */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex flex-col gap-3 pt-2 pb-4"
      >
        <Button
          onClick={onSave}
          size="lg"
          disabled={saved || isSaving}
          className={`w-full gap-2 rounded-2xl h-14 text-base font-bold transition-all ${
            saved 
              ? 'bg-emerald-500 hover:bg-emerald-500 shadow-[0_4px_0_hsl(160_80%_35%),0_6px_12px_rgba(0,0,0,0.15)]' 
              : 'bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 shadow-[0_4px_0_hsl(var(--primary)/0.5),0_8px_16px_rgba(0,0,0,0.2)] active:translate-y-1 active:shadow-[0_2px_0_hsl(var(--primary)/0.5)]'
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
        
        <Button
          onClick={onNewScan}
          variant="outline"
          size="lg"
          className="w-full gap-2 rounded-2xl h-12 text-base font-bold shadow-[0_4px_0_hsl(var(--border)),0_6px_12px_rgba(0,0,0,0.08)] active:translate-y-1 active:shadow-[0_2px_0_hsl(var(--border))] transition-all border-2"
          disabled={isSaving}
        >
          <RefreshCw className="h-5 w-5" />
          {t.scanAgain}
        </Button>
      </motion.div>
    </motion.div>
  );
}
