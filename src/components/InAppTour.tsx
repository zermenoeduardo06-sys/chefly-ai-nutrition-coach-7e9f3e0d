import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import mascotImage from "@/assets/chefly-guide-mascot.png";

interface TourStep {
  target: string;
  titleKey: string;
  descKey: string;
  position: "top" | "bottom" | "left" | "right";
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
    position: "top",
  },
  {
    target: "[data-tour='complete-meal']",
    titleKey: "tour.completeMeal.title",
    descKey: "tour.completeMeal.desc",
    position: "left",
  },
  {
    target: "[data-tour='gamification']",
    titleKey: "tour.gamification.title",
    descKey: "tour.gamification.desc",
    position: "bottom",
  },
  {
    target: "[data-tour='chat']",
    titleKey: "tour.chat.title",
    descKey: "tour.chat.desc",
    position: "bottom",
  },
  {
    target: "[data-tour='navigation']",
    titleKey: "tour.navigation.title",
    descKey: "tour.navigation.desc",
    position: "right",
  },
];

export function InAppTour({ open, onComplete, onSkip }: InAppTourProps) {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({});
  const [arrowStyle, setArrowStyle] = useState<React.CSSProperties>({});
  const [arrowRotation, setArrowRotation] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const calculatePositions = useCallback(() => {
    if (!open) return;
    
    const step = tourSteps[currentStep];
    const element = document.querySelector(step.target);
    
    if (!element) {
      console.log("Element not found:", step.target);
      return;
    }

    const rect = element.getBoundingClientRect();
    const padding = 12;
    const tooltipWidth = 340;
    const tooltipHeight = 220;
    const arrowSize = 48;
    const gap = 16;

    // Highlight position
    setHighlightStyle({
      position: "fixed",
      top: rect.top - padding,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
      pointerEvents: "none",
    });

    // Calculate tooltip and arrow position based on step position
    let tooltipTop = 0;
    let tooltipLeft = 0;
    let arrowTop = 0;
    let arrowLeft = 0;
    let rotation = 0;

    switch (step.position) {
      case "bottom":
        tooltipTop = rect.bottom + gap + arrowSize;
        tooltipLeft = rect.left + rect.width / 2 - tooltipWidth / 2;
        arrowTop = rect.bottom + gap;
        arrowLeft = rect.left + rect.width / 2 - arrowSize / 2;
        rotation = 0; // Arrow pointing up
        break;
      case "top":
        tooltipTop = rect.top - tooltipHeight - gap - arrowSize;
        tooltipLeft = rect.left + rect.width / 2 - tooltipWidth / 2;
        arrowTop = rect.top - gap - arrowSize;
        arrowLeft = rect.left + rect.width / 2 - arrowSize / 2;
        rotation = 180; // Arrow pointing down
        break;
      case "left":
        tooltipTop = rect.top + rect.height / 2 - tooltipHeight / 2;
        tooltipLeft = rect.left - tooltipWidth - gap - arrowSize;
        arrowTop = rect.top + rect.height / 2 - arrowSize / 2;
        arrowLeft = rect.left - gap - arrowSize;
        rotation = 90; // Arrow pointing right
        break;
      case "right":
        tooltipTop = rect.top + rect.height / 2 - tooltipHeight / 2;
        tooltipLeft = rect.right + gap + arrowSize;
        arrowTop = rect.top + rect.height / 2 - arrowSize / 2;
        arrowLeft = rect.right + gap;
        rotation = -90; // Arrow pointing left
        break;
    }

    // Keep tooltip within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (tooltipLeft < 16) tooltipLeft = 16;
    if (tooltipLeft + tooltipWidth > viewportWidth - 16) {
      tooltipLeft = viewportWidth - tooltipWidth - 16;
    }
    if (tooltipTop < 16) tooltipTop = 16;
    if (tooltipTop + tooltipHeight > viewportHeight - 16) {
      tooltipTop = viewportHeight - tooltipHeight - 16;
    }

    setTooltipStyle({
      position: "fixed",
      top: tooltipTop,
      left: tooltipLeft,
      width: tooltipWidth,
    });

    setArrowStyle({
      position: "fixed",
      top: arrowTop,
      left: arrowLeft,
    });

    setArrowRotation(rotation);
    setIsReady(true);

    // Scroll element into view
    element.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [currentStep, open]);

  useEffect(() => {
    if (open) {
      setIsReady(false);
      const timer = setTimeout(calculatePositions, 150);
      window.addEventListener("resize", calculatePositions);
      window.addEventListener("scroll", calculatePositions);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("resize", calculatePositions);
        window.removeEventListener("scroll", calculatePositions);
      };
    }
  }, [open, currentStep, calculatePositions]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setIsReady(false);
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setIsReady(false);
      setCurrentStep(currentStep - 1);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999]">
          {/* Dark overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/75"
            onClick={onSkip}
          />

          {/* Spotlight highlight */}
          {isReady && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={highlightStyle}
              className="rounded-xl border-4 border-primary bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.75)] z-[10000]"
            />
          )}

          {/* Pulsing ring around highlight */}
          {isReady && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ 
                opacity: [0.5, 1, 0.5], 
                scale: [1, 1.05, 1],
              }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              style={{
                ...highlightStyle,
                border: "none",
                boxShadow: "0 0 30px 10px hsl(var(--primary) / 0.4)",
              }}
              className="rounded-xl z-[9999]"
            />
          )}

          {/* Animated arrow pointing to element */}
          {isReady && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={arrowStyle}
              className="z-[10001] pointer-events-none"
            >
              <motion.svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                animate={{ 
                  y: arrowRotation === 0 ? [-4, 4, -4] : 
                     arrowRotation === 180 ? [4, -4, 4] : 0,
                  x: arrowRotation === 90 ? [4, -4, 4] :
                     arrowRotation === -90 ? [-4, 4, -4] : 0,
                }}
                transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
                style={{ transform: `rotate(${arrowRotation}deg)` }}
                className="text-primary drop-shadow-lg"
              >
                <path
                  d="M24 8L24 36M24 36L14 26M24 36L34 26"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </motion.svg>
            </motion.div>
          )}

          {/* Tooltip with mascot */}
          {isReady && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              style={tooltipStyle}
              className="z-[10002]"
            >
              <div className="bg-card border-2 border-primary/30 rounded-2xl shadow-2xl overflow-hidden">
                {/* Header with mascot */}
                <div className="bg-gradient-to-r from-primary via-primary to-primary/80 p-4 flex items-center gap-4">
                  <motion.img
                    src={mascotImage}
                    alt="Chefly Guide"
                    className="w-20 h-20 object-contain drop-shadow-lg flex-shrink-0"
                    animate={{ 
                      y: [0, -5, 0],
                      rotate: [0, 3, -3, 0],
                    }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-primary-foreground font-bold text-lg leading-tight">
                      {t(tourSteps[currentStep].titleKey)}
                    </h3>
                    <div className="flex gap-1.5 mt-2">
                      {tourSteps.map((_, i) => (
                        <div
                          key={i}
                          className={`h-2 rounded-full transition-all ${
                            i === currentStep 
                              ? "w-6 bg-white" 
                              : i < currentStep 
                              ? "w-2 bg-white/80" 
                              : "w-2 bg-white/30"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/20 flex-shrink-0"
                    onClick={onSkip}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Content */}
                <div className="p-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t(tourSteps[currentStep].descKey)}
                  </p>
                </div>

                {/* Footer with navigation */}
                <div className="p-4 pt-0 flex gap-3">
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
                    className="flex-1 bg-primary hover:bg-primary/90"
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
