import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card3D, Card3DContent, Card3DHeader } from "@/components/ui/card-3d";
import { Icon3D } from "@/components/ui/icon-3d";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Lightbulb, RefreshCw, Heart, Brain, Moon, Apple, Droplets, Dumbbell } from "lucide-react";

const allTips = {
  es: [
    { icon: Apple, category: 'nutrición', tip: 'Los alimentos ricos en omega-3 (pescado, nueces) pueden mejorar tu estado de ánimo.' },
    { icon: Brain, category: 'mente', tip: 'Tomar 5 minutos de respiración profunda puede reducir el estrés significativamente.' },
    { icon: Moon, category: 'sueño', tip: 'Dormir 7-8 horas mejora la regulación emocional y la energía.' },
    { icon: Droplets, category: 'hidratación', tip: 'La deshidratación leve puede afectar tu concentración y ánimo.' },
    { icon: Dumbbell, category: 'ejercicio', tip: '30 minutos de caminata liberan endorfinas que mejoran el ánimo.' },
    { icon: Heart, category: 'bienestar', tip: 'Las comidas regulares mantienen estables los niveles de azúcar y tu humor.' },
    { icon: Brain, category: 'mente', tip: 'Escribir 3 cosas por las que estás agradecido mejora la perspectiva.' },
    { icon: Apple, category: 'nutrición', tip: 'Evitar el exceso de azúcar previene cambios bruscos de humor.' },
    { icon: Moon, category: 'sueño', tip: 'Evitar pantallas 1 hora antes de dormir mejora la calidad del sueño.' },
    { icon: Dumbbell, category: 'ejercicio', tip: 'El ejercicio regular es tan efectivo como algunos antidepresivos.' },
    { icon: Droplets, category: 'hidratación', tip: 'Empezar el día con un vaso de agua activa tu metabolismo.' },
    { icon: Heart, category: 'bienestar', tip: 'Pasar tiempo en la naturaleza reduce cortisol y ansiedad.' },
  ],
  en: [
    { icon: Apple, category: 'nutrition', tip: 'Foods rich in omega-3 (fish, nuts) can improve your mood.' },
    { icon: Brain, category: 'mind', tip: 'Taking 5 minutes of deep breathing can significantly reduce stress.' },
    { icon: Moon, category: 'sleep', tip: 'Sleeping 7-8 hours improves emotional regulation and energy.' },
    { icon: Droplets, category: 'hydration', tip: 'Mild dehydration can affect your concentration and mood.' },
    { icon: Dumbbell, category: 'exercise', tip: '30 minutes of walking releases endorphins that improve mood.' },
    { icon: Heart, category: 'wellness', tip: 'Regular meals keep blood sugar stable and your mood even.' },
    { icon: Brain, category: 'mind', tip: 'Writing 3 things you\'re grateful for improves perspective.' },
    { icon: Apple, category: 'nutrition', tip: 'Avoiding excess sugar prevents sudden mood swings.' },
    { icon: Moon, category: 'sleep', tip: 'Avoiding screens 1 hour before bed improves sleep quality.' },
    { icon: Dumbbell, category: 'exercise', tip: 'Regular exercise is as effective as some antidepressants.' },
    { icon: Droplets, category: 'hydration', tip: 'Starting the day with a glass of water activates your metabolism.' },
    { icon: Heart, category: 'wellness', tip: 'Spending time in nature reduces cortisol and anxiety.' },
  ],
};

interface WellnessTipsProps {
  moodScore?: number;
  factors?: string[];
}

export function WellnessTips({ moodScore, factors = [] }: WellnessTipsProps) {
  const { language } = useLanguage();
  const [tipIndex, setTipIndex] = useState(0);

  const texts = {
    es: {
      title: 'Tips de Bienestar',
      subtitle: 'Consejos personalizados para ti',
      nextTip: 'Otro tip',
    },
    en: {
      title: 'Wellness Tips',
      subtitle: 'Personalized advice for you',
      nextTip: 'Next tip',
    },
  };
  const t = texts[language];

  // Filter tips based on mood and factors
  const relevantTips = useMemo(() => {
    const tips = allTips[language];
    
    // If mood is low, prioritize certain categories
    if (moodScore && moodScore <= 2) {
      return tips.filter(t => 
        t.category === 'mente' || t.category === 'mind' ||
        t.category === 'bienestar' || t.category === 'wellness'
      );
    }
    
    // If sleep factor is present, prioritize sleep tips
    if (factors.includes('sleep_bad')) {
      const sleepTips = tips.filter(t => t.category === 'sueño' || t.category === 'sleep');
      if (sleepTips.length > 0) return sleepTips;
    }
    
    // If low energy, prioritize nutrition and exercise
    if (factors.includes('low_energy')) {
      return tips.filter(t => 
        t.category === 'nutrición' || t.category === 'nutrition' ||
        t.category === 'ejercicio' || t.category === 'exercise'
      );
    }
    
    return tips;
  }, [language, moodScore, factors]);

  const currentTip = relevantTips[tipIndex % relevantTips.length];
  const TipIcon = currentTip?.icon || Lightbulb;

  const nextTip = () => {
    setTipIndex(prev => (prev + 1) % relevantTips.length);
  };

  if (!currentTip) return null;

  return (
    <Card3D variant="default">
      <Card3DHeader className="pb-2">
        <div className="flex items-center gap-3">
          <Icon3D icon={Lightbulb} color="amber" size="md" />
          <div>
            <h3 className="font-bold">{t.title}</h3>
            <p className="text-xs text-muted-foreground">{t.subtitle}</p>
          </div>
        </div>
      </Card3DHeader>
      <Card3DContent>
        <AnimatePresence mode="wait">
          <motion.div
            key={tipIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex items-start gap-3 p-3 bg-amber-500/10 rounded-xl"
          >
            <div className="p-2 bg-amber-500/20 rounded-lg flex-shrink-0">
              <TipIcon className="h-5 w-5 text-amber-600" />
            </div>
            <p className="text-sm text-foreground leading-relaxed flex-1">
              {currentTip.tip}
            </p>
          </motion.div>
        </AnimatePresence>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={nextTip}
          className="w-full mt-3"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          {t.nextTip}
        </Button>
      </Card3DContent>
    </Card3D>
  );
}
