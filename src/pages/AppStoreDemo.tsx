import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChefHat, Sparkles, Brain, Calendar, ShoppingCart, 
  TrendingUp, Heart, Zap, Star, CheckCircle2, 
  Flame, Trophy, Target, ArrowRight
} from 'lucide-react';
import cheflyLogo from '@/assets/chefly-logo.png';
import mascotLime from '@/assets/mascot-lime.png';

// App Store Preview dimensions:
// iPhone 6.7" (Pro Max): 1290 x 2796 pixels
// iPhone 6.5": 1242 x 2688 pixels  
// iPhone 5.5": 1080 x 1920 pixels
// Aspect ratio: ~9:19.5 (approximately 1:2.17)

const SCENE_DURATION = 4000; // 4 seconds per scene
const TOTAL_SCENES = 6;

const demoMeals = [
  { name: "Oatmeal with Fresh Fruits", calories: 320, type: "Breakfast", emoji: "🥣" },
  { name: "Quinoa Power Bowl", calories: 450, type: "Lunch", emoji: "🥗" },
  { name: "Teriyaki Salmon", calories: 520, type: "Dinner", emoji: "🍣" },
];

const features = [
  { icon: Brain, label: "AI Personalized", color: "from-primary to-primary/70" },
  { icon: Calendar, label: "Weekly Plans", color: "from-accent to-accent/70" },
  { icon: ShoppingCart, label: "Shopping List", color: "from-emerald-500 to-green-500" },
  { icon: TrendingUp, label: "Progress Tracking", color: "from-orange-500 to-amber-500" },
];

