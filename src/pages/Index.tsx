import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-nutrition.jpg";
import { Utensils, Brain, TrendingUp, Clock } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Brain,
      title: "IA Personalizada",
      description: "Menús adaptados a tus objetivos y preferencias",
    },
    {
      icon: Utensils,
      title: "Recetas Deliciosas",
      description: "Comidas saludables que te encantarán",
    },
    {
      icon: TrendingUp,
      title: "Alcanza tus Metas",
      description: "Bajar grasa, ganar músculo o comer saludable",
    },
    {
      icon: Clock,
      title: "Ahorra Tiempo",
      description: "Lista de compras automática cada semana",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="inline-block px-4 py-2 bg-primary/10 rounded-full">
                <span className="text-primary font-semibold text-sm">
                  🎉 Prueba gratis 4 días sin tarjeta
                </span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
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
                <Button 
                  variant="hero" 
                  size="lg"
                  className="text-lg px-8 py-6 h-auto"
                  onClick={() => navigate("/auth")}
                >
                  Comienza gratis
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="text-lg px-8 py-6 h-auto"
                  onClick={() => navigate("/auth")}
                >
                  Iniciar sesión
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">
                ✨ Sin tarjeta requerida • 🎯 4 días de prueba gratuita
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl -z-10"></div>
              <img 
                src={heroImage} 
                alt="Ingredientes saludables frescos" 
                className="rounded-3xl shadow-2xl w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

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
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group p-8 rounded-2xl bg-card border border-border hover:shadow-[0_8px_30px_rgb(255,99,71,0.15)] transition-all hover:-translate-y-1"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8 p-12 rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
            <h2 className="text-4xl lg:text-5xl font-bold">
              Empieza tu transformación hoy
            </h2>
            <p className="text-xl text-muted-foreground">
              Únete a miles de personas que ya están comiendo mejor y sintiéndose increíbles
            </p>
            <Button 
              variant="hero" 
              size="lg"
              className="text-lg px-12 py-6 h-auto"
              onClick={() => navigate("/auth")}
            >
              Prueba gratis por 4 días
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
