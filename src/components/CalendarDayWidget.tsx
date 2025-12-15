import { format, addDays, startOfWeek } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { Calendar, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";

interface CalendarDayWidgetProps {
  isCheckInDay: boolean;
  onCheckInClick?: () => void;
  currentDay: number;
  onDayChange: (day: number) => void;
  weekStartDate?: string;
}

export function CalendarDayWidget({ 
  isCheckInDay, 
  onCheckInClick, 
  currentDay, 
  onDayChange,
  weekStartDate 
}: CalendarDayWidgetProps) {
  const { language } = useLanguage();
  const locale = language === 'es' ? es : enUS;
  
  // Get the date for the selected day based on week start
  const getSelectedDate = () => {
    if (weekStartDate) {
      return addDays(new Date(weekStartDate), currentDay);
    }
    // Fallback: use current week
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday start
    return addDays(weekStart, currentDay);
  };
  
  const selectedDate = getSelectedDate();
  const dayNumber = format(selectedDate, 'd', { locale });
  const dayName = format(selectedDate, 'EEEE', { locale });
  const monthName = format(selectedDate, 'MMMM', { locale });
  const year = format(selectedDate, 'yyyy', { locale });
  
  // Check if selected day is Monday (day 0 in our system, which is Monday)
  const isMonday = currentDay === 0;
  
  // Check if selected day is today
  const today = new Date();
  const isToday = format(today, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
  
  const t = {
    es: {
      checkInDay: "Día de Check-In",
      today: "Hoy",
      day: "Día",
    },
    en: {
      checkInDay: "Check-In Day",
      today: "Today",
      day: "Day",
    }
  };
  
  const texts = t[language];

  const goToPreviousDay = () => {
    if (currentDay > 0) {
      onDayChange(currentDay - 1);
    }
  };

  const goToNextDay = () => {
    if (currentDay < 6) {
      onDayChange(currentDay + 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className={`relative overflow-hidden ${
          isCheckInDay && isMonday 
            ? 'bg-gradient-to-br from-primary/20 via-primary/10 to-background border-primary/30' 
            : 'bg-card/50 border-border/50'
        }`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between gap-2">
            {/* Previous day button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPreviousDay}
              disabled={currentDay === 0}
              className="h-10 w-10 shrink-0"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            {/* Calendar day display */}
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentDay}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3 flex-1 justify-center cursor-pointer"
                onClick={isCheckInDay && isMonday ? onCheckInClick : undefined}
              >
                <div className={`
                  relative w-14 h-14 rounded-xl flex flex-col items-center justify-center shrink-0
                  ${isCheckInDay && isMonday 
                    ? 'bg-primary text-primary-foreground' 
                    : isToday 
                      ? 'bg-secondary text-secondary-foreground ring-2 ring-primary'
                      : 'bg-muted text-foreground'
                  }
                `}>
                  <span className="text-[10px] uppercase font-semibold opacity-80">
                    {monthName.slice(0, 3)}
                  </span>
                  <span className="text-2xl font-bold leading-none">{dayNumber}</span>
                </div>
                
                <div className="flex flex-col min-w-0">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">
                    {isToday ? texts.today : `${texts.day} ${currentDay + 1}`}
                  </span>
                  <span className="text-lg font-semibold capitalize text-foreground truncate">
                    {dayName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {monthName} {year}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Next day button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNextDay}
              disabled={currentDay === 6}
              className="h-10 w-10 shrink-0"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Day indicators */}
          <div className="flex justify-center gap-1.5 mt-3">
            {[0, 1, 2, 3, 4, 5, 6].map((day) => (
              <button
                key={day}
                onClick={() => onDayChange(day)}
                className={`
                  w-2 h-2 rounded-full transition-all duration-200
                  ${day === currentDay 
                    ? 'bg-primary w-4' 
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }
                `}
              />
            ))}
          </div>
          
          {/* Check-in badge */}
          {isCheckInDay && isMonday && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="flex justify-center mt-3"
            >
              <Badge 
                variant="default" 
                className="bg-primary/90 text-primary-foreground gap-1 cursor-pointer"
                onClick={onCheckInClick}
              >
                <Sparkles className="w-3 h-3" />
                {texts.checkInDay}
              </Badge>
            </motion.div>
          )}
        </div>
        
        {/* Decorative calendar icon */}
        <Calendar 
          className={`
            absolute -right-4 -bottom-4 w-24 h-24 opacity-5
            ${isCheckInDay && isMonday ? 'text-primary' : 'text-foreground'}
          `}
        />
      </Card>
    </motion.div>
  );
}