export default function AppStoreDemo() {
  const [currentScene, setCurrentScene] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentScene((prev) => (prev + 1) % TOTAL_SCENES);
    }, SCENE_DURATION);

    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="relative overflow-hidden bg-gradient-to-br from-background via-primary/10 to-background"
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
            className="absolute w-2 h-2 rounded-full bg-primary/20"
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
          <div key={i} className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
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
                  className="absolute inset-0 bg-gradient-to-r from-primary/50 to-accent/50 rounded-full blur-3xl"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <img src={cheflyLogo} alt="Chefly" className="w-32 h-32 relative z-10" />
              </div>
            </motion.div>
            
            <motion.h1
              className="text-5xl font-bold text-foreground mt-8 tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Chefly AI
            </motion.h1>
            
            <motion.p
              className="text-xl text-muted-foreground mt-4 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              Your AI Nutrition Coach
            </motion.p>

            <motion.div
              className="flex items-center gap-2 mt-8 px-6 py-3 bg-card/50 backdrop-blur-sm rounded-full border border-border"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 }}
            >
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-foreground font-medium">Powered by AI</span>
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
              className="text-3xl font-bold text-foreground mb-8 text-center"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Everything You Need
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
                  <feature.icon className="w-10 h-10 text-primary-foreground mb-3" />
                  <p className="text-primary-foreground font-semibold text-sm">{feature.label}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="mt-8 flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Heart className="w-5 h-5 text-destructive" />
              <span className="text-muted-foreground">+10,000 happy users</span>
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
              <h2 className="text-2xl font-bold text-foreground">Today's Plan</h2>
              <p className="text-muted-foreground mt-1">Personalized for you</p>
            </motion.div>

            <div className="space-y-4">
              {demoMeals.map((meal, i) => (
                <motion.div
                  key={meal.name}
                  className="bg-card/80 backdrop-blur-md rounded-2xl p-4 border border-border"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.2, type: "spring" }}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{meal.emoji}</div>
                    <div className="flex-1">
                      <p className="text-foreground font-semibold">{meal.name}</p>
                      <p className="text-muted-foreground text-sm">{meal.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-foreground font-bold">{meal.calories}</p>
                      <p className="text-muted-foreground text-xs">kcal</p>
                    </div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.2 + 0.5 }}
                    >
                      <CheckCircle2 className="w-6 h-6 text-primary" />
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Nutrition summary */}
            <motion.div
              className="mt-6 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl p-5 border border-border"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-muted-foreground text-sm">Total Calories</p>
                  <p className="text-3xl font-bold text-foreground">1,290</p>
                </div>
                <div className="flex gap-4">
                  <div className="text-center">
                    <p className="text-primary font-bold">85g</p>
                    <p className="text-muted-foreground text-xs">Protein</p>
                  </div>
                  <div className="text-center">
                    <p className="text-accent font-bold">120g</p>
                    <p className="text-muted-foreground text-xs">Carbs</p>
                  </div>
                  <div className="text-center">
                    <p className="text-yellow-500 font-bold">45g</p>
                    <p className="text-muted-foreground text-xs">Fats</p>
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
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Chef AI</h2>
                <p className="text-primary text-sm flex items-center gap-1">
                  <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  Online
                </p>
              </div>
            </motion.div>

            <div className="space-y-4 flex-1">
              <motion.div
                className="bg-card/80 backdrop-blur-md rounded-2xl rounded-tl-sm p-4 max-w-[80%] border border-border"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-foreground">Hi! I'm your personal AI chef. What would you like to eat today? 🍽️</p>
              </motion.div>

              <motion.div
                className="bg-primary/80 backdrop-blur-md rounded-2xl rounded-tr-sm p-4 max-w-[80%] ml-auto"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
              >
                <p className="text-primary-foreground">Something high in protein and low in carbs</p>
              </motion.div>

              <motion.div
                className="bg-card/80 backdrop-blur-md rounded-2xl rounded-tl-sm p-4 max-w-[80%] border border-border"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.3 }}
              >
                <p className="text-foreground">Perfect! I recommend a Teriyaki Chicken Bowl with roasted vegetables. It has 42g of protein and only 15g of carbs. Want me to prepare the recipe? 🥗</p>
              </motion.div>

              <motion.div
                className="flex gap-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.8 }}
              >
                <div className="px-4 py-2 bg-primary rounded-full">
                  <span className="text-primary-foreground text-sm font-medium">Yes, please!</span>
                </div>
                <div className="px-4 py-2 bg-card rounded-full border border-border">
                  <span className="text-foreground text-sm">See options</span>
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
                className="absolute -top-2 -right-2 bg-card rounded-full px-3 py-1 shadow-lg border border-border"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <span className="text-orange-500 font-bold">🔥 15</span>
              </motion.div>
            </motion.div>

            <motion.h2
              className="text-3xl font-bold text-foreground text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              15 Day Streak!
            </motion.h2>
            <motion.p
              className="text-muted-foreground text-center mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Keep going to unlock achievements
            </motion.p>

            <motion.div
              className="flex gap-4 mt-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              {[
                { icon: Trophy, label: "12 Badges", color: "bg-yellow-500/20 text-yellow-500" },
                { icon: Target, label: "Level 8", color: "bg-primary/20 text-primary" },
                { icon: Star, label: "2,450 pts", color: "bg-accent/20 text-accent" },
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
              className="mt-8 flex items-center gap-2 text-primary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              <Zap className="w-5 h-5" />
              <span className="font-medium">+50 points today</span>
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
              src={mascotLime}
              alt="Chefly Mascot"
              className="w-48 h-48 object-contain"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring" }}
            />

            <motion.h2
              className="text-3xl font-bold text-foreground text-center mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Start Free Today!
            </motion.h2>

            <motion.p
              className="text-muted-foreground text-center mt-3 text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Transform your nutrition with AI power
            </motion.p>

            <motion.button
              className="mt-8 px-8 py-4 bg-gradient-to-r from-primary to-accent rounded-full flex items-center gap-3 shadow-lg shadow-primary/30"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, type: "spring" }}
            >
              <span className="text-primary-foreground font-bold text-lg">Download Now</span>
              <ArrowRight className="w-5 h-5 text-primary-foreground" />
            </motion.button>

            <motion.div
              className="flex items-center gap-4 mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <div className="flex -space-x-2">
                {['😊', '🥳', '💪', '🌟'].map((emoji, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-card flex items-center justify-center text-sm border-2 border-background">
                    {emoji}
                  </div>
                ))}
              </div>
              <span className="text-muted-foreground text-sm">+10,000 downloads</span>
            </motion.div>

            <motion.div
              className="flex items-center gap-1 mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              ))}
              <span className="text-muted-foreground text-sm ml-2">4.9 on App Store</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
