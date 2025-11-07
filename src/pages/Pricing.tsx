import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SubscriptionPlan {
  id: string;
  name: string;
  price_mxn: number;
  billing_period: string;
  features: string[];
  display_order: number;
}

const Pricing = () => {
  const navigate = useNavigate();

  const { data: plans, isLoading } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as SubscriptionPlan[];
    },
  });

  const handleSelectPlan = (planId: string) => {
    // Por ahora solo redirige al dashboard, más adelante se integrará Stripe
    navigate("/dashboard");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando planes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Elige tu plan de nutrición
          </h1>
          <p className="text-xl text-muted-foreground">
            Comienza tu viaje hacia una mejor alimentación
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans?.map((plan, index) => (
            <Card
              key={plan.id}
              className={`relative flex flex-col ${
                index === 1 ? "border-primary shadow-lg scale-105" : ""
              }`}
            >
              {index === 1 && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Más Popular
                </Badge>
              )}
              
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>
                  <span className="text-4xl font-bold text-foreground">
                    ${plan.price_mxn}
                  </span>
                  <span className="text-muted-foreground"> MXN/mes</span>
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  variant={index === 1 ? "default" : "outline"}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  Seleccionar Plan
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>Todos los planes incluyen acceso completo a la plataforma</p>
          <p className="mt-2">Puedes cancelar en cualquier momento</p>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
