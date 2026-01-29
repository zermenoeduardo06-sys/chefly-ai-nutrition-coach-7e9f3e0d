import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useInAppPurchases, APPLE_IAP_PRODUCTS } from '@/hooks/useInAppPurchases';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useAppReview } from '@/hooks/useAppReview';
import { Crown, Loader2, RefreshCw, CheckCircle, Calendar, Utensils, MessageSquare, Camera, Users, Sparkles, Star, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card3D } from '@/components/ui/card-3d';
import { Icon3D } from '@/components/ui/icon-3d';
import mascotCelebrating from '@/assets/mascot-celebrating.png';
import mascotMoney from '@/assets/mascot-money.png';

interface IAPPaywallProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | undefined;
  onPurchaseSuccess?: () => void;
}

export const IAPPaywall = ({ open, onOpenChange, userId, onPurchaseSuccess }: IAPPaywallProps) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const { requestReviewAfterDelay } = useAppReview();
  const [showSuccess, setShowSuccess] = useState(false);
  
  const {
    isPurchasing,
    isRestoring,
    isAvailable,
    isLoading,
    error,
    products,
    purchaseProduct,
    restorePurchases,
    clearError,
  } = useInAppPurchases(userId);

  const handlePurchase = async () => {
    console.log('[IAPPaywall] Starting purchase...');
    clearError();
    
    const success = await purchaseProduct(APPLE_IAP_PRODUCTS.CHEFLY_PLUS_MONTHLY);
    
    if (success) {
      setShowSuccess(true);
      requestReviewAfterDelay(4000);
    } else if (error) {
      toast({
        variant: 'destructive',
        title: language === 'es' ? 'Error en la compra' : 'Purchase failed',
        description: error,
      });
    }
  };

  const handleSuccessContinue = () => {
    setShowSuccess(false);
    onPurchaseSuccess?.();
    onOpenChange(false);
  };

  const handleRestore = async () => {
    const success = await restorePurchases();
    
    if (success) {
      setShowSuccess(true);
      requestReviewAfterDelay(4000);
    } else {
      toast({
        variant: 'destructive',
        title: language === 'es' ? 'Sin compras previas' : 'No previous purchases',
        description: language === 'es' 
          ? 'No encontramos compras anteriores asociadas a tu cuenta.'
          : 'We could not find any previous purchases associated with your account.',
      });
    }
  };

  const benefits = [
    {
      icon: Calendar,
      color: 'primary' as const,
      es: 'Planes frescos cada semana',
      en: 'Fresh plans every week',
    },
    {
      icon: Utensils,
      color: 'emerald' as const,
      es: 'Cambia comidas cuando quieras',
      en: 'Swap meals anytime',
    },
    {
      icon: Camera,
      color: 'amber' as const,
      es: 'Escanea cualquier platillo',
      en: 'Scan any dish',
    },
    {
      icon: MessageSquare,
      color: 'sky' as const,
      es: 'Tu nutriólogo 24/7',
      en: 'Your 24/7 nutritionist',
    },
    {
      icon: Users,
      color: 'rose' as const,
      es: 'Motívate con amigos',
      en: 'Stay motivated with friends',
    },
  ];

  const texts = {
    es: {
      title: 'Transforma tu alimentación',
      subtitle: 'Todo lo que necesitas para alcanzar tus metas',
      price: '$7.99 USD/mes',
      cta: 'Comenzar ahora',
      processing: 'Procesando...',
      loading: 'Cargando...',
      restore: 'Restaurar compras',
      restoring: 'Restaurando...',
      cancel: 'Cancela cuando quieras',
      legal: 'El pago se cargará a tu cuenta de Apple al confirmar. La suscripción se renueva automáticamente a menos que se cancele 24 horas antes del final del período.',
      terms: 'Términos',
      privacy: 'Privacidad',
      unavailable: '⚠️ Compras no disponibles. Verifica tu conexión.',
      successTitle: '¡Bienvenido a Chefly Plus!',
      successSubtitle: 'Ya tienes acceso a todas las funciones premium',
      continue: 'Continuar',
      rating: '4.8★ • +50k usuarios',
    },
    en: {
      title: 'Transform your nutrition',
      subtitle: 'Everything you need to reach your goals',
      price: '$7.99 USD/month',
      cta: 'Start now',
      processing: 'Processing...',
      loading: 'Loading...',
      restore: 'Restore purchases',
      restoring: 'Restoring...',
      cancel: 'Cancel anytime',
      legal: 'Payment will be charged to your Apple account upon confirmation. Subscription auto-renews unless cancelled 24 hours before period ends.',
      terms: 'Terms',
      privacy: 'Privacy',
      unavailable: '⚠️ Purchases unavailable. Check your connection.',
      successTitle: 'Welcome to Chefly Plus!',
      successSubtitle: 'You now have access to all premium features',
      continue: 'Continue',
      rating: '4.8★ • +50k users',
    },
  };

  const t = texts[language];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) setShowSuccess(false);
      onOpenChange(isOpen);
    }}>
      <DialogContent className="max-w-md max-h-[95vh] overflow-y-auto p-0 border-0 bg-transparent">
        <AnimatePresence mode="wait">
          {showSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card3D variant="elevated" className="p-8 text-center space-y-6">
                <motion.img
                  src={mascotCelebrating}
                  alt="Celebration"
                  className="h-32 w-32 object-contain mx-auto"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                />

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-3"
                >
                  <div className="mx-auto w-16 h-16 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">{t.successTitle}</h3>
                  <p className="text-muted-foreground">{t.successSubtitle}</p>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button 
                    onClick={handleSuccessContinue}
                    variant="modern3d"
                    size="lg"
                    className="w-full h-14 text-lg font-bold"
                  >
                    {t.continue}
                  </Button>
                </motion.div>
              </Card3D>
            </motion.div>
          ) : (
            <motion.div 
              key="form" 
              initial={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
            >
              <Card3D variant="glass" className="overflow-hidden">
                {/* Hero Header with Gradient */}
                <div className="relative bg-gradient-to-br from-primary via-primary/90 to-secondary p-6 pb-16">
                  {/* Social proof badge */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-center mb-4"
                  >
                    <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                      <Star className="h-3.5 w-3.5 text-yellow-300 fill-yellow-300" />
                      <span className="text-xs font-semibold text-white">{t.rating}</span>
                    </div>
                  </motion.div>

                  {/* Mascot floating */}
                  <motion.img
                    src={mascotMoney}
                    alt="Chefly"
                    className="absolute top-4 right-4 h-16 w-16 object-contain"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  />

                  {/* Sparkle decorations */}
                  <motion.div
                    className="absolute top-8 left-6"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sparkles className="h-4 w-4 text-white/60" />
                  </motion.div>

                  <div className="text-center text-white">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Crown className="h-5 w-5" />
                        <span className="font-bold text-lg">Chefly Plus</span>
                      </div>
                      <h2 className="text-2xl font-bold mb-1">{t.title}</h2>
                      <p className="text-sm text-white/80">{t.subtitle}</p>
                    </motion.div>
                  </div>
                </div>

                {/* Price badge floating */}
                <div className="relative px-6 -mt-8">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="mx-auto w-fit"
                  >
                    <div className="bg-card border-2 border-primary/20 rounded-2xl px-6 py-3 shadow-lg">
                      <span className="text-2xl font-bold text-foreground">{t.price}</span>
                    </div>
                  </motion.div>
                </div>

                {/* Benefits with Icon3D */}
                <div className="px-6 py-6 space-y-3">
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.08 }}
                      className="flex items-center gap-3"
                    >
                      <Icon3D icon={benefit.icon} color={benefit.color} size="sm" />
                      <span className="text-sm font-medium text-foreground">
                        {language === 'es' ? benefit.es : benefit.en}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* IAP Status Indicator */}
                {!isLoading && !isAvailable && (
                  <div className="mx-6 mb-3 p-2 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-xs text-destructive text-center">{t.unavailable}</p>
                  </div>
                )}

                {/* CTA Section */}
                <div className="px-6 pb-6 space-y-3">
                  {/* Cancel anytime badge */}
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span className="text-sm">{t.cancel}</span>
                  </div>

                  {/* Purchase Button */}
                  <Button
                    onClick={handlePurchase}
                    disabled={isPurchasing || isRestoring || isLoading}
                    variant="modern3d"
                    size="lg"
                    className="w-full h-14 text-lg font-bold"
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
                        <Crown className="mr-2 h-5 w-5" />
                        {t.cta}
                      </>
                    )}
                  </Button>

                  {/* Restore Purchases */}
                  <Button
                    variant="ghost"
                    onClick={handleRestore}
                    disabled={isPurchasing || isRestoring}
                    className="w-full text-sm text-muted-foreground"
                  >
                    {isRestoring ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t.restoring}
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        {t.restore}
                      </>
                    )}
                  </Button>
                </div>

                {/* Legal Text */}
                <div className="px-6 pb-6 pt-2 border-t border-border space-y-2">
                  <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
                    {t.legal}
                  </p>
                  <div className="flex justify-center gap-4 text-[10px] text-muted-foreground">
                    <a href="/terms" className="hover:underline">{t.terms}</a>
                    <a href="/privacy" className="hover:underline">{t.privacy}</a>
                  </div>
                </div>
              </Card3D>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
