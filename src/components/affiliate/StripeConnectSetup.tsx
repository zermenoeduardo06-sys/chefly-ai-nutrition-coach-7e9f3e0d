import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CreditCard, CheckCircle2, AlertCircle, Loader2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StripeConnectSetupProps {
  profile: any;
  onStatusUpdate: () => void;
}

export function StripeConnectSetup({ profile, onStatusUpdate }: StripeConnectSetupProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [stripeStatus, setStripeStatus] = useState<any>(null);

  useEffect(() => {
    checkStripeStatus();
  }, [profile]);

  const checkStripeStatus = async () => {
    if (!profile.stripe_account_id) {
      setStripeStatus({ connected: false, status: "not_connected" });
      return;
    }

    setChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-stripe-account-status");
      
      if (error) throw error;
      setStripeStatus(data);
      onStatusUpdate();
    } catch (error) {
      console.error("Error checking Stripe status:", error);
    } finally {
      setChecking(false);
    }
  };

  const handleConnectStripe = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-stripe-account");
      
      if (error) throw error;

      if (data.onboardingUrl) {
        // Open Stripe onboarding in new window
        window.open(data.onboardingUrl, "_blank");
        
        toast({
          title: "Redirigiendo a Stripe",
          description: "Completa el proceso de registro en la ventana nueva",
        });

        // Check status after a delay
        setTimeout(() => {
          checkStripeStatus();
        }, 5000);
      } else if (data.exists) {
        toast({
          title: "Cuenta ya conectada",
          description: "Tu cuenta de Stripe ya está vinculada",
        });
        checkStripeStatus();
      }
    } catch (error) {
      console.error("Error connecting Stripe:", error);
      toast({
        title: "Error",
        description: "No se pudo conectar con Stripe. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Not connected
  if (!stripeStatus?.connected || stripeStatus?.status === "not_connected") {
    return (
      <Card className="border-2 border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Conectar Cuenta de Pagos
          </CardTitle>
          <CardDescription>
            Conecta tu cuenta bancaria o PayPal a través de Stripe para recibir pagos automáticos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Configuración requerida</AlertTitle>
            <AlertDescription>
              Necesitas conectar una cuenta de Stripe para poder recibir tus comisiones automáticamente.
              El proceso es rápido y seguro.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2">
            <h4 className="font-medium">¿Qué necesitas?</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Cuenta bancaria o cuenta de PayPal</li>
              <li>Identificación oficial</li>
              <li>Información fiscal (RFC para México)</li>
            </ul>
          </div>

          <Button 
            onClick={handleConnectStripe} 
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Conectando...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Conectar con Stripe
                <ExternalLink className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Connected and active
  if (stripeStatus.isActive) {
    return (
      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <CheckCircle2 className="h-5 w-5" />
            Cuenta Conectada
          </CardTitle>
          <CardDescription>
            Tu cuenta de Stripe está activa y lista para recibir pagos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-primary/20 bg-primary/10">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <AlertTitle className="text-primary">¡Todo listo!</AlertTitle>
            <AlertDescription>
              Puedes solicitar retiros cuando tengas al menos $200 MXN disponibles.
              Los pagos se procesarán automáticamente a tu cuenta conectada.
            </AlertDescription>
          </Alert>

          <Button 
            variant="outline" 
            onClick={checkStripeStatus}
            disabled={checking}
            className="w-full"
          >
            {checking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verificando...
              </>
            ) : (
              "Verificar Estado"
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Pending or needs onboarding
  return (
    <Card className="border-2 border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-700">
          <AlertCircle className="h-5 w-5" />
          Configuración Pendiente
        </CardTitle>
        <CardDescription>
          Completa la configuración de tu cuenta de Stripe
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-orange-200 bg-orange-100">
          <AlertCircle className="h-4 w-4 text-orange-700" />
          <AlertDescription className="text-orange-800">
            {stripeStatus.needsOnboarding 
              ? "Completa el proceso de registro en Stripe para activar tu cuenta."
              : "Tu cuenta está en revisión. Esto puede tomar unos minutos."}
          </AlertDescription>
        </Alert>

        <div className="flex gap-2">
          {stripeStatus.needsOnboarding && (
            <Button 
              onClick={handleConnectStripe}
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cargando...
                </>
              ) : (
                <>
                  Completar Registro
                  <ExternalLink className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          )}
          
          <Button 
            variant="outline" 
            onClick={checkStripeStatus}
            disabled={checking}
          >
            {checking ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Actualizar"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
