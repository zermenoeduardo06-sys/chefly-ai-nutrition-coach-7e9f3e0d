import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useInAppPurchases, APPLE_IAP_PRODUCTS } from '@/hooks/useInAppPurchases';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useAppReview } from '@/hooks/useAppReview';
import { Check, Crown, Loader2, Zap, RefreshCw, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import mascotLime from '@/assets/mascot-lime.png';
import mascotCelebrating from '@/assets/mascot-celebrating.png';

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
    console.log('[IAPPaywall] IAP Available:', isAvailable);
    console.log('[IAPPaywall] Products loaded:', products.length);
    console.log('[IAPPaywall] User ID:', userId);
    
    clearError();
    
    const success = await purchaseProduct(APPLE_IAP_PRODUCTS.CHEFLY_PLUS_MONTHLY);
    console.log('[IAPPaywall] Purchase result:', success);
    
    if (success) {
      // Show success screen first
      setShowSuccess(true);
      
      // Request app review after 4 seconds (only on iOS, only once)
      requestReviewAfterDelay(4000);
    } else if (error) {
      console.log('[IAPPaywall] Showing error toast:', error);
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
      // Show success screen for restored purchases too
      setShowSuccess(true);
      
      // Request app review after restore as well
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

  const planFeatures = [
    language === 'es' ? 'Planes semanales ilimitados' : 'Unlimited weekly plans',
    language === 'es' ? 'Intercambio de comidas' : 'Meal swapping',
    language === 'es' ? 'Reemplaza comidas por alternativas' : 'Replace meals with alternatives',
    language === 'es' ? 'Chat ilimitado con IA' : 'Unlimited AI chat',
    language === 'es' ? 'Escaneo ilimitado' : 'Unlimited food scanning',
    language === 'es' ? 'Sistema de amigos' : 'Friends system',
  ];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) setShowSuccess(false);
      onOpenChange(isOpen);
    }}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-gradient-to-b from-card to-background border-border">
        <AnimatePresence mode="wait">
          {showSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8 space-y-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="mx-auto"
              >
                <img 
                  src={mascotCelebrating} 
                  alt="Celebration" 
                  className="h-28 w-28 object-contain mx-auto" 
                />
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {language === 'es' ? '¡Bienvenido a Premium!' : 'Welcome to Premium!'}
                </h3>
                <p className="text-muted-foreground">
                  {language === 'es' 
                    ? '¡Gracias por tu compra! Ahora tienes acceso a todas las funciones.'
                    : 'Thank you for your purchase! You now have access to all features.'}
                </p>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Button 
                  onClick={handleSuccessContinue}
                  className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold"
                >
                  {language === 'es' ? 'Continuar' : 'Continue'}
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DialogHeader className="text-center pb-2">
                <motion.div 
                  className="mx-auto mb-2"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <img src={mascotLime} alt="Chefly" className="h-16 w-16 object-contain" />
                </motion.div>
                <DialogTitle className="text-xl font-bold">
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {language === 'es' ? 'Desbloquea Chefly Plus' : 'Unlock Chefly Plus'}
                  </span>
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  {language === 'es' 
                    ? 'Acceso ilimitado a todas las funciones'
                    : 'Unlimited access to all features'}
                </p>
              </DialogHeader>

              <div className="space-y-3 py-4">
                <div className="w-full p-4 rounded-xl border-2 border-primary bg-primary/5 ring-2 ring-primary/20">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="p-1.5 rounded-lg bg-gradient-to-r from-emerald-400 to-teal-500">
                          <Zap className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-bold text-foreground">Chefly Plus</span>
                      </div>
                      
                      <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-lg font-bold text-foreground">$7.99</span>
                        <span className="text-sm text-muted-foreground">
                          {language === 'es' ? '/mes' : '/month'}
                        </span>
                      </div>
                      
                      <ul className="space-y-1">
                        {planFeatures.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Check className="h-3 w-3 text-primary" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* IAP Status Indicator (for debugging) */}
              {!isLoading && !isAvailable && (
                <div className="mb-3 p-2 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-xs text-destructive text-center">
                    {language === 'es' 
                      ? '⚠️ Compras no disponibles. Verifica tu conexión.'
                      : '⚠️ Purchases unavailable. Check your connection.'}
                  </p>
                </div>
              )}

              {/* Purchase Button */}
              <Button
                onClick={handlePurchase}
                disabled={isPurchasing || isRestoring || isLoading}
                className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold text-base"
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
                    <Crown className="mr-2 h-5 w-5" />
                    {language === 'es' ? 'Suscribirse' : 'Subscribe'}
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
                    {language === 'es' ? 'Restaurando...' : 'Restoring...'}
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {language === 'es' ? 'Restaurar compras' : 'Restore purchases'}
                  </>
                )}
              </Button>

              {/* Legal Text */}
              <div className="space-y-2 pt-2 border-t border-border">
                <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
                  {language === 'es' 
                    ? 'El pago se cargará a tu cuenta de Apple al confirmar. La suscripción se renueva automáticamente a menos que se cancele 24 horas antes del final del período.'
                    : 'Payment will be charged to your Apple account upon confirmation. Subscription auto-renews unless cancelled 24 hours before period ends.'}
                </p>
                <div className="flex justify-center gap-4 text-[10px] text-muted-foreground">
                  <a href="/terms" className="hover:underline">
                    {language === 'es' ? 'Términos' : 'Terms'}
                  </a>
                  <a href="/privacy" className="hover:underline">
                    {language === 'es' ? 'Privacidad' : 'Privacy'}
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};