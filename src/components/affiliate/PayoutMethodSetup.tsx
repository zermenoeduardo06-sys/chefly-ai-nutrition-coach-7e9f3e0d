import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CreditCard, CheckCircle2, AlertCircle } from "lucide-react";

interface PayoutMethodSetupProps {
  profile: any;
}

export function PayoutMethodSetup({ profile }: PayoutMethodSetupProps) {
  const hasPayoutMethod = profile.payout_method && (
    (profile.payout_method === "paypal" && profile.paypal_email) ||
    (profile.payout_method === "bank_transfer" && profile.bank_account && profile.bank_name) ||
    (profile.payout_method === "spei" && profile.bank_clabe)
  );

  const getMethodLabel = (method: string) => {
    switch (method) {
      case "paypal": return "PayPal";
      case "bank_transfer": return "Transferencia Bancaria";
      case "spei": return "SPEI";
      default: return method;
    }
  };

  if (hasPayoutMethod) {
    return (
      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <CheckCircle2 className="h-5 w-5" />
            Método de Pago Configurado
          </CardTitle>
          <CardDescription>
            {getMethodLabel(profile.payout_method)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="border-primary/20 bg-primary/10">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <AlertTitle className="text-primary">¡Todo listo!</AlertTitle>
            <AlertDescription>
              Puedes solicitar retiros cuando tengas al menos $200 MXN disponibles.
              Los pagos se procesarán manualmente por nuestro equipo dentro de 1-3 días hábiles.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-dashed">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Configurar Método de Pago
        </CardTitle>
        <CardDescription>
          Configura tu método de pago preferido para recibir comisiones
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Configuración requerida</AlertTitle>
          <AlertDescription>
            Agrega tu información de pago al realizar tu primera solicitud de retiro.
            Puedes elegir entre PayPal, transferencia bancaria o SPEI.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-2">
          <h4 className="font-medium">Métodos disponibles:</h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>PayPal - Retiros rápidos</li>
            <li>Transferencia Bancaria - A tu cuenta bancaria</li>
            <li>SPEI - Transferencia instantánea en México</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
