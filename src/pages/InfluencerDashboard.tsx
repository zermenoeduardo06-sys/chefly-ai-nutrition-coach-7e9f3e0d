import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Copy, DollarSign, Users, TrendingUp, MessageCircle, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import cheflyLogo from "@/assets/chefly-logo.png";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function InfluencerDashboard() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [sales, setSales] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (code) {
      loadInfluencerData(code.toUpperCase());
    }
  }, [code]);

  const loadInfluencerData = async (affiliateCode: string) => {
    try {
      // Load influencer profile
      const { data: profileData, error: profileError } = await supabase
        .from("affiliate_profiles")
        .select("*")
        .eq("affiliate_code", affiliateCode)
        .eq("is_influencer", true)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profileData) {
        toast({
          title: "No encontrado",
          description: "Este código de influencer no existe",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setProfile(profileData);

      // Load recent sales
      const { data: salesData, error: salesError } = await supabase
        .from("affiliate_sales")
        .select("*")
        .eq("affiliate_id", profileData.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (!salesError && salesData) {
        setSales(salesData);
      }
    } catch (error: any) {
      console.error("Error loading influencer data:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar la información",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    const link = `${window.location.origin}/?ref=${profile?.affiliate_code}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    toast({
      title: "Enlace copiado",
      description: "Compártelo con tu audiencia",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const openWhatsApp = () => {
    const message = encodeURIComponent(
      `Hola! Soy ${profile?.full_name} (${profile?.affiliate_code}). Quisiera solicitar un pago de mi balance pendiente: $${Number(profile?.pending_balance_mxn || 0).toFixed(2)} MXN`
    );
    window.open(`https://wa.me/5215512345678?text=${message}`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const referralLink = `${window.location.origin}/?ref=${profile.affiliate_code}`;
  const pendingBalance = Number(profile.pending_balance_mxn || 0);
  const canRequestPayout = pendingBalance >= 200;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4">
            <img src={cheflyLogo} alt="Chefly" className="h-12 w-12" />
            <div>
              <h1 className="text-2xl font-bold">Panel de Influencer</h1>
              <p className="text-primary-foreground/80">¡Hola, {profile.full_name}!</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Referral Link Card */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Tu Enlace de Referido
              <Badge variant="secondary">{profile.affiliate_code}</Badge>
            </CardTitle>
            <CardDescription>Comparte este enlace con tu audiencia</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="flex-1 bg-muted rounded-lg px-4 py-3 font-mono text-sm break-all">
                {referralLink}
              </div>
              <Button onClick={copyLink} variant={copied ? "default" : "outline"}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Clics</p>
                  <p className="text-2xl font-bold">{profile.total_clicks || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ventas</p>
                  <p className="text-2xl font-bold">{profile.total_conversions || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Ganado</p>
                  <p className="text-2xl font-bold">${Number(profile.total_earned_mxn || 0).toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={canRequestPayout ? "border-primary bg-primary/5" : ""}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                  canRequestPayout 
                    ? "bg-primary/20" 
                    : "bg-orange-100 dark:bg-orange-900/30"
                }`}>
                  <DollarSign className={`h-6 w-6 ${canRequestPayout ? "text-primary" : "text-orange-600"}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Balance Pendiente</p>
                  <p className="text-2xl font-bold">${pendingBalance.toFixed(2)}</p>
                  {canRequestPayout && (
                    <Badge variant="default" className="mt-1">
                      ¡Listo para cobrar!
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Request Payout Button */}
        {canRequestPayout && (
          <Card className="border-primary">
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">¡Tienes ${pendingBalance.toFixed(2)} MXN listos para cobrar!</h3>
                  <p className="text-sm text-muted-foreground">Contáctanos para procesar tu pago</p>
                </div>
                <Button onClick={openWhatsApp} size="lg">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Solicitar Pago
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sales History */}
        <Card>
          <CardHeader>
            <CardTitle>Historial de Ventas</CardTitle>
            <CardDescription>Tus últimas conversiones</CardDescription>
          </CardHeader>
          <CardContent>
            {sales.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Aún no tienes ventas</p>
                <p className="text-sm">¡Comparte tu enlace para empezar a ganar!</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Venta</TableHead>
                    <TableHead>Comisión</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>
                        {format(new Date(sale.created_at), "dd MMM yyyy", { locale: es })}
                      </TableCell>
                      <TableCell>{sale.plan_name}</TableCell>
                      <TableCell>${Number(sale.sale_amount_mxn).toFixed(2)}</TableCell>
                      <TableCell className="font-semibold text-primary">
                        ${Number(sale.commission_amount_mxn).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            sale.commission_status === "paid" ? "default" :
                            sale.commission_status === "approved" ? "secondary" :
                            "outline"
                          }
                        >
                          {sale.commission_status === "paid" ? "Pagado" :
                           sale.commission_status === "approved" ? "Aprobado" :
                           "Pendiente"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="bg-muted/50">
          <CardContent className="py-6">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">¿Tienes preguntas o necesitas ayuda?</p>
              <Button variant="outline" onClick={openWhatsApp}>
                <MessageCircle className="h-4 w-4 mr-2" />
                Contactar por WhatsApp
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
