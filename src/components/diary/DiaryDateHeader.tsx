import { useState } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, subDays, isToday, isYesterday, isFuture, startOfDay } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { useLanguage } from "@/contexts/LanguageContext";
import { useHaptics } from "@/hooks/useHaptics";
import { cn } from "@/lib/utils";

interface DiaryDateHeaderProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const texts = {
  es: {
    today: "Hoy",
    yesterday: "Ayer",
  },
  en: {
    today: "Today",
    yesterday: "Yesterday",
  },
};

export function DiaryDateHeader({ selectedDate, onDateChange }: DiaryDateHeaderProps) {
  const { language } = useLanguage();
  const { lightImpact } = useHaptics();
  const t = texts[language];
  const locale = language === 'es' ? es : enUS;
  
  const [direction, setDirection] = useState(0);
  
  // Check if we can go to next day (only if it's not in the future)
  const canGoNext = !isToday(selectedDate);

  const getDateLabel = (date: Date): string => {
    if (isToday(date)) return t.today;
    if (isYesterday(date)) return t.yesterday;
    return format(date, "EEEE", { locale });
  };

  const getFormattedDate = (date: Date): string => {
    if (isToday(date) || isYesterday(date)) {
      return format(date, "d 'de' MMMM", { locale });
    }
    return format(date, "d 'de' MMMM, yyyy", { locale });
  };

  const handlePrevDay = () => {
    lightImpact();
    setDirection(-1);
    onDateChange(subDays(selectedDate, 1));
  };

  const handleNextDay = () => {
    // Block navigation to future dates
    if (!canGoNext) return;
    lightImpact();
    setDirection(1);
    onDateChange(addDays(selectedDate, 1));
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x > threshold) {
      handlePrevDay();
    } else if (info.offset.x < -threshold && canGoNext) {
      handleNextDay();
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
    }),
  };

  return (
    <div className="relative">
      {/* Swipeable container */}
      <motion.div
        className="flex items-center justify-between px-2 py-3 cursor-grab active:cursor-grabbing"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
      >
        {/* Previous day button */}
        <button
          onClick={handlePrevDay}
          className="p-2 rounded-full hover:bg-muted/50 transition-colors active:scale-90"
          aria-label="Previous day"
        >
          <ChevronLeft className="h-6 w-6 text-muted-foreground" />
        </button>

        {/* Date display with animation */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={selectedDate.toISOString()}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.15, ease: "easeInOut" }}
              className="text-center"
            >
              <h2 className={cn(
                "text-xl font-bold capitalize",
                isToday(selectedDate) ? "text-primary" : "text-foreground"
              )}>
                {getDateLabel(selectedDate)}
              </h2>
              <p className="text-sm text-muted-foreground capitalize">
                {getFormattedDate(selectedDate)}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Next day button - disabled if today */}
        <button
          onClick={handleNextDay}
          disabled={!canGoNext}
          className={cn(
            "p-2 rounded-full transition-colors active:scale-90",
            canGoNext 
              ? "hover:bg-muted/50 text-muted-foreground" 
              : "text-muted-foreground/30 cursor-not-allowed"
          )}
          aria-label="Next day"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </motion.div>

      {/* Day dots indicator - only past days and today */}
      <div className="flex justify-center gap-1.5 pb-2">
        {[-4, -3, -2, -1, 0].map((offset) => {
          // Use startOfDay to ensure we're working with local dates, not UTC
          const today = startOfDay(new Date());
          const dotDate = addDays(today, offset);
          const isSelected = format(selectedDate, 'yyyy-MM-dd') === format(dotDate, 'yyyy-MM-dd');
          const isTodayDot = offset === 0;
          
          return (
            <button
              key={offset}
              onClick={() => {
                lightImpact();
                setDirection(offset > 0 ? 1 : offset < 0 ? -1 : 0);
                onDateChange(dotDate);
              }}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-200",
                isSelected
                  ? "bg-primary scale-125"
                  : isTodayDot
                    ? "bg-primary/40"
                    : "bg-muted-foreground/30"
              )}
              aria-label={format(dotDate, 'EEEE d', { locale })}
            />
          );
        })}
      </div>
    </div>
  );
}
