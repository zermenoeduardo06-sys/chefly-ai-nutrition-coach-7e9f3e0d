import { useState, useEffect } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Loader2, CreditCard, Lock, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { useAppReview } from '@/hooks/useAppReview';
import { motion, AnimatePresence } from 'framer-motion';
import mascotCelebrating from '@/assets/mascot-celebrating.png';

interface InAppCheckoutProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  priceId: string;
  planName: string;
  planPrice: string;
}

interface CheckoutFormProps {
  onSuccess: () => void;
  onError: (error: string) => void;
  planName: string;
  planPrice: string;
}

const CheckoutForm = ({ onSuccess, onError, planName, planPrice }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const { language } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard?subscription=success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        onError(error.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess();
      } else {
        // Handle other statuses
        onSuccess();
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Plan Summary */}
      <div className="bg-muted/50 rounded-xl p-4 border border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-foreground">{planName}</p>
            <p className="text-sm text-muted-foreground">
              {language === 'es' ? 'Suscripción mensual' : 'Monthly subscription'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">{planPrice}</p>
            <p className="text-xs text-muted-foreground">USD/{language === 'es' ? 'mes' : 'month'}</p>
          </div>
        </div>
      </div>

      {/* Payment Element */}
      <div className="bg-background rounded-xl border border-border p-4">
        <PaymentElement 
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      {/* Security Badge */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Lock className="h-3 w-3" />
        <span>{language === 'es' ? 'Pago seguro con Stripe' : 'Secure payment with Stripe'}</span>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full h-12 text-base font-bold"
        variant="duolingo"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            {language === 'es' ? 'Procesando...' : 'Processing...'}
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-5 w-5" />
            {language === 'es' ? `Pagar ${planPrice}/mes` : `Pay ${planPrice}/month`}
          </>
        )}
      </Button>
    </form>
  );
};

const SuccessScreen = ({ onClose, onReviewRequest }: { onClose: () => void; onReviewRequest: () => void }) => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    // Trigger app review request after delay
    onReviewRequest();
  }, []);

  const handleContinue = () => {
    onClose();
    navigate('/dashboard?subscription=success');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
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

      <Button onClick={handleContinue} variant="duolingo" className="w-full h-12">
        {language === 'es' ? 'Continuar' : 'Continue'}
      </Button>
    </motion.div>
  );
};

export const InAppCheckout = ({ open, onOpenChange, priceId, planName, planPrice }: InAppCheckoutProps) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  const { language } = useLanguage();
  const { requestReviewAfterDelay } = useAppReview();

  useEffect(() => {
    if (open && !clientSecret && !isLoading) {
      createSubscriptionIntent();
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      // Reset state when dialog closes
      setClientSecret(null);
      setError(null);
      setIsSuccess(false);
    }
  }, [open]);

  const createSubscriptionIntent = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const affiliateCode = localStorage.getItem("affiliate_code");
      const endorselyReferral = (window as any).endorsely_referral;

      const { data, error: fnError } = await supabase.functions.invoke('create-subscription-intent', {
        body: { 
          priceId,
          affiliateCode: affiliateCode || null,
          endorselyReferral: endorselyReferral || null,
        },
      });

      if (fnError) throw fnError;
      if (data.error) throw new Error(data.error);

      setClientSecret(data.clientSecret);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to initialize payment';
      setError(message);
      toast({
        variant: 'destructive',
        title: language === 'es' ? 'Error' : 'Error',
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = () => {
    setIsSuccess(true);
    toast({
      title: language === 'es' ? '¡Suscripción activada!' : 'Subscription activated!',
      description: language === 'es' 
        ? 'Ahora tienes acceso a todas las funciones premium.'
        : 'You now have access to all premium features.',
    });
  };

  const handleError = (errorMessage: string) => {
    toast({
      variant: 'destructive',
      title: language === 'es' ? 'Error en el pago' : 'Payment error',
      description: errorMessage,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            {language === 'es' ? 'Completar pago' : 'Complete payment'}
          </DialogTitle>
          <DialogDescription>
            {language === 'es' 
              ? 'Ingresa los datos de tu tarjeta para activar tu suscripción'
              : 'Enter your card details to activate your subscription'}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {isSuccess ? (
            <SuccessScreen 
              onClose={() => onOpenChange(false)} 
              onReviewRequest={() => requestReviewAfterDelay(4000)}
            />
          ) : isLoading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12 gap-4"
            >
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                {language === 'es' ? 'Preparando formulario de pago...' : 'Preparing payment form...'}
              </p>
            </motion.div>
          ) : error ? (
            <motion.div 
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8 space-y-4"
            >
              <p className="text-destructive">{error}</p>
              <Button onClick={createSubscriptionIntent} variant="outline">
                {language === 'es' ? 'Reintentar' : 'Retry'}
              </Button>
            </motion.div>
          ) : clientSecret ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Elements 
                stripe={stripePromise} 
                options={{ 
                  clientSecret,
                  appearance: {
                    theme: 'stripe',
                    variables: {
                      colorPrimary: '#10b981',
                      borderRadius: '8px',
                    },
                  },
                }}
              >
                <CheckoutForm 
                  onSuccess={handleSuccess}
                  onError={handleError}
                  planName={planName}
                  planPrice={planPrice}
                />
              </Elements>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
