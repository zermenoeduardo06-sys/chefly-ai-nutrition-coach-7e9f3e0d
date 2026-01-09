import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Target, Flame, Trophy, Star } from 'lucide-react';
import { useCelebrations } from '@/hooks/useCelebrations';
import { useLanguage } from '@/contexts/LanguageContext';
import mascotEnergized from '@/assets/mascot-energized.png';
import mascotPower from '@/assets/mascot-power.png';
import mascotCelebrating from '@/assets/mascot-celebrating.png';

interface Milestone {
  percentage: number;
  icon: React.ReactNode;
  titleEs: string;
  titleEn: string;
  subtitleEs: string;
  subtitleEn: string;
  colors: string[];
  mascot: string;
  intensity: 'small' | 'medium' | 'epic';
}

const milestones: Milestone[] = [
  {
    percentage: 25,
    icon: <Sparkles className="w-8 h-8" />,
    titleEs: '¡Buen comienzo!',
    titleEn: 'Good start!',
    subtitleEs: '25% de tu meta',
    subtitleEn: '25% of your goal',
    colors: ['from-emerald-400', 'to-teal-500'],
    mascot: mascotEnergized,
    intensity: 'small',
  },
  {
    percentage: 50,
    icon: <Target className="w-8 h-8" />,
    titleEs: '¡Mitad del camino!',
    titleEn: 'Halfway there!',
    subtitleEs: '50% completado',
    subtitleEn: '50% complete',
    colors: ['from-blue-400', 'to-cyan-500'],
    mascot: mascotEnergized,
    intensity: 'small',
  },
  {
    percentage: 75,
    icon: <Flame className="w-8 h-8" />,
    titleEs: '¡Ya casi llegas!',
    titleEn: 'Almost there!',
    subtitleEs: '75% - ¡Sigue así!',
    subtitleEn: '75% - Keep going!',
    colors: ['from-orange-400', 'to-amber-500'],
    mascot: mascotPower,
    intensity: 'medium',
  },
  {
    percentage: 100,
    icon: <Trophy className="w-8 h-8" />,
    titleEs: '¡META ALCANZADA!',
    titleEn: 'GOAL REACHED!',
    subtitleEs: '¡Increíble trabajo! 🎉',
    subtitleEn: 'Amazing work! 🎉',
    colors: ['from-primary', 'to-accent'],
    mascot: mascotCelebrating,
    intensity: 'epic',
  },
];

// Helper to get today's date as a key
const getTodayKey = () => new Date().toISOString().split('T')[0];

// Helper to get/set milestones from localStorage
const getStoredMilestones = (): { date: string; milestones: number[] } => {
  try {
    const stored = localStorage.getItem('daily_milestones_shown');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error reading milestones from storage:', e);
  }
  return { date: '', milestones: [] };
};

const setStoredMilestones = (milestones: number[]) => {
  try {
    localStorage.setItem('daily_milestones_shown', JSON.stringify({
      date: getTodayKey(),
      milestones,
    }));
  } catch (e) {
    console.error('Error saving milestones to storage:', e);
  }
};

interface DailyProgressMilestonesProps {
  currentCalories: number;
  targetCalories: number;
  selectedDate?: Date;
  onMilestoneReached?: (percentage: number) => void;
}

export const DailyProgressMilestones: React.FC<DailyProgressMilestonesProps> = ({
  currentCalories,
  targetCalories,
  selectedDate,
  onMilestoneReached,
}) => {
  const { language } = useLanguage();
  const { celebrateProgressMilestone } = useCelebrations();
  const [activeMilestone, setActiveMilestone] = useState<Milestone | null>(null);
  const [showMilestone, setShowMilestone] = useState(false);
  const [shownMilestones, setShownMilestones] = useState<Set<number>>(() => {
    const stored = getStoredMilestones();
    if (stored.date === getTodayKey()) {
      return new Set(stored.milestones);
    }
    return new Set();
  });
  const prevPercentage = useRef(0);
  const hasInitialized = useRef(false);

  const currentPercentage = targetCalories > 0 
    ? Math.round((currentCalories / targetCalories) * 100) 
    : 0;

  // Check if viewing today
  const isToday = !selectedDate || 
    new Date(selectedDate).toISOString().split('T')[0] === getTodayKey();

  useEffect(() => {
    // Don't show milestones if not viewing today
    if (!isToday) return;

    // On first render, just set the initial percentage without triggering milestones
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      prevPercentage.current = currentPercentage;
      
      // Also mark already-reached milestones as shown (for when user reopens the app)
      const alreadyReached = milestones
        .filter(m => currentPercentage >= m.percentage)
        .map(m => m.percentage);
      
      if (alreadyReached.length > 0) {
        const stored = getStoredMilestones();
        if (stored.date === getTodayKey()) {
          // Keep the stored ones
          return;
        }
        // New day but user already has progress - mark as shown
        const newShown = new Set(alreadyReached);
        setShownMilestones(newShown);
        setStoredMilestones(alreadyReached);
      }
      return;
    }

    // Check for newly reached milestones
    for (const milestone of milestones) {
      const wasReached = prevPercentage.current >= milestone.percentage;
      const isNowReached = currentPercentage >= milestone.percentage;
      const alreadyShown = shownMilestones.has(milestone.percentage);

      if (isNowReached && !wasReached && !alreadyShown) {
        // New milestone reached!
        const newShownMilestones = new Set(shownMilestones);
        newShownMilestones.add(milestone.percentage);
        setShownMilestones(newShownMilestones);
        setStoredMilestones(Array.from(newShownMilestones));
        
        setActiveMilestone(milestone);
        setShowMilestone(true);
        celebrateProgressMilestone(milestone.percentage);
        onMilestoneReached?.(milestone.percentage);

        // Auto-hide after delay
        const duration = milestone.intensity === 'epic' ? 4000 : milestone.intensity === 'medium' ? 3000 : 2500;
        setTimeout(() => {
          setShowMilestone(false);
        }, duration);

        break; // Only show one milestone at a time
      }
    }

    prevPercentage.current = currentPercentage;
  }, [currentPercentage, celebrateProgressMilestone, onMilestoneReached, shownMilestones, isToday]);

  // Reset milestones at start of new day
  useEffect(() => {
    const stored = getStoredMilestones();
    if (stored.date !== getTodayKey()) {
      setShownMilestones(new Set());
      localStorage.removeItem('daily_milestones_shown');
    }
  }, []);

  return (
    <AnimatePresence>
      {showMilestone && activeMilestone && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
        >
          {/* Backdrop for epic milestones */}
          {activeMilestone.intensity === 'epic' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-b from-primary/20 to-background/80 backdrop-blur-sm"
            />
          )}

          {/* Main celebration card */}
          <motion.div
            initial={{ scale: 0, y: 100, rotate: -10 }}
            animate={{ 
              scale: 1, 
              y: 0, 
              rotate: 0,
              transition: { type: "spring", stiffness: 300, damping: 15 }
            }}
            exit={{ scale: 0, y: -100, opacity: 0 }}
            className="relative z-10"
          >
            {/* Glow effect */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className={`absolute inset-0 -m-4 rounded-3xl bg-gradient-to-r ${activeMilestone.colors[0]} ${activeMilestone.colors[1]} blur-xl opacity-50`}
            />

            {/* Card content */}
            <div className={`relative bg-gradient-to-br ${activeMilestone.colors[0]} ${activeMilestone.colors[1]} p-6 rounded-3xl shadow-2xl`}>
              {/* Floating particles */}
              {activeMilestone.intensity !== 'small' && [...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    x: Math.cos((i * 45) * Math.PI / 180) * 60,
                    y: Math.sin((i * 45) * Math.PI / 180) * 60,
                  }}
                  transition={{
                    duration: 1.2,
                    delay: i * 0.1,
                    repeat: Infinity,
                    repeatDelay: 0.5,
                  }}
                  className="absolute top-1/2 left-1/2 text-white/80"
                >
                  <Star className="w-4 h-4 fill-current" />
                </motion.div>
              ))}

              {/* Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
                className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center text-white"
              >
                {activeMilestone.icon}
              </motion.div>

              {/* Text */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-white text-center mb-1"
              >
                {language === 'es' ? activeMilestone.titleEs : activeMilestone.titleEn}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-white/80 text-center text-sm"
              >
                {language === 'es' ? activeMilestone.subtitleEs : activeMilestone.subtitleEn}
              </motion.p>

              {/* Progress indicator */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="mt-4 h-2 bg-white/30 rounded-full overflow-hidden"
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(currentPercentage, 100)}%` }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="h-full bg-white rounded-full"
                />
              </motion.div>

              {/* Mascot */}
              <motion.img
                src={activeMilestone.mascot}
                alt="Mascot"
                initial={{ scale: 0, x: 50 }}
                animate={{ scale: 1, x: 0 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="absolute -right-8 -bottom-8 w-24 h-24 object-contain"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DailyProgressMilestones;
