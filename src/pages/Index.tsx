import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
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
import { useAffiliateTracking } from "@/hooks/useAffiliateTracking";
import { AffiliatePromoBanner } from "@/components/AffiliatePromoBanner";
import { HeroParticles } from "@/components/HeroParticles";
import { LandingNavbar } from "@/components/LandingNavbar";

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
  const [isNativeRedirecting, setIsNativeRedirecting] = useState(false);
  
  // Redirect to auth for native mobile apps (skip landing page completely)
  useEffect(() => {
    const checkNativeAndAuth = async () => {
      if (Capacitor.isNativePlatform()) {
        setIsNativeRedirecting(true);
        // Check if already logged in
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          navigate("/dashboard", { replace: true });
        } else {
          navigate("/auth", { replace: true });
        }
      }
    };
    checkNativeAndAuth();
  }, [navigate]);

  // Don't render anything for native mobile - show loading while redirecting
  if (Capacitor.isNativePlatform() || isNativeRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

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
      {/* Premium Navigation Bar */}
      <LandingNavbar />
      
      {/* Hero Section */}
      <main>
      <section className="relative overflow-hidden min-h-[85vh] sm:min-h-[90vh]" aria-labelledby="hero-heading">
        {/* Animated Particles Background with Parallax */}
        <HeroParticles />
        
        <div className="container mx-auto px-4 pt-20 pb-12 sm:py-20 lg:py-32 relative z-10">
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
            {/* Mobile: Mascot first, then content */}
            <div className="relative flex items-center justify-center order-1 md:order-2">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl -z-10 animate-pulse"></div>
              <img 
                src={coachMascot} 
                alt="Chefly.AI Coach - Tu entrenador nutricional personal" 
                className="w-48 sm:w-64 md:w-full max-w-sm md:max-w-md lg:max-w-lg drop-shadow-2xl animate-fade-in hover:scale-105 transition-transform duration-500"
              />
            </div>

            <div className="space-y-4 sm:space-y-6 lg:space-y-8 animate-fade-in order-2 md:order-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 rounded-full">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                <span className="text-primary font-semibold text-xs sm:text-sm">
                  {t("hero.trial")}
                </span>
              </div>
              
              <h1 id="hero-heading" className="text-4xl sm:text-5xl lg:text-7xl leading-tight">
                <span className="font-brand font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent tracking-tight">
                  Chefly.AI
                </span>
              </h1>
              
              <p className="text-xl sm:text-2xl lg:text-3xl font-semibold text-foreground/90">
                {t("hero.title")}
              </p>
              
              <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto md:mx-0">
                {t("hero.subtitle")}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start">
                <Button variant="hero" size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 h-auto group" onClick={() => navigate("/auth")}>
                  {t("hero.cta")}
                  <Sparkles className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-12 transition-transform" />
                </Button>
                <Button variant="outline" size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 h-auto" onClick={() => navigate("/auth")}>
                  {t("nav.login")}
                </Button>
              </div>

              <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground justify-center md:justify-start">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-secondary shrink-0" />
                  <span>{t("hero.noCardRequired")}</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-secondary shrink-0" />
                  <span>{t("hero.trialDays")}</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-secondary shrink-0" />
                  <span>{t("hero.cancelAnytime")}</span>
                </div>
              </div>

              {/* Product Hunt Badge */}
              <div className="pt-2 sm:pt-4 flex justify-center md:justify-start">
                <a 
                  href="https://www.producthunt.com/products/chefly-ai?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-chefly-ai" 
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img 
                    src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1045239&theme=light&t=1764774216974" 
                    alt="Chefly.AI - AI nutrition coach with personalized meal plans | Product Hunt" 
                    width="200" 
                    height="43"
                    className="hover:opacity-90 transition-opacity sm:w-[250px] sm:h-[54px]"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-10 sm:py-16 bg-gradient-to-r from-primary/5 to-secondary/5 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            {stats.map((stat, index) => <div key={index} className="text-center space-y-1 sm:space-y-2 group animate-fade-in" style={{
            animationDelay: `${index * 100}ms`
          }}>
                <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-primary group-hover:scale-110 transition-transform" />
                <div className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>)}
          </div>
        </div>
      </section>

      {/* Affiliate Promo Banner */}
      <AffiliatePromoBanner />

      {/* How It Works Section */}
      <section id="how-it-works" className="py-12 sm:py-20 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 sm:mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              {t("how.title")}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => <div key={index} className="relative group">
                <Card className="h-full border-border/50 hover:shadow-[0_8px_30px_rgb(255,99,71,0.15)] transition-all hover:-translate-y-2 bg-gradient-to-br from-card to-card/50">
                  <CardContent className="p-5 sm:p-8 space-y-3 sm:space-y-4">
                    <div className="text-4xl sm:text-6xl font-bold text-primary/10 absolute top-3 sm:top-4 right-3 sm:right-4">
                      {step.number}
                    </div>
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center group-hover:scale-110 transition-transform">
                      <step.icon className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold">{step.title}</h3>
                    <p className="text-sm sm:text-base text-muted-foreground">{step.description}</p>
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
      <section id="features" className="py-12 sm:py-20 bg-card/50 scroll-mt-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-10 sm:mb-16">
            {t("features.title")}
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {features.map((feature, index) => <div key={index} className="group p-4 sm:p-8 rounded-xl sm:rounded-2xl bg-card border border-border hover:shadow-[0_8px_30px_rgb(255,99,71,0.15)] transition-all hover:-translate-y-1 animate-fade-in" style={{
            animationDelay: `${index * 100}ms`
          }}>
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-5 h-5 sm:w-7 sm:h-7 text-primary-foreground" />
                </div>
                <h3 className="text-base sm:text-xl font-semibold mb-2 sm:mb-3">{feature.title}</h3>
                <p className="text-xs sm:text-base text-muted-foreground">{feature.description}</p>
              </div>)}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-12 sm:py-20 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 sm:mb-16 space-y-3 sm:space-y-4">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              {t("pricing.title")}
            </h2>
            <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto">
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
      <section id="testimonials" className="py-12 sm:py-20 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 sm:mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              {t("testimonials.title")}
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => <Card key={index} className="border-border/50 hover:shadow-[0_8px_30px_rgb(255,99,71,0.15)] transition-all hover:-translate-y-2 bg-gradient-to-br from-card to-card/50 animate-fade-in" style={{
            animationDelay: `${index * 150}ms`
          }}>
                <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                  <div className="flex gap-0.5 sm:gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-primary text-primary" />)}
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground italic">"{testimonial.text}"</p>
                  <div className="flex items-center gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-border/50">
                    <img src={testimonial.image} alt={testimonial.name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover ring-2 ring-primary/20" />
                    <div>
                      <div className="font-semibold text-sm sm:text-base">{testimonial.name}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-8 sm:py-12 border-y border-border/50 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center items-center gap-4 sm:gap-8 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-secondary shrink-0" />
              <span className="font-medium">100% Seguro</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-secondary shrink-0" />
              <span className="font-medium">Datos Encriptados</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-secondary shrink-0" />
              <span className="font-medium">Soporte 24/7</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-secondary shrink-0" />
              <span className="font-medium">Satisfacción Garantizada</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8 p-6 sm:p-12 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/5 border border-primary/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 blur-3xl"></div>
            <div className="relative z-10 space-y-5 sm:space-y-8">
              <Badge variant="secondary" className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-1.5 sm:mr-2" />
                Oferta especial
              </Badge>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold">
                Empieza tu transformación hoy
              </h2>
              <p className="text-base sm:text-xl text-muted-foreground">
                Únete a miles de personas que ya están comiendo mejor y sintiéndose increíbles
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="hero" size="lg" className="text-base sm:text-lg px-8 sm:px-12 py-5 sm:py-6 h-auto group" onClick={() => navigate("/auth")}>
                  Prueba gratis por 4 días
                  <Sparkles className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-12 transition-transform" />
                </Button>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                🎉 Sin compromiso • 🚫 Sin tarjeta • ✨ Cancela cuando quieras
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 sm:py-20 bg-muted/30" aria-labelledby="features-heading">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12 space-y-3 sm:space-y-4">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              {t("contact.title")}
            </h2>
            <p className="text-base sm:text-xl text-muted-foreground">
              {t("contact.subtitle")}
            </p>
          </div>
          
          <ContactForm />
        </div>
      </section>

      </main>
      
      {/* Footer */}
      <footer className="bg-muted/50 border-t border-border" role="contentinfo">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="col-span-2 md:col-span-1 space-y-3 sm:space-y-4">
              <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Chefly.AI
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Tu coach nutricional inteligente para una vida más saludable.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Enlaces Rápidos</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
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
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Legal</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
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
          <div className="pt-6 sm:pt-8 border-t border-border/50 text-center text-xs sm:text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Chefly AI Nutrition Coach. Todos los derechos reservados.</p>
            <p className="mt-2 text-[10px] sm:text-xs">
              Esta aplicación no proporciona asesoramiento médico. Consulte con un profesional de la salud antes de hacer cambios dietéticos significativos.
            </p>
          </div>
        </div>
      </footer>
    </div>
  </>;
};
export default Index;