import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Droplets, Plus, Minus, Check, Sparkles } from "lucide-react";
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
  const { selectionChanged, successNotification } = useHaptics();
  const [showSplash, setShowSplash] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  const progress = Math.min((glasses / dailyGoal) * 100, 100);
  const isComplete = glasses >= dailyGoal;

  const handleAdd = async () => {
    await selectionChanged();
    setShowSplash(true);
    setTimeout(() => setShowSplash(false), 600);
    
    const wasNotComplete = glasses < dailyGoal;
    addGlass();
    
    // Celebrate completion
    if (wasNotComplete && glasses + 1 >= dailyGoal) {
      await successNotification();
      setJustCompleted(true);
      setTimeout(() => setJustCompleted(false), 2000);
    }
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
      perfect: "¡Perfecto!",
    },
    en: {
      title: "Water",
      glasses: "glasses",
      complete: "Goal!",
      perfect: "Perfect!",
    },
  };

  const t = texts[language];

  return (
    <Card3D variant="default" hover={false} className="overflow-hidden relative">
      {/* Splash effect overlay */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 2.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute top-1/2 left-1/4 w-8 h-8 rounded-full bg-sky-400/40 z-10 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Celebration overlay */}
      <AnimatePresence>
        {justCompleted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-emerald-500/10 backdrop-blur-[1px] rounded-2xl"
          >
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: [0, 1.2, 1], rotate: 0 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500 text-white font-bold shadow-lg"
            >
              <Sparkles className="w-5 h-5" />
              {t.perfect}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Card3DContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Animated Water Drop with fill */}
          <div className="relative">
            <motion.div
              className="relative w-16 h-16 flex items-center justify-center"
              animate={isComplete ? { scale: [1, 1.05, 1] } : showSplash ? { scale: [1, 1.08, 1] } : {}}
              transition={{ repeat: isComplete ? Infinity : 0, duration: isComplete ? 2 : 0.3 }}
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
                  {/* Wave effect - enhanced animation */}
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
                      d: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
                    }}
                    className={isComplete ? "fill-emerald-300/50" : "fill-sky-300/50"}
                  />
                </g>
              </svg>
              
              {/* Check icon when complete */}
              {isComplete && (
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Check className="h-6 w-6 text-white drop-shadow-lg" strokeWidth={3} />
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Center: Count display with animated number */}
          <div className="flex-1 text-center">
            <div className="flex items-baseline justify-center gap-1">
              <motion.span 
                key={glasses}
                initial={{ scale: 1.3, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                className="text-4xl font-bold text-foreground tabular-nums"
              >
                {glasses}
              </motion.span>
              <span className="text-lg text-muted-foreground">/ {dailyGoal}</span>
            </div>
            <motion.p 
              className={`text-sm font-medium transition-colors ${isComplete ? "text-emerald-500" : "text-muted-foreground"}`}
              animate={isComplete ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              {isComplete ? t.complete + " 💧" : t.glasses}
            </motion.p>
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
