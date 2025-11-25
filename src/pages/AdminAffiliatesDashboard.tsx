import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminAffiliatesOverview } from "@/components/admin/AdminAffiliatesOverview";
import { AdminAffiliatesList } from "@/components/admin/AdminAffiliatesList";
import { AdminAffiliateSales } from "@/components/admin/AdminAffiliateSales";
import { AdminAffiliatePayouts } from "@/components/admin/AdminAffiliatePayouts";

export default function AdminAffiliatesDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();

      if (error || !roles) {
        toast({
          title: "Acceso Denegado",
          description: "No tienes permisos de administrador",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error("Error checking admin status:", error);
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Dashboard de Administración</h1>
        <p className="text-muted-foreground">Gestión del Programa de Afiliados</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="affiliates">Afiliados</TabsTrigger>
          <TabsTrigger value="sales">Ventas</TabsTrigger>
          <TabsTrigger value="payouts">Pagos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <AdminAffiliatesOverview />
        </TabsContent>

        <TabsContent value="affiliates">
          <AdminAffiliatesList />
        </TabsContent>

        <TabsContent value="sales">
          <AdminAffiliateSales />
        </TabsContent>

        <TabsContent value="payouts">
          <AdminAffiliatePayouts />
        </TabsContent>
      </Tabs>
    </div>
  );
}
