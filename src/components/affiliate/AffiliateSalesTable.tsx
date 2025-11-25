import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface AffiliateSalesTableProps {
  affiliateId: string;
}

export function AffiliateSalesTable({ affiliateId }: AffiliateSalesTableProps) {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSales();
  }, [affiliateId]);

  const loadSales = async () => {
    try {
      const { data, error } = await supabase
        .from("affiliate_sales")
        .select("*")
        .eq("affiliate_id", affiliateId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setSales(data || []);
    } catch (error) {
      console.error("Error loading sales:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      approved: "default",
      paid: "outline",
      rejected: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Ventas</CardTitle>
        <CardDescription>
          Últimas {sales.length} ventas realizadas
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sales.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Aún no tienes ventas registradas
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cliente</TableHead>
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
                    <TableCell className="font-mono text-xs">
                      {sale.customer_email}
                    </TableCell>
                    <TableCell>{sale.plan_name}</TableCell>
                    <TableCell>${sale.sale_amount_mxn} MXN</TableCell>
                    <TableCell className="font-semibold">
                      ${sale.commission_amount_mxn} MXN
                    </TableCell>
                    <TableCell>{getStatusBadge(sale.commission_status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
