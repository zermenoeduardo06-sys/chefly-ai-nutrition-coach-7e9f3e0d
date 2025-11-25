import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Sparkles, Calendar, MessageSquare, Trophy } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import confetti from "canvas-confetti";

const Welcome = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | undefined>();
  const { subscribed, planName, isLoading } = useSubscription(userId);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUserId(user.id);
      
      // Procesar conversión de afiliado si existe
      const affiliateCode = localStorage.getItem("affiliate_code");
      if (affiliateCode && subscribed) {
        try {
          // Obtener información de la suscripción
          const { data: subData } = await supabase.functions.invoke("check-subscription");
          
          if (subData?.product_id) {
            // Registrar la venta del afiliado
            const { error } = await supabase.functions.invoke("process-affiliate-sale", {
              body: {
                affiliateCode,
                customerId: user.id,
                customerEmail: user.email || "",
                productId: subData.product_id,
                stripeSubscriptionId: "",
                stripeCustomerId: "",
              },
            });

            if (!error) {
              console.log("Affiliate sale registered successfully");
              // Limpiar código después de procesar
              localStorage.removeItem("affiliate_code");
              localStorage.removeItem("affiliate_referral_stored");
            } else {
              console.error("Error registering affiliate sale:", error);
            }
          }
        } catch (err) {
          console.error("Exception processing affiliate conversion:", err);
        }
      }
    };
    checkUser();
  }, [navigate, subscribed]);

  useEffect(() => {
    if (subscribed && planName) {
      // Disparar confetti cuando se confirme la suscripción
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [subscribed, planName]);

  const nextSteps = [
    {
      icon: Calendar,
      title: "Genera tu primer plan de comidas",
      description: "Crea un plan semanal personalizado basado en tus objetivos nutricionales",
      action: () => navigate("/dashboard"),
    },
    {
      icon: MessageSquare,
      title: "Chatea con tu coach de IA",
      description: "Obtén respuestas instantáneas sobre nutrición y ajusta tus planes",
      action: () => navigate("/chat"),
    },
    {
      icon: Trophy,
      title: "Completa desafíos diarios",
      description: "Gana puntos y mantén tu racha completando desafíos nutricionales",
      action: () => navigate("/dashboard/challenges"),
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando tu suscripción...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header de bienvenida */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <CheckCircle2 className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            ¡Bienvenido a tu nueva vida saludable! 🎉
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Tu suscripción ha sido activada exitosamente
          </p>
          
          {subscribed && planName && (
            <div className="inline-block">
              <Badge className="text-lg px-6 py-2" variant="default">
                <Sparkles className="w-4 h-4 mr-2" />
                Plan {planName}
              </Badge>
            </div>
          )}
        </div>

        {/* Características del plan */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Lo que incluye tu plan</CardTitle>
            <CardDescription>
              Aprovecha todas estas características para alcanzar tus metas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {planName === "Intermedio" ? (
                <>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Planes de comidas diarios ilimitados</p>
                      <p className="text-sm text-muted-foreground">Genera todos los planes que necesites</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Chat con IA ilimitado</p>
                      <p className="text-sm text-muted-foreground">Obtén respuestas y consejos sin límites</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Recetas premium y variadas</p>
                      <p className="text-sm text-muted-foreground">Acceso a toda nuestra biblioteca de recetas</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Seguimiento avanzado y desafíos</p>
                      <p className="text-sm text-muted-foreground">Monitorea tu progreso con herramientas avanzadas</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Plan de comidas semanal personalizado</p>
                      <p className="text-sm text-muted-foreground">Un plan adaptado a tus necesidades</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Seguimiento de calorías y macros</p>
                      <p className="text-sm text-muted-foreground">Monitorea tu progreso diario</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Chat con IA (5 mensajes/día)</p>
                      <p className="text-sm text-muted-foreground">Obtén respuestas a tus dudas</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Acceso a recetas básicas</p>
                      <p className="text-sm text-muted-foreground">Descubre nuevas opciones saludables</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Próximos pasos */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Tus próximos pasos</h2>
          <div className="grid gap-4">
            {nextSteps.map((step, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={step.action}>
                <CardContent className="flex items-start gap-4 p-6">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 shrink-0">
                    <step.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                  <div className="text-2xl font-bold text-muted-foreground/20">{index + 1}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA principal */}
        <div className="text-center">
          <Button size="lg" onClick={() => navigate("/dashboard")} className="w-full md:w-auto">
            Ir al Dashboard
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            ¿Necesitas ayuda? Visita nuestra{" "}
            <a href="/faq" className="text-primary hover:underline">
              sección de preguntas frecuentes
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
