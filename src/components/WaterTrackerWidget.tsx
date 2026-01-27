import { motion } from "framer-motion";
import { Droplets, Plus, Minus, Check } from "lucide-react";
import { Card3D, Card3DContent } from "@/components/ui/card-3d";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useWaterIntake } from "@/hooks/useWaterIntake";
import { useHaptics } from "@/hooks/useHaptics";

interface WaterTrackerWidgetProps {
  userId: string | undefined;
  selectedDate: Date;
}

export function WaterTrackerWidget({ userId, selectedDate }: WaterTrackerWidgetProps) {
  const { language } = useLanguage();
  const { glasses, dailyGoal, addGlass, removeGlass } = useWaterIntake(userId, selectedDate);
  const { selectionChanged } = useHaptics();

  const progress = Math.min((glasses / dailyGoal) * 100, 100);
  const isComplete = glasses >= dailyGoal;

  const handleAdd = async () => {
    await selectionChanged();
    addGlass();
  };

  const handleRemove = async () => {
    await selectionChanged();
    removeGlass();
  };

  const texts = {
    es: {
      title: "Agua",
      glasses: "vasos",
      complete: "¡Meta!",
    },
    en: {
      title: "Water",
      glasses: "glasses",
      complete: "Goal!",
    },
  };

  const t = texts[language];

  return (
    <Card3D variant="default" hover={false} className="overflow-hidden">
      <Card3DContent className="p-5">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Animated Water Drop with fill */}
          <div className="relative">
            <motion.div
              className="relative w-16 h-16 flex items-center justify-center"
              animate={isComplete ? { scale: [1, 1.05, 1] } : {}}
              transition={{ repeat: isComplete ? Infinity : 0, duration: 2 }}
            >
              {/* Water drop background */}
              <svg viewBox="0 0 64 64" className="w-full h-full">
                <defs>
                  <clipPath id="dropClip">
                    <path d="M32 4 C32 4 52 24 52 40 C52 52 43 60 32 60 C21 60 12 52 12 40 C12 24 32 4 32 4Z" />
                  </clipPath>
                </defs>
                {/* Empty drop outline */}
                <path 
                  d="M32 4 C32 4 52 24 52 40 C52 52 43 60 32 60 C21 60 12 52 12 40 C12 24 32 4 32 4Z" 
                  fill="none"
                  stroke="hsl(var(--border))"
                  strokeWidth="2"
                  className="opacity-50"
                />
                {/* Filled water with animation */}
                <g clipPath="url(#dropClip)">
                  <motion.rect 
                    x="0"
                    width="64"
                    height="64"
                    initial={{ y: 64 }}
                    animate={{ y: 64 - (progress * 0.56) }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className={isComplete ? "fill-emerald-400" : "fill-sky-400"}
                  />
                  {/* Wave effect */}
                  <motion.path
                    d="M0 40 Q16 35 32 40 T64 40 V64 H0 Z"
                    initial={{ y: 24 }}
                    animate={{ 
                      y: 64 - (progress * 0.56) - 8,
                      d: [
                        "M0 40 Q16 35 32 40 T64 40 V64 H0 Z",
                        "M0 40 Q16 45 32 40 T64 40 V64 H0 Z",
                        "M0 40 Q16 35 32 40 T64 40 V64 H0 Z"
                      ]
                    }}
                    transition={{ 
                      y: { duration: 0.5, ease: "easeOut" },
                      d: { repeat: Infinity, duration: 2, ease: "easeInOut" }
                    }}
                    className={isComplete ? "fill-emerald-300/50" : "fill-sky-300/50"}
                  />
                </g>
              </svg>
              
              {/* Check icon when complete */}
              {isComplete && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Check className="h-6 w-6 text-white drop-shadow-lg" strokeWidth={3} />
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Center: Count display */}
          <div className="flex-1 text-center">
            <div className="flex items-baseline justify-center gap-1">
              <motion.span 
                key={glasses}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-4xl font-bold text-foreground"
              >
                {glasses}
              </motion.span>
              <span className="text-lg text-muted-foreground">/ {dailyGoal}</span>
            </div>
            <p className={`text-sm font-medium ${isComplete ? "text-emerald-500" : "text-muted-foreground"}`}>
              {isComplete ? t.complete + " 💧" : t.glasses}
            </p>
          </div>

          {/* Right: +/- buttons stacked vertically */}
          <div className="flex flex-col gap-2">
            <Button
              variant="modern3dOutline"
              size="icon"
              className="h-12 w-12 rounded-xl"
              onClick={handleAdd}
            >
              <Plus className="h-5 w-5" />
            </Button>
            <Button
              variant="modern3dOutline"
              size="icon"
              className="h-12 w-12 rounded-xl"
              onClick={handleRemove}
              disabled={glasses <= 0}
            >
              <Minus className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </Card3DContent>
    </Card3D>
  );
}
