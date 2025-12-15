import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { Calendar, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

interface CalendarDayWidgetProps {
  isCheckInDay: boolean;
  onCheckInClick?: () => void;
}

export function CalendarDayWidget({ isCheckInDay, onCheckInClick }: CalendarDayWidgetProps) {
  const { language } = useLanguage();
  const locale = language === 'es' ? es : enUS;
  
  // Get current date in user's timezone
  const now = new Date();
  const dayNumber = format(now, 'd', { locale });
  const dayName = format(now, 'EEEE', { locale });
  const monthName = format(now, 'MMMM', { locale });
  const year = format(now, 'yyyy', { locale });
  
  // Check if today is Monday (day 1 in date-fns, 0 is Sunday)
  const isMonday = now.getDay() === 1;
  
  const t = {
    es: {
      checkInDay: "Día de Check-In",
      today: "Hoy",
    },
    en: {
      checkInDay: "Check-In Day",
      today: "Today",
    }
  };
  
  const texts = t[language];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className={`relative overflow-hidden ${
          isCheckInDay && isMonday 
            ? 'bg-gradient-to-br from-primary/20 via-primary/10 to-background border-primary/30 cursor-pointer hover:border-primary/50 transition-colors' 
            : 'bg-card/50 border-border/50'
        }`}
        onClick={isCheckInDay && isMonday ? onCheckInClick : undefined}
      >
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            {/* Calendar icon section */}
            <div className="flex items-center gap-3">
              <div className={`
                relative w-14 h-14 rounded-xl flex flex-col items-center justify-center
                ${isCheckInDay && isMonday 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-foreground'
                }
              `}>
                <span className="text-[10px] uppercase font-semibold opacity-80">
                  {monthName.slice(0, 3)}
                </span>
                <span className="text-2xl font-bold leading-none">{dayNumber}</span>
              </div>
              
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">
                  {texts.today}
                </span>
                <span className="text-lg font-semibold capitalize text-foreground">
                  {dayName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {monthName} {year}
                </span>
              </div>
            </div>
            
            {/* Check-in badge */}
            {isCheckInDay && isMonday && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <Badge 
                  variant="default" 
                  className="bg-primary/90 text-primary-foreground gap-1 whitespace-nowrap"
                >
                  <Sparkles className="w-3 h-3" />
                  {texts.checkInDay}
                </Badge>
              </motion.div>
            )}
          </div>
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
