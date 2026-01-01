import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChefHat, Sparkles, Brain, Calendar, ShoppingCart, 
  TrendingUp, Heart, Zap, Star, CheckCircle2, 
  Flame, Trophy, Target, ArrowRight
} from 'lucide-react';
import cheflyLogo from '@/assets/chefly-logo.png';
import mascotCooking from '@/assets/mascot-cooking.png';

// App Store Preview dimensions:
// iPhone 6.7" (Pro Max): 1290 x 2796 pixels
// iPhone 6.5": 1242 x 2688 pixels  
// iPhone 5.5": 1080 x 1920 pixels
// Aspect ratio: ~9:19.5 (approximately 1:2.17)

const SCENE_DURATION = 4000; // 4 seconds per scene
const TOTAL_SCENES = 6;

const demoMeals = [
  { name: "Avena con Frutas", calories: 320, type: "Desayuno", emoji: "🥣" },
  { name: "Bowl de Quinoa", calories: 450, type: "Almuerzo", emoji: "🥗" },
  { name: "Salmón Teriyaki", calories: 520, type: "Cena", emoji: "🍣" },
];

const features = [
  { icon: Brain, label: "IA Personalizada", color: "from-violet-500 to-purple-600" },
  { icon: Calendar, label: "Planes Semanales", color: "from-blue-500 to-cyan-500" },
  { icon: ShoppingCart, label: "Lista de Compras", color: "from-emerald-500 to-green-500" },
  { icon: TrendingUp, label: "Seguimiento", color: "from-orange-500 to-amber-500" },
];

