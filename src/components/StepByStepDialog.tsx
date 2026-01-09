import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Check, ChefHat, Sparkles, ShoppingBasket, Info } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import mascotLime from "@/assets/mascot-lime.png";

interface StepByStepDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  steps: string[];
  mealName: string;
  mealImage?: string;
  ingredients?: string[];
}

export function StepByStepDialog({
  open,
  onOpenChange,
  steps,
  mealName,
  mealImage,
  ingredients,
}: StepByStepDialogProps) {
  const [currentStep, setCurrentStep] = useState(-1); // -1 = ingredients checklist
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [checkedIngredients, setCheckedIngredients] = useState<number[]>([]);
  const { language } = useLanguage();

  const isIngredientsStep = currentStep === -1;
  const totalSteps = steps.length;
  const allIngredientsChecked = ingredients ? checkedIngredients.length === ingredients.length : true;

  const handleNext = () => {
    if (isIngredientsStep) {
      setCurrentStep(0);
    } else if (currentStep < steps.length - 1) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep === 0 && ingredients && ingredients.length > 0) {
      setCurrentStep(-1);
    } else if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setCompletedSteps([...completedSteps, currentStep]);
    onOpenChange(false);
    setCurrentStep(-1);
    setCompletedSteps([]);
    setCheckedIngredients([]);
  };

  const toggleIngredient = (index: number) => {
    setCheckedIngredients(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const progress = isIngredientsStep ? 0 : ((currentStep + 1) / totalSteps) * 100;
  const isLastStep = currentStep === steps.length - 1;

  // Get mascot message based on step progress
  const getMascotMessage = () => {
    if (isIngredientsStep) {
      return language === 'es' ? "¡Primero revisemos los ingredientes! ✅" : "First let's check the ingredients! ✅";
    } else if (currentStep === 0) {
      return language === 'es' ? "¡Empecemos a cocinar! 👨‍🍳" : "Let's start cooking! 👨‍🍳";
    } else if (isLastStep) {
      return language === 'es' ? "¡Último paso! ¡Ya casi terminas! 🎉" : "Last step! Almost there! 🎉";
    } else if (currentStep < steps.length / 2) {
      return language === 'es' ? "¡Vas muy bien! Sigue así 💪" : "You're doing great! Keep going 💪";
    } else {
      return language === 'es' ? "¡Ya casi terminas! Un poco más 🔥" : "Almost done! Just a bit more 🔥";
    }
  };

  // Get a tip for the current step
  const getStepTip = () => {
    const tips = {
      es: [
        "💡 Tip: Prepara todos los ingredientes antes de empezar",
        "💡 Tip: Usa fuego medio para mejores resultados",
        "💡 Tip: No olvides probar la sazón",
        "💡 Tip: Tómate tu tiempo, la paciencia es clave",
        "💡 Tip: Mantén tu área de trabajo limpia",
      ],
      en: [
        "💡 Tip: Prep all ingredients before starting",
        "💡 Tip: Use medium heat for best results",
        "💡 Tip: Don't forget to taste as you go",
        "💡 Tip: Take your time, patience is key",
        "💡 Tip: Keep your workspace clean",
      ]
    };
    const tipList = language === 'es' ? tips.es : tips.en;
    return tipList[currentStep % tipList.length];
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        setCurrentStep(-1);
        setCompletedSteps([]);
        setCheckedIngredients([]);
      }
      onOpenChange(isOpen);
    }}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg max-h-[90vh] overflow-y-auto p-0 rounded-3xl border-4 border-primary/30 bg-gradient-to-b from-background to-primary/5">
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
            <span className="text-muted-foreground font-medium">
              {isIngredientsStep 
                ? (language === 'es' ? 'Ingredientes' : 'Ingredients')
                : `${language === 'es' ? 'Paso' : 'Step'} ${currentStep + 1} ${language === 'es' ? 'de' : 'of'} ${totalSteps}`
              }
            </span>
            <div className="flex gap-1">
              {steps.map((_, index) => (
                <motion.div
                  key={index}
                  className={`w-2.5 h-2.5 rounded-full ${
                    index === currentStep
                      ? 'bg-primary'
                      : completedSteps.includes(index)
                      ? 'bg-secondary'
                      : 'bg-muted-foreground/30'
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

        {/* Meal image and name */}
        <div className="px-4 pb-3">
          {mealImage && (
            <div className="relative h-24 rounded-2xl overflow-hidden mb-3">
              <img 
                src={mealImage} 
                alt={mealName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <h2 className="absolute bottom-2 left-3 right-3 text-white font-bold text-lg line-clamp-1 drop-shadow-lg">
                {mealName}
              </h2>
            </div>
          )}
          {!mealImage && (
            <h2 className="text-lg font-bold text-center line-clamp-1 mb-2">{mealName}</h2>
          )}
          
          {/* Language notice */}
          <div className="flex items-center gap-1.5 justify-center text-[10px] text-muted-foreground/70">
            <Info className="w-3 h-3" />
            <span>
              {language === 'es' 
                ? "El idioma de la receta depende del idioma seleccionado al generar tu plan"
                : "Recipe language depends on the language selected when generating your plan"
              }
            </span>
          </div>
        </div>

        {/* Main content */}
        <div className="px-4 pb-4 flex-1">
          <AnimatePresence mode="wait">
            {isIngredientsStep && ingredients && ingredients.length > 0 ? (
              <motion.div
                key="ingredients"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="flex flex-col gap-3"
              >
                {/* Ingredients checklist card */}
                <div className="relative bg-card border-2 border-primary/20 rounded-2xl p-4 shadow-lg">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center shadow-md">
                      <ShoppingBasket className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">
                        {language === 'es' ? 'Checklist de Ingredientes' : 'Ingredients Checklist'}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {language === 'es' 
                          ? `${checkedIngredients.length}/${ingredients.length} listos`
                          : `${checkedIngredients.length}/${ingredients.length} ready`
                        }
                      </p>
                    </div>
                  </div>

                  {/* Ingredients list */}
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {ingredients.map((ingredient, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                          checkedIngredients.includes(index)
                            ? 'bg-secondary/10 border-secondary/30'
                            : 'bg-background border-border hover:border-primary/30'
                        }`}
                        onClick={() => toggleIngredient(index)}
                      >
                        <Checkbox
                          checked={checkedIngredients.includes(index)}
                          onCheckedChange={() => toggleIngredient(index)}
                          className="data-[state=checked]:bg-secondary data-[state=checked]:border-secondary"
                        />
                        <span className={`text-sm flex-1 ${
                          checkedIngredients.includes(index) ? 'line-through text-muted-foreground' : ''
                        }`}>
                          {ingredient}
                        </span>
                        {checkedIngredients.includes(index) && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-secondary"
                          >
                            <Check className="w-4 h-4" />
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {/* All checked message */}
                  {allIngredientsChecked && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 p-2.5 bg-secondary/10 border border-secondary/20 rounded-xl text-center"
                    >
                      <p className="text-xs font-medium text-secondary">
                        {language === 'es' ? '¡Tienes todo listo! 🎉' : 'You have everything ready! 🎉'}
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* Mascot section */}
                <motion.div
                  className="flex items-center gap-3 bg-secondary/10 border border-secondary/20 rounded-2xl p-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <motion.div
                    className="relative w-14 h-14 shrink-0"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <img src={mascotLime} alt="Chefly" className="w-full h-full object-contain" />
                    <motion.div
                      className="absolute -top-1 left-1/2 -translate-x-1/2"
                      animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.1, 0.9] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ChefHat className="w-3.5 h-3.5 text-primary" />
                    </motion.div>
                  </motion.div>
                  <motion.div
                    className="relative flex-1 bg-background rounded-xl p-2.5 shadow-sm"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                  >
                    <div className="absolute left-0 top-1/2 -translate-x-2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[6px] border-r-background" />
                    <p className="text-sm font-medium text-foreground">{getMascotMessage()}</p>
                  </motion.div>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="flex flex-col gap-3"
              >
                {/* Step card */}
                <div className="relative bg-card border-2 border-primary/20 rounded-2xl p-4 pt-5 shadow-lg">
                  {/* Step number badge */}
                  <motion.div
                    className="absolute top-3 left-3 w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  >
                    {currentStep + 1}
                  </motion.div>

                  {/* Sparkles decoration */}
                  <motion.div
                    className="absolute top-3 right-3"
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sparkles className="w-5 h-5 text-primary/40" />
                  </motion.div>

                  {/* Step header */}
                  <div className="ml-10 mb-3">
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                      {language === 'es' ? `Paso ${currentStep + 1}` : `Step ${currentStep + 1}`}
                    </span>
                  </div>

                  {/* Step text */}
                  <motion.p
                    className="text-base leading-relaxed font-medium"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {steps[currentStep]}
                  </motion.p>

                  {/* Step tip */}
                  <motion.div
                    className="mt-4 p-2.5 bg-primary/5 border border-primary/10 rounded-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <p className="text-xs text-muted-foreground">
                      {getStepTip()}
                    </p>
                  </motion.div>
                </div>

                {/* Mascot section */}
                <motion.div
                  className="flex items-center gap-3 bg-secondary/10 border border-secondary/20 rounded-2xl p-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <motion.div
                    className="relative w-14 h-14 shrink-0"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <img src={mascotLime} alt="Chefly" className="w-full h-full object-contain" />
                    <motion.div
                      className="absolute -top-1 left-1/2 -translate-x-1/2"
                      animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.1, 0.9] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ChefHat className="w-3.5 h-3.5 text-primary" />
                    </motion.div>
                  </motion.div>
                  <motion.div
                    className="relative flex-1 bg-background rounded-xl p-2.5 shadow-sm"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                  >
                    <div className="absolute left-0 top-1/2 -translate-x-2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[6px] border-r-background" />
                    <p className="text-sm font-medium text-foreground">{getMascotMessage()}</p>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation buttons */}
        <div className="p-4 pt-0 flex gap-3">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={isIngredientsStep}
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
              {isIngredientsStep 
                ? (language === 'es' ? 'Empezar' : 'Start')
                : (language === 'es' ? 'Siguiente' : 'Next')
              }
              <ChevronRight className="w-5 h-5" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
