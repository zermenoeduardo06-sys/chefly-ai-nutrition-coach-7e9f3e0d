import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card3D, Card3DContent } from "@/components/ui/card-3d";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { Check, ChevronRight, Heart, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

const moodOptions = [
  { score: 5, emoji: '😊', labelEs: 'Excelente', labelEn: 'Excellent', color: 'bg-emerald-500' },
  { score: 4, emoji: '🙂', labelEs: 'Bien', labelEn: 'Good', color: 'bg-lime-500' },
  { score: 3, emoji: '😐', labelEs: 'Normal', labelEn: 'Okay', color: 'bg-yellow-500' },
  { score: 2, emoji: '😔', labelEs: 'Bajo', labelEn: 'Low', color: 'bg-orange-500' },
  { score: 1, emoji: '😫', labelEs: 'Muy bajo', labelEn: 'Very low', color: 'bg-red-500' },
];

const factorOptions = [
  { id: 'sleep_bad', emoji: '😴', labelEs: 'Dormí mal', labelEn: 'Slept poorly' },
  { id: 'sleep_good', emoji: '💤', labelEs: 'Dormí bien', labelEn: 'Slept well' },
  { id: 'stress', emoji: '💼', labelEs: 'Estrés', labelEn: 'Stress' },
  { id: 'low_energy', emoji: '🔋', labelEs: 'Baja energía', labelEn: 'Low energy' },
  { id: 'high_energy', emoji: '⚡', labelEs: 'Mucha energía', labelEn: 'High energy' },
  { id: 'anxiety', emoji: '😰', labelEs: 'Ansiedad', labelEn: 'Anxiety' },
  { id: 'exercise', emoji: '🏃', labelEs: 'Hice ejercicio', labelEn: 'Exercised' },
  { id: 'social', emoji: '👥', labelEs: 'Vida social', labelEn: 'Socializing' },
  { id: 'happy', emoji: '🎉', labelEs: 'Día feliz', labelEn: 'Happy day' },
  { id: 'productivity', emoji: '✅', labelEs: 'Productivo', labelEn: 'Productive' },
];

interface MoodCheckInWidgetProps {
  onSubmit: (score: number, factors: string[], note?: string) => Promise<boolean>;
  existingMood?: {
    mood_score: number;
    factors: string[];
    note?: string | null;
  } | null;
  compact?: boolean;
  onClose?: () => void;
}

export function MoodCheckInWidget({ 
  onSubmit, 
  existingMood, 
  compact = false,
  onClose 
}: MoodCheckInWidgetProps) {
  const { language } = useLanguage();
  const [step, setStep] = useState<'mood' | 'factors' | 'note' | 'done'>(
    existingMood ? 'done' : 'mood'
  );
  const [selectedMood, setSelectedMood] = useState<number | null>(
    existingMood?.mood_score || null
  );
  const [selectedFactors, setSelectedFactors] = useState<string[]>(
    existingMood?.factors || []
  );
  const [note, setNote] = useState(existingMood?.note || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const texts = {
    es: {
      title: '¿Cómo te sientes hoy?',
      whatAffects: '¿Qué te afecta hoy?',
      addNote: 'Agregar nota (opcional)',
      notePlaceholder: 'Escribe cómo te sientes...',
      save: 'Guardar',
      skip: 'Omitir',
      done: '¡Registrado!',
      todaysMood: 'Tu ánimo hoy',
      change: 'Cambiar',
      optional: 'opcional',
    },
    en: {
      title: 'How are you feeling today?',
      whatAffects: 'What affects you today?',
      addNote: 'Add note (optional)',
      notePlaceholder: 'Write how you feel...',
      save: 'Save',
      skip: 'Skip',
      done: 'Logged!',
      todaysMood: 'Your mood today',
      change: 'Change',
      optional: 'optional',
    },
  };
  const t = texts[language];

  const handleMoodSelect = (score: number) => {
    setSelectedMood(score);
    // Brief delay for animation then advance
    setTimeout(() => setStep('factors'), 300);
  };

  const handleFactorToggle = (factorId: string) => {
    setSelectedFactors(prev => 
      prev.includes(factorId)
        ? prev.filter(f => f !== factorId)
        : [...prev, factorId]
    );
  };

  const handleSubmit = async () => {
    if (!selectedMood) return;
    
    setIsSubmitting(true);
    const success = await onSubmit(selectedMood, selectedFactors, note || undefined);
    setIsSubmitting(false);
    
    if (success) {
      setStep('done');
      // Celebration for good mood
      if (selectedMood >= 4) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#22c55e', '#84cc16', '#facc15'],
        });
      }
    }
  };

  const handleReset = () => {
    setStep('mood');
  };

  // Compact version for dashboard widget
  if (compact && step === 'done' && existingMood) {
    const moodData = moodOptions.find(m => m.score === existingMood.mood_score);
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={handleReset}
        className="w-full flex items-center justify-between p-3 bg-card/50 rounded-xl border border-border/50 hover:bg-card/80 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{moodData?.emoji || '😊'}</span>
          <div className="text-left">
            <p className="text-xs text-muted-foreground">{t.todaysMood}</p>
            <p className="text-sm font-medium">
              {language === 'es' ? moodData?.labelEs : moodData?.labelEn}
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="text-xs">
          {t.change}
        </Badge>
      </motion.button>
    );
  }

  // Full widget
  return (
    <Card3D variant="elevated" className="overflow-hidden">
      <Card3DContent className="p-4">
        <AnimatePresence mode="wait">
          {/* Step 1: Select Mood */}
          {step === 'mood' && (
            <motion.div
              key="mood"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-rose-500" />
                <h3 className="font-semibold">{t.title}</h3>
              </div>
              
              <div className="flex justify-between gap-2">
                {moodOptions.map((mood) => (
                  <motion.button
                    key={mood.score}
                    onClick={() => handleMoodSelect(mood.score)}
                    className={cn(
                      "flex flex-col items-center gap-1 p-3 rounded-xl transition-all flex-1",
                      selectedMood === mood.score
                        ? `${mood.color} text-white shadow-lg`
                        : "bg-muted hover:bg-muted/80"
                    )}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-2xl">{mood.emoji}</span>
                    <span className="text-[10px] font-medium truncate">
                      {language === 'es' ? mood.labelEs : mood.labelEn}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Select Factors */}
          {step === 'factors' && (
            <motion.div
              key="factors"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{t.whatAffects}</h3>
                <Badge variant="outline" className="text-xs">
                  {t.optional}
                </Badge>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {factorOptions.map((factor) => (
                  <motion.button
                    key={factor.id}
                    onClick={() => handleFactorToggle(factor.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all",
                      selectedFactors.includes(factor.id)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80"
                    )}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>{factor.emoji}</span>
                    <span className="text-xs">
                      {language === 'es' ? factor.labelEs : factor.labelEn}
                    </span>
                  </motion.button>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStep('note')}
                  className="flex-1"
                >
                  {t.skip}
                </Button>
                <Button
                  size="sm"
                  onClick={() => setStep('note')}
                  className="flex-1"
                >
                  <ChevronRight className="h-4 w-4 mr-1" />
                  {t.addNote}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Add Note */}
          {step === 'note' && (
            <motion.div
              key="note"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{t.addNote}</h3>
                <div className="flex items-center gap-1">
                  <span className="text-2xl">
                    {moodOptions.find(m => m.score === selectedMood)?.emoji}
                  </span>
                </div>
              </div>
              
              <Textarea
                placeholder={t.notePlaceholder}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="resize-none"
              />
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {t.skip}
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="h-4 w-4" />
                    </motion.div>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      {t.save}
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Done */}
          {step === 'done' && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4 space-y-3"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 25, delay: 0.1 }}
                className="text-5xl"
              >
                {moodOptions.find(m => m.score === selectedMood)?.emoji || '✓'}
              </motion.div>
              <p className="font-semibold text-primary">{t.done}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
              >
                {t.change}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </Card3DContent>
    </Card3D>
  );
}
