import React from 'react';
import { Camera, Crown, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface ScannerPromoProps {
  scansRemaining: number;
  maxScans: number;
  isPremium: boolean;
  onScanClick: () => void;
}

export const ScannerPromo: React.FC<ScannerPromoProps> = ({
  scansRemaining,
  maxScans,
  isPremium,
  onScanClick,
}) => {
  const { language } = useLanguage();

  const texts = {
    es: {
      title: 'Escanea tu comida',
      subtitle: 'Toma una foto y registramos la nutrición automáticamente',
      buttonText: 'Escanear con IA',
      scansLeft: `${scansRemaining}/${maxScans} escaneos disponibles`,
      unlimited: 'Escaneos ilimitados',
      premiumBadge: 'Premium',
    },
    en: {
      title: 'Scan your food',
      subtitle: 'Take a photo and we\'ll log the nutrition automatically',
      buttonText: 'Scan with AI',
      scansLeft: `${scansRemaining}/${maxScans} scans available`,
      unlimited: 'Unlimited scans',
      premiumBadge: 'Premium',
    },
  };

  const t = texts[language] || texts.es;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 border border-primary/20 p-5"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10">
        <div className="flex items-start gap-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25"
          >
            <Camera className="w-7 h-7 text-primary-foreground" />
          </motion.div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-foreground">{t.title}</h3>
              {isPremium && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium">
                  <Crown className="w-3 h-3" />
                  {t.premiumBadge}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-4">{t.subtitle}</p>

            <Button
              onClick={onScanClick}
              className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold shadow-lg shadow-primary/25 gap-2"
              size="lg"
            >
              <Sparkles className="w-5 h-5" />
              {t.buttonText}
            </Button>

            <div className="mt-3 text-center">
              {isPremium ? (
                <span className="text-xs text-primary font-medium flex items-center justify-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {t.unlimited}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">
                  {t.scansLeft}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
