import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Sparkles, Lock, TrendingUp, TrendingDown, Minus, Zap, Battery, BatteryLow } from "lucide-react";
import { WeeklyCheckInData } from "@/hooks/useWeeklyCheckIn";
import { useLanguage } from "@/contexts/LanguageContext";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import confetti from "canvas-confetti";
import { useHaptics } from "@/hooks/useHaptics";

interface WeeklyCheckInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  checkInData: WeeklyCheckInData;
  setCheckInData: React.Dispatch<React.SetStateAction<WeeklyCheckInData>>;
  onSubmit: () => Promise<boolean>;
  canAccess: boolean;
  onUpgrade: () => void;
}

const TOTAL_STEPS = 5;

const WeeklyCheckInDialog = ({
  open,
  onOpenChange,
  checkInData,
  setCheckInData,
  onSubmit,
  canAccess,
  onUpgrade,
}: WeeklyCheckInDialogProps) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { language, t: translate } = useLanguage();
  const { lightImpact, successNotification, celebrationPattern } = useHaptics();

  const t = {
    es: {
      title: "Check-In Semanal",
      subtitle: "Ajustemos tus recetas a tu progreso",
      locked: "Función Premium",
      lockedDesc: "Esta función ajusta tus recetas cada semana según tu progreso real. Desbloquéala con Chefly Plus.",
      upgrade: "Desbloquear Ahora",
      next: "Siguiente",
      back: "Atrás",
      finish: "Generar Mi Plan",
      step1Title: "¿Cómo cambió tu peso esta semana?",
      up: "Subí",
      down: "Bajé",
      same: "Me mantuve igual",
      step2Title: "¿Cómo te sentiste de energía?",
      high: "Alta",
      normal: "Normal",
      low: "Baja",
      step3Title: "¿Qué tipo de recetas quieres ahora?",
      healthier: "Más saludables",
      faster: "Más rápidas",
      cheaper: "Más económicas",
      moreProtein: "Más proteicas",
      moreVaried: "Más variadas",
      different: "Algo diferente",
      customPlaceholder: "Escribe aquí si quieres algo específico...",
      step4Title: "¿Qué ingredientes tienes disponibles?",
      ingredientsPlaceholder: "Ej: pollo, arroz, verduras, huevos...",
      step5Title: "¿Qué prioridad quieres esta semana?",
      priorityCheaper: "Más barato",
      priorityFaster: "Más rápido",
      priorityProtein: "Más proteína",
      successTitle: "¡Tu semana personalizada está lista!",
      successDesc: "Estas recetas fueron ajustadas según tus objetivos y tu evolución.",
      close: "Ver Mi Plan",
    },
    en: {
      title: "Weekly Check-In",
      subtitle: "Let's adjust your recipes to your progress",
      locked: "Premium Feature",
      lockedDesc: "This feature adjusts your recipes weekly based on your real progress. Unlock it with Chefly Plus.",
      upgrade: "Unlock Now",
      next: "Next",
      back: "Back",
      finish: "Generate My Plan",
      step1Title: "How did your weight change this week?",
      up: "Went up",
      down: "Went down",
      same: "Stayed the same",
      step2Title: "How was your energy level?",
      high: "High",
      normal: "Normal",
      low: "Low",
      step3Title: "What kind of recipes do you want now?",
      healthier: "Healthier",
      faster: "Faster",
      cheaper: "Cheaper",
      moreProtein: "More protein",
      moreVaried: "More varied",
      different: "Something different",
      customPlaceholder: "Write here if you want something specific...",
      step4Title: "What ingredients do you have available?",
      ingredientsPlaceholder: "E.g: chicken, rice, vegetables, eggs...",
      step5Title: "What's your priority this week?",
      priorityCheaper: "Cheaper",
      priorityFaster: "Faster",
      priorityProtein: "More protein",
      successTitle: "Your personalized week is ready!",
      successDesc: "These recipes were adjusted based on your goals and progress.",
      close: "View My Plan",
    },
  };

  const texts = t[language];

  useEffect(() => {
    if (open) {
      setStep(1);
      setShowSuccess(false);
    }
  }, [open]);

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      lightImpact();
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      lightImpact();
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const success = await onSubmit();
    setIsSubmitting(false);
    
    if (success) {
      // Haptic celebration
      successNotification();
      setTimeout(() => celebrationPattern(), 200);
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#f97316", "#22c55e", "#3b82f6"],
      });
      setShowSuccess(true);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return checkInData.weightChange !== null;
      case 2:
        return checkInData.energyLevel !== null;
      case 3:
        return checkInData.recipePreferences.length > 0 || checkInData.customRecipePreference.length > 0;
      case 4:
        return true; // Optional
      case 5:
        return true; // Optional
      default:
        return false;
    }
  };

  const toggleRecipePreference = (pref: string) => {
    setCheckInData((prev) => ({
      ...prev,
      recipePreferences: prev.recipePreferences.includes(pref)
        ? prev.recipePreferences.filter((p) => p !== pref)
        : [...prev.recipePreferences, pref],
    }));
  };

  const toggleWeeklyGoal = (goal: string) => {
    setCheckInData((prev) => ({
      ...prev,
      weeklyGoals: prev.weeklyGoals.includes(goal)
        ? prev.weeklyGoals.filter((g) => g !== goal)
        : [...prev.weeklyGoals, goal],
    }));
  };

  // Locked state for non-premium users
  if (!canAccess) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <div className="text-center space-y-6 py-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{texts.locked}</h2>
              <p className="text-muted-foreground mt-2">{texts.lockedDesc}</p>
            </div>
            <Button onClick={onUpgrade} className="w-full" size="lg">
              <Sparkles className="w-4 h-4 mr-2" />
              {texts.upgrade}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Success state
  if (showSuccess) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 py-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="mx-auto w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center"
            >
              <Sparkles className="w-10 h-10 text-green-500" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">{texts.successTitle}</h2>
              <p className="text-muted-foreground mt-2">{texts.successDesc}</p>
            </div>
            <Button onClick={() => onOpenChange(false)} className="w-full" size="lg">
              {texts.close}
            </Button>
          </motion.div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            <span className="text-2xl font-bold">{texts.title}</span>
            <p className="text-sm text-muted-foreground font-normal mt-1">{texts.subtitle}</p>
          </DialogTitle>
        </DialogHeader>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{translate('weeklyCheckIn.stepOf', { current: step, total: TOTAL_STEPS })}</span>
            <span>{Math.round((step / TOTAL_STEPS) * 100)}%</span>
          </div>
          <Progress value={(step / TOTAL_STEPS) * 100} className="h-2" />
        </div>

        {/* Steps */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="min-h-[280px] py-4"
          >
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-center">{texts.step1Title}</h3>
                <div className="grid gap-3">
                  {[
                    { value: "up", label: texts.up, icon: TrendingUp, color: "text-red-500" },
                    { value: "down", label: texts.down, icon: TrendingDown, color: "text-green-500" },
                    { value: "same", label: texts.same, icon: Minus, color: "text-blue-500" },
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant={checkInData.weightChange === option.value ? "default" : "outline"}
                      className="h-14 justify-start gap-4"
                      onClick={() => setCheckInData((prev) => ({ ...prev, weightChange: option.value as any }))}
                    >
                      <option.icon className={`w-5 h-5 ${checkInData.weightChange === option.value ? "" : option.color}`} />
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-center">{texts.step2Title}</h3>
                <div className="grid gap-3">
                  {[
                    { value: "high", label: texts.high, icon: Zap, color: "text-yellow-500" },
                    { value: "normal", label: texts.normal, icon: Battery, color: "text-blue-500" },
                    { value: "low", label: texts.low, icon: BatteryLow, color: "text-red-500" },
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant={checkInData.energyLevel === option.value ? "default" : "outline"}
                      className="h-14 justify-start gap-4"
                      onClick={() => setCheckInData((prev) => ({ ...prev, energyLevel: option.value as any }))}
                    >
                      <option.icon className={`w-5 h-5 ${checkInData.energyLevel === option.value ? "" : option.color}`} />
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-center">{texts.step3Title}</h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  {[
                    { value: "healthier", label: texts.healthier },
                    { value: "faster", label: texts.faster },
                    { value: "cheaper", label: texts.cheaper },
                    { value: "more_protein", label: texts.moreProtein },
                    { value: "more_varied", label: texts.moreVaried },
                    { value: "different", label: texts.different },
                  ].map((option) => (
                    <Badge
                      key={option.value}
                      variant={checkInData.recipePreferences.includes(option.value) ? "default" : "outline"}
                      className="cursor-pointer px-4 py-2 text-sm transition-all hover:scale-105"
                      onClick={() => toggleRecipePreference(option.value)}
                    >
                      {option.label}
                    </Badge>
                  ))}
                </div>
                <Textarea
                  placeholder={texts.customPlaceholder}
                  value={checkInData.customRecipePreference}
                  onChange={(e) => setCheckInData((prev) => ({ ...prev, customRecipePreference: e.target.value }))}
                  className="mt-4"
                  rows={2}
                />
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-center">{texts.step4Title}</h3>
                <Textarea
                  placeholder={texts.ingredientsPlaceholder}
                  value={checkInData.availableIngredients}
                  onChange={(e) => setCheckInData((prev) => ({ ...prev, availableIngredients: e.target.value }))}
                  rows={5}
                  className="resize-none"
                />
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-center">{texts.step5Title}</h3>
                <div className="grid gap-3">
                  {[
                    { value: "cheaper", label: texts.priorityCheaper },
                    { value: "faster", label: texts.priorityFaster },
                    { value: "more_protein", label: texts.priorityProtein },
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant={checkInData.weeklyGoals.includes(option.value) ? "default" : "outline"}
                      className="h-12"
                      onClick={() => toggleWeeklyGoal(option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground text-center mt-4">
                  {language === "es"
                    ? "Puedes seleccionar varias opciones"
                    : "You can select multiple options"}
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-3 pt-4 border-t">
          {step > 1 && (
            <Button variant="outline" onClick={handleBack} className="flex-1">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {texts.back}
            </Button>
          )}
          {step < TOTAL_STEPS ? (
            <Button onClick={handleNext} disabled={!canProceed()} className="flex-1">
              {texts.next}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <span className="animate-pulse">{language === "es" ? "Generando..." : "Generating..."}</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {texts.finish}
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WeeklyCheckInDialog;
