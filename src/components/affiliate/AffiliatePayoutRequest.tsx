import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AffiliatePayoutRequestProps {
  profile: any;
  onSuccess: () => void;
}

export function AffiliatePayoutRequest({ profile, onSuccess }: AffiliatePayoutRequestProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [payoutMethod, setPayoutMethod] = useState(profile.payout_method || "paypal");

  const minPayout = 200; // Mínimo $200 MXN
  const availableBalance = parseFloat(profile.pending_balance_mxn || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const requestAmount = parseFloat(amount);
    
    if (requestAmount < minPayout) {
      toast({
        title: "Monto insuficiente",
        description: `El monto mínimo de retiro es $${minPayout} MXN`,
        variant: "destructive",
      });
      return;
    }

    if (requestAmount > availableBalance) {
      toast({
        title: "Saldo insuficiente",
        description: "No tienes suficiente saldo disponible",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from("affiliate_payouts")
        .insert({
          affiliate_id: profile.id,
          amount_mxn: requestAmount,
          payout_method: payoutMethod,
          status: "pending",
        });

      if (error) throw error;

      toast({
        title: "¡Solicitud enviada!",
        description: "Tu solicitud de pago está siendo procesada",
      });

      setAmount("");
      onSuccess();
    } catch (error: any) {
      console.error("Error requesting payout:", error);
      toast({
        title: "Error",
        description: "No se pudo procesar la solicitud",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Solicitar Pago
        </CardTitle>
        <CardDescription>
          Disponible: ${availableBalance.toFixed(2)} MXN
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Monto a Retirar (MXN)</Label>
            <Input
              id="amount"
              type="number"
              min={minPayout}
              max={availableBalance}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Mínimo $${minPayout}`}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="method">Método de Pago</Label>
            <Select value={payoutMethod} onValueChange={setPayoutMethod}>
              <SelectTrigger id="method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="bank_transfer">Transferencia Bancaria</SelectItem>
                <SelectItem value="spei">SPEI</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={loading || availableBalance < minPayout}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              "Solicitar Pago"
            )}
          </Button>

          {availableBalance < minPayout && (
            <p className="text-xs text-muted-foreground text-center">
              Necesitas al menos ${minPayout} MXN para solicitar un pago
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
