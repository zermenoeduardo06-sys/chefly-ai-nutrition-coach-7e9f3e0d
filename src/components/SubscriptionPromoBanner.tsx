import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, X, Sparkles, Zap } from 'lucide-react';
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
              className="absolute top-3 right-14 opacity-70"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </motion.div>
            <motion.div 
              className="absolute bottom-3 left-10 opacity-50"
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
            >
              <Sparkles className="h-3 w-3 text-primary-foreground" />
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
                <h3 className="text-sm font-bold text-primary-foreground flex items-center gap-1.5">
                  <Crown className="h-4 w-4" />
                  Chefly Plus
                </h3>
                <p className="text-xs text-primary-foreground/80 line-clamp-1">
                  {language === 'es'
                    ? 'Desbloquea todas las funciones'
                    : 'Unlock all features'}
                </p>
              </div>

              {/* CTA Button */}
              <Button
                onClick={handleUpgrade}
                size="sm"
                variant="secondary"
                className="flex-shrink-0 bg-white text-primary hover:bg-white/90 font-bold shadow-md gap-1.5"
              >
                <Zap className="h-3.5 w-3.5" />
                {language === 'es' ? 'Mejorar' : 'Upgrade'}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
