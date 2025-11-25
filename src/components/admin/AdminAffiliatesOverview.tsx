import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, TrendingUp, Clock } from "lucide-react";

export function AdminAffiliatesOverview() {
  const [stats, setStats] = useState({
    totalAffiliates: 0,
    pendingApprovals: 0,
    totalEarned: 0,
    pendingPayouts: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const [affiliates, pending, sales, payouts] = await Promise.all([
      supabase.from("affiliate_profiles").select("id", { count: "exact" }),
      supabase.from("affiliate_profiles").select("id", { count: "exact" }).eq("status", "pending"),
      supabase.from("affiliate_sales").select("commission_amount_mxn"),
      supabase.from("affiliate_payouts").select("amount_mxn").eq("status", "pending"),
    ]);

    const totalEarned = sales.data?.reduce((sum, sale) => sum + Number(sale.commission_amount_mxn), 0) || 0;
    const pendingPayouts = payouts.data?.reduce((sum, payout) => sum + Number(payout.amount_mxn), 0) || 0;

    setStats({
      totalAffiliates: affiliates.count || 0,
      pendingApprovals: pending.count || 0,
      totalEarned,
      pendingPayouts,
    });
  };

  const cards = [
    {
      title: "Total Afiliados",
      value: stats.totalAffiliates,
      icon: Users,
      description: "Afiliados registrados",
    },
    {
      title: "Pendientes de Aprobación",
      value: stats.pendingApprovals,
      icon: Clock,
      description: "Solicitudes por revisar",
    },
    {
      title: "Comisiones Totales",
      value: `$${stats.totalEarned.toFixed(2)} MXN`,
      icon: DollarSign,
      description: "Generadas por ventas",
    },
    {
      title: "Pagos Pendientes",
      value: `$${stats.pendingPayouts.toFixed(2)} MXN`,
      icon: TrendingUp,
      description: "Por procesar",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
