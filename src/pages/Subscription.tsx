import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Crown, ExternalLink, Check, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSubscription } from "@/hooks/useSubscription";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";

const Subscription = () => {
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const navigate = useNavigate();
  const { toast } = useToast();
  const subscription = useSubscription(userId);
  const { limits } = useSubscriptionLimits(userId);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUserId(user.id);
    setLoading(false);
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");

      if (error) throw error;

      if (data.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Error opening customer portal:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo abrir el portal de gestión. Intenta de nuevo.",
      });
    } finally {
      setPortalLoading(false);
    }
  };

  if (loading || subscription.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const features = [
    {
      name: "Generar nuevos planes",
      basic: false,
      intermediate: true,
    },
    {
      name: "Intercambiar comidas",
      basic: false,
      intermediate: true,
    },
    {
      name: "Chat ilimitado con coach",
      basic: false,
      intermediate: true,
    },
    {
      name: "Chat limitado (5 mensajes/día)",
      basic: true,
      intermediate: false,
    },
    {
      name: "Ver plan semanal",
      basic: true,
      intermediate: true,
    },
    {
      name: "Marcar comidas completadas",
      basic: true,
      intermediate: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <main className="container mx-auto px-4 py-6 space-y-6 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Gestionar Suscripción</h1>
            <p className="text-muted-foreground">Administra tu plan y facturación</p>
          </div>
        </div>

        {/* Current Plan */}
        <Card className="border-2 border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Crown className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle className="text-2xl">
                    {limits.planName || "Plan Básico"}
                  </CardTitle>
                  <CardDescription>
                    {subscription.subscribed 
                      ? "Tu suscripción activa"
                      : "Plan gratuito"}
                  </CardDescription>
                </div>
              </div>
              <Badge variant="default" className="bg-primary">
                {subscription.subscribed ? "Activo" : "Gratuito"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {subscription.subscription_end && (
              <Alert>
                <AlertDescription>
                  Tu suscripción se renueva el {new Date(subscription.subscription_end).toLocaleDateString('es-ES', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </AlertDescription>
              </Alert>
            )}

            {/* Features Table */}
            <div className="space-y-3 mt-6">
              <h3 className="font-semibold">Características de tu plan</h3>
              <div className="space-y-2">
                {features.map((feature) => {
                  const hasFeature = limits.isBasicPlan ? feature.basic : feature.intermediate;
                  return (
                    <div key={feature.name} className="flex items-center justify-between py-2 border-b border-border/50">
                      <span className="text-sm">{feature.name}</span>
                      {hasFeature ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-4">
              {subscription.subscribed ? (
                <Button
                  onClick={handleManageSubscription}
                  disabled={portalLoading}
                  variant="outline"
                  size="lg"
                >
                  {portalLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Abriendo portal...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Gestionar suscripción en Stripe
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={() => navigate("/pricing")}
                  size="lg"
                  variant="hero"
                >
                  Ver planes disponibles
                </Button>
              )}
              
              {subscription.subscribed && (
                <Alert className="mt-4">
                  <AlertDescription className="text-sm">
                    <strong>¿Necesitas cancelar?</strong> Haz clic en "Gestionar suscripción en Stripe" para acceder al portal donde podrás cancelar tu plan, actualizar tu método de pago y ver tu historial de facturación.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upgrade Card */}
        {limits.isBasicPlan && (
          <Card className="border-2 border-secondary bg-gradient-to-r from-primary/10 to-secondary/10">
            <CardHeader>
              <CardTitle>Mejora a Plan Intermedio</CardTitle>
              <CardDescription>
                Desbloquea todas las funciones premium
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">Genera nuevos planes cuando quieras</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">Intercambia comidas entre días</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span className="text-sm">Chat ilimitado con tu coach nutricional</span>
                </li>
              </ul>
              <Button
                onClick={() => navigate("/pricing")}
                className="w-full"
                variant="hero"
              >
                Ver planes
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Subscription;
