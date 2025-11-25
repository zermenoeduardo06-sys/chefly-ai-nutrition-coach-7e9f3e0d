import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Target, TrendingUp, Users } from "lucide-react";

export function AffiliateQuickGuide() {
  const tips = [
    {
      icon: Target,
      title: "Define tu Audiencia",
      description: "Enfócate en personas interesadas en salud, fitness o nutrición.",
    },
    {
      icon: Users,
      title: "Comparte Contenido de Valor",
      description: "Crea contenido educativo sobre nutrición y vida saludable antes de promocionar.",
    },
    {
      icon: TrendingUp,
      title: "Usa Múltiples Canales",
      description: "Promociona en redes sociales, blog, email, y comunidades relevantes.",
    },
    {
      icon: CheckCircle2,
      title: "Sé Auténtico",
      description: "Comparte tu experiencia real con NutriPlan para generar confianza.",
    },
  ];

  const bestPractices = [
    "Incluye tu código de afiliado en todos tus enlaces",
    "Comparte testimonios y resultados (con permiso)",
    "Crea contenido regular sobre nutrición",
    "Responde preguntas de tu audiencia",
    "Participa en grupos de salud y fitness",
    "Usa historias de Instagram/Facebook para promocionar",
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Guía Rápida de Éxito</CardTitle>
          <CardDescription>
            Tips y mejores prácticas para maximizar tus ganancias
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {tips.map((tip, index) => (
              <div key={index} className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <tip.icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">{tip.title}</h4>
                  <p className="text-sm text-muted-foreground">{tip.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Mejores Prácticas</h3>
            <ul className="space-y-2">
              {bestPractices.map((practice, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>{practice}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              💡 Consejo Pro
            </h4>
            <p className="text-sm text-muted-foreground">
              Los afiliados más exitosos crean contenido educativo valioso primero y 
              luego introducen NutriPlan como una solución natural. No vendas, ayuda.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
