import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, MousePointerClick, ShoppingCart, TrendingUp, Wallet, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface AffiliateStatsProps {
  profile: any;
  onRequestPayout?: () => void;
}

export function AffiliateStats({ profile, onRequestPayout }: AffiliateStatsProps) {
  const conversionRate = profile.total_clicks > 0 
    ? ((profile.total_conversions / profile.total_clicks) * 100).toFixed(2)
    : "0.00";
  
  const pendingBalance = parseFloat(profile.pending_balance_mxn || 0);
  const canRequestPayout = pendingBalance >= 200;

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
    <div className="space-y-4">
      {/* Alerta de retiro disponible */}
      {canRequestPayout && (
        <Alert className="border-2 border-primary bg-gradient-to-r from-primary/10 to-primary/5">
          <Wallet className="h-5 w-5 text-primary" />
          <AlertTitle className="text-lg font-bold text-primary">
            ¡Retiro disponible! 💰
          </AlertTitle>
          <AlertDescription className="space-y-3">
            <p className="text-base">
              Tienes <span className="font-bold text-primary">${pendingBalance.toFixed(2)} MXN</span> disponibles.
              El pago se procesa automáticamente al confirmar el retiro.
            </p>
            {onRequestPayout && (
              <Button 
                onClick={onRequestPayout}
                className="bg-primary hover:bg-primary/90"
                size="lg"
              >
                <Wallet className="h-4 w-4 mr-2" />
                Retirar Ahora
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Alerta informativa cuando está cerca de los 200 MXN */}
      {!canRequestPayout && pendingBalance > 0 && pendingBalance < 200 && (
        <Alert className="border border-muted-foreground/20">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Casi llegas al mínimo de retiro</AlertTitle>
          <AlertDescription>
            Te faltan <span className="font-semibold">${(200 - pendingBalance).toFixed(2)} MXN</span> para poder solicitar tu primer retiro.
            El mínimo es de $200 MXN.
          </AlertDescription>
        </Alert>
      )}

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
    </div>
  );
}
