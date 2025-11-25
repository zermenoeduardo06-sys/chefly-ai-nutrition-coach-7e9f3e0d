import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function AdminAffiliateSales() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    const { data, error } = await supabase
      .from("affiliate_sales")
      .select(`
        *,
        affiliate_profiles (
          full_name,
          affiliate_code
        )
      `)
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error && data) {
      setSales(data);
    }
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: "secondary",
      approved: "default",
      paid: "outline",
    };

    const labels: Record<string, string> = {
      pending: "Pendiente",
      approved: "Aprobado",
      paid: "Pagado",
    };

    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Ventas</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Afiliado</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Venta</TableHead>
              <TableHead>Comisión</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No hay ventas registradas
                </TableCell>
              </TableRow>
            ) : (
              sales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>
                    {format(new Date(sale.created_at), "dd MMM yyyy", { locale: es })}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{sale.affiliate_profiles?.full_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {sale.affiliate_profiles?.affiliate_code}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{sale.customer_email}</TableCell>
                  <TableCell>{sale.plan_name}</TableCell>
                  <TableCell>${Number(sale.sale_amount_mxn).toFixed(2)} MXN</TableCell>
                  <TableCell className="font-medium">
                    ${Number(sale.commission_amount_mxn).toFixed(2)} MXN
                  </TableCell>
                  <TableCell>{getStatusBadge(sale.commission_status)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
