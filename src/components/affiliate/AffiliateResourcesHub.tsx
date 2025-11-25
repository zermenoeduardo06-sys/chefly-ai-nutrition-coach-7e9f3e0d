import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, FileText, Video, BookOpen, MessageSquare } from "lucide-react";

export function AffiliateResourcesHub() {
  const resources = [
    {
      icon: FileText,
      title: "Documentación Completa",
      description: "Guías detalladas sobre cómo funciona el programa de afiliados",
      action: "Ver Documentación",
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      icon: Video,
      title: "Video Tutoriales",
      description: "Aprende a promocionar efectivamente con nuestros videos",
      action: "Ver Videos",
      color: "bg-purple-500/10 text-purple-600",
    },
    {
      icon: BookOpen,
      title: "Blog de Afiliados",
      description: "Casos de éxito y consejos de marketing",
      action: "Leer Blog",
      color: "bg-green-500/10 text-green-600",
    },
    {
      icon: MessageSquare,
      title: "Comunidad de Afiliados",
      description: "Conéctate con otros afiliados y comparte estrategias",
      action: "Unirse",
      color: "bg-orange-500/10 text-orange-600",
    },
  ];

  const faqItems = [
    {
      q: "¿Cuándo recibo mis comisiones?",
      a: "Las comisiones se aprueban automáticamente y puedes solicitar retiros cuando alcances $200 MXN.",
    },
    {
      q: "¿Puedo usar mi propio enlace?",
      a: "Sí, puedes comprar con tu propio código de afiliado y obtener comisiones.",
    },
    {
      q: "¿Las comisiones son recurrentes?",
      a: "Sí, ganas comisión por cada pago de suscripción mientras el cliente permanezca activo.",
    },
    {
      q: "¿Hay límite de ganancias?",
      a: "No hay límite. Mientras más promuevas y más ventas generes, más ganas.",
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Centro de Recursos</CardTitle>
          <CardDescription>
            Todo lo que necesitas para tener éxito como afiliado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {resources.map((resource, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg ${resource.color} flex items-center justify-center`}>
                    <resource.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{resource.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      {resource.description}
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      {resource.action}
                      <ExternalLink className="h-3 w-3 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Preguntas Frecuentes</h3>
            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <div key={index} className="border-l-2 border-primary pl-4">
                  <h4 className="font-semibold text-sm mb-1">{item.q}</h4>
                  <p className="text-sm text-muted-foreground">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
