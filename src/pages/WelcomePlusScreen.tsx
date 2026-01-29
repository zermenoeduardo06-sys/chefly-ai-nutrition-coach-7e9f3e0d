import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown, Check, Sparkles, Rocket, Camera, MessageCircle, RefreshCw, Calendar } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useHaptics } from "@/hooks/useHaptics";
import confetti from "canvas-confetti";
import mascotCelebrating from "@/assets/mascot-celebrating.png";

interface Benefit {
  icon: LucideIcon;
  text: string;
}

export default function WelcomePlusScreen() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { celebrationPattern } = useHaptics();

  useEffect(() => {
    // Trigger haptic celebration
    celebrationPattern();

    // Epic confetti explosion
    const fireConfetti = () => {
      // Initial burst from center
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#A3E635', '#22D3EE', '#FBBF24', '#F472B6'],
      });

      // Left side burst
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors: ['#A3E635', '#22D3EE', '#FBBF24'],
        });
      }, 200);

      // Right side burst
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors: ['#A3E635', '#22D3EE', '#F472B6'],
        });
      }, 400);

      // Continuous rain for 3 seconds
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0 },
          colors: ['#A3E635', '#22D3EE'],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0 },
          colors: ['#FBBF24', '#F472B6'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      setTimeout(frame, 600);
    };

    fireConfetti();
  }, [celebrationPattern]);

  const texts: Record<'es' | 'en', { title: string; titleHighlight: string; subtitle: string; benefits: Benefit[]; cta: string }> = {
    es: {
      title: '¡Bienvenido a',
      titleHighlight: 'Chefly Plus!',
      subtitle: 'Ahora tienes acceso a todo lo que necesitas',
      benefits: [
        { icon: Calendar, text: 'Planes semanales ilimitados' },
        { icon: Camera, text: 'Escaneo de comidas con IA' },
        { icon: MessageCircle, text: 'Chat ilimitado con Chef IA' },
        { icon: RefreshCw, text: 'Intercambio de comidas' },
        { icon: Sparkles, text: '$2 USD/mes en créditos de IA' },
      ],
      cta: '¡Empezar a disfrutar!',
    },
    en: {
      title: 'Welcome to',
      titleHighlight: 'Chefly Plus!',
      subtitle: 'You now have access to everything you need',
      benefits: [
        { icon: Calendar, text: 'Unlimited weekly plans' },
        { icon: Camera, text: 'AI food scanning' },
        { icon: MessageCircle, text: 'Unlimited Chef AI chat' },
        { icon: RefreshCw, text: 'Meal swapping' },
        { icon: Sparkles, text: '$2 USD/month in AI credits' },
      ],
      cta: 'Start enjoying!',
    },
  };

  const t = texts[language];

  const handleContinue = () => {
    navigate('/dashboard');
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 flex flex-col relative overflow-hidden"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      {/* Floating sparkles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl"
            style={{
              top: `${15 + i * 12}%`,
              left: i % 2 === 0 ? `${5 + i * 3}%` : undefined,
              right: i % 2 === 1 ? `${5 + i * 3}%` : undefined,
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: [0.3, 0.7, 0.3], 
              y: [0, -15, 0],
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          >
            ✨
          </motion.div>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 relative z-10">
        {/* Crown with glow */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className="relative mb-4"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="p-4 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_0_40px_rgba(251,191,36,0.5)]"
          >
            <Crown className="h-10 w-10 text-white" />
          </motion.div>
        </motion.div>

        {/* Mascot */}
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 150, delay: 0.3 }}
          className="relative mb-6"
        >
          <motion.img
            src={mascotCelebrating}
            alt="Chefly celebrating"
            className="h-36 w-36 object-contain"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mb-2"
        >
          <h1 className="text-2xl font-bold text-foreground">
            {t.title}{' '}
            <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-[shimmer_3s_linear_infinite]">
              {t.titleHighlight}
            </span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-muted-foreground text-center mb-8"
        >
          {t.subtitle}
        </motion.p>

        {/* Benefits list */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="w-full max-w-sm space-y-3 mb-8"
        >
          {t.benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + index * 0.12 }}
              className="flex items-center gap-4 p-3 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm"
            >
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                <benefit.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-foreground font-medium">{benefit.text}</span>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.3 + index * 0.1, type: "spring" }}
                className="ml-auto"
              >
                <Check className="h-5 w-5 text-primary" />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Bottom CTA */}
      <div className="px-6 pb-8 safe-area-pb">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
        >
          <Button
            onClick={handleContinue}
            size="lg"
            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground shadow-lg shadow-primary/30"
          >
            <Rocket className="mr-2 h-5 w-5" />
            {t.cta}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
