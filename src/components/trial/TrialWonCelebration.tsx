import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useHaptics } from '@/hooks/useHaptics';
import { Check, Sparkles, Zap, MessageSquare, Camera, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';
import mascotCelebrating from '@/assets/mascot-celebrating.png';

const benefits = [
  { icon: Sparkles, labelEs: 'Planes ilimitados', labelEn: 'Unlimited plans' },
  { icon: Camera, labelEs: 'Escaneo IA de comida', labelEn: 'AI food scanning' },
  { icon: MessageSquare, labelEs: 'Chef IA personal', labelEn: 'Personal AI Chef' },
  { icon: CreditCard, labelEs: 'Sin cargos hoy', labelEn: 'No charges today' },
];

export const TrialWonCelebration = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { successNotification, celebrationPattern } = useHaptics();

  const texts = {
    es: {
      won: '¡Ganaste',
      days: 'días gratis',
      subtitle: 'de Chefly Plus!',
      cta: 'Reclamar mi premio',
    },
    en: {
      won: 'You won',
      days: 'free days',
      subtitle: 'of Chefly Plus!',
      cta: 'Claim my prize',
    },
  };

  const t = texts[language];

  useEffect(() => {
    // Initial celebration
    successNotification();
    celebrationPattern();

    // Continuous confetti for 3 seconds
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#a3e635', '#22d3ee', '#facc15'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#a3e635', '#22d3ee', '#facc15'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, [successNotification, celebrationPattern]);

  const handleContinue = () => {
    navigate('/trial-trust', { replace: true });
  };

  return (
    <div 
      className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-center p-6 overflow-hidden relative"
      style={{
        background: 'radial-gradient(circle at 50% 30%, hsl(var(--primary) / 0.2) 0%, hsl(var(--background)) 60%)',
        paddingTop: 'env(safe-area-inset-top, 24px)',
        paddingBottom: 'env(safe-area-inset-bottom, 24px)',
      }}
    >
      {/* Animated background glow */}
      <motion.div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary/20 blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      {/* Stars/sparkles floating */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl"
          initial={{ 
            x: Math.random() * 300 - 150 + 'px', 
            y: Math.random() * 600 - 300 + 'px',
            opacity: 0,
          }}
          animate={{ 
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5],
            rotate: [0, 180],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        >
          ✨
        </motion.div>
      ))}

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Mascot */}
        <motion.img
          src={mascotCelebrating}
          alt="Chefly celebrating"
          className="w-28 h-28 object-contain mb-4"
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        />

        {/* Big number 3 */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, delay: 0.3 }}
          className="relative"
        >
          <span className="text-9xl font-black bg-gradient-to-br from-primary via-secondary to-primary bg-clip-text text-transparent">
            3
          </span>
          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 text-9xl font-black text-primary/30 blur-xl -z-10"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            3
          </motion.div>
        </motion.div>

        {/* Days text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl font-bold text-foreground">{t.days.toUpperCase()}</h2>
          <p className="text-lg text-muted-foreground">{t.subtitle}</p>
        </motion.div>

        {/* Benefits list */}
        <div className="w-full max-w-xs space-y-3 mb-10">
          {benefits.map((benefit, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + i * 0.15 }}
              className="flex items-center gap-3 bg-card/80 backdrop-blur-sm rounded-xl p-3 border border-border"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.9 + i * 0.15 }}
                className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center"
              >
                <benefit.icon className="w-5 h-5 text-primary" />
              </motion.div>
              <span className="font-medium text-foreground">
                {language === 'es' ? benefit.labelEs : benefit.labelEn}
              </span>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 1.1 + i * 0.15 }}
                className="ml-auto"
              >
                <Check className="w-5 h-5 text-green-500" />
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="w-full max-w-xs"
        >
          <Button
            onClick={handleContinue}
            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-primary to-secondary hover:opacity-90"
          >
            <Zap className="w-5 h-5 mr-2" />
            {t.cta}
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default TrialWonCelebration;
