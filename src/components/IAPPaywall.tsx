import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useInAppPurchases, APPLE_IAP_PRODUCTS } from '@/hooks/useInAppPurchases';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useAppReview } from '@/hooks/useAppReview';
import { Check, Crown, Loader2, Zap, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import mascotLime from '@/assets/mascot-lime.png';

interface IAPPaywallProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | undefined;
  onPurchaseSuccess?: () => void;
}

export const IAPPaywall = ({ open, onOpenChange, userId, onPurchaseSuccess }: IAPPaywallProps) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { toast } = useToast();
  const { requestReviewAfterDelay } = useAppReview();
  
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
      // Request app review after 4 seconds (only on iOS, only once)
      requestReviewAfterDelay(4000);
      
      // Navigate to welcome plus screen
      onOpenChange(false);
      navigate('/welcome-plus');
    } else if (error) {
      console.log('[IAPPaywall] Showing error toast:', error);
      toast({
        variant: 'destructive',
        title: language === 'es' ? 'Error en la compra' : 'Purchase failed',
        description: error,
      });
    }
  };


  const handleRestore = async () => {
    const success = await restorePurchases();
    
    if (success) {
      // Request app review after restore as well
      requestReviewAfterDelay(4000);
      
      // Navigate to welcome plus screen
      onOpenChange(false);
      navigate('/welcome-plus');
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
    language === 'es' ? 'Chat IA + Escáner de comida' : 'AI Chat + Food Scanner',
    language === 'es' ? '$2 USD/mes en créditos de IA' : '$2 USD/month in AI credits',
    language === 'es' ? 'Sistema de amigos' : 'Friends system',
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-gradient-to-b from-card to-background border-border">
        <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
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
      </DialogContent>
    </Dialog>
  );
};