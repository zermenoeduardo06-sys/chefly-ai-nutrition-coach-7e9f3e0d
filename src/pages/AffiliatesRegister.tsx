import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowLeft, Home, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

const AffiliateHeader = () => {
  const navigate = useNavigate();
  
  return (
    <header className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Chefly Afiliados</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              className="text-primary-foreground hover:bg-primary-foreground/20"
              onClick={() => navigate("/")}
            >
              <Home className="h-4 w-4 mr-2" />
              Inicio
            </Button>
            <Button 
              variant="ghost" 
              className="text-primary-foreground hover:bg-primary-foreground/20"
              onClick={() => navigate("/programa-afiliados")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Información
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default function AffiliatesRegister() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      if (user && !formData.email) {
        setFormData(prev => ({ ...prev, email: user.email || "" }));
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      setIsAuthenticated(false);
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast({
        title: "Inicia sesión primero",
        description: "Necesitas crear una cuenta o iniciar sesión para registrarte como afiliado",
        variant: "destructive",
      });
      navigate("/affiliates/login");
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error de autenticación",
          description: "Por favor inicia sesión nuevamente",
          variant: "destructive",
        });
        navigate("/affiliates/login");
        return;
      }

      console.log("Generating affiliate code...");
      const { data: codeData, error: codeError } = await supabase
        .rpc("generate_affiliate_code");

      if (codeError) {
        console.error("Error generating code:", codeError);
        throw codeError;
      }

      console.log("Inserting affiliate profile...", { user_id: user.id, code: codeData });
      const { error } = await supabase
        .from("affiliate_profiles")
        .insert({
          user_id: user.id,
          affiliate_code: codeData,
          full_name: formData.full_name,
          email: formData.email || user.email,
          phone: formData.phone || null,
          country: formData.country,
          payout_method: formData.payout_method as any,
          paypal_email: formData.payout_method === "paypal" ? formData.paypal_email : null,
          bank_name: formData.payout_method === "bank_transfer" || formData.payout_method === "spei" ? formData.bank_name : null,
          bank_account: formData.payout_method === "bank_transfer" || formData.payout_method === "spei" ? formData.bank_account : null,
          bank_clabe: formData.payout_method === "spei" ? formData.bank_clabe : null,
          status: "pending",
        });

      if (error) {
        console.error("Error inserting profile:", error);
        throw error;
      }

      console.log("Affiliate profile created successfully!");
      toast({
        title: "¡Solicitud enviada!",
        description: "Tu solicitud será revisada en 1-2 días hábiles",
      });

      navigate("/affiliates");
    } catch (error: any) {
      console.error("Error registering affiliate:", error);
      toast({
        title: "Error al registrar",
        description: error.message || "No se pudo completar el registro. Por favor intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <AffiliateHeader />
        <div className="flex items-center justify-center min-h-[80vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <AffiliateHeader />
      <div className="container mx-auto py-8 px-4 max-w-2xl">
          <Alert className="mb-6 border-yellow-500 bg-yellow-500/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Necesitas iniciar sesión para registrarte como afiliado.{" "}
              <Button 
                variant="link" 
                className="p-0 h-auto font-semibold underline"
                onClick={() => navigate("/affiliates/login")}
              >
                Inicia sesión aquí
              </Button>
            </AlertDescription>
          </Alert>

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
                <li>• Pago mínimo: $200 MXN</li>
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
    </div>
  );
}
