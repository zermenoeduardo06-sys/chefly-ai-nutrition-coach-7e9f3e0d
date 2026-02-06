import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Check, ChevronRight, Footprints, Flame, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppleHealth } from '@/hooks/useAppleHealth';
import { useLanguage } from '@/contexts/LanguageContext';
import { OnboardingMascotInteraction } from './OnboardingMascotInteraction';

interface OnboardingHealthStepProps {
  onNext: () => void;
  onSkip: () => void;
}

export const OnboardingHealthStep: React.FC<OnboardingHealthStepProps> = ({ onNext, onSkip }) => {
  const { language } = useLanguage();
  const { requestAuthorization, isLoading, isAuthorized } = useAppleHealth();
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    const success = await requestAuthorization();
    setConnecting(false);
    
    if (success) {
      setConnected(true);
      // Wait a moment to show success, then proceed
      setTimeout(() => {
        onNext();
      }, 1500);
    }
  };

  const benefits = [
    {
      icon: Footprints,
      text: language === 'es' ? 'Sincroniza tus pasos diarios' : 'Sync your daily steps',
      color: 'text-blue-500',
    },
    {
      icon: Flame,
      text: language === 'es' ? 'Ajusta calorías según tu actividad real' : 'Adjust calories based on real activity',
      color: 'text-orange-500',
    },
    {
      icon: Scale,
      text: language === 'es' ? 'Actualiza tu peso automáticamente' : 'Auto-update your weight',
      color: 'text-purple-500',
    },
  ];

  if (connected || isAuthorized) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-6"
        >
          <Check className="w-12 h-12 text-white" />
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-foreground text-center mb-2"
        >
          {language === 'es' ? '¡Conectado!' : 'Connected!'}
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground text-center mb-8"
        >
          {language === 'es' 
            ? 'Tus datos de Apple Health se sincronizarán automáticamente'
            : 'Your Apple Health data will sync automatically'}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={onNext}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white text-lg font-semibold px-12"
          >
            {language === 'es' ? 'Continuar' : 'Continue'}
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col px-6 py-8">
      <OnboardingMascotInteraction 
        message={language === 'es' 
          ? "¿Quieres conectar Apple Health? 🍎 Así tus metas serán más precisas basándose en tu actividad real."
          : "Want to connect Apple Health? 🍎 Your goals will be more accurate based on real activity."}
        pose="health"
        size="small"
        className="mb-6"
      />

      {/* Apple Health Icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center mx-auto mb-6 shadow-lg"
      >
        <Heart className="w-10 h-10 text-white" />
      </motion.div>

      {/* Benefits List */}
      <div className="space-y-4 mb-8">
        {benefits.map((benefit, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="flex items-center gap-3 bg-card rounded-xl p-4 border border-border"
          >
            <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center ${benefit.color}`}>
              <benefit.icon className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-foreground">{benefit.text}</span>
          </motion.div>
        ))}
      </div>

      {/* Privacy Note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-xs text-muted-foreground text-center mb-6"
      >
        {language === 'es' 
          ? '🔒 Tus datos nunca salen de tu dispositivo. Solo sincronizamos pasos, calorías y peso.'
          : '🔒 Your data never leaves your device. We only sync steps, calories, and weight.'}
      </motion.p>

      {/* Action Buttons */}
      <div className="space-y-3 mt-auto">
        <Button
          onClick={handleConnect}
          disabled={connecting || isLoading}
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 text-white text-lg font-semibold"
        >
          {connecting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              {language === 'es' ? 'Conectando...' : 'Connecting...'}
            </>
          ) : (
            <>
              <Heart className="w-5 h-5 mr-2" />
              {language === 'es' ? 'Conectar Apple Health' : 'Connect Apple Health'}
            </>
          )}
        </Button>

        <button
          onClick={onSkip}
          className="w-full py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {language === 'es' ? 'Más tarde' : 'Maybe later'}
          <ChevronRight className="w-4 h-4 inline ml-1" />
        </button>
      </div>
    </div>
  );
};
