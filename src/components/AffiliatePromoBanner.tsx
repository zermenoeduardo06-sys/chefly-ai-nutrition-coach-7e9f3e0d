import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { TrendingUp, DollarSign, Users, Sparkles, ArrowRight } from "lucide-react";

export function AffiliatePromoBanner() {
  const navigate = useNavigate();

  return (
    <section className="py-16 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10"></div>
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-md rounded-3xl border-2 border-primary/20 shadow-[0_8px_30px_rgb(255,99,71,0.25)] overflow-hidden">
            <div className="grid md:grid-cols-2 gap-8 p-8 lg:p-12 items-center">
              {/* Left content */}
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-primary font-semibold text-sm">
                    Gana Dinero Extra
                  </span>
                </div>
                
                <h2 className="text-3xl lg:text-4xl font-bold leading-tight">
                  ¡Únete al{" "}
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Programa de Afiliados
                  </span>{" "}
                  de Chefly!
                </h2>
                
                <p className="text-lg text-muted-foreground">
                  Recomienda Chefly y gana hasta <span className="font-bold text-primary">25% de comisión</span> por cada venta. 
                  100% gratis, sin costos de membresía.
                </p>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">20-25% de comisión</p>
                      <p className="text-sm text-muted-foreground">Por cada venta referida</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <p className="font-semibold">Pagos cada 15 días</p>
                      <p className="text-sm text-muted-foreground">Retiro mínimo de $200 MXN</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-semibold">Dashboard en tiempo real</p>
                      <p className="text-sm text-muted-foreground">Estadísticas y herramientas de marketing</p>
                    </div>
                  </div>
                </div>

                <Button 
                  size="lg" 
                  className="w-full md:w-auto group"
                  onClick={() => navigate("/programa-afiliados")}
                >
                  Comenzar Ahora
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>

              {/* Right visual */}
              <div className="relative hidden md:block">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl blur-2xl"></div>
                <div className="relative bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8 backdrop-blur-sm border border-border/50">
                  <div className="space-y-6">
                    <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-border/50 shadow-lg transform rotate-2 hover:rotate-0 transition-transform">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Comisiones este mes</span>
                        <TrendingUp className="w-4 h-4 text-secondary" />
                      </div>
                      <p className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        $12,450 MXN
                      </p>
                    </div>
                    
                    <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-border/50 shadow-lg transform -rotate-2 hover:rotate-0 transition-transform">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Ventas este mes</span>
                        <Users className="w-4 h-4 text-primary" />
                      </div>
                      <p className="text-3xl font-bold">47</p>
                    </div>
                    
                    <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-border/50 shadow-lg hover:scale-105 transition-transform">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-accent" />
                        <span className="text-sm font-semibold">Nivel: Plata ⭐</span>
                      </div>
                      <div className="w-full bg-muted/50 rounded-full h-2">
                        <div className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full" style={{ width: "68%" }}></div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">68% para nivel Oro</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
