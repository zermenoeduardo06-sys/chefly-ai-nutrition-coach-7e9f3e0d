import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import mascotImage from "@/assets/mascot-lime.png";

interface TourStep {
  target: string;
  titleKey: string;
  descKey: string;
}

interface InAppTourProps {
  open: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const tourStepsDesktop: TourStep[] = [
  {
    target: "[data-tour='gamification']",
    titleKey: "tour.gamification.title",
    descKey: "tour.gamification.desc",
  },
  {
    target: "[data-tour='meal-plan']",
    titleKey: "tour.mealPlan.title",
    descKey: "tour.mealPlan.desc",
  },
  {
    target: "[data-tour='complete-meal']",
    titleKey: "tour.completeMeal.title",
    descKey: "tour.completeMeal.desc",
  },
  {
    target: "[data-tour='chat']",
    titleKey: "tour.chat.title",
    descKey: "tour.chat.desc",
  },
  {
    target: "[data-tour='navigation']",
    titleKey: "tour.navigation.title",
    descKey: "tour.navigation.desc",
  },
  {
    target: "[data-tour='shopping']",
    titleKey: "tour.shopping.title",
    descKey: "tour.shopping.desc",
  },
  {
    target: "[data-tour='progress']",
    titleKey: "tour.progress.title",
    descKey: "tour.progress.desc",
  },
  {
    target: "[data-tour='achievements']",
    titleKey: "tour.achievements.title",
    descKey: "tour.achievements.desc",
  },
  {
    target: "[data-tour='challenges']",
    titleKey: "tour.challenges.title",
    descKey: "tour.challenges.desc",
  },
  {
    target: "[data-tour='friends']",
    titleKey: "tour.friends.title",
    descKey: "tour.friends.desc",
  },
];

// Mobile tour skips navigation (sidebar is hidden) and shows page previews
const tourStepsMobile: TourStep[] = [
  {
    target: "[data-tour='gamification']",
    titleKey: "tour.gamification.title",
    descKey: "tour.gamification.desc",
  },
  {
    target: "[data-tour='meal-plan']",
    titleKey: "tour.mealPlan.title",
    descKey: "tour.mealPlan.desc",
  },
  {
    target: "[data-tour='complete-meal']",
    titleKey: "tour.completeMeal.title",
    descKey: "tour.completeMeal.desc",
  },
  {
    target: "[data-tour='chat']",
    titleKey: "tour.chat.title",
    descKey: "tour.chat.desc",
  },
  {
    target: "[data-tour='quick-actions']",
    titleKey: "tour.navigation.title",
    descKey: "tour.navigation.desc",
  },
];

export function InAppTour({ open, onComplete, onSkip }: InAppTourProps) {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightRect, setHighlightRect] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [isReady, setIsReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const calculatePositions = useCallback(() => {
    if (!open) return;
    
    // Check if mobile
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    
    const tourSteps = mobile ? tourStepsMobile : tourStepsDesktop;
    const step = tourSteps[currentStep];
    
    if (!step) {
      setIsReady(true);
      return;
    }
    
    const element = document.querySelector(step.target);
    
    if (!element) {
      console.log("Element not found:", step.target);
      setIsReady(true);
      return;
    }

    const rect = element.getBoundingClientRect();
    const padding = isMobile ? 6 : 10;

    setHighlightRect({
      top: rect.top - padding,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: Math.min(rect.height + padding * 2, window.innerHeight * 0.4), // Limit height on mobile
    });

    setIsReady(true);

    // Scroll element into view with offset for tooltip
    element.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [currentStep, open, isMobile]);

  useEffect(() => {
    if (open) {
      setIsReady(false);
      const timer = setTimeout(calculatePositions, 200);
      window.addEventListener("resize", calculatePositions);
      window.addEventListener("scroll", calculatePositions, true);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("resize", calculatePositions);
        window.removeEventListener("scroll", calculatePositions, true);
      };
    }
  }, [open, currentStep, calculatePositions]);

  useEffect(() => {
    if (!open) {
      setCurrentStep(0);
      setIsReady(false);
    }
  }, [open]);

  // Get the correct tour steps based on device
  const tourSteps = isMobile ? tourStepsMobile : tourStepsDesktop;

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

  // Calculate best position for tooltip based on highlight position
  const getTooltipPosition = () => {
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const tooltipHeight = isMobile ? 200 : 220;
    const tooltipWidth = isMobile ? Math.min(viewportWidth - 32, 320) : 360;
    const gap = 16;

    // Check if there's more space above or below the highlight
    const spaceAbove = highlightRect.top;
    const spaceBelow = viewportHeight - (highlightRect.top + highlightRect.height);

    let top: number;
    let arrowDirection: "up" | "down";

    if (spaceBelow >= tooltipHeight + gap + 40 || spaceBelow > spaceAbove) {
      // Position below
      top = Math.min(
        highlightRect.top + highlightRect.height + gap + 40,
        viewportHeight - tooltipHeight - 16
      );
      arrowDirection = "up";
    } else {
      // Position above
      top = Math.max(
        highlightRect.top - tooltipHeight - gap - 40,
        16
      );
      arrowDirection = "down";
    }

    // Ensure tooltip doesn't go below viewport
    if (top + tooltipHeight > viewportHeight - 16) {
      top = viewportHeight - tooltipHeight - 16;
    }

    // Ensure tooltip doesn't go above viewport
    if (top < 16) {
      top = 16;
    }

    // Center horizontally on mobile, or align with highlight on desktop
    let left: number;
    if (isMobile) {
      left = (viewportWidth - tooltipWidth) / 2;
    } else {
      left = Math.max(16, Math.min(
        highlightRect.left + highlightRect.width / 2 - tooltipWidth / 2,
        viewportWidth - tooltipWidth - 16
      ));
    }

    // Arrow position
    const arrowLeft = Math.max(
      left + 20,
      Math.min(
        highlightRect.left + highlightRect.width / 2 - 20,
        left + tooltipWidth - 60
      )
    );

    const arrowTop = arrowDirection === "up" 
      ? top - 36
      : top + tooltipHeight - 4;

    return { top, left, tooltipWidth, arrowLeft, arrowTop, arrowDirection };
  };

  const tooltipPos = isReady ? getTooltipPosition() : null;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999] overflow-hidden">
          {/* Dark overlay with cutout */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            onClick={onSkip}
          >
            {/* SVG mask for spotlight effect */}
            <svg className="w-full h-full">
              <defs>
                <mask id="spotlight-mask">
                  <rect width="100%" height="100%" fill="white" />
                  {isReady && (
                    <rect
                      x={highlightRect.left}
                      y={highlightRect.top}
                      width={highlightRect.width}
                      height={highlightRect.height}
                      rx="12"
                      fill="black"
                    />
                  )}
                </mask>
              </defs>
              <rect
                width="100%"
                height="100%"
                fill="rgba(0, 0, 0, 0.8)"
                mask="url(#spotlight-mask)"
              />
            </svg>
          </motion.div>

          {/* Highlight border with glow */}
          {isReady && (
            <>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute pointer-events-none rounded-xl border-[3px] border-primary z-[10000]"
                style={{
                  top: highlightRect.top,
                  left: highlightRect.left,
                  width: highlightRect.width,
                  height: highlightRect.height,
                  boxShadow: "0 0 20px 5px hsl(var(--primary) / 0.5), inset 0 0 20px 5px hsl(var(--primary) / 0.1)",
                }}
              />
              {/* Pulsing effect */}
              <motion.div
                animate={{ 
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.02, 1],
                }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className="absolute pointer-events-none rounded-xl border-2 border-primary/50 z-[9999]"
                style={{
                  top: highlightRect.top - 4,
                  left: highlightRect.left - 4,
                  width: highlightRect.width + 8,
                  height: highlightRect.height + 8,
                }}
              />
            </>
          )}

          {/* Animated arrow */}
          {isReady && tooltipPos && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute z-[10001] pointer-events-none"
              style={{
                top: tooltipPos.arrowTop,
                left: tooltipPos.arrowLeft,
              }}
            >
              <motion.svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                animate={{ 
                  y: tooltipPos.arrowDirection === "up" ? [-6, 0, -6] : [6, 0, 6],
                }}
                transition={{ repeat: Infinity, duration: 0.7, ease: "easeInOut" }}
                className="text-primary drop-shadow-lg"
                style={{ 
                  transform: tooltipPos.arrowDirection === "down" ? "rotate(180deg)" : "none"
                }}
              >
                <path
                  d="M20 8L20 28M20 28L10 18M20 28L30 18"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </motion.svg>
            </motion.div>
          )}

