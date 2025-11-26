import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, TrendingUp, Clock, BarChart3, RefreshCw, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export function AdminAffiliatesOverview() {
  const [stats, setStats] = useState({
    totalAffiliates: 0,
    activeAffiliates: 0,
    pendingApprovals: 0,
    totalEarned: 0,
    totalSales: 0,
    pendingPayouts: 0,
    monthSales: 0,
    monthCommissions: 0,
    conversionRate: 0,
    avgCommission: 0,
    totalPendingBalance: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const [
        affiliates,
        activeAffiliates,
        pending,
        allSales,
        monthSales,
        payouts,
        referrals,
        affiliateProfiles
      ] = await Promise.all([
        supabase.from("affiliate_profiles").select("id", { count: "exact" }),
        supabase.from("affiliate_profiles").select("id", { count: "exact" }).eq("status", "active"),
        supabase.from("affiliate_profiles").select("id", { count: "exact" }).eq("status", "pending"),
        supabase.from("affiliate_sales").select("commission_amount_mxn, sale_amount_mxn"),
        supabase.from("affiliate_sales").select("commission_amount_mxn, sale_amount_mxn").gte("created_at", firstDayOfMonth),
        supabase.from("affiliate_payouts").select("amount_mxn").eq("status", "pending"),
        supabase.from("affiliate_referrals").select("id, converted", { count: "exact" }),
        supabase.from("affiliate_profiles").select("pending_balance_mxn"),
      ]);

      const totalEarned = allSales.data?.reduce((sum, sale) => sum + Number(sale.commission_amount_mxn), 0) || 0;
      const totalSalesAmount = allSales.data?.reduce((sum, sale) => sum + Number(sale.sale_amount_mxn), 0) || 0;
      const pendingPayouts = payouts.data?.reduce((sum, payout) => sum + Number(payout.amount_mxn), 0) || 0;
      const monthCommissions = monthSales.data?.reduce((sum, sale) => sum + Number(sale.commission_amount_mxn), 0) || 0;
      const monthSalesAmount = monthSales.data?.reduce((sum, sale) => sum + Number(sale.sale_amount_mxn), 0) || 0;

      const totalClicks = referrals.count || 0;
      const totalConversions = referrals.data?.filter(r => r.converted).length || 0;
      const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
      const avgCommission = allSales.data && allSales.data.length > 0 ? totalEarned / allSales.data.length : 0;
      const totalPendingBalance = affiliateProfiles.data?.reduce((sum, profile) => sum + Number(profile.pending_balance_mxn || 0), 0) || 0;

      setStats({
        totalAffiliates: affiliates.count || 0,
        activeAffiliates: activeAffiliates.count || 0,
        pendingApprovals: pending.count || 0,
        totalEarned,
        totalSales: totalSalesAmount,
        pendingPayouts,
        monthSales: monthSalesAmount,
        monthCommissions,
        conversionRate,
        avgCommission,
        totalPendingBalance,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      title: "Total Afiliados",
      value: stats.totalAffiliates,
      subtitle: `${stats.activeAffiliates} activos`,
      icon: Users,
      trend: `${((stats.activeAffiliates / stats.totalAffiliates) * 100).toFixed(0)}%`,
      trendLabel: "tasa de activación",
    },
    {
      title: "Pendientes",
      value: stats.pendingApprovals,
      subtitle: "Solicitudes por revisar",
      icon: Clock,
      trend: stats.pendingApprovals > 5 ? "⚠️" : "✓",
      trendLabel: stats.pendingApprovals > 5 ? "requiere atención" : "bajo control",
    },
    {
      title: "Comisiones del Mes",
      value: `$${stats.monthCommissions.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
      subtitle: `Ventas: $${stats.monthSales.toLocaleString('es-MX')} MXN`,
      icon: DollarSign,
      trend: `${((stats.monthCommissions / stats.totalEarned) * 100).toFixed(1)}%`,
      trendLabel: "del total histórico",
    },
    {
      title: "Pagos Pendientes",
      value: `$${stats.pendingPayouts.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
      subtitle: "Por procesar",
      icon: TrendingUp,
      trend: `$${stats.totalEarned.toLocaleString('es-MX')}`,
      trendLabel: "total generado",
    },
    {
      title: "Tasa de Conversión",
      value: `${stats.conversionRate.toFixed(2)}%`,
      subtitle: "Clics a ventas",
      icon: BarChart3,
      trend: stats.conversionRate > 5 ? "Excelente" : stats.conversionRate > 2 ? "Buena" : "Baja",
      trendLabel: "rendimiento",
    },
    {
      title: "Comisión Promedio",
      value: `$${stats.avgCommission.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
      subtitle: "Por venta",
      icon: Activity,
      trend: `${stats.totalSales > 0 ? ((stats.totalEarned / stats.totalSales) * 100).toFixed(1) : 0}%`,
      trendLabel: "del valor de venta",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Resumen General</h2>
          <p className="text-muted-foreground">Métricas clave del programa de afiliados</p>
        </div>
        <Button
          onClick={loadStats}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Tarjeta destacada de balance pendiente */}
      <Card className="border-2 border-primary bg-gradient-to-br from-primary/10 to-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-2xl">
            <span className="flex items-center gap-2">
              💰 Total a Pagar a Afiliados
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-5xl font-bold text-primary mb-2">
            ${stats.totalPendingBalance.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
          </div>
          <p className="text-sm text-muted-foreground">
            Balance pendiente acumulado de todos los afiliados activos
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">{card.value}</div>
              <p className="text-xs text-muted-foreground mb-2">{card.subtitle}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{card.trendLabel}</span>
                <span className="font-medium">{card.trend}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Affiliates Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Distribución de Afiliados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Activos</span>
              <span className="font-medium">{stats.activeAffiliates} ({((stats.activeAffiliates / stats.totalAffiliates) * 100).toFixed(0)}%)</span>
            </div>
            <Progress value={(stats.activeAffiliates / stats.totalAffiliates) * 100} className="h-2" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Pendientes</span>
              <span className="font-medium">{stats.pendingApprovals} ({((stats.pendingApprovals / stats.totalAffiliates) * 100).toFixed(0)}%)</span>
            </div>
            <Progress value={(stats.pendingApprovals / stats.totalAffiliates) * 100} className="h-2" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Inactivos</span>
              <span className="font-medium">{stats.totalAffiliates - stats.activeAffiliates - stats.pendingApprovals}</span>
            </div>
            <Progress value={((stats.totalAffiliates - stats.activeAffiliates - stats.pendingApprovals) / stats.totalAffiliates) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
