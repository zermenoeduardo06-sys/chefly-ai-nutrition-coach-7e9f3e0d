import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, PanInfo, useMotionValue, animate } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SwipeableDaysNavigatorProps {
  currentDay: number;
  totalDays: number;
  dayNames: string[];
  onDayChange: (day: number) => void;
}

export const SwipeableDaysNavigator = ({
  currentDay,
  totalDays,
  dayNames,
  onDayChange,
}: SwipeableDaysNavigatorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, []);

  const SWIPE_THRESHOLD = containerWidth * 0.2;

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    // Determine direction based on offset and velocity
    if (offset < -SWIPE_THRESHOLD || velocity < -500) {
      // Swipe left -> next day
      if (currentDay < totalDays - 1) {
        onDayChange(currentDay + 1);
      }
    } else if (offset > SWIPE_THRESHOLD || velocity > 500) {
      // Swipe right -> previous day
      if (currentDay > 0) {
        onDayChange(currentDay - 1);
      }
    }

    // Always reset x position
    animate(x, 0, { type: "spring", stiffness: 500, damping: 30 });
  };

  const goToPreviousDay = () => {
    if (currentDay > 0) {
      onDayChange(currentDay - 1);
    }
  };

  const goToNextDay = () => {
    if (currentDay < totalDays - 1) {
      onDayChange(currentDay + 1);
    }
  };

  return (
    <div className="relative">
      {/* Day indicators */}
      <div className="flex items-center justify-center gap-1 mb-3">
        {Array.from({ length: totalDays }).map((_, index) => (
          <button
            key={index}
            onClick={() => onDayChange(index)}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              index === currentDay 
                ? "w-6 bg-primary" 
                : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
            )}
          />
        ))}
      </div>

      {/* Navigation controls */}
      <div 
        ref={containerRef}
        className="flex items-center justify-between gap-2"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPreviousDay}
          disabled={currentDay === 0}
          className="h-10 w-10 rounded-full shrink-0"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        {/* Swipeable day name */}
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
          style={{ x }}
          className="flex-1 cursor-grab active:cursor-grabbing touch-pan-y select-none"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentDay}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-[0_3px_0_hsl(16_90%_45%)]">
                  <span className="text-primary-foreground font-bold text-sm sm:text-base">
                    {currentDay + 1}
                  </span>
                </div>
                <span className="text-lg sm:text-xl font-bold">{dayNames[currentDay]}</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <Button
          variant="ghost"
          size="icon"
          onClick={goToNextDay}
          disabled={currentDay === totalDays - 1}
          className="h-10 w-10 rounded-full shrink-0"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Swipe hint */}
      <p className="text-xs text-muted-foreground text-center mt-2 md:hidden">
        <ChevronLeft className="h-3 w-3 inline animate-pulse" />
        <span className="mx-1">Desliza para cambiar día</span>
        <ChevronRight className="h-3 w-3 inline animate-pulse" />
      </p>
    </div>
  );
};
