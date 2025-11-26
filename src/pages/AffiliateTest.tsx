import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Check, Copy, ExternalLink, ArrowRight, UserPlus, CreditCard, BarChart3 } from "lucide-react";

export default function AffiliateTest() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [affiliateCode, setAffiliateCode] = useState("");
  const [testUrl, setTestUrl] = useState("");
  const [step, setStep] = useState(1);

  const generateTestUrl = () => {
    if (!affiliateCode) {
      toast({
        variant: "destructive",
        title: "Código requerido",
        description: "Por favor ingresa tu código de afiliado",
      });
      return;
    }

    const url = `${window.location.origin}?ref=${affiliateCode}`;
    setTestUrl(url);
    setStep(2);

    toast({
      title: "Link generado",
      description: "Copia el link y ábrelo en modo incógnito",
    });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(testUrl);
      toast({
        title: "¡Copiado!",
        description: "Link copiado al portapapeles",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo copiar el link",
      });
    }
  };

  const openInIncognito = () => {
    toast({
      title: "Instrucciones",
      description: "Abre este link en una ventana de incógnito manualmente",
    });
  };

  const steps = [
    {
      number: 1,
      title: "Obtén tu código de afiliado",
      description: "Ingresa tu código de afiliado para generar tu link de prueba",
      icon: UserPlus,
      action: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="code">Código de Afiliado</Label>
            <Input
              id="code"
              placeholder="Ej: 2F8E103"
              value={affiliateCode}
              onChange={(e) => setAffiliateCode(e.target.value.toUpperCase())}
              className="mt-2"
            />
          </div>
          <Button onClick={generateTestUrl} className="w-full">
            Generar Link de Prueba
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ),
    },
    {
      number: 2,
      title: "Abre en modo incógnito",
      description: "Copia el link y ábrelo en una ventana de incógnito para simular un nuevo usuario",
      icon: ExternalLink,
      action: testUrl && (
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg break-all font-mono text-sm">
            {testUrl}
          </div>
          <div className="flex gap-2">
            <Button onClick={copyToClipboard} className="flex-1">
              <Copy className="mr-2 h-4 w-4" />
              Copiar Link
            </Button>
            <Button onClick={openInIncognito} variant="outline" className="flex-1">
              <ExternalLink className="mr-2 h-4 w-4" />
              Abrir Incógnito
            </Button>
          </div>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>💡 <strong>En Windows/Linux:</strong> Ctrl + Shift + N (Chrome) o Ctrl + Shift + P (Firefox)</p>
            <p>💡 <strong>En Mac:</strong> Cmd + Shift + N (Chrome) o Cmd + Shift + P (Firefox)</p>
            <p>💡 <strong>En móvil:</strong> Menú → Nueva pestaña de incógnito</p>
          </div>
        </div>
      ),
    },
    {
      number: 3,
      title: "Registra una cuenta nueva",
      description: "En la ventana incógnito, regístrate con un email diferente",
      icon: UserPlus,
      action: (
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Pasos:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Ve a la página de registro</li>
              <li>Usa un email diferente (ej: prueba@test.com)</li>
              <li>Completa el registro</li>
              <li>Verifica que el código de afiliado se muestre en la consola</li>
            </ol>
          </div>
          <Button onClick={() => setStep(4)} className="w-full">
            Ya me registré
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ),
    },
    {
      number: 4,
      title: "Completa una compra de prueba",
      description: "Ve a la página de precios y completa una compra con tarjeta de prueba",
      icon: CreditCard,
      action: (
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg space-y-3">
            <div>
              <h4 className="font-semibold mb-2">Tarjeta de prueba de Stripe:</h4>
              <div className="space-y-2 text-sm font-mono">
                <p>💳 <strong>Número:</strong> 4242 4242 4242 4242</p>
                <p>📅 <strong>Fecha:</strong> 12/34 (cualquier fecha futura)</p>
                <p>🔒 <strong>CVC:</strong> 123 (cualquier 3 dígitos)</p>
                <p>📮 <strong>ZIP:</strong> 12345 (cualquier código)</p>
              </div>
            </div>
            <div className="pt-3 border-t">
              <h4 className="font-semibold mb-2">Pasos:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Ve a /pricing</li>
                <li>Selecciona un plan (Básico o Intermedio)</li>
                <li>Completa el checkout con la tarjeta de prueba</li>
                <li>Espera la confirmación de pago</li>
              </ol>
            </div>
          </div>
          <Button onClick={() => setStep(5)} className="w-full">
            Ya completé el pago
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ),
    },
    {
      number: 5,
      title: "Verifica en el dashboard",
      description: "Regresa al dashboard de afiliados y verifica que se registró la venta",
      icon: BarChart3,
      action: (
        <div className="space-y-4">
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">
              ✅ ¡Casi listo!
            </h4>
            <p className="text-sm text-muted-foreground">
              Ahora ve al dashboard de afiliados y haz click en "Refrescar datos" para ver tu venta registrada.
            </p>
          </div>
          
          <div className="grid gap-3">
            <Button 
              onClick={() => navigate("/affiliates/dashboard")} 
              className="w-full"
              size="lg"
            >
              <BarChart3 className="mr-2 h-5 w-5" />
              Ir al Dashboard de Afiliados
            </Button>
            
            <Button 
              onClick={() => {
                setStep(1);
                setAffiliateCode("");
                setTestUrl("");
              }}
              variant="outline"
              className="w-full"
            >
              Repetir Prueba
            </Button>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">¿Qué deberías ver?</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Total conversiones: +1</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Balance pendiente: +$48 o +$58 MXN (según el plan)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Nueva venta en la tabla con estado "Pendiente"</span>
              </li>
            </ul>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">
            🧪 Testing del Programa de Afiliados
          </h1>
          <p className="text-muted-foreground text-lg">
            Sigue estos pasos para probar que el sistema de afiliados funciona correctamente
          </p>
        </div>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((s, idx) => (
              <div key={s.number} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                    step >= s.number
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step > s.number ? <Check className="h-5 w-5" /> : s.number}
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`h-1 w-12 md:w-24 mx-2 transition-colors ${
                      step > s.number ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Current step card */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0">
                {steps[step - 1] && (() => {
                  const StepIcon = steps[step - 1].icon;
                  return <StepIcon className="h-6 w-6 text-primary-foreground" />;
                })()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">Paso {step} de {steps.length}</Badge>
                </div>
                <CardTitle className="text-2xl mb-2">
                  {steps[step - 1]?.title}
                </CardTitle>
                <CardDescription className="text-base">
                  {steps[step - 1]?.description}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {steps[step - 1]?.action}
          </CardContent>
        </Card>

        {/* Quick navigation */}
        <div className="mt-8 flex gap-4 justify-center">
          <Button
            onClick={() => navigate("/affiliates/dashboard")}
            variant="outline"
          >
            Ir al Dashboard
          </Button>
          <Button
            onClick={() => navigate("/")}
            variant="ghost"
          >
            Volver al Inicio
          </Button>
        </div>

        {/* Important note */}
        <Card className="mt-8 border-orange-500/50 bg-orange-500/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              ⚠️ Importante
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>Asegúrate de usar cuentas diferentes:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Una cuenta para el afiliado (que genera el link)</li>
              <li>Otra cuenta para el cliente (que hace la compra)</li>
            </ul>
            <p className="mt-4">
              Si ves que la venta no aparece, verifica que estés logueado con la cuenta correcta del afiliado.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
