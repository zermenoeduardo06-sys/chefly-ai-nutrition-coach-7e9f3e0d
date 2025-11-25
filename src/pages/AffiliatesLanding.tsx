import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { DollarSign, TrendingUp, Users, Zap, CheckCircle2, Link2, Award, Medal, Crown, Star, Gem, Home, LogIn, Shield, Clock, BarChart3, Lock, MessageCircle } from "lucide-react";

export default function AffiliatesLanding() {
  const navigate = useNavigate();

  const stats = [
    {
      value: "500+",
      label: "Afiliados Activos"
    },
    {
      value: "$2M+",
      label: "Pagado a Afiliados"
    },
    {
      value: "10,000+",
      label: "Ventas Generadas"
    },
    {
      value: "98%",
      label: "Tasa de Satisfacción"
    }
  ];

  const testimonials = [
    {
      name: "María González",
      role: "Influencer de Nutrición",
      earnings: "$12,500 MXN/mes",
      quote: "Chefly me ha permitido monetizar mi audiencia de forma natural. Mis seguidores valoran las recomendaciones y yo genero ingresos constantes.",
      avatar: "MG"
    },
    {
      name: "Carlos Ramírez",
      role: "Blogger de Fitness",
      earnings: "$8,300 MXN/mes",
      quote: "El dashboard es súper completo y los pagos siempre llegan a tiempo. Llevo 6 meses como afiliado y cada mes gano más.",
      avatar: "CR"
    },
    {
      name: "Ana Martínez",
      role: "Coach de Salud",
      earnings: "$15,200 MXN/mes",
      quote: "Lo mejor es que el producto se vende solo. Mis clientes aman Chefly y yo recibo comisiones recurrentes cada mes.",
      avatar: "AM"
    }
  ];

  const faqs = [
    {
      question: "¿Cuánto puedo ganar como afiliado?",
      answer: "Tus ganancias dependen del número de ventas que generes. Con comisiones de 20-25% y un sistema de bonos por niveles, los afiliados activos ganan entre $5,000 y $20,000 MXN mensuales. Los afiliados top superan los $50,000 MXN al mes."
    },
    {
      question: "¿Cuándo y cómo recibo mis pagos?",
      answer: "Puedes solicitar un pago cuando alcances $200 MXN de saldo. Procesamos pagos en 3-5 días hábiles vía PayPal o transferencia bancaria (SPEI). Todos los pagos están protegidos y verificados."
    },
    {
      question: "¿Hay algún costo para unirme?",
      answer: "No. El programa de afiliados de Chefly es 100% gratuito. No hay cuotas de inscripción, ni costos ocultos, ni mínimos de venta requeridos."
    },
    {
      question: "¿Qué pasa si mis referidos cancelan su suscripción?",
      answer: "Las comisiones se calculan sobre pagos completados. Si un cliente cancela antes del primer pago, no se genera comisión. Sin embargo, si ya pagó al menos un mes, tu comisión queda confirmada."
    },
    {
      question: "¿Puedo promocionar Chefly en redes sociales?",
      answer: "¡Por supuesto! Proporcionamos materiales de marketing diseñados específicamente para redes sociales, blogs y email. Puedes compartir tu enlace de afiliado en cualquier plataforma."
    },
    {
      question: "¿Cómo sé si mis enlaces están funcionando?",
      answer: "Tu dashboard muestra estadísticas en tiempo real: clicks, conversiones, ventas pendientes, comisiones ganadas y más. Puedes monitorear todo 24/7."
    },
    {
      question: "¿Hay soporte para afiliados?",
      answer: "Sí. Todos los afiliados tienen acceso a soporte prioritario por email y chat. Los afiliados de nivel Oro y superiores cuentan con un gestor dedicado."
    },
    {
      question: "¿Puedo ser afiliado si vivo fuera de México?",
      answer: "Actualmente el programa está diseñado para México, pero aceptamos afiliados internacionales que puedan recibir pagos vía PayPal en MXN."
    }
  ];

  const guarantees = [
    {
      icon: Shield,
      title: "Pagos Garantizados",
      description: "Pagos puntuales cada vez que lo solicites. Sin trucos ni letras pequeñas."
    },
    {
      icon: Lock,
      title: "Datos Seguros",
      description: "Información bancaria y de pago protegida con encriptación de nivel bancario."
    },
    {
      icon: Clock,
      title: "Procesamiento Rápido",
      description: "Pagos procesados en 3-5 días hábiles máximo."
    },
    {
      icon: BarChart3,
      title: "Transparencia Total",
      description: "Dashboard con métricas en tiempo real. Siempre sabes cuánto has ganado."
    }
  ];

  const benefits = [
    {
      icon: DollarSign,
      title: "Comisiones Atractivas",
      description: "Gana hasta 25% de comisión por cada venta que generes"
    },
    {
      icon: TrendingUp,
      title: "Pagos Puntuales",
      description: "Retira tus ganancias cuando alcances el mínimo de $200 MXN"
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
      description: "Solicita tu pago cuando alcances $200 MXN vía PayPal o transferencia bancaria"
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
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Chefly Afiliados
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
            >
              <Home className="h-4 w-4 mr-2" />
              Inicio
            </Button>
            <Button
              variant="default"
              onClick={() => navigate("/affiliates/login")}
            >
              <LogIn className="h-4 w-4 mr-2" />
              Acceder
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-b from-primary/10 to-background">
        <div className="max-w-6xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4 text-sm py-2 px-4">
            <CheckCircle2 className="h-4 w-4 mr-2 inline" />
            Programa Verificado y Confiable
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
            Programa de Afiliados Chefly
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Gana dinero compartiendo la mejor plataforma de planes nutricionales personalizados con IA
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6"
              onClick={() => navigate("/affiliates/login")}
            >
              Únete Ahora - Es Gratis
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 py-6"
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Ver Cómo Funciona
            </Button>
          </div>
          
          {/* Trust Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guarantees Section */}
      <section className="py-16 px-4 border-y border-border bg-card">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-6">
            {guarantees.map((guarantee, index) => (
              <div key={index} className="text-center">
                <guarantee.icon className="h-10 w-10 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-2 text-foreground">{guarantee.title}</h3>
                <p className="text-sm text-muted-foreground">{guarantee.description}</p>
              </div>
            ))}
          </div>
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
      <section id="how-it-works" className="py-16 px-4">
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

      {/* Testimonials Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
            Historias de Éxito
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Afiliados reales compartiendo sus resultados
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-2">
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                      <CardDescription>{testimonial.role}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className="w-fit">
                    <DollarSign className="h-3 w-3 mr-1" />
                    {testimonial.earnings}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground italic">"{testimonial.quote}"</p>
                  <div className="flex gap-1 mt-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features List */}
      <section className="py-16 px-4">
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

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
            Preguntas Frecuentes
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            Resuelve todas tus dudas antes de unirte
          </p>
          
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            ¿Listo para Empezar a Ganar?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Únete a más de 500 afiliados que ya generan ingresos con Chefly
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              size="lg" 
              variant="secondary"
              className="text-lg px-8 py-6"
              onClick={() => navigate("/affiliates/login")}
            >
              <Link2 className="mr-2 h-5 w-5" />
              Registrarme como Afiliado
            </Button>
          </div>
          <div className="flex items-center justify-center gap-6 text-sm opacity-90">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>100% Gratis</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Sin Compromiso</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>Pagos Garantizados</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          <p>© 2024 Chefly. Todos los derechos reservados.</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <MessageCircle className="h-4 w-4" />
            <span>¿Necesitas ayuda? Escríbenos a afiliados@chefly.com</span>
          </div>
        </div>
      </footer>
    </div>
  );
}