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
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useAffiliateTracking } from "@/hooks/useAffiliateTracking";
import { AffiliatePromoBanner } from "@/components/AffiliatePromoBanner";

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
  const { t } = useLanguage();
  
  // Activar tracking de afiliados
  useAffiliateTracking();

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
    label: t("stats.users"),
    icon: Users
  }, {
    number: "2M+",
    label: t("stats.meals"),
    icon: Utensils
  }, {
    number: "4.9/5",
    label: t("stats.rating"),
    icon: Star
  }, {
    number: "95%",
    label: t("stats.success"),
    icon: TrendingUp
  }];
  const features = [{
    icon: Brain,
    title: t("features.ai.title"),
    description: t("features.ai.desc")
  }, {
    icon: Utensils,
    title: t("features.recipes.title"),
    description: t("features.recipes.desc")
  }, {
    icon: TrendingUp,
    title: t("features.goals.title"),
    description: t("features.goals.desc")
  }, {
    icon: Clock,
    title: t("features.time.title"),
    description: t("features.time.desc")
  }];
  const steps = [{
    number: "01",
    icon: ChefHat,
    title: t("how.step1.title"),
    description: t("how.step1.desc")
  }, {
    number: "02",
    icon: Sparkles,
    title: t("how.step2.title"),
    description: t("how.step2.desc")
  }, {
    number: "03",
    icon: Calendar,
    title: t("how.step3.title"),
    description: t("how.step3.desc")
  }];
  const testimonials = [{
    name: t("testimonials.1.name"),
    role: t("testimonials.1.role"),
    image: testimonial1,
    rating: 5,
    text: t("testimonials.1.text")
  }, {
    name: t("testimonials.2.name"),
    role: t("testimonials.2.role"),
    image: testimonial2,
    rating: 5,
    text: t("testimonials.2.text")
  }, {
    name: t("testimonials.3.name"),
    role: t("testimonials.3.role"),
    image: testimonial3,
    rating: 5,
    text: t("testimonials.3.text")
  }];
  return <>
    {/* JSON-LD Structured Data */}
    <script type="application/ld+json">
      {JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Chefly.AI",
        "description": "Coach nutricional personalizado con inteligencia artificial para planes alimenticios y recetas saludables",
        "url": "https://chefly.ai",
        "applicationCategory": "HealthApplication",
        "operatingSystem": "Web",
        "offers": {
          "@type": "AggregateOffer",
          "priceCurrency": "MXN",
          "lowPrice": plans?.[0]?.price_mxn || "0",
          "highPrice": plans?.[plans.length - 1]?.price_mxn || "999",
          "offerCount": plans?.length || 3
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "ratingCount": "50000",
          "bestRating": "5",
          "worstRating": "1"
        },
        "provider": {
          "@type": "Organization",
          "name": "Chefly.AI",
          "url": "https://chefly.ai"
        }
      })}
    </script>
    
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Navigation Bar */}
      <header>
        <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50" role="navigation" aria-label="Main navigation">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <span className="text-3xl font-brand bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Chefly.AI
            </span>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate("/auth")}
              >
                {t("nav.login")}
              </Button>
              <LanguageToggle />
            </div>
          </div>
        </nav>
      </header>
      
      {/* Hero Section */}
      <main>
      <section className="relative overflow-hidden" aria-labelledby="hero-heading">
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
                  {t("hero.trial")}
                </span>
              </div>
              
              <h1 id="hero-heading" className="text-5xl lg:text-7xl leading-tight">
                <span className="font-brand bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Chefly.AI
                </span>
              </h1>
              
              <p className="text-2xl lg:text-3xl font-semibold text-foreground/90">
                {t("hero.title")}
              </p>
              
              <p className="text-lg text-muted-foreground max-w-xl">
                {t("hero.subtitle")}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="hero" size="lg" className="text-lg px-8 py-6 h-auto group" onClick={() => navigate("/auth")}>
                  {t("hero.cta")}
                  <Sparkles className="ml-2 w-5 h-5 group-hover:rotate-12 transition-transform" />
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 py-6 h-auto" onClick={() => navigate("/auth")}>
                  {t("nav.login")}
                </Button>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-secondary" />
                  <span>{t("hero.noCardRequired")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-secondary" />
                  <span>{t("hero.trialDays")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-secondary" />
                  <span>{t("hero.cancelAnytime")}</span>
                </div>
              </div>

              {/* Product Hunt Badge */}
              <div className="pt-4">
                <a 
                  href="https://www.producthunt.com/products/chefly-ai?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-chefly-ai" 
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img 
                    src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1045239&theme=light&t=1764774216974" 
                    alt="Chefly.AI - AI nutrition coach with personalized meal plans | Product Hunt" 
                    width="250" 
                    height="54"
                    className="hover:opacity-90 transition-opacity"
                  />
                </a>
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

      {/* Affiliate Promo Banner */}
      <AffiliatePromoBanner />

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold">
              {t("how.title")}
            </h2>
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
            {t("features.title")}
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
            <h2 className="text-4xl lg:text-5xl font-bold">
              {t("pricing.title")}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("pricing.subtitle")}
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
                    {t("pricing.comingSoon")}
                  </Badge>
                ) : index === 1 && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-secondary">
                    {t("pricing.mostPopular")}
                  </Badge>
                )}
                
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>
                    <span className="text-4xl font-bold text-foreground">
                      ${Math.round(plan.price_mxn / 20)}
                    </span>
                    <span className="text-muted-foreground"> USD/{t("pricing.month")}</span>
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
                    {plan.coming_soon ? t("pricing.comingSoon") : t("pricing.cta")}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center text-sm text-muted-foreground space-y-2">
            <p>🎉 {t("pricing.trialAllPlans")}</p>
            <p>✨ {t("pricing.cancelNoCommitment")}</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold">
              {t("testimonials.title")}
            </h2>
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
      <section className="py-20 bg-muted/30" aria-labelledby="features-heading">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold">
              {t("contact.title")}
            </h2>
            <p className="text-xl text-muted-foreground">
              {t("contact.subtitle")}
            </p>
          </div>
          
          <ContactForm />
        </div>
      </section>

      </main>
      
      {/* Footer */}
      <footer className="bg-muted/50 border-t border-border" role="contentinfo">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Chefly.AI
              </h3>
              <p className="text-muted-foreground text-sm">
                Tu coach nutricional inteligente para una vida más saludable.
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
                  <button onClick={() => navigate("/affiliates")} className="hover:text-foreground transition-colors">
                    Afiliados
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate("/faq")} className="hover:text-foreground transition-colors">
                    Preguntas Frecuentes
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate("/blog")} className="hover:text-foreground transition-colors">
                    Blog
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
    </div>
  </>;
};
export default Index;