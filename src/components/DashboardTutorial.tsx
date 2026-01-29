import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  BookOpen, 
  Check, 
  Trophy, 
  Sparkles, 
  Heart, 
  Camera,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DashboardTutorialProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

const DashboardTutorial = ({ open, onOpenChange, onComplete }: DashboardTutorialProps) => {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: Sparkles,
      titleKey: "tutorial.welcome.title",
      descKey: "tutorial.welcome.desc",
      color: "from-primary to-secondary",
    },
    {
      icon: BookOpen,
      titleKey: "tutorial.diary.title",
      descKey: "tutorial.diary.desc",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Check,
      titleKey: "tutorial.completeMeal.title",
      descKey: "tutorial.completeMeal.desc",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Camera,
      titleKey: "tutorial.scanner.title",
      descKey: "tutorial.scanner.desc",
      color: "from-violet-500 to-purple-500",
    },
    {
      icon: Trophy,
      titleKey: "tutorial.gamification.title",
      descKey: "tutorial.gamification.desc",
      color: "from-yellow-500 to-orange-500",
    },
    {
      icon: Heart,
      titleKey: "tutorial.wellness.title",
      descKey: "tutorial.wellness.desc",
      color: "from-pink-500 to-rose-500",
    },
    {
      icon: Sparkles,
      titleKey: "tutorial.ready.title",
      descKey: "tutorial.ready.desc",
      color: "from-primary to-secondary",
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setCurrentStep(0);
    onComplete();
    onOpenChange(false);
  };

  const handleSkip = () => {
    setCurrentStep(0);
    onComplete();
    onOpenChange(false);
  };

  useEffect(() => {
    if (!open) {
      setCurrentStep(0);
    }
  }, [open]);

  const currentStepData = steps[currentStep];
  const IconComponent = currentStepData.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md overflow-hidden p-0">
        <div className={`bg-gradient-to-br ${currentStepData.color} p-6 pb-12`}>
          <div className="flex justify-between items-start mb-4">
            <div className="flex gap-1.5">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 w-6 rounded-full transition-colors ${
                    index <= currentStep ? "bg-white" : "bg-white/30"
                  }`}
                />
              ))}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/20"
              onClick={handleSkip}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-4 backdrop-blur-sm">
                <IconComponent className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {t(currentStepData.titleKey)}
              </h3>
            </motion.div>
          </AnimatePresence>
        </div>
        
        <div className="p-6 pt-0 -mt-6">
          <div className="bg-card rounded-xl p-4 shadow-lg border">
            <AnimatePresence mode="wait">
              <motion.p
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                className="text-sm text-muted-foreground leading-relaxed text-center"
              >
                {t(currentStepData.descKey)}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        <DialogFooter className="p-4 pt-0 flex gap-2">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex-1"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t("tutorial.prev")}
          </Button>
          <Button
            onClick={handleNext}
            className="flex-1"
          >
            {currentStep === steps.length - 1 ? t("tutorial.start") : t("tutorial.next")}
            {currentStep < steps.length - 1 && <ChevronRight className="h-4 w-4 ml-1" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DashboardTutorial;