export default function AppStoreDemo() {
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentScene((prev) => (prev + 1) % TOTAL_SCENES);
    }, SCENE_DURATION);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const restartDemo = () => {
    setCurrentScene(0);
    setIsPlaying(true);
  };

  return (
    <div 
      className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900"
      style={{ 
        width: '100vw', 
        height: '100vh',
        maxWidth: '430px', // iPhone Pro Max width in CSS pixels
        margin: '0 auto',
      }}
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-white/10"
            initial={{ 
              x: Math.random() * 430, 
              y: -20,
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{ 
              y: '100vh',
              rotate: 360,
            }}
            transition={{ 
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 z-50 flex gap-1 p-4 pt-safe-top">
        {[...Array(TOTAL_SCENES)].map((_, i) => (
          <div key={i} className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white rounded-full"
              initial={{ width: "0%" }}
              animate={{ 
                width: currentScene === i ? "100%" : currentScene > i ? "100%" : "0%" 
              }}
              transition={{ 
                duration: currentScene === i ? SCENE_DURATION / 1000 : 0.3,
                ease: "linear",
              }}
            />
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Scene 1: Splash/Logo */}
        {currentScene === 0 && (
          <motion.div
            key="splash"
            className="absolute inset-0 flex flex-col items-center justify-center px-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", duration: 1, delay: 0.2 }}
            >
              <div className="relative">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary/50 to-purple-500/50 rounded-full blur-3xl"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <img src={cheflyLogo} alt="Chefly" className="w-32 h-32 relative z-10" />
              </div>
            </motion.div>
            
            <motion.h1
              className="text-5xl font-bold text-white mt-8 tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Chefly AI
            </motion.h1>
            
            <motion.p
              className="text-xl text-white/70 mt-4 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              Tu Coach de Nutrición con IA
            </motion.p>

            <motion.div
              className="flex items-center gap-2 mt-8 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 }}
            >
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-medium">Powered by AI</span>
            </motion.div>
          </motion.div>
        )}

        {/* Scene 2: Features Grid */}
        {currentScene === 1 && (
          <motion.div
            key="features"
            className="absolute inset-0 flex flex-col items-center justify-center px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h2
              className="text-3xl font-bold text-white mb-8 text-center"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Todo lo que necesitas
            </motion.h2>

            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.label}
                  className={`bg-gradient-to-br ${feature.color} p-5 rounded-2xl shadow-lg`}
                  initial={{ opacity: 0, scale: 0.5, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: i * 0.15, type: "spring" }}
                >
                  <feature.icon className="w-10 h-10 text-white mb-3" />
                  <p className="text-white font-semibold text-sm">{feature.label}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="mt-8 flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Heart className="w-5 h-5 text-red-400" />
              <span className="text-white/70">+10,000 usuarios felices</span>
            </motion.div>
          </motion.div>
        )}

        {/* Scene 3: Meal Plan Preview */}
        {currentScene === 2 && (
          <motion.div
            key="meals"
            className="absolute inset-0 flex flex-col px-6 pt-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="text-center mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-2xl font-bold text-white">Tu Plan de Hoy</h2>
              <p className="text-white/60 mt-1">Personalizado para ti</p>
            </motion.div>

            <div className="space-y-4">
              {demoMeals.map((meal, i) => (
                <motion.div
                  key={meal.name}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.2, type: "spring" }}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{meal.emoji}</div>
                    <div className="flex-1">
                      <p className="text-white font-semibold">{meal.name}</p>
                      <p className="text-white/60 text-sm">{meal.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">{meal.calories}</p>
                      <p className="text-white/60 text-xs">kcal</p>
                    </div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.2 + 0.5 }}
                    >
                      <CheckCircle2 className="w-6 h-6 text-green-400" />
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Nutrition summary */}
            <motion.div
              className="mt-6 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-2xl p-5 border border-white/10"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white/60 text-sm">Calorías totales</p>
                  <p className="text-3xl font-bold text-white">1,290</p>
                </div>
                <div className="flex gap-4">
                  <div className="text-center">
                    <p className="text-primary font-bold">85g</p>
                    <p className="text-white/60 text-xs">Proteína</p>
                  </div>
                  <div className="text-center">
                    <p className="text-blue-400 font-bold">120g</p>
                    <p className="text-white/60 text-xs">Carbos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-yellow-400 font-bold">45g</p>
                    <p className="text-white/60 text-xs">Grasas</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Scene 4: AI Chat Preview */}
        {currentScene === 3 && (
          <motion.div
            key="chat"
            className="absolute inset-0 flex flex-col px-6 pt-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="flex items-center gap-3 mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Chef AI</h2>
                <p className="text-green-400 text-sm flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  En línea
                </p>
              </div>
            </motion.div>

            <div className="space-y-4 flex-1">
              <motion.div
                className="bg-white/10 backdrop-blur-md rounded-2xl rounded-tl-sm p-4 max-w-[80%]"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-white">¡Hola! Soy tu chef personal con IA. ¿Qué te gustaría comer hoy? 🍽️</p>
              </motion.div>

              <motion.div
                className="bg-primary/80 backdrop-blur-md rounded-2xl rounded-tr-sm p-4 max-w-[80%] ml-auto"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
              >
                <p className="text-white">Algo alto en proteína y bajo en carbohidratos</p>
              </motion.div>

              <motion.div
                className="bg-white/10 backdrop-blur-md rounded-2xl rounded-tl-sm p-4 max-w-[80%]"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.3 }}
              >
                <p className="text-white">¡Perfecto! Te recomiendo un Bowl de Pollo Teriyaki con verduras asadas. Tiene 42g de proteína y solo 15g de carbos. ¿Te preparo la receta? 🥗</p>
              </motion.div>

              <motion.div
                className="flex gap-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.8 }}
              >
                <div className="px-4 py-2 bg-primary rounded-full">
                  <span className="text-white text-sm font-medium">¡Sí, por favor!</span>
                </div>
                <div className="px-4 py-2 bg-white/10 rounded-full border border-white/20">
                  <span className="text-white text-sm">Ver opciones</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Scene 5: Gamification/Streaks */}
        {currentScene === 4 && (
          <motion.div
            key="gamification"
            className="absolute inset-0 flex flex-col items-center justify-center px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="relative mb-8"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
            >
              <motion.div
                className="absolute inset-0 bg-orange-500/30 rounded-full blur-3xl"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div className="relative bg-gradient-to-br from-orange-500 to-red-500 w-32 h-32 rounded-full flex items-center justify-center">
                <Flame className="w-16 h-16 text-white" />
              </div>
              <motion.div
                className="absolute -top-2 -right-2 bg-white rounded-full px-3 py-1 shadow-lg"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <span className="text-orange-500 font-bold">🔥 15</span>
              </motion.div>
            </motion.div>

            <motion.h2
              className="text-3xl font-bold text-white text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              ¡Racha de 15 días!
            </motion.h2>
            <motion.p
              className="text-white/60 text-center mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Sigue así para desbloquear logros
            </motion.p>

            <motion.div
              className="flex gap-4 mt-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              {[
                { icon: Trophy, label: "12 Logros", color: "bg-yellow-500/20 text-yellow-400" },
                { icon: Target, label: "Nivel 8", color: "bg-purple-500/20 text-purple-400" },
                { icon: Star, label: "2,450 pts", color: "bg-blue-500/20 text-blue-400" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className={`${stat.color} px-4 py-3 rounded-xl flex flex-col items-center`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                >
                  <stat.icon className="w-6 h-6 mb-1" />
                  <span className="text-xs font-medium">{stat.label}</span>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="mt-8 flex items-center gap-2 text-green-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              <Zap className="w-5 h-5" />
              <span className="font-medium">+50 puntos hoy</span>
            </motion.div>
          </motion.div>
        )}

        {/* Scene 6: CTA / Download */}
        {currentScene === 5 && (
          <motion.div
            key="cta"
            className="absolute inset-0 flex flex-col items-center justify-center px-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.img
              src={mascotCooking}
              alt="Chefly Mascot"
              className="w-48 h-48 object-contain"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring" }}
            />

            <motion.h2
              className="text-3xl font-bold text-white text-center mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              ¡Empieza Gratis Hoy!
            </motion.h2>

            <motion.p
              className="text-white/70 text-center mt-3 text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Transforma tu alimentación con el poder de la IA
            </motion.p>

            <motion.button
              className="mt-8 px-8 py-4 bg-gradient-to-r from-primary to-purple-500 rounded-full flex items-center gap-3 shadow-lg shadow-primary/30"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, type: "spring" }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-white font-bold text-lg">Descargar Ahora</span>
              <ArrowRight className="w-5 h-5 text-white" />
            </motion.button>

            <motion.div
              className="flex items-center gap-4 mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <div className="flex -space-x-2">
                {['😊', '🥳', '💪', '🌟'].map((emoji, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm border-2 border-slate-900">
                    {emoji}
                  </div>
                ))}
              </div>
              <span className="text-white/60 text-sm">+10,000 descargas</span>
            </motion.div>

            <motion.div
              className="flex items-center gap-1 mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              ))}
              <span className="text-white/60 text-sm ml-2">4.9 en App Store</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control buttons (hidden during recording) */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 pb-safe-area-bottom">
        <motion.button
          onClick={() => setIsPlaying(!isPlaying)}
          className="px-6 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm border border-white/20"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isPlaying ? "Pausar" : "Reproducir"}
        </motion.button>
        <motion.button
          onClick={restartDemo}
          className="px-6 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm border border-white/20"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Reiniciar
        </motion.button>
      </div>

      {/* Recording guide overlay - can be toggled */}
      <div className="absolute top-20 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-2 text-xs text-white/60">
        {Math.ceil((currentScene + 1) * SCENE_DURATION / 1000)}s / {Math.ceil(TOTAL_SCENES * SCENE_DURATION / 1000)}s
      </div>
    </div>
  );
}
