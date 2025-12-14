import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Check, ChefHat, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import cheflyGuideMascot from "@/assets/chefly-guide-mascot.png";

interface StepByStepDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  steps: string[];
  mealName: string;
  mealImage?: string;
}

export function StepByStepDialog({
  open,
  onOpenChange,
  steps,
  mealName,
  mealImage,
}: StepByStepDialogProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const { language } = useLanguage();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setCompletedSteps([...completedSteps, currentStep]);
    onOpenChange(false);
    setCurrentStep(0);
    setCompletedSteps([]);
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const isLastStep = currentStep === steps.length - 1;

  // Get mascot message based on step progress
  const getMascotMessage = () => {
    if (currentStep === 0) {
      return language === 'es' ? "¡Empecemos a cocinar!" : "Let's start cooking!";
    } else if (isLastStep) {
      return language === 'es' ? "¡Último paso! ¡Ya casi!" : "Last step! Almost there!";
    } else if (currentStep < steps.length / 2) {
      return language === 'es' ? "¡Vas muy bien!" : "You're doing great!";
    } else {
      return language === 'es' ? "¡Ya casi terminas!" : "Almost done!";
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        setCurrentStep(0);
        setCompletedSteps([]);
      }
      onOpenChange(isOpen);
    }}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg max-h-[90vh] overflow-hidden p-0 rounded-3xl border-4 border-primary/30 bg-gradient-to-b from-background to-primary/5">
        {/* Header with progress */}
        <div className="relative p-4 pb-2">
          {/* Progress bar */}
          <div className="h-3 bg-muted rounded-full overflow-hidden mb-4">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          
          {/* Step indicator */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {language === 'es' ? 'Paso' : 'Step'} {currentStep + 1} {language === 'es' ? 'de' : 'of'} {steps.length}
            </span>
            <div className="flex gap-1">
              {steps.map((_, index) => (
                <motion.div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentStep
                      ? 'bg-primary'
                      : completedSteps.includes(index)
                      ? 'bg-secondary'
                      : 'bg-muted'
                  }`}
                  animate={{
                    scale: index === currentStep ? 1.3 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Meal name */}
        <div className="px-4 pb-2">
          <h2 className="text-lg font-bold text-center line-clamp-1">{mealName}</h2>
        </div>

        {/* Main content */}
        <div className="px-4 pb-4 flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex flex-col gap-4"
            >
              {/* Step card */}
              <div className="relative bg-card border-2 border-primary/20 rounded-2xl p-5 shadow-lg min-h-[180px]">
                {/* Step number badge */}
                <motion.div
                  className="absolute -top-4 left-4 w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  {currentStep + 1}
                </motion.div>

                {/* Sparkles decoration */}
                <motion.div
                  className="absolute top-2 right-2"
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-5 h-5 text-primary/40" />
                </motion.div>

                {/* Step text */}
                <motion.p
                  className="text-base leading-relaxed mt-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {steps[currentStep]}
                </motion.p>
              </div>

              {/* Mascot section */}
              <motion.div
                className="flex items-center gap-3 bg-secondary/10 border border-secondary/20 rounded-2xl p-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <motion.div
                  className="relative w-16 h-16 shrink-0"
                  animate={{ 
                    y: [0, -5, 0],
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <img
                    src={cheflyGuideMascot}
                    alt="Chefly"
                    className="w-full h-full object-contain"
                  />
                  {/* Chef hat glow */}
                  <motion.div
                    className="absolute -top-1 left-1/2 -translate-x-1/2"
                    animate={{ 
                      opacity: [0.5, 1, 0.5],
                      scale: [0.9, 1.1, 0.9],
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ChefHat className="w-4 h-4 text-primary" />
                  </motion.div>
                </motion.div>
                
                {/* Speech bubble */}
                <motion.div
                  className="relative flex-1 bg-background rounded-xl p-3 shadow-sm"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                >
                  {/* Triangle */}
                  <div className="absolute left-0 top-1/2 -translate-x-2 -translate-y-1/2 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[8px] border-r-background" />
                  
                  <p className="text-sm font-medium text-foreground">
                    {getMascotMessage()}
                  </p>
                </motion.div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation buttons */}
        <div className="p-4 pt-0 flex gap-3">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex-1 h-12 rounded-xl text-base font-semibold gap-2 disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5" />
            {language === 'es' ? 'Anterior' : 'Previous'}
          </Button>
          
          {isLastStep ? (
            <Button
              onClick={handleComplete}
              className="flex-1 h-12 rounded-xl text-base font-semibold gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-lg"
            >
              <Check className="w-5 h-5" />
              {language === 'es' ? '¡Listo!' : 'Done!'}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="flex-1 h-12 rounded-xl text-base font-semibold gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-lg"
            >
              {language === 'es' ? 'Siguiente' : 'Next'}
              <ChevronRight className="w-5 h-5" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
