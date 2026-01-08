import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface OnboardingNumericInputProps {
  value: number | string;
  onChange: (value: number) => void;
  unit?: string;
  alternateUnit?: string;
  onUnitToggle?: () => void;
  min?: number;
  max?: number;
  placeholder?: string;
  label?: string;
  className?: string;
}

export const OnboardingNumericInput: React.FC<OnboardingNumericInputProps> = ({
  value,
  onChange,
  unit,
  alternateUnit,
  onUnitToggle,
  min = 0,
  max = 999,
  placeholder = "0",
  label,
  className = "",
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9.]/g, '');
    const numValue = parseFloat(rawValue) || 0;
    
    if (numValue >= min && numValue <= max) {
      onChange(numValue);
    }
  };

  return (
    <div className={cn("flex flex-col items-center gap-6", className)}>
      {label && (
        <p className="text-lg text-muted-foreground text-center">
          {label}
        </p>
      )}
      
      <div className="flex flex-col items-center gap-4">
        {/* Large number display */}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            inputMode="decimal"
            value={value || ''}
            onChange={handleChange}
            placeholder={placeholder}
            className={cn(
              "w-48 text-center text-6xl font-bold bg-transparent border-none outline-none",
              "text-foreground placeholder:text-muted-foreground/30",
              "focus:ring-0"
            )}
            style={{ caretColor: 'hsl(var(--primary))' }}
          />
          
          {/* Underline */}
          <motion.div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 bg-gradient-to-r from-primary to-secondary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: value ? '80%' : '40%' }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Unit toggle */}
        {unit && (
          <div className="flex items-center gap-2">
            {alternateUnit && onUnitToggle ? (
              <div className="flex bg-muted rounded-full p-1">
                <button
                  onClick={onUnitToggle}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all",
                    !alternateUnit ? "bg-card text-foreground shadow-sm" : ""
                  )}
                >
                  {unit}
                </button>
                <button
                  onClick={onUnitToggle}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all",
                    alternateUnit ? "bg-card text-foreground shadow-sm" : ""
                  )}
                >
                  {alternateUnit}
                </button>
              </div>
            ) : (
              <span className="text-xl text-muted-foreground font-medium">
                {unit}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
