import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { ChevronLeft, ChevronRight, X, ArrowDown, ArrowUp, ArrowLeft, ArrowRight } from "lucide-react";
import mascotImage from "@/assets/chefly-guide-mascot.png";

interface TourStep {
  target: string; // CSS selector
  titleKey: string;
  descKey: string;
  position: "top" | "bottom" | "left" | "right";
  arrowDirection: "up" | "down" | "left" | "right";
}

interface InAppTourProps {
  open: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const tourSteps: TourStep[] = [
  {
    target: "[data-tour='meal-plan']",
    titleKey: "tour.mealPlan.title",
    descKey: "tour.mealPlan.desc",
    position: "bottom",
    arrowDirection: "up",
  },
  {
    target: "[data-tour='complete-meal']",
    titleKey: "tour.completeMeal.title",
    descKey: "tour.completeMeal.desc",
    position: "bottom",
    arrowDirection: "up",
  },
  {
    target: "[data-tour='gamification']",
    titleKey: "tour.gamification.title",
    descKey: "tour.gamification.desc",
    position: "left",
    arrowDirection: "right",
  },
  {
    target: "[data-tour='chat']",
    titleKey: "tour.chat.title",
    descKey: "tour.chat.desc",
    position: "top",
    arrowDirection: "down",
  },
  {
    target: "[data-tour='navigation']",
    titleKey: "tour.navigation.title",
    descKey: "tour.navigation.desc",
    position: "right",
    arrowDirection: "left",
  },
];

export function InAppTour({ open, onComplete, onSkip }: InAppTourProps) {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [highlightRect, setHighlightRect] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [isPositioned, setIsPositioned] = useState(false);

  const calculatePosition = useCallback(() => {
    if (!open) return;
    
    const step = tourSteps[currentStep];
    const element = document.querySelector(step.target);
    
    if (element) {
      const rect = element.getBoundingClientRect();
      const padding = 8;
      
      setHighlightRect({
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      });

      // Calculate tooltip position
      const tooltipWidth = 320;
      const tooltipHeight = 200;
      let top = 0;
      let left = 0;

      switch (step.position) {
        case "bottom":
          top = rect.bottom + 20;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case "top":
          top = rect.top - tooltipHeight - 20;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case "left":
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.left - tooltipWidth - 20;
          break;
        case "right":
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.right + 20;
          break;
      }

      // Keep tooltip within viewport
      left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16));
      top = Math.max(16, Math.min(top, window.innerHeight - tooltipHeight - 16));

      setTooltipPosition({ top, left });
      setIsPositioned(true);

      // Scroll element into view if needed
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentStep, open]);

  useEffect(() => {
    if (open) {
      setIsPositioned(false);
      const timer = setTimeout(calculatePosition, 100);
      window.addEventListener("resize", calculatePosition);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("resize", calculatePosition);
      };
    }
  }, [open, currentStep, calculatePosition]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setIsPositioned(false);
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setIsPositioned(false);
      setCurrentStep(currentStep - 1);
    }
  };

  const ArrowIcon = {
    up: ArrowUp,
    down: ArrowDown,
    left: ArrowLeft,
    right: ArrowRight,
  }[tourSteps[currentStep]?.arrowDirection || "down"];

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100]">
          {/* Overlay with spotlight */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70"
            style={{
              clipPath: isPositioned
                ? `polygon(
                    0% 0%, 0% 100%, 
                    ${highlightRect.left}px 100%, 
                    ${highlightRect.left}px ${highlightRect.top}px, 
                    ${highlightRect.left + highlightRect.width}px ${highlightRect.top}px, 
                    ${highlightRect.left + highlightRect.width}px ${highlightRect.top + highlightRect.height}px, 
                    ${highlightRect.left}px ${highlightRect.top + highlightRect.height}px, 
                    ${highlightRect.left}px 100%, 
                    100% 100%, 100% 0%
                  )`
                : undefined,
            }}
          />

          {/* Highlight border */}
          {isPositioned && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute pointer-events-none rounded-lg border-2 border-primary shadow-lg shadow-primary/30"
              style={{
                top: highlightRect.top,
                left: highlightRect.left,
                width: highlightRect.width,
                height: highlightRect.height,
              }}
            />
          )}

          {/* Animated arrow pointing to element */}
          {isPositioned && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: 1,
                y: tourSteps[currentStep].arrowDirection === "down" ? [0, 8, 0] : 
                   tourSteps[currentStep].arrowDirection === "up" ? [0, -8, 0] : 0,
                x: tourSteps[currentStep].arrowDirection === "left" ? [-8, 0, -8] :
                   tourSteps[currentStep].arrowDirection === "right" ? [8, 0, 8] : 0,
              }}
              transition={{ repeat: Infinity, duration: 1.2 }}
              className="absolute z-[101] text-primary"
              style={{
                top: tourSteps[currentStep].arrowDirection === "down" 
                  ? highlightRect.top - 40
                  : tourSteps[currentStep].arrowDirection === "up"
                  ? highlightRect.top + highlightRect.height + 8
                  : highlightRect.top + highlightRect.height / 2 - 16,
                left: tourSteps[currentStep].arrowDirection === "left"
                  ? highlightRect.left + highlightRect.width + 8
                  : tourSteps[currentStep].arrowDirection === "right"
                  ? highlightRect.left - 40
                  : highlightRect.left + highlightRect.width / 2 - 16,
              }}
            >
              <ArrowIcon className="w-8 h-8 drop-shadow-lg" />
            </motion.div>
          )}

          {/* Tooltip with mascot */}
          {isPositioned && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="absolute z-[102] w-80"
              style={{
                top: tooltipPosition.top,
                left: tooltipPosition.left,
              }}
            >
              <div className="bg-card border rounded-xl shadow-2xl overflow-hidden">
                {/* Header with mascot */}
                <div className="bg-gradient-to-r from-primary to-primary/80 p-4 flex items-center gap-3">
                  <motion.img
                    src={mascotImage}
                    alt="Chefly Guide"
                    className="w-16 h-16 object-contain drop-shadow-lg"
                    animate={{ 
                      y: [0, -4, 0],
                      rotate: [0, 3, -3, 0],
                    }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  />
                  <div className="flex-1">
                    <h3 className="text-primary-foreground font-bold text-lg">
                      {t(tourSteps[currentStep].titleKey)}
                    </h3>
                    <div className="flex gap-1 mt-1">
                      {tourSteps.map((_, i) => (
                        <div
                          key={i}
                          className={`h-1.5 w-4 rounded-full transition-colors ${
                            i <= currentStep ? "bg-white" : "bg-white/30"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/20"
                    onClick={onSkip}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Content */}
                <div className="p-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t(tourSteps[currentStep].descKey)}
                  </p>
                </div>

                {/* Footer with navigation */}
                <div className="p-3 pt-0 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                    className="flex-1"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    {t("tour.prev")}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleNext}
                    className="flex-1"
                  >
                    {currentStep === tourSteps.length - 1 ? t("tour.finish") : t("tour.next")}
                    {currentStep < tourSteps.length - 1 && <ChevronRight className="h-4 w-4 ml-1" />}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
}
