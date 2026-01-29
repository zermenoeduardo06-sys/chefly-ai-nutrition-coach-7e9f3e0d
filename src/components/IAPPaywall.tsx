import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useInAppPurchases, APPLE_IAP_PRODUCTS } from '@/hooks/useInAppPurchases';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useAppReview } from '@/hooks/useAppReview';
import { Crown, Loader2, Zap, RefreshCw, CheckCircle, Camera, MessageSquare, Utensils, Star, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon3D } from '@/components/ui/icon-3d';
import mascotCelebrating from '@/assets/mascot-celebrating.png';

interface IAPPaywallProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | undefined;
  onPurchaseSuccess?: () => void;
}

// Floating food emojis for decoration
const floatingEmojis = [
  { emoji: "🍎", top: "8%", left: "8%", delay: 0 },
  { emoji: "✨", top: "12%", right: "12%", delay: 0.3 },
  { emoji: "🥕", top: "18%", left: "15%", delay: 0.6 },
  { emoji: "🧀", top: "5%", right: "25%", delay: 0.2 },
  { emoji: "🥦", top: "22%", right: "8%", delay: 0.5 },
];

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
      icon: Zap,
      color: "amber" as const,
      text: language === 'es' ? 'Planes frescos cada semana' : 'Fresh plans every week',
    },
    {
      icon: Camera,
      color: "sky" as const,
      text: language === 'es' ? 'Escanea cualquier platillo' : 'Scan any dish',
    },
    {
      icon: MessageSquare,
      color: "emerald" as const,
      text: language === 'es' ? 'Tu nutriólogo 24/7' : 'Your 24/7 nutritionist',
    },
    {
      icon: Utensils,
      color: "rose" as const,
      text: language === 'es' ? 'Cambia comidas cuando quieras' : 'Swap meals anytime',
    },
  ];

  const texts = {
    es: {
      title: "Te ayudaremos a alcanzar tu meta",
      subtitle: "nutricional",
      mostPopular: "Lo más popular",
      price: "$7.99",
      period: "/mes",
      cta: "COMENZAR AHORA",
      cancel: "Cancela cuando quieras",
      restore: "Restaurar compras",
      rating: "4.8★ App Store",
    },
    en: {
      title: "We'll help you reach your",
      subtitle: "nutrition goals",
      mostPopular: "Most popular",
      price: "$7.99",
      period: "/month",
      cta: "START NOW",
      cancel: "Cancel anytime",
      restore: "Restore purchases",
      rating: "4.8★ App Store",
    },
  };

  const t = texts[language];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) setShowSuccess(false);
      onOpenChange(isOpen);
    }}>
      <DialogContent className="max-w-md h-[90vh] max-h-[700px] p-0 overflow-hidden border-0 bg-background flex flex-col">
        <AnimatePresence mode="wait">
          {showSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                <img 
                  src={mascotCelebrating} 
                  alt="Celebration" 
                  className="h-32 w-32 object-contain" 
                />
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mb-4 shadow-[0_4px_0_hsl(160_80%_30%),0_8px_20px_rgba(0,0,0,0.2)]">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {language === 'es' ? '¡Bienvenido a Chefly Plus!' : 'Welcome to Chefly Plus!'}
                </h3>
                <p className="text-muted-foreground">
                  {language === 'es' 
                    ? '¡Gracias! Ahora tienes acceso a todo.'
                    : 'Thanks! You now have full access.'}
                </p>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="w-full"
              >
                <Button 
                  onClick={handleSuccessContinue}
                  variant="modern3d"
                  size="xl"
                  className="w-full"
                >
                  {language === 'es' ? 'Continuar' : 'Continue'}
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
              {/* Close button */}
              <button
                onClick={() => onOpenChange(false)}
                className="absolute top-4 right-4 z-50 p-2 rounded-full bg-muted/80 hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>

              {/* Hero Section with floating emojis and mascot */}
              <div className="relative bg-gradient-to-b from-primary/20 via-primary/10 to-background pt-8 pb-6 px-6 overflow-hidden">
                {/* Floating Emojis */}
                {floatingEmojis.map((item, index) => (
                  <motion.div
                    key={index}
                    className="absolute text-2xl pointer-events-none"
                    style={{ top: item.top, left: item.left, right: item.right }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ 
                      opacity: 1, 
                      y: [0, -8, 0],
                    }}
                    transition={{ 
                      opacity: { delay: item.delay, duration: 0.4 },
                      y: { delay: item.delay, duration: 2.5, repeat: Infinity, ease: "easeInOut" }
                    }}
                  >
                    {item.emoji}
                  </motion.div>
                ))}

                {/* Rating Badge */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex justify-center mb-4"
                >
                  <div className="flex items-center gap-1.5 bg-card/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border shadow-sm">
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-medium text-foreground">{t.rating}</span>
                  </div>
                </motion.div>

                {/* Mascot */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                  className="flex justify-center mb-4"
                >
                  <img
                    src={mascotCelebrating}
                    alt="Chefly mascot"
                    className="h-28 w-28 object-contain drop-shadow-lg"
                  />
                </motion.div>

                {/* Title */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center"
                >
                  <h2 className="text-xl font-bold text-foreground leading-tight">
                    {t.title}
                  </h2>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {t.subtitle}
                  </h2>
                </motion.div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-6 pb-4">
                {/* Plan Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mb-5"
                >
                  <div className="relative p-4 rounded-2xl border-2 border-primary bg-primary/5 shadow-[0_4px_0_hsl(var(--primary)/0.3),0_8px_20px_rgba(0,0,0,0.1)]">
                    {/* Popular Badge */}
                    <div className="absolute -top-3 left-4">
                      <span className="bg-gradient-to-r from-primary to-secondary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-md">
                        ⭐ {t.mostPopular}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
                          <Crown className="h-5 w-5 text-primary" />
                        </div>
                        <span className="font-bold text-lg text-foreground">Chefly Plus</span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-foreground">{t.price}</span>
                        <span className="text-sm text-muted-foreground">{t.period}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Benefits with Icon3D */}
                <div className="space-y-3 mb-4">
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <Icon3D icon={benefit.icon} color={benefit.color} size="sm" />
                      <span className="text-sm font-medium text-foreground">{benefit.text}</span>
                    </motion.div>
                  ))}
                </div>

                {/* IAP Status Indicator */}
                {!isLoading && !isAvailable && (
                  <div className="mb-3 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                    <p className="text-xs text-destructive text-center">
                      {language === 'es' 
                        ? '⚠️ Compras no disponibles. Verifica tu conexión.'
                        : '⚠️ Purchases unavailable. Check your connection.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Fixed Bottom CTA */}
              <div className="flex-shrink-0 px-6 pb-6 pt-3 bg-gradient-to-t from-background via-background to-transparent border-t border-border/50">
                {/* Cancel anytime text */}
                <p className="text-center text-sm text-muted-foreground mb-3">
                  ✓ {t.cancel}
                </p>

                {/* Purchase Button */}
                <Button
                  onClick={handlePurchase}
                  disabled={isPurchasing || isRestoring || isLoading}
                  variant="modern3d"
                  size="xl"
                  className="w-full mb-3"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {language === 'es' ? 'Cargando...' : 'Loading...'}
                    </>
                  ) : isPurchasing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {language === 'es' ? 'Procesando...' : 'Processing...'}
                    </>
                  ) : (
                    <>
                      {t.cta} - {t.price}{t.period}
                    </>
                  )}
                </Button>

                {/* Restore Purchases */}
                <button
                  onClick={handleRestore}
                  disabled={isPurchasing || isRestoring}
                  className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2 disabled:opacity-50"
                >
                  {isRestoring ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {language === 'es' ? 'Restaurando...' : 'Restoring...'}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4" />
                      {t.restore}
                    </span>
                  )}
                </button>

                {/* Legal Text */}
                <div className="mt-3 pt-3 border-t border-border/50">
                  <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
                    {language === 'es' 
                      ? 'El pago se carga a tu cuenta de Apple. La suscripción se renueva automáticamente a menos que se cancele 24h antes.'
                      : 'Payment charged to Apple account. Auto-renews unless cancelled 24h before period ends.'}
                  </p>
                  <div className="flex justify-center gap-4 text-[10px] text-muted-foreground mt-2">
                    <a href="/terms" className="hover:underline">
                      {language === 'es' ? 'Términos' : 'Terms'}
                    </a>
                    <a href="/privacy" className="hover:underline">
                      {language === 'es' ? 'Privacidad' : 'Privacy'}
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
