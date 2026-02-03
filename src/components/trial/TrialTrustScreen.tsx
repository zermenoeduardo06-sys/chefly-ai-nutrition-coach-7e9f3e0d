import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useHaptics } from '@/hooks/useHaptics';
import { Shield, Bell, DollarSign, Lock, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import mascotHealth from '@/assets/mascot-health.png';

const guarantees = [
  { 
    icon: Shield, 
    titleEs: 'Cancela cuando quieras', 
    titleEn: 'Cancel anytime',
    descEs: 'Sin compromisos, sin preguntas',
    descEn: 'No commitments, no questions asked',
  },
  { 
    icon: Bell, 
    titleEs: 'Aviso 24h antes', 
    titleEn: '24h reminder',
    descEs: 'Te recordamos antes del cobro',
    descEn: "We'll remind you before charging",
  },
  { 
    icon: DollarSign, 
    titleEs: 'Sin cargos hoy', 
    titleEn: 'No charges today',
    descEs: 'No pagas nada por 3 días',
    descEn: "You pay nothing for 3 days",
  },
  { 
    icon: Lock, 
    titleEs: 'Pago 100% seguro', 
    titleEn: '100% secure payment',
    descEs: 'Protegido por Apple',
    descEn: 'Protected by Apple',
  },
];

export const TrialTrustScreen = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { lightImpact, successNotification } = useHaptics();

  const texts = {
    es: {
      title: 'Tranquilo, esto es seguro',
      subtitle: 'Tu tranquilidad es nuestra prioridad',
      price: '$0.00 hoy',
      cta: 'Activar mi prueba gratis',
    },
    en: {
      title: "Relax, this is safe",
      subtitle: 'Your peace of mind is our priority',
      price: '$0.00 today',
      cta: 'Activate my free trial',
    },
  };

  const t = texts[language];

  const handleContinue = () => {
    successNotification();
    navigate('/trial-activate', { replace: true });
  };

  return (
    <div 
      className="min-h-screen min-h-[100dvh] flex flex-col p-6 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--card)) 100%)',
        paddingTop: 'env(safe-area-inset-top, 24px)',
        paddingBottom: 'env(safe-area-inset-bottom, 24px)',
      }}
    >
      {/* Header */}
      <div className="flex-none pt-4 pb-6 text-center">
        <motion.img
          src={mascotHealth}
          alt="Chefly"
          className="w-20 h-20 object-contain mx-auto mb-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        />
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-foreground mb-2"
        >
          {t.title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground"
        >
          {t.subtitle}
        </motion.p>
      </div>

      {/* Guarantees */}
      <div className="flex-1 flex flex-col justify-center space-y-4 max-w-md mx-auto w-full">
        {guarantees.map((guarantee, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.15, type: 'spring', stiffness: 100 }}
            onAnimationComplete={() => lightImpact()}
            className="flex items-start gap-4 bg-card rounded-2xl p-4 border border-border shadow-sm"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.5 + i * 0.15 }}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0"
            >
              <guarantee.icon className="w-6 h-6 text-primary" />
            </motion.div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">
                {language === 'es' ? guarantee.titleEs : guarantee.titleEn}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === 'es' ? guarantee.descEs : guarantee.descEn}
              </p>
            </div>
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', delay: 0.7 + i * 0.15 }}
            >
              <Check className="w-5 h-5 text-green-500" />
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Bottom CTA section */}
      <div className="flex-none pt-6 pb-4">
        {/* Price badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
          className="text-center mb-4"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-green-500/20 text-green-600 font-bold text-lg">
            {t.price}
          </span>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <Button
            onClick={handleContinue}
            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-primary to-secondary hover:opacity-90"
          >
            {t.cta}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>

        {/* Security badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="flex items-center justify-center gap-4 mt-4"
        >
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Lock className="w-3 h-3" />
            <span>SSL Secured</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Shield className="w-3 h-3" />
            <span>Apple Pay</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TrialTrustScreen;
