import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { DollarSign, TrendingUp, Users, Zap, CheckCircle2, Link2, Award, Medal, Crown, Star, Gem } from "lucide-react";

export default function AffiliatesLanding() {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: DollarSign,
      title: "Comisiones Atractivas",
      description: "Gana hasta 25% de comisión por cada venta que generes"
    },
    {
      icon: TrendingUp,
      title: "Pagos Puntuales",
      description: "Retira tus ganancias cuando alcances el mínimo de $500 MXN"
    },
    {
      icon: Users,
      title: "Dashboard Completo",
      description: "Monitorea tus clicks, conversiones y ganancias en tiempo real"
    },
    {
      icon: Zap,
      title: "Fácil de Usar",
      description: "Obtén tu enlace personalizado y comienza a ganar en minutos"
    }
  ];

  const commissions = [
    {
      plan: "Plan Básico",
      price: "$239 MXN",
      commission: "20%",
      earnings: "$48 MXN"
    },
    {
      plan: "Plan Intermedio",
      price: "$289 MXN",
      commission: "25%",
      earnings: "$72.50 MXN"
    }
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Regístrate Gratis",
      description: "Completa el formulario de registro con tus datos y método de pago preferido"
    },
    {
      step: "2",
      title: "Obtén tu Enlace",
      description: "Recibe tu enlace de afiliado único para compartir en redes sociales, blogs o con tus contactos"
    },
    {
      step: "3",
      title: "Comparte y Gana",
      description: "Cada vez que alguien se suscriba usando tu enlace, ganas una comisión automáticamente"
    },
    {
      step: "4",
      title: "Retira tus Ganancias",
      description: "Solicita tu pago cuando alcances $500 MXN vía PayPal o transferencia bancaria"
    }
  ];

  const tiers = [
    {
      name: "Bronce",
      icon: Award,
      color: "#CD7F32",
      requirements: "Inicio",
      bonus: "+0%",
      benefits: ["Comisión base 20-25%", "Dashboard básico", "Materiales de marketing"]
    },
    {
      name: "Plata",
      icon: Medal,
      color: "#C0C0C0",
      requirements: "$10,000 MXN en ventas",
      bonus: "+5%",
      benefits: ["Comisión +5% adicional", "Soporte prioritario", "Materiales premium"]
    },
    {
      name: "Oro",
      icon: Crown,
      color: "#FFD700",
      requirements: "$50,000 MXN en ventas",
      bonus: "+10%",
      benefits: ["Comisión +10% adicional", "Gestor dedicado", "Acceso anticipado"]
    },
    {
      name: "Platino",
      icon: Star,
      color: "#E5E4E2",
      requirements: "$150,000 MXN en ventas",
      bonus: "+15%",
      benefits: ["Comisión +15% adicional", "Bonos trimestrales", "Co-marketing"]
    },
    {
      name: "Diamante",
      icon: Gem,
      color: "#B9F2FF",
      requirements: "$500,000 MXN en ventas",
      bonus: "+25%",
      benefits: ["Comisión +25% adicional", "Revenue share", "Eventos VIP"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-b from-primary/10 to-background">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
            Programa de Afiliados Chefly
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Gana dinero compartiendo la mejor plataforma de planes nutricionales personalizados con IA
          </p>
          <Button 
            size="lg" 
            className="text-lg px-8 py-6"
            onClick={() => navigate("/affiliates/register")}
          >
            Únete Ahora - Es Gratis
          </Button>
        </div>
      </section>

      {/* Commissions Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
            Estructura de Comisiones
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Gana comisiones competitivas por cada suscripción que generes
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {commissions.map((item, index) => (
              <Card key={index} className="border-2">
                <CardHeader>
                  <CardTitle className="text-2xl">{item.plan}</CardTitle>
                  <CardDescription className="text-lg">{item.price} mensuales</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
                      <span className="text-muted-foreground">Comisión</span>
                      <span className="text-2xl font-bold text-primary">{item.commission}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-lg">
                      <span className="text-muted-foreground">Ganas por venta</span>
                      <span className="text-2xl font-bold text-green-600 dark:text-green-400">{item.earnings}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
            Beneficios del Programa
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Todas las herramientas que necesitas para tener éxito como afiliado
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index}>
                <CardHeader>
                  <benefit.icon className="h-10 w-10 mb-4 text-primary" />
                  <CardTitle>{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tiers Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
            Sistema de Niveles
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Sube de nivel y aumenta tus comisiones mientras generas más ventas
          </p>
          
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
            {tiers.map((tier, index) => (
              <Card key={index} className="border-2 hover:border-primary transition-colors">
                <CardHeader className="text-center">
                  <tier.icon className="h-12 w-12 mx-auto mb-3" style={{ color: tier.color }} />
                  <CardTitle className="text-xl">{tier.name}</CardTitle>
                  <CardDescription className="text-sm">{tier.requirements}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="mb-4 p-3 bg-primary/10 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{tier.bonus}</div>
                    <div className="text-xs text-muted-foreground">bonificación</div>
                  </div>
                  <ul className="text-xs text-left space-y-1.5">
                    {tier.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="h-3 w-3 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              🚀 <strong>¡Progresa automáticamente!</strong> Tu nivel se actualiza automáticamente cuando alcanzas los requisitos
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
            ¿Cómo Funciona?
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Comienza a ganar en 4 simples pasos
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features List */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
            Todo lo que Incluye
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[
              "Dashboard con estadísticas en tiempo real",
              "Enlaces de afiliado personalizados",
              "Tracking automático de clicks y conversiones",
              "Reportes detallados de ventas",
              "Historial completo de pagos",
              "Soporte prioritario para afiliados",
              "Material promocional descargable",
              "Pagos seguros vía PayPal o transferencia"
            ].map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            ¿Listo para Empezar a Ganar?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Únete a nuestro programa de afiliados hoy y comienza a generar ingresos pasivos
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="text-lg px-8 py-6"
            onClick={() => navigate("/affiliates/register")}
          >
            <Link2 className="mr-2 h-5 w-5" />
            Registrarme como Afiliado
          </Button>
        </div>
      </section>
    </div>
  );
}