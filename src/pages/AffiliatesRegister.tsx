import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AffiliatesRegister() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    country: "MX",
    payout_method: "paypal",
    paypal_email: "",
    bank_name: "",
    bank_account: "",
    bank_clabe: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      // Generar código de afiliado usando la función de la base de datos
      const { data: codeData, error: codeError } = await supabase
        .rpc("generate_affiliate_code");

      if (codeError) throw codeError;

      const { error } = await supabase
        .from("affiliate_profiles")
        .insert({
          user_id: user.id,
          affiliate_code: codeData,
          full_name: formData.full_name,
          email: formData.email || user.email,
          phone: formData.phone,
          country: formData.country,
          payout_method: formData.payout_method as any,
          paypal_email: formData.payout_method === "paypal" ? formData.paypal_email : null,
          bank_name: formData.payout_method === "bank_transfer" || formData.payout_method === "spei" ? formData.bank_name : null,
          bank_account: formData.payout_method === "bank_transfer" || formData.payout_method === "spei" ? formData.bank_account : null,
          bank_clabe: formData.payout_method === "spei" ? formData.bank_clabe : null,
          status: "pending",
        });

      if (error) throw error;

      toast({
        title: "¡Solicitud enviada!",
        description: "Tu solicitud será revisada en 1-2 días hábiles",
      });

      navigate("/affiliates");
    } catch (error: any) {
      console.error("Error registering affiliate:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo completar el registro",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Button
        variant="ghost"
        onClick={() => navigate("/affiliates")}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Registro de Afiliado</CardTitle>
          <CardDescription>
            Completa el formulario para unirte al programa de afiliados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nombre Completo *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => updateFormData("full_name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData("email", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateFormData("phone", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">País *</Label>
                <Select value={formData.country} onValueChange={(value) => updateFormData("country", value)}>
                  <SelectTrigger id="country">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MX">México</SelectItem>
                    <SelectItem value="US">Estados Unidos</SelectItem>
                    <SelectItem value="ES">España</SelectItem>
                    <SelectItem value="AR">Argentina</SelectItem>
                    <SelectItem value="CO">Colombia</SelectItem>
                    <SelectItem value="CL">Chile</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-t pt-6 space-y-4">
              <h3 className="font-semibold">Método de Pago</h3>
              
              <div className="space-y-2">
                <Label htmlFor="payout_method">Método Preferido *</Label>
                <Select value={formData.payout_method} onValueChange={(value) => updateFormData("payout_method", value)}>
                  <SelectTrigger id="payout_method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="bank_transfer">Transferencia Bancaria</SelectItem>
                    <SelectItem value="spei">SPEI (México)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.payout_method === "paypal" && (
                <div className="space-y-2">
                  <Label htmlFor="paypal_email">Email de PayPal *</Label>
                  <Input
                    id="paypal_email"
                    type="email"
                    value={formData.paypal_email}
                    onChange={(e) => updateFormData("paypal_email", e.target.value)}
                    required
                  />
                </div>
              )}

              {(formData.payout_method === "bank_transfer" || formData.payout_method === "spei") && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="bank_name">Banco *</Label>
                    <Input
                      id="bank_name"
                      value={formData.bank_name}
                      onChange={(e) => updateFormData("bank_name", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bank_account">Número de Cuenta *</Label>
                    <Input
                      id="bank_account"
                      value={formData.bank_account}
                      onChange={(e) => updateFormData("bank_account", e.target.value)}
                      required
                    />
                  </div>

                  {formData.payout_method === "spei" && (
                    <div className="space-y-2">
                      <Label htmlFor="bank_clabe">CLABE Interbancaria *</Label>
                      <Input
                        id="bank_clabe"
                        value={formData.bank_clabe}
                        onChange={(e) => updateFormData("bank_clabe", e.target.value)}
                        maxLength={18}
                        required
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="bg-muted p-4 rounded-lg space-y-2">
              <h4 className="font-semibold">Comisiones:</h4>
              <ul className="text-sm space-y-1">
                <li>• Plan Básico: 20% de comisión ($48 MXN por venta)</li>
                <li>• Plan Intermedio: 25% de comisión ($72.50 MXN por venta)</li>
                <li>• Pago mínimo: $500 MXN</li>
                <li>• Pagos procesados cada 15 días</li>
              </ul>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                "Enviar Solicitud"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
