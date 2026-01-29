import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, X, Sparkles, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useHaptics } from '@/hooks/useHaptics';
import mascotMoney from '@/assets/mascot-money.png';

interface SubscriptionPromoBannerProps {
  visible: boolean;
  onDismiss: () => void;
}

export const SubscriptionPromoBanner: React.FC<SubscriptionPromoBannerProps> = ({
  visible,
  onDismiss,
}) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { lightImpact, mediumImpact } = useHaptics();

  const handleUpgrade = () => {
    mediumImpact();
    navigate('/subscription');
  };

  const handleDismiss = () => {
    lightImpact();
    onDismiss();
  };

  const texts = {
    es: {
      title: "Chefly Plus",
      subtitle: "Desbloquea todas las funciones",
      cta: "Ver más",
    },
    en: {
      title: "Chefly Plus",
      subtitle: "Unlock all features",
      cta: "Learn more",
    },
  };

  const t = texts[language];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="mx-4 mb-4"
        >
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-secondary p-4 shadow-[0_4px_0_hsl(var(--primary)/0.4),0_8px_20px_rgba(0,0,0,0.15)]">
            {/* Decorative sparkles */}
            <motion.div 
              className="absolute top-2 right-14"
              animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </motion.div>
            <motion.div 
              className="absolute bottom-2 left-8"
              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
            >
              <Star className="h-3 w-3 text-primary-foreground" />
            </motion.div>

            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4 text-primary-foreground" />
            </button>

            <div className="flex items-center gap-3">
              {/* Mascot */}
              <motion.div 
                className="flex-shrink-0"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <img 
                  src={mascotMoney}
                  alt="Chefly"
                  className="h-14 w-14 object-contain"
                />
              </motion.div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-primary-foreground" />
                  <h3 className="text-sm font-bold text-primary-foreground">
                    {t.title}
                  </h3>
                </div>
                <p className="text-xs text-primary-foreground/80 line-clamp-1">
                  {t.subtitle}
                </p>
              </div>

              {/* CTA Button */}
              <Button
                onClick={handleUpgrade}
                size="sm"
                className="flex-shrink-0 bg-white text-primary hover:bg-white/90 font-semibold shadow-md"
              >
                {t.cta}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
