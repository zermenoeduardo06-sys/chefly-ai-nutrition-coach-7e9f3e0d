import { motion } from "framer-motion";
import { Droplets, Plus, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
      goal: "Meta:",
      complete: "¡Meta alcanzada!",
    },
    en: {
      title: "Water",
      glasses: "glasses",
      goal: "Goal:",
      complete: "Goal reached!",
    },
  };

  const t = texts[language];

  return (
    <Card className="border-border/50 overflow-hidden bg-gradient-to-br from-sky-500/5 to-blue-500/10">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {/* Left: Icon + Info */}
          <div className="flex items-center gap-3">
            <motion.div
              animate={isComplete ? { scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: isComplete ? Infinity : 0, duration: 2 }}
              className={`p-2.5 rounded-full ${
                isComplete
                  ? "bg-sky-500/20 text-sky-500"
                  : "bg-sky-500/10 text-sky-400"
              }`}
            >
              <Droplets className="h-5 w-5" />
            </motion.div>

            <div>
              <h3 className="text-sm font-medium text-foreground">{t.title}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-foreground">{glasses}</span>
                <span className="text-sm text-muted-foreground">/ {dailyGoal}</span>
                <span className="text-xs text-muted-foreground ml-1">{t.glasses}</span>
              </div>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-full border-sky-500/30 hover:bg-sky-500/10"
              onClick={handleRemove}
              disabled={glasses <= 0}
            >
              <Minus className="h-4 w-4 text-sky-500" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-full border-sky-500/30 hover:bg-sky-500/10 bg-sky-500/5"
              onClick={handleAdd}
            >
              <Plus className="h-4 w-4 text-sky-500" />
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 relative">
          <div className="h-2 bg-sky-500/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={`h-full rounded-full ${
                isComplete
                  ? "bg-gradient-to-r from-sky-400 to-emerald-400"
                  : "bg-gradient-to-r from-sky-400 to-blue-500"
              }`}
            />
          </div>
          {isComplete && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-emerald-500 font-medium mt-1 text-center"
            >
              {t.complete} 💧
            </motion.p>
          )}
        </div>

        {/* Glass indicators */}
        <div className="flex gap-1 mt-3 justify-center flex-wrap">
          {Array.from({ length: dailyGoal }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.03 }}
              className={`w-4 h-6 rounded-sm border ${
                i < glasses
                  ? "bg-sky-500/80 border-sky-400"
                  : "bg-sky-500/10 border-sky-500/20"
              }`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
