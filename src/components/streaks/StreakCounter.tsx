import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Snowflake, Trophy, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface StreakCounterProps {
  streak: number;
  longestStreak: number;
  streakFreezeAvailable: number;
  isFreezed?: boolean;
  isPremium: boolean;
  onUseFreeze?: () => void;
  showMilestoneAnimation?: boolean;
  onMilestoneShown?: () => void;
}

const STREAK_MILESTONES = [7, 14, 30, 50, 100, 365];

const getMilestoneReached = (streak: number): number | null => {
  const milestone = STREAK_MILESTONES.find(m => m === streak);
  return milestone || null;
};

const getStreakColor = (streak: number): string => {
  if (streak >= 100) return "from-purple-500 to-pink-500";
  if (streak >= 30) return "from-yellow-500 to-orange-500";
  if (streak >= 14) return "from-orange-500 to-red-500";
  if (streak >= 7) return "from-red-500 to-orange-400";
  return "from-primary to-primary-hover";
};

const getStreakEmoji = (streak: number): string => {
  if (streak >= 100) return "👑";
  if (streak >= 30) return "🔥";
  if (streak >= 14) return "💪";
  if (streak >= 7) return "⚡";
  return "🔥";
};

export function StreakCounter({
  streak,
  longestStreak,
  streakFreezeAvailable,
  isFreezed = false,
  isPremium,
  onUseFreeze,
  showMilestoneAnimation = false,
  onMilestoneShown,
}: StreakCounterProps) {
  const { language } = useLanguage();
  const [showMilestone, setShowMilestone] = useState(false);
  const [currentMilestone, setCurrentMilestone] = useState<number | null>(null);

  const texts = {
    es: {
      streak: "Racha",
      days: "días",
      day: "día",
      longest: "Récord",
      freezeAvailable: "Congelar racha",
      freezeUsed: "Racha congelada",
      noFreeze: "Sin congelación",
      premium: "Premium",
      useFreeze: "Usar",
      milestoneTitle: "¡Hito alcanzado!",
      milestoneSubtitle: "días consecutivos",
    },
    en: {
      streak: "Streak",
      days: "days",
      day: "day",
      longest: "Record",
      freezeAvailable: "Freeze streak",
      freezeUsed: "Streak frozen",
      noFreeze: "No freeze",
      premium: "Premium",
      useFreeze: "Use",
      milestoneTitle: "Milestone reached!",
      milestoneSubtitle: "consecutive days",
    },
  };

  const t = texts[language];

  useEffect(() => {
    if (showMilestoneAnimation) {
      const milestone = getMilestoneReached(streak);
      if (milestone) {
        setCurrentMilestone(milestone);
        setShowMilestone(true);
        const timer = setTimeout(() => {
          setShowMilestone(false);
          onMilestoneShown?.();
        }, 3500);
        return () => clearTimeout(timer);
      }
    }
  }, [showMilestoneAnimation, streak, onMilestoneShown]);

  return (
    <div className="relative">
      {/* Milestone celebration overlay */}
      <AnimatePresence>
        {showMilestone && currentMilestone && (
          <MilestoneAnimation 
            milestone={currentMilestone} 
            texts={t}
            onComplete={() => setShowMilestone(false)}
          />
        )}
      </AnimatePresence>

      {/* Main streak counter */}
      <motion.div
        className={cn(
          "relative bg-gradient-to-br p-4 rounded-2xl shadow-lg border-2",
          getStreakColor(streak),
          "border-white/20"
        )}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {/* Glow effect for high streaks */}
        {streak >= 7 && (
          <motion.div
            className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}

        <div className="relative z-10 flex items-center gap-4">
          {/* Fire icon with animation */}
          <motion.div
            className="relative"
            animate={streak >= 3 ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              {isFreezed ? (
                <Snowflake className="w-8 h-8 text-white" />
              ) : (
                <span className="text-3xl">{getStreakEmoji(streak)}</span>
              )}
            </div>
            
            {/* Flame particles for high streaks */}
            {streak >= 7 && !isFreezed && (
              <div className="absolute -top-1 -right-1">
                <motion.div
                  animate={{ y: [0, -5, 0], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                >
                  <Flame className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                </motion.div>
              </div>
            )}
          </motion.div>

          {/* Streak number and info */}
          <div className="flex-1 text-white">
            <div className="flex items-baseline gap-2">
              <motion.span 
                className="text-4xl font-black"
                key={streak}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring" }}
              >
                {streak}
              </motion.span>
              <span className="text-lg font-medium opacity-90">
                {streak === 1 ? t.day : t.days}
              </span>
            </div>
            <p className="text-sm opacity-80 font-medium">{t.streak}</p>
          </div>

          {/* Longest streak badge */}
          <div className="text-right text-white/80">
            <div className="flex items-center gap-1 justify-end">
              <Trophy className="w-4 h-4" />
              <span className="text-sm font-medium">{t.longest}</span>
            </div>
            <span className="text-xl font-bold">{longestStreak}</span>
          </div>
        </div>

        {/* Streak freeze section for premium */}
        {isPremium && (
          <motion.div 
            className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 text-white/90">
              <Shield className="w-4 h-4" />
              <span className="text-sm">
                {isFreezed 
                  ? t.freezeUsed 
                  : streakFreezeAvailable > 0 
                    ? `${t.freezeAvailable} (${streakFreezeAvailable})` 
                    : t.noFreeze}
              </span>
            </div>
            {streakFreezeAvailable > 0 && !isFreezed && onUseFreeze && (
              <Button
                size="sm"
                variant="secondary"
                onClick={onUseFreeze}
                className="h-7 text-xs bg-white/20 hover:bg-white/30 text-white border-0"
              >
                <Snowflake className="w-3 h-3 mr-1" />
                {t.useFreeze}
              </Button>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

interface MilestoneAnimationProps {
  milestone: number;
  texts: Record<string, string>;
  onComplete: () => void;
}

function MilestoneAnimation({ milestone, texts, onComplete }: MilestoneAnimationProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onComplete}
    >
      <motion.div
        className="relative"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0, rotate: 180 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        {/* Celebration particles */}
        <CelebrationParticles />
        
        {/* Main milestone badge */}
        <motion.div
          className="relative bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 p-8 rounded-3xl shadow-2xl"
          animate={{ 
            boxShadow: [
              "0 0 20px rgba(251, 191, 36, 0.5)",
              "0 0 60px rgba(251, 191, 36, 0.8)",
              "0 0 20px rgba(251, 191, 36, 0.5)"
            ]
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="text-center text-white">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ delay: 0.3 }}
              className="text-6xl mb-2"
            >
              🎉
            </motion.div>
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl font-bold mb-1"
            >
              {texts.milestoneTitle}
            </motion.h2>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="flex items-center justify-center gap-2"
            >
              <Flame className="w-8 h-8 fill-yellow-200 text-yellow-200" />
              <span className="text-5xl font-black">{milestone}</span>
              <Flame className="w-8 h-8 fill-yellow-200 text-yellow-200" />
            </motion.div>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-sm opacity-90 mt-1"
            >
              {texts.milestoneSubtitle}
            </motion.p>
          </div>
        </motion.div>
        
        {/* Burst rays */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute top-1/2 left-1/2 w-2 h-20 bg-gradient-to-t from-yellow-400 to-transparent origin-bottom"
              style={{ transform: `rotate(${i * 45}deg)` }}
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: [0, 1, 0], opacity: [0, 0.8, 0] }}
              transition={{ delay: 0.2 + i * 0.05, duration: 0.8 }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

function CelebrationParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 400,
    y: (Math.random() - 0.5) * 400,
    delay: Math.random() * 0.5,
    size: 8 + Math.random() * 12,
    emoji: ['⭐', '✨', '🔥', '💫', '🎊'][Math.floor(Math.random() * 5)],
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute top-1/2 left-1/2 text-2xl"
          style={{ fontSize: particle.size }}
          initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
          animate={{ 
            x: particle.x, 
            y: particle.y, 
            opacity: [0, 1, 0],
            scale: [0, 1.2, 0],
            rotate: [0, 360]
          }}
          transition={{ 
            duration: 1.5, 
            delay: particle.delay,
            ease: "easeOut" 
          }}
        >
          {particle.emoji}
        </motion.div>
      ))}
    </div>
  );
}
