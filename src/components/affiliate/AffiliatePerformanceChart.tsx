import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface AffiliatePerformanceChartProps {
  affiliateId: string;
}

export function AffiliatePerformanceChart({ affiliateId }: AffiliatePerformanceChartProps) {
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);

  useEffect(() => {
    loadPerformanceData();
  }, [affiliateId]);

  const loadPerformanceData = async () => {
    try {
      const { data, error } = await supabase
        .from("affiliate_commissions")
        .select("*")
        .eq("affiliate_id", affiliateId)
        .order("year", { ascending: true })
        .order("month", { ascending: true });

      if (error) throw error;

      const formattedData = (data || []).map((item) => ({
        name: `${item.month}/${item.year}`,
        ventas: item.total_sales || 0,
        monto: parseFloat(String(item.total_amount_mxn || 0)),
        comision: parseFloat(String(item.commission_earned_mxn || 0)),
      }));

      setMonthlyData(formattedData);
    } catch (error) {
      console.error("Error loading performance data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (monthlyData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rendimiento Mensual</CardTitle>
          <CardDescription>Aún no hay datos suficientes</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Los gráficos aparecerán cuando tengas ventas registradas
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Comisiones Mensuales</CardTitle>
          <CardDescription>Evolución de tus ganancias</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="comision" 
                stroke="hsl(var(--primary))" 
                name="Comisión (MXN)"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ventas Mensuales</CardTitle>
          <CardDescription>Número de conversiones por mes</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="ventas" 
                fill="hsl(var(--primary))" 
                name="Ventas"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
