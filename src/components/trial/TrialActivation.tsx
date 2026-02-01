import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useInAppPurchases, APPLE_IAP_PRODUCTS } from '@/hooks/useInAppPurchases';
import { useHaptics } from '@/hooks/useHaptics';
import { useAppReview } from '@/hooks/useAppReview';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Check, Crown, Loader2, Sparkles, Shield, Clock } from 'lucide-react';
import mascotLime from '@/assets/mascot-lime.png';

const trialBenefits = [
  { labelEs: 'Planes semanales ilimitados', labelEn: 'Unlimited weekly plans' },
  { labelEs: 'Escaneo IA de comida', labelEn: 'AI food scanning' },
  { labelEs: 'Chat con Chef IA', labelEn: 'Chat with AI Chef' },
  { labelEs: '$2 USD/mes en créditos IA', labelEn: '$2 USD/month in AI credits' },
];

export const TrialActivation = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const { requestReviewAfterDelay } = useAppReview();
  const { celebrationPattern } = useHaptics();

  const {
    isPurchasing,
    isLoading,
    isAvailable,
    error,
    purchaseProduct,
    clearError,
  } = useInAppPurchases(user?.id);

  const texts = {
    es: {
      title: 'Activa tu prueba',
      free: 'GRATIS',
      forDays: 'por 3 días',
      then: 'Después',
      perMonth: '/mes',
      cta: 'Empezar prueba gratis',
      skip: 'Continuar sin prueba',
      legal: 'El pago se cargará a tu cuenta de Apple después del periodo de prueba. La suscripción se renueva automáticamente a menos que se cancele 24 horas antes.',
      processing: 'Procesando...',
      loading: 'Cargando...',
    },
    en: {
      title: 'Activate your trial',
      free: 'FREE',
      forDays: 'for 3 days',
      then: 'Then',
      perMonth: '/month',
      cta: 'Start free trial',
      skip: 'Continue without trial',
      legal: 'Payment will be charged to your Apple account after the trial period. Subscription auto-renews unless cancelled 24 hours before.',
      processing: 'Processing...',
      loading: 'Loading...',
    },
  };

  const t = texts[language];

  const handleActivateTrial = async () => {
    clearError();
    
    const success = await purchaseProduct(APPLE_IAP_PRODUCTS.CHEFLY_PLUS_MONTHLY);
    
    if (success) {
      celebrationPattern();
      requestReviewAfterDelay(4000);
      navigate('/welcome-plus', { replace: true });
    } else if (error) {
      toast({
        variant: 'destructive',
        title: language === 'es' ? 'Error' : 'Error',
        description: error,
      });
    }
  };

  const handleSkip = () => {
    // Mark that user saw trial flow
    localStorage.setItem('trial_flow_completed', 'true');
    navigate('/dashboard', { replace: true });
  };

  return (
    <div 
      className="min-h-[100dvh] flex flex-col p-6 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--card)) 50%, hsl(var(--background)) 100%)',
        paddingTop: 'env(safe-area-inset-top, 24px)',
        paddingBottom: 'env(safe-area-inset-bottom, 24px)',
      }}
    >
      {/* Header with mascot */}
      <div className="flex-none pt-4 text-center">
        <motion.img
          src={mascotLime}
          alt="Chefly"
          className="w-20 h-20 object-contain mx-auto mb-4"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-foreground"
        >
          {t.title}
        </motion.h1>
      </div>

      {/* Main pricing card */}
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full py-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card rounded-2xl border-2 border-primary p-6 shadow-xl relative overflow-hidden"
        >
          {/* Premium badge */}
          <div className="absolute top-0 right-0 bg-gradient-to-r from-primary to-secondary text-primary-foreground px-4 py-1 rounded-bl-xl text-sm font-bold">
            <Crown className="w-4 h-4 inline mr-1" />
            Plus
          </div>

          {/* Pricing display */}
          <div className="text-center mb-6 pt-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <motion.span
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-4xl font-black text-primary"
              >
                {t.free}
              </motion.span>
              <span className="text-xl text-muted-foreground">{t.forDays}</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <span>{t.then}</span>
              <span className="text-lg font-semibold text-foreground">$7.99</span>
              <span>{t.perMonth}</span>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-3 mb-6">
            {trialBenefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                <span className="text-foreground">
                  {language === 'es' ? benefit.labelEs : benefit.labelEn}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground border-t border-border pt-4">
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              <span>{language === 'es' ? 'Cancela gratis' : 'Cancel free'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{language === 'es' ? 'Aviso 24h' : '24h reminder'}</span>
            </div>
          </div>
        </motion.div>

        {/* IAP Status warning */}
        {!isLoading && !isAvailable && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20"
          >
            <p className="text-xs text-destructive text-center">
              {language === 'es' 
                ? '⚠️ Compras no disponibles. Verifica tu conexión.'
                : '⚠️ Purchases unavailable. Check your connection.'}
            </p>
          </motion.div>
        )}
      </div>

      {/* Bottom buttons */}
      <div className="flex-none space-y-3 pb-4">
        {/* Main CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={handleActivateTrial}
            disabled={isPurchasing || isLoading}
            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-primary to-secondary hover:opacity-90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {t.loading}
              </>
            ) : isPurchasing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {t.processing}
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                {t.cta}
              </>
            )}
          </Button>
        </motion.div>

        {/* Skip button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Button
            variant="ghost"
            onClick={handleSkip}
            disabled={isPurchasing}
            className="w-full text-muted-foreground"
          >
            {t.skip}
          </Button>
        </motion.div>

        {/* Legal text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-[10px] text-muted-foreground text-center leading-relaxed"
        >
          {t.legal}
        </motion.p>

        {/* Links */}
        <div className="flex justify-center gap-4 text-[10px] text-muted-foreground">
          <a href="/terms" className="hover:underline">
            {language === 'es' ? 'Términos' : 'Terms'}
          </a>
          <a href="/privacy" className="hover:underline">
            {language === 'es' ? 'Privacidad' : 'Privacy'}
          </a>
        </div>
      </div>
    </div>
  );
};

export default TrialActivation;