          {/* Tooltip */}
          {isReady && tooltipPos && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: tooltipPos.arrowDirection === "up" ? 20 : -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.25, delay: 0.05 }}
              className="absolute z-[10002]"
              style={{
                top: tooltipPos.top,
                left: tooltipPos.left,
                width: tooltipPos.tooltipWidth,
              }}
            >
              <div className="bg-card border-2 border-primary/30 rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary via-primary to-primary/80 p-3 md:p-4 flex items-center gap-3">
                  <motion.img
                    src={mascotImage}
                    alt="Chefly"
                    className="w-14 h-14 md:w-16 md:h-16 object-contain drop-shadow-lg flex-shrink-0"
                    animate={{ 
                      y: [0, -3, 0],
                      rotate: [0, 2, -2, 0],
                    }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-primary-foreground font-bold text-base md:text-lg leading-tight">
                      {t(tourSteps[currentStep].titleKey)}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-primary-foreground/80 text-xs">
                        {currentStep + 1}/{tourSteps.length}
                      </span>
                      <div className="flex gap-1">
                        {tourSteps.map((_, i) => (
                          <div
                            key={i}
                            className={`h-1.5 rounded-full transition-all ${
                              i === currentStep 
                                ? "w-4 bg-white" 
                                : i < currentStep 
                                ? "w-1.5 bg-white/70" 
                                : "w-1.5 bg-white/30"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/20 flex-shrink-0"
                    onClick={onSkip}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Content */}
                <div className="p-3 md:p-4">
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                    {t(tourSteps[currentStep].descKey)}
                  </p>
                </div>

                {/* Footer */}
                <div className="px-3 pb-3 md:px-4 md:pb-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                    className="flex-1 h-9 text-xs md:text-sm"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    {t("tour.prev")}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleNext}
                    className="flex-1 h-9 text-xs md:text-sm"
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
