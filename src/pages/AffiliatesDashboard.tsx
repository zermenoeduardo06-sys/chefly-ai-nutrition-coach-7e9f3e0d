import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AffiliateStats } from "@/components/affiliate/AffiliateStats";
import { AffiliateLinkGenerator } from "@/components/affiliate/AffiliateLinkGenerator";
import { AffiliateSalesTable } from "@/components/affiliate/AffiliateSalesTable";
import { AffiliatePayoutRequest } from "@/components/affiliate/AffiliatePayoutRequest";
import { AffiliatePayoutHistory } from "@/components/affiliate/AffiliatePayoutHistory";
import { AffiliatePerformanceChart } from "@/components/affiliate/AffiliatePerformanceChart";
import { AffiliateTierProgress } from "@/components/affiliate/AffiliateTierProgress";
import { AffiliateTierBadge } from "@/components/affiliate/AffiliateTierBadge";

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
        navigate("/auth");
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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!affiliateProfile) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Únete al Programa de Afiliados</CardTitle>
            <CardDescription>
              Completa tu registro para comenzar a ganar comisiones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Regístrate como afiliado y comienza a ganar hasta 25% de comisión por cada venta.
            </p>
            <button
              onClick={() => navigate("/affiliates/register")}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Registrarse como Afiliado
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (affiliateProfile.status === "pending") {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Solicitud en Revisión</CardTitle>
            <CardDescription>
              Tu solicitud está siendo revisada por nuestro equipo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Te notificaremos por correo cuando tu cuenta sea aprobada.
              Esto generalmente toma 1-2 días hábiles.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (affiliateProfile.status === "suspended" || affiliateProfile.status === "inactive") {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Cuenta {affiliateProfile.status === "suspended" ? "Suspendida" : "Inactiva"}</CardTitle>
            <CardDescription>
              Tu cuenta de afiliado no está activa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Por favor contacta a soporte para más información.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold">Dashboard de Afiliado</h1>
          <AffiliateTierBadge tier={affiliateProfile.current_tier} size="lg" />
        </div>
        <p className="text-muted-foreground">
          Código de Afiliado: <span className="font-mono font-semibold">{affiliateProfile.affiliate_code}</span>
        </p>
      </div>

      <AffiliateTierProgress profile={affiliateProfile} />

      <AffiliateStats profile={affiliateProfile} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AffiliateLinkGenerator affiliateCode={affiliateProfile.affiliate_code} />
        <AffiliatePayoutRequest profile={affiliateProfile} onSuccess={loadAffiliateProfile} />
      </div>

      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="performance">Rendimiento</TabsTrigger>
          <TabsTrigger value="sales">Ventas</TabsTrigger>
          <TabsTrigger value="payouts">Pagos</TabsTrigger>
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
      </Tabs>
    </div>
  );
}
