import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useHaptics } from '@/hooks/useHaptics';

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
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-secondary p-4 shadow-lg">
            {/* Decorative sparkles */}
            <div className="absolute top-2 right-12 opacity-60">
              <Sparkles className="h-4 w-4 text-primary-foreground animate-pulse" />
            </div>
            <div className="absolute bottom-2 left-8 opacity-40">
              <Sparkles className="h-3 w-3 text-primary-foreground animate-pulse delay-300" />
            </div>

            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4 text-primary-foreground" />
            </button>

            <div className="flex items-center gap-3">
              {/* Crown icon */}
              <div className="flex-shrink-0 p-2.5 rounded-xl bg-primary-foreground/20 backdrop-blur-sm">
                <Crown className="h-6 w-6 text-primary-foreground" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-primary-foreground">
                  Chefly Plus
                </h3>
                <p className="text-xs text-primary-foreground/80 line-clamp-1">
                  {language === 'es'
                    ? 'Desbloquea todas las funciones premium'
                    : 'Unlock all premium features'}
                </p>
              </div>

              {/* CTA Button */}
              <Button
                onClick={handleUpgrade}
                size="sm"
                variant="secondary"
                className="flex-shrink-0 bg-white text-primary hover:bg-white/90 font-semibold shadow-md"
              >
                {language === 'es' ? 'Ver más' : 'Learn more'}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
