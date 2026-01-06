import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useInAppPurchases, APPLE_IAP_PRODUCTS } from '@/hooks/useInAppPurchases';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Check, Crown, Loader2, Users, Zap, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import mascotLime from '@/assets/mascot-lime.png';

interface IAPPaywallProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | undefined;
  onPurchaseSuccess?: () => void;
}

export const IAPPaywall = ({ open, onOpenChange, userId, onPurchaseSuccess }: IAPPaywallProps) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState<string>(APPLE_IAP_PRODUCTS.CHEFLY_PLUS_MONTHLY);
  
  const {
    isPurchasing,
    isRestoring,
    products,
    error,
    purchaseProduct,
    restorePurchases,
    clearError,
  } = useInAppPurchases(userId);

  const handlePurchase = async () => {
    clearError();
    
    const success = await purchaseProduct(selectedProduct);
    
    if (success) {
      toast({
        title: language === 'es' ? '¡Compra exitosa!' : 'Purchase successful!',
        description: language === 'es' 
          ? 'Ya tienes acceso a todas las funciones premium.'
          : 'You now have access to all premium features.',
      });
      onPurchaseSuccess?.();
      onOpenChange(false);
    } else if (error) {
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
      toast({
        title: language === 'es' ? '¡Compras restauradas!' : 'Purchases restored!',
        description: language === 'es' 
          ? 'Tu suscripción ha sido restaurada exitosamente.'
          : 'Your subscription has been successfully restored.',
      });
      onPurchaseSuccess?.();
      onOpenChange(false);
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

  const planOptions = [
    {
      id: APPLE_IAP_PRODUCTS.CHEFLY_PLUS_MONTHLY,
      name: 'Chefly Plus',
      price: '$7.99',
      period: language === 'es' ? '/mes' : '/month',
      icon: Zap,
      gradient: 'from-emerald-400 to-teal-500',
      features: [
        language === 'es' ? 'Planes semanales ilimitados' : 'Unlimited weekly plans',
        language === 'es' ? 'Chat ilimitado con IA' : 'Unlimited AI chat',
        language === 'es' ? 'Escaneo ilimitado' : 'Unlimited food scanning',
      ],
    },
    {
      id: APPLE_IAP_PRODUCTS.CHEFLY_FAMILY_MONTHLY,
      name: 'Chefly Familiar',
      price: '$19.99',
      period: language === 'es' ? '/mes' : '/month',
      icon: Users,
      gradient: 'from-violet-500 to-purple-500',
      badge: language === 'es' ? '5 personas' : '5 people',
      features: [
        language === 'es' ? 'Todo de Chefly Plus' : 'Everything in Chefly Plus',
        language === 'es' ? 'Hasta 5 perfiles' : 'Up to 5 profiles',
        language === 'es' ? 'Metas individuales' : 'Individual goals',
      ],
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-gradient-to-b from-card to-background border-border">
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
              {language === 'es' ? 'Desbloquea Chefly Premium' : 'Unlock Chefly Premium'}
            </span>
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {language === 'es' 
              ? 'Acceso ilimitado a todas las funciones'
              : 'Unlimited access to all features'}
          </p>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {planOptions.map((plan) => (
            <motion.button
              key={plan.id}
              onClick={() => setSelectedProduct(plan.id)}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                selectedProduct === plan.id
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                  : 'border-border hover:border-primary/50'
              }`}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`p-1.5 rounded-lg bg-gradient-to-r ${plan.gradient}`}>
                      <plan.icon className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-bold text-foreground">{plan.name}</span>
                    {plan.badge && (
                      <span className="text-xs bg-violet-500/10 text-violet-500 px-2 py-0.5 rounded-full">
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-lg font-bold text-foreground">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  </div>
                  
                  <ul className="space-y-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="h-3 w-3 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedProduct === plan.id 
                    ? 'border-primary bg-primary' 
                    : 'border-muted-foreground/30'
                }`}>
                  {selectedProduct === plan.id && (
                    <Check className="h-3 w-3 text-primary-foreground" />
                  )}
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Purchase Button */}
        <Button
          onClick={handlePurchase}
          disabled={isPurchasing || isRestoring}
          className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold text-base"
        >
          {isPurchasing ? (
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
      </DialogContent>
    </Dialog>
  );
};
