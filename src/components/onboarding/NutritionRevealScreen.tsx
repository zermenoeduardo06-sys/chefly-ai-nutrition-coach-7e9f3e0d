import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useHaptics } from '@/hooks/useHaptics';
import { useCelebrationSounds } from '@/hooks/useCelebrationSounds';
import { useLanguage } from '@/contexts/LanguageContext';
import { Flame, Beef, Wheat, Droplets, Sparkles, Calculator, Target, Zap } from 'lucide-react';
import AnimatedNumber from './AnimatedNumber';
import MacroRevealCard from './MacroRevealCard';
import mascotHappy from '@/assets/mascot-happy.png';

interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface UserSummary {
  name: string;
  age: number;
  goal: string;
  currentWeight: number;
  targetWeight: number;
  activityLevel: string;
  dietType: string;
  timeline?: string;
}

interface NutritionRevealScreenProps {
  goals: NutritionGoals;
  userSummary: UserSummary;
  onComplete: () => void;
}

type Phase = 'calculating' | 'calories' | 'macros' | 'summary' | 'celebration';

export const NutritionRevealScreen = ({
  goals,
  userSummary,
  onComplete,
}: NutritionRevealScreenProps) => {
  const [phase, setPhase] = useState<Phase>('calculating');
  const { successNotification, celebrationPattern, heavyImpact } = useHaptics();
  const { playCelebrationSound, playAchievementSound } = useCelebrationSounds();
  const { t } = useLanguage();

  // Phase transitions
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    timers.push(setTimeout(() => {
      setPhase('calories');
      heavyImpact();
    }, 3500));

    timers.push(setTimeout(() => {
      setPhase('macros');
      successNotification();
    }, 7000));

    timers.push(setTimeout(() => {
      setPhase('summary');
      successNotification();
    }, 12000));

    timers.push(setTimeout(() => {
      setPhase('celebration');
      celebrationPattern();
      playAchievementSound();
      
      // Big celebration confetti
      const duration = 3000;
      const end = Date.now() + duration;
      const colors = ['#a3e635', '#22d3ee', '#f59e0b', '#ec4899'];

      (function frame() {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    }, 15000));

    return () => timers.forEach(clearTimeout);
  }, []);

  const getGoalMessage = () => {
    const diff = userSummary.currentWeight - userSummary.targetWeight;
    if (userSummary.goal === 'lose_weight') {
      return `Para perder ${Math.abs(diff).toFixed(1)}kg de forma saludable`;
    } else if (userSummary.goal === 'gain_muscle') {
      return 'Para ganar músculo magro';
    }
    return 'Para mantener tu peso ideal';
  };

  const getActivityLabel = () => {
    const labels: Record<string, string> = {
      sedentary: 'Sedentario',
      light: 'Ligero',
      moderate: 'Moderado',
      active: 'Activo',
      very_active: 'Muy activo',
    };
    return labels[userSummary.activityLevel] || 'Moderado';
  };

  const getDietLabel = () => {
    const labels: Record<string, string> = {
      balanced: 'Equilibrada',
      low_carb: 'Baja en carbohidratos',
      high_protein: 'Alta en proteína',
      vegetarian: 'Vegetariana',
      vegan: 'Vegana',
      keto: 'Keto',
      mediterranean: 'Mediterránea',
    };
    return labels[userSummary.dietType] || 'Equilibrada';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background flex flex-col items-center justify-center p-6 overflow-hidden"
    >
      {/* PHASE 1: Calculating */}
      <AnimatePresence mode="wait">
        {phase === 'calculating' && (
          <motion.div
            key="calculating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex flex-col items-center text-center"
          >
            {/* Animated mascot */}
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="relative mb-8"
            >
              <img src={mascotHappy} alt="Mascot" className="w-32 h-32 object-contain" />
              
              {/* Thinking bubbles */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0.5, 1, 0.5],
                    y: [-20 - i * 15],
                    x: [20 + i * 10],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.3,
                    repeat: Infinity,
                  }}
                  className="absolute top-0 right-0 w-4 h-4 rounded-full bg-primary/50"
                />
              ))}
            </motion.div>

            <motion.h2
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-2xl font-bold text-foreground mb-4"
            >
              Calculando tu plan perfecto...
            </motion.h2>

            {/* Floating data icons */}
            <div className="flex gap-6 mt-4">
              {[Calculator, Target, Zap, Flame].map((Icon, i) => (
                <motion.div
                  key={i}
                  animate={{
                    y: [0, -15, 0],
                    rotate: [0, 10, -10, 0],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.2,
                    repeat: Infinity,
                  }}
                  className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center"
                >
                  <Icon className="w-6 h-6 text-primary" />
                </motion.div>
              ))}
            </div>

            {/* Processing bar */}
            <motion.div className="w-64 h-2 bg-muted/30 rounded-full mt-8 overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 3, ease: 'easeInOut' }}
                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
              />
            </motion.div>
          </motion.div>
        )}

        {/* PHASE 2: Calories Reveal */}
        {phase === 'calories' && (
          <motion.div
            key="calories"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex flex-col items-center text-center"
          >
            {/* Calorie icon with glow */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="relative mb-6"
            >
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full bg-orange-500/30 blur-2xl"
              />
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <Flame className="w-12 h-12 text-white" />
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-muted-foreground mb-2"
            >
              Tu objetivo diario de calorías
            </motion.p>

            {/* Big calorie number */}
            <div className="relative">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <AnimatedNumber
                  value={goals.calories}
                  duration={2000}
                  delay={500}
                  suffix=" kcal"
                  className="text-6xl font-black text-foreground"
                />
              </motion.div>
              
              {/* Sparkle effects */}
              <motion.div
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.5, 1.2, 0.5],
                }}
                transition={{ delay: 2, duration: 1 }}
                className="absolute -top-4 -right-4"
              >
                <Sparkles className="w-8 h-8 text-yellow-500" />
              </motion.div>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.5 }}
              className="text-primary font-medium mt-4"
            >
              {getGoalMessage()}
            </motion.p>
          </motion.div>
        )}

        {/* PHASE 3: Macros Reveal */}
        {phase === 'macros' && (
          <motion.div
            key="macros"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-md space-y-4"
          >
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold text-center text-foreground mb-6"
            >
              Tus macros diarios
            </motion.h2>

            <MacroRevealCard
              label="Proteína"
              value={goals.protein}
              unit="g"
              color="hsl(142, 76%, 36%)"
              icon={<Beef className="w-6 h-6" />}
              description="Para mantener y construir músculo"
              delay={0}
              maxValue={300}
            />

            <MacroRevealCard
              label="Carbohidratos"
              value={goals.carbs}
              unit="g"
              color="hsl(45, 93%, 47%)"
              icon={<Wheat className="w-6 h-6" />}
              description="Tu energía durante el día"
              delay={800}
              maxValue={400}
            />

            <MacroRevealCard
              label="Grasas"
              value={goals.fats}
              unit="g"
              color="hsl(199, 89%, 48%)"
              icon={<Droplets className="w-6 h-6" />}
              description="Nutrientes esenciales"
              delay={1600}
              maxValue={150}
            />
          </motion.div>
        )}

        {/* PHASE 4: Summary */}
        {phase === 'summary' && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-md"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-card/80 backdrop-blur-md border border-border rounded-3xl p-6 shadow-2xl"
            >
              {/* Header with avatar */}
              <div className="flex items-center gap-4 mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center"
                >
                  <span className="text-2xl font-bold text-primary-foreground">
                    {userSummary.name.charAt(0).toUpperCase()}
                  </span>
                </motion.div>
                <div>
                  <motion.h3
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl font-bold text-foreground"
                  >
                    {userSummary.name}
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-muted-foreground"
                  >
                    {userSummary.age} años
                  </motion.p>
                </div>
              </div>

              {/* Weight journey */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-muted/30 rounded-2xl p-4 mb-4"
              >
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Actual</p>
                    <p className="text-2xl font-bold text-foreground">{userSummary.currentWeight}kg</p>
                  </div>
                  
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="flex-1 px-4"
                  >
                    <div className="h-2 bg-muted/50 rounded-full relative overflow-hidden">
                      <motion.div
                        initial={{ width: '10%' }}
                        animate={{ width: '90%' }}
                        transition={{ delay: 0.5, duration: 1.5 }}
                        className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                      />
                    </div>
                    <p className="text-center text-xs text-muted-foreground mt-1">Tu viaje</p>
                  </motion.div>

                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Meta</p>
                    <p className="text-2xl font-bold text-primary">{userSummary.targetWeight}kg</p>
                  </div>
                </div>
              </motion.div>

              {/* Details */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-2 gap-3"
              >
                <div className="bg-muted/20 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground">Actividad</p>
                  <p className="font-semibold text-foreground">{getActivityLabel()}</p>
                </div>
                <div className="bg-muted/20 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground">Dieta</p>
                  <p className="font-semibold text-foreground">{getDietLabel()}</p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {/* PHASE 5: Celebration */}
        {phase === 'celebration' && (
          <motion.div
            key="celebration"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center"
          >
            {/* Celebrating mascot */}
            <motion.div
              animate={{
                y: [0, -20, 0],
                rotate: [0, 10, -10, 0],
              }}
              transition={{ duration: 1, repeat: Infinity }}
              className="relative mb-6"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full bg-primary/30 blur-3xl"
              />
              <img src={mascotHappy} alt="Celebration" className="relative w-40 h-40 object-contain" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-black text-foreground mb-2"
            >
              ¡Tu plan está listo!
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-muted-foreground text-lg mb-8"
            >
              Personalizado solo para ti
            </motion.p>

            {/* Quick summary pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-wrap justify-center gap-2 mb-8"
            >
              <span className="px-4 py-2 bg-orange-500/20 text-orange-400 rounded-full text-sm font-medium">
                {goals.calories} kcal
              </span>
              <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                {goals.protein}g proteína
              </span>
              <span className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium">
                {goals.carbs}g carbos
              </span>
              <span className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
                {goals.fats}g grasas
              </span>
            </motion.div>

            {/* CTA Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onComplete}
              className="w-full max-w-xs py-4 px-8 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-bold text-lg rounded-2xl shadow-lg shadow-primary/30"
            >
              <motion.span
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Comenzar mi viaje
              </motion.span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default NutritionRevealScreen;
