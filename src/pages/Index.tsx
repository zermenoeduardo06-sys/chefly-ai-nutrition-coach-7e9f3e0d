import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-nutrition.jpg";
import coachMascot from "@/assets/coach-mascot.png";
import testimonial1 from "@/assets/testimonial-1.jpg";
import testimonial2 from "@/assets/testimonial-2.jpg";
import testimonial3 from "@/assets/testimonial-3.jpg";
import { Utensils, Brain, TrendingUp, Clock, Star, Users, CheckCircle2, Sparkles, ChefHat, Calendar, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { InteractiveDemoSection } from "@/components/InteractiveDemoSection";
import { ContactForm } from "@/components/ContactForm";

interface SubscriptionPlan {
  id: string;
  name: string;
  price_mxn: number;
  billing_period: string;
  features: string[];
  display_order: number;
  coming_soon?: boolean;
  is_active: boolean;
}
const Index = () => {
  const navigate = useNavigate();

  const { data: plans } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .or("is_active.eq.true,coming_soon.eq.true")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as SubscriptionPlan[];
    },
  });
  const stats = [{
    number: "50K+",
    label: "Usuarios activos",
    icon: Users
  }, {
    number: "2M+",
    label: "Comidas generadas",
    icon: Utensils
  }, {
    number: "4.9/5",
    label: "Calificación",
    icon: Star
  }, {
    number: "95%",
    label: "Éxito comprobado",
    icon: TrendingUp
  }];
  const features = [{
    icon: Brain,
    title: "IA Personalizada",
    description: "Menús adaptados a tus objetivos y preferencias"
  }, {
    icon: Utensils,
    title: "Recetas Deliciosas",
    description: "Comidas saludables que te encantarán"
  }, {
    icon: TrendingUp,
    title: "Alcanza tus Metas",
    description: "Bajar grasa, ganar músculo o comer saludable"
  }, {
    icon: Clock,
    title: "Ahorra Tiempo",
    description: "Lista de compras automática cada semana"
  }];
  const steps = [{
    number: "01",
    icon: ChefHat,
    title: "Cuéntanos tus objetivos",
    description: "Responde unas preguntas sobre tu estilo de vida y metas"
  }, {
    number: "02",
    icon: Sparkles,
    title: "IA genera tu menú",
    description: "Recibe un plan semanal personalizado al instante"
  }, {
    number: "03",
    icon: Calendar,
    title: "Disfruta y progresa",
    description: "Sigue tu plan, chatea con tu coach y alcanza tus metas"
  }];
  const testimonials = [{
    name: "María González",
    role: "Bajó 8kg en 2 meses",
    image: testimonial1,
    rating: 5,
    text: "Chefly.AI cambió mi vida. Los menús son deliciosos y fáciles de seguir. ¡Perdí peso sin sufrir!"
  }, {
    name: "Carlos Ramírez",
    role: "Ganó 5kg de músculo",
    image: testimonial2,
    rating: 5,
    text: "Como atleta, necesitaba una nutrición precisa. La IA me creó el plan perfecto para mis entrenamientos."
  }, {
    name: "Ana Martínez",
    role: "Mejoró su salud",
    image: testimonial3,
    rating: 5,
    text: "Tengo diabetes y el coach nutricional me ayudó a comer mejor. Mis análisis mejoraron increíblemente."
  }];
  return <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Gradient waves */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-background"></div>
          
          {/* Animated wave shapes */}
          <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-primary/10 to-transparent" 
               style={{
                 clipPath: "ellipse(100% 100% at 50% 100%)"
               }}></div>
          
          {/* Decorative circles */}
          <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 blur-2xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-48 h-48 rounded-full bg-gradient-to-br from-secondary/15 to-primary/15 blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
          <div className="absolute bottom-20 left-1/4 w-24 h-24 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 blur-xl animate-pulse" style={{ animationDelay: "2s" }}></div>
          
          {/* Small decorative stars/sparkles */}
          <div className="absolute top-32 right-1/4 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          <div className="absolute top-64 right-1/3 w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" style={{ animationDelay: "0.5s" }}></div>
          <div className="absolute bottom-40 left-1/3 w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "1.5s" }}></div>
        </div>
        
        <div className="container mx-auto px-4 py-20 lg:py-32 relative z-10">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6 lg:space-y-8 animate-fade-in order-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-primary font-semibold text-sm">
                  Prueba gratis 4 días sin tarjeta
                </span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Chefly.AI
                </span>
              </h1>
              
              <p className="text-2xl lg:text-3xl font-semibold text-foreground/90">
                Tu entrenador alimenticio con IA
              </p>
              
              <p className="text-lg text-muted-foreground max-w-xl">
                Recibe menús semanales personalizados, habla con tu coach virtual 
                y alcanza tus objetivos de salud de forma simple y deliciosa.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="hero" size="lg" className="text-lg px-8 py-6 h-auto group" onClick={() => navigate("/auth")}>
                  Comienza gratis
                  <Sparkles className="ml-2 w-5 h-5 group-hover:rotate-12 transition-transform" />
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 py-6 h-auto" onClick={() => navigate("/auth")}>
                  Iniciar sesión
                </Button>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-secondary" />
                  <span>Sin tarjeta requerida</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-secondary" />
                  <span>4 días de prueba</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-secondary" />
                  <span>Cancela cuando quieras</span>
                </div>
              </div>
            </div>

            <div className="relative flex items-center justify-center order-2">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl -z-10 animate-pulse"></div>
              <img 
                src={coachMascot} 
                alt="Chefly.AI Coach - Tu entrenador nutricional personal" 
                className="w-full max-w-sm md:max-w-md lg:max-w-lg drop-shadow-2xl animate-fade-in hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-primary/5 to-secondary/5 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => <div key={index} className="text-center space-y-2 group animate-fade-in" style={{
            animationDelay: `${index * 100}ms`
          }}>
                <stat.icon className="w-8 h-8 mx-auto text-primary group-hover:scale-110 transition-transform" />
                <div className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>)}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              Proceso simple
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold">
              Cómo funciona{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Chefly.AI
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tres pasos simples para transformar tu alimentación
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => <div key={index} className="relative group">
                <Card className="h-full border-border/50 hover:shadow-[0_8px_30px_rgb(255,99,71,0.15)] transition-all hover:-translate-y-2 bg-gradient-to-br from-card to-card/50">
                  <CardContent className="p-8 space-y-4">
                    <div className="text-6xl font-bold text-primary/10 absolute top-4 right-4">
                      {step.number}
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center group-hover:scale-110 transition-transform">
                      <step.icon className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h3 className="text-2xl font-semibold">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
                {index < steps.length - 1 && <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary to-secondary opacity-30"></div>}
              </div>)}
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <InteractiveDemoSection />

      {/* Features Section */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">
            ¿Por qué elegir{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Chefly.AI
            </span>
            ?
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => <div key={index} className="group p-8 rounded-2xl bg-card border border-border hover:shadow-[0_8px_30px_rgb(255,99,71,0.15)] transition-all hover:-translate-y-1 animate-fade-in" style={{
            animationDelay: `${index * 100}ms`
          }}>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>)}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              Planes y precios
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold">
              Elige tu{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                plan perfecto
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comienza tu viaje hacia una mejor alimentación con el plan que mejor se adapte a ti
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans?.map((plan, index) => (
              <Card
                key={plan.id}
                className={`relative flex flex-col border-border/50 hover:shadow-[0_8px_30px_rgb(255,99,71,0.15)] transition-all hover:-translate-y-2 bg-gradient-to-br from-card to-card/50 animate-fade-in ${
                  index === 1 ? "md:scale-105 border-primary shadow-lg" : ""
                } ${plan.coming_soon ? "opacity-90" : ""}`}
                style={{
                  animationDelay: `${index * 150}ms`
                }}
              >
                {plan.coming_soon ? (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-muted to-muted-foreground">
                    Próximamente
                  </Badge>
                ) : index === 1 && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-secondary">
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
                    variant={index === 1 && !plan.coming_soon ? "default" : "outline"}
                    onClick={() => navigate("/auth")}
                    disabled={plan.coming_soon}
                  >
                    {plan.coming_soon ? "Próximamente" : "Comenzar ahora"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center text-sm text-muted-foreground space-y-2">
            <p>🎉 4 días de prueba gratis en todos los planes</p>
            <p>✨ Cancela en cualquier momento sin compromiso</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              Testimonios reales
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold">
              Lo que dicen nuestros{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                usuarios
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Miles de personas ya transformaron su vida con Chefly.AI
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => <Card key={index} className="border-border/50 hover:shadow-[0_8px_30px_rgb(255,99,71,0.15)] transition-all hover:-translate-y-2 bg-gradient-to-br from-card to-card/50 animate-fade-in" style={{
            animationDelay: `${index * 150}ms`
          }}>
                <CardContent className="p-6 space-y-4">
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => <Star key={i} className="w-5 h-5 fill-primary text-primary" />)}
                  </div>
                  <p className="text-muted-foreground italic">"{testimonial.text}"</p>
                  <div className="flex items-center gap-4 pt-4 border-t border-border/50">
                    <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20" />
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 border-y border-border/50 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-secondary" />
              <span className="font-medium">100% Seguro</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-secondary" />
              <span className="font-medium">Datos Encriptados</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-secondary" />
              <span className="font-medium">Soporte 24/7</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-secondary" />
              <span className="font-medium">Garantía de Satisfacción</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8 p-12 rounded-3xl bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/5 border border-primary/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 blur-3xl"></div>
            <div className="relative z-10 space-y-8">
              <Badge variant="secondary" className="px-4 py-2">
                <Sparkles className="w-4 h-4 inline mr-2" />
                Oferta especial
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-bold">
                Empieza tu transformación hoy
              </h2>
              <p className="text-xl text-muted-foreground">
                Únete a miles de personas que ya están comiendo mejor y sintiéndose increíbles
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="hero" size="lg" className="text-lg px-12 py-6 h-auto group" onClick={() => navigate("/auth")}>
                  Prueba gratis por 4 días
                  <Sparkles className="ml-2 w-5 h-5 group-hover:rotate-12 transition-transform" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                🎉 Sin compromiso • 🚫 Sin tarjeta • ✨ Cancela cuando quieras
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 space-y-4">
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              Contacto
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold">
              ¿Necesitas{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                ayuda?
              </span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Estamos aquí para responder tus preguntas
            </p>
          </div>
          
          <ContactForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/50 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <ChefHat className="w-6 h-6 text-primary" />
                Chefly AI
              </h3>
              <p className="text-sm text-muted-foreground">
                Tu coach de nutrición con inteligencia artificial. Come mejor, vive mejor.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Enlaces Rápidos</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <button onClick={() => navigate("/pricing")} className="hover:text-foreground transition-colors">
                    Planes y Precios
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate("/faq")} className="hover:text-foreground transition-colors">
                    Preguntas Frecuentes
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate("/auth")} className="hover:text-foreground transition-colors">
                    Iniciar Sesión
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <button onClick={() => navigate("/privacy")} className="hover:text-foreground transition-colors">
                    Política de Privacidad
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate("/terms")} className="hover:text-foreground transition-colors">
                    Términos y Condiciones
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Chefly AI Nutrition Coach. Todos los derechos reservados.</p>
            <p className="mt-2 text-xs">
              Esta aplicación no proporciona asesoramiento médico. Consulte con un profesional de la salud antes de hacer cambios dietéticos significativos.
            </p>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;