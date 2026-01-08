import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface OnboardingDatePickerProps {
  value: Date | null;
  onChange: (date: Date) => void;
  minYear?: number;
  maxYear?: number;
  className?: string;
}

const months = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const OnboardingDatePicker: React.FC<OnboardingDatePickerProps> = ({
  value,
  onChange,
  minYear = 1940,
  maxYear = new Date().getFullYear() - 10,
  className = "",
}) => {
  const currentYear = new Date().getFullYear();
  const defaultYear = currentYear - 25;
  
  const [day, setDay] = useState(value?.getDate() || 15);
  const [month, setMonth] = useState(value?.getMonth() || 5);
  const [year, setYear] = useState(value?.getFullYear() || defaultYear);

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);

  useEffect(() => {
    // Adjust day if it exceeds the days in the selected month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    if (day > daysInMonth) {
      setDay(daysInMonth);
    }
    
    const newDate = new Date(year, month, Math.min(day, daysInMonth));
    onChange(newDate);
  }, [day, month, year]);

  return (
    <div className={cn("flex flex-col items-center gap-6", className)}>
      <div className="flex items-center justify-center gap-2 w-full max-w-sm">
        {/* Day picker */}
        <PickerColumn
          items={days}
          value={day}
          onChange={setDay}
          formatItem={(d) => d.toString().padStart(2, '0')}
          width="w-16"
        />
        
        {/* Month picker */}
        <PickerColumn
          items={months.map((_, i) => i)}
          value={month}
          onChange={setMonth}
          formatItem={(m) => months[m]}
          width="w-32"
        />
        
        {/* Year picker */}
        <PickerColumn
          items={years}
          value={year}
          onChange={setYear}
          formatItem={(y) => y.toString()}
          width="w-20"
        />
      </div>
    </div>
  );
};

interface PickerColumnProps<T> {
  items: T[];
  value: T;
  onChange: (value: T) => void;
  formatItem: (item: T) => string;
  width?: string;
}

function PickerColumn<T extends number>({
  items,
  value,
  onChange,
  formatItem,
  width = "w-20",
}: PickerColumnProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemHeight = 48;
  const visibleItems = 5;
  const centerOffset = Math.floor(visibleItems / 2) * itemHeight;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const index = items.indexOf(value);
    if (index !== -1) {
      container.scrollTop = index * itemHeight;
    }
  }, []);

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    const scrollTop = container.scrollTop;
    const index = Math.round(scrollTop / itemHeight);
    const clampedIndex = Math.max(0, Math.min(items.length - 1, index));
    
    if (items[clampedIndex] !== value) {
      onChange(items[clampedIndex]);
    }
  };

  const handleItemClick = (item: T) => {
    const container = containerRef.current;
    if (!container) return;

    const index = items.indexOf(item);
    container.scrollTo({
      top: index * itemHeight,
      behavior: 'smooth'
    });
    onChange(item);
  };

  return (
    <div className={cn("relative", width)} style={{ height: itemHeight * visibleItems }}>
      {/* Selection highlight */}
      <div 
        className="absolute left-0 right-0 bg-muted rounded-lg pointer-events-none z-0"
        style={{
          top: centerOffset,
          height: itemHeight,
        }}
      />
      
      {/* Gradient overlays */}
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-background to-transparent pointer-events-none z-10" />
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />
      
      {/* Scrollable list */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto scrollbar-hide snap-y snap-mandatory"
        style={{
          paddingTop: centerOffset,
          paddingBottom: centerOffset,
        }}
      >
        {items.map((item, index) => {
          const isSelected = item === value;
          
          return (
            <button
              key={index}
              onClick={() => handleItemClick(item)}
              className={cn(
                "w-full flex items-center justify-center snap-center transition-all",
                isSelected 
                  ? "text-foreground font-semibold text-lg" 
                  : "text-muted-foreground text-base"
              )}
              style={{ height: itemHeight }}
            >
              {formatItem(item)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
