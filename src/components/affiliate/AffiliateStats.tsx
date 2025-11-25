import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, MousePointerClick, ShoppingCart, TrendingUp } from "lucide-react";

interface AffiliateStatsProps {
  profile: any;
}

export function AffiliateStats({ profile }: AffiliateStatsProps) {
  const conversionRate = profile.total_clicks > 0 
    ? ((profile.total_conversions / profile.total_clicks) * 100).toFixed(2)
    : "0.00";

  const stats = [
    {
      title: "Total Ganado",
      value: `$${parseFloat(profile.total_earned_mxn || 0).toFixed(2)} MXN`,
      icon: DollarSign,
      description: "Comisiones totales",
    },
    {
      title: "Balance Pendiente",
      value: `$${parseFloat(profile.pending_balance_mxn || 0).toFixed(2)} MXN`,
      icon: TrendingUp,
      description: "Por cobrar",
    },
    {
      title: "Total Clicks",
      value: profile.total_clicks || 0,
      icon: MousePointerClick,
      description: "Enlaces visitados",
    },
    {
      title: "Conversiones",
      value: `${profile.total_conversions || 0} (${conversionRate}%)`,
      icon: ShoppingCart,
      description: "Ventas realizadas",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
