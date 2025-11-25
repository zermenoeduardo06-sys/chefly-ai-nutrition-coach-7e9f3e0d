import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import cheflyLogo from "@/assets/chefly-logo.png";
import { AffiliateStats } from "@/components/affiliate/AffiliateStats";
import { AffiliateLinkGenerator } from "@/components/affiliate/AffiliateLinkGenerator";
import { AffiliateSalesTable } from "@/components/affiliate/AffiliateSalesTable";
import { AffiliatePayoutRequest } from "@/components/affiliate/AffiliatePayoutRequest";
import { AffiliatePayoutHistory } from "@/components/affiliate/AffiliatePayoutHistory";
import { AffiliatePerformanceChart } from "@/components/affiliate/AffiliatePerformanceChart";
import { AffiliateTierProgress } from "@/components/affiliate/AffiliateTierProgress";
import { AffiliateTierBadge } from "@/components/affiliate/AffiliateTierBadge";
import { AffiliateQuickGuide } from "@/components/affiliate/AffiliateQuickGuide";
import { AffiliateResourcesHub } from "@/components/affiliate/AffiliateResourcesHub";

const AffiliateHeader = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });
      navigate("/programa-afiliados");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };
  
  return (
    <header className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={cheflyLogo} alt="Chefly Logo" className="h-10 w-10" />
            <h1 className="text-2xl font-bold">Chefly Afiliados</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              className="text-primary-foreground hover:bg-primary-foreground/20"
              onClick={() => navigate("/")}
            >
              <Home className="h-4 w-4 mr-2" />
              Inicio
            </Button>
            <Button 
              variant="ghost" 
              className="text-primary-foreground hover:bg-primary-foreground/20"
              onClick={() => navigate("/programa-afiliados")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Información
            </Button>
            <Button 
              variant="ghost" 
              className="text-primary-foreground hover:bg-primary-foreground/20"
              onClick={handleLogout}
            >
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default function AffiliatesDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [affiliateProfile, setAffiliateProfile] = useState<any>(null);

  useEffect(() => {
    loadAffiliateProfile();
  }, []);

  const loadAffiliateProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/affiliates/login");
        return;
      }

      const { data: profile, error } = await supabase
        .from("affiliate_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (!profile) {
        // Si no tiene perfil, mostrar formulario de registro
        setAffiliateProfile(null);
      } else {
        setAffiliateProfile(profile);
      }
    } catch (error: any) {
      console.error("Error loading affiliate profile:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar el perfil de afiliado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <AffiliateHeader />
        <div className="flex items-center justify-center min-h-[80vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!affiliateProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <AffiliateHeader />
        <div className="container mx-auto py-8 px-4 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Únete al Programa de Afiliados</CardTitle>
              <CardDescription>
                Completa tu registro para comenzar a ganar comisiones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Regístrate como afiliado y comienza a ganar hasta 25% de comisión por cada venta.
              </p>
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <h4 className="font-semibold">Beneficios:</h4>
                <ul className="text-sm space-y-1">
                  <li>✓ Sin costos de membresía - 100% gratis</li>
                  <li>✓ Gana 20-25% por cada venta</li>
                  <li>✓ Retiro mínimo de solo $200 MXN</li>
                  <li>✓ Pagos cada 15 días</li>
                  <li>✓ Dashboard con estadísticas en tiempo real</li>
                </ul>
              </div>
              <Button
                onClick={() => navigate("/affiliates/register")}
                className="w-full"
                size="lg"
              >
                Registrarse como Afiliado
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (affiliateProfile.status === "pending") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <AffiliateHeader />
        <div className="container mx-auto py-8 px-4 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Solicitud en Revisión</CardTitle>
              <CardDescription>
                Tu solicitud está siendo revisada por nuestro equipo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
                <p className="text-muted-foreground text-center">
                  Te notificaremos por correo cuando tu cuenta sea aprobada.
                  Esto generalmente toma 1-2 días hábiles.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (affiliateProfile.status === "suspended" || affiliateProfile.status === "inactive") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <AffiliateHeader />
        <div className="container mx-auto py-8 px-4 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Cuenta {affiliateProfile.status === "suspended" ? "Suspendida" : "Inactiva"}</CardTitle>
              <CardDescription>
                Tu cuenta de afiliado no está activa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Por favor contacta a soporte para más información sobre el estado de tu cuenta.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <AffiliateHeader />
      <div className="container mx-auto py-8 px-4 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">Dashboard de Afiliado</h1>
              <AffiliateTierBadge tier={affiliateProfile.current_tier} size="lg" />
            </div>
            <p className="text-muted-foreground">
              Código de Afiliado: <span className="font-mono font-semibold">{affiliateProfile.affiliate_code}</span>
            </p>
          </div>
        </div>

      <AffiliateTierProgress profile={affiliateProfile} />

      <AffiliateStats profile={affiliateProfile} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AffiliateLinkGenerator affiliateCode={affiliateProfile.affiliate_code} />
        <AffiliatePayoutRequest profile={affiliateProfile} onSuccess={loadAffiliateProfile} />
      </div>

        <Tabs defaultValue="performance" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="performance">Rendimiento</TabsTrigger>
            <TabsTrigger value="sales">Ventas</TabsTrigger>
            <TabsTrigger value="payouts">Pagos</TabsTrigger>
            <TabsTrigger value="guide">Guía</TabsTrigger>
            <TabsTrigger value="resources">Recursos</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-4">
            <AffiliatePerformanceChart affiliateId={affiliateProfile.id} />
          </TabsContent>

          <TabsContent value="sales">
            <AffiliateSalesTable affiliateId={affiliateProfile.id} />
          </TabsContent>

          <TabsContent value="payouts">
            <AffiliatePayoutHistory affiliateId={affiliateProfile.id} />
          </TabsContent>

          <TabsContent value="guide">
            <AffiliateQuickGuide />
          </TabsContent>

          <TabsContent value="resources">
            <AffiliateResourcesHub />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
