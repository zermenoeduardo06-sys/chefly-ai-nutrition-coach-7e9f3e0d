import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface AffiliatePayoutHistoryProps {
  affiliateId: string;
}

export function AffiliatePayoutHistory({ affiliateId }: AffiliatePayoutHistoryProps) {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayouts();
  }, [affiliateId]);

  const loadPayouts = async () => {
    try {
      const { data, error } = await supabase
        .from("affiliate_payouts")
        .select("*")
        .eq("affiliate_id", affiliateId)
        .order("requested_at", { ascending: false });

      if (error) throw error;
      setPayouts(data || []);
    } catch (error) {
      console.error("Error loading payouts:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      pending: { variant: "secondary", label: "Pendiente" },
      processing: { variant: "default", label: "Procesando" },
      completed: { variant: "outline", label: "Completado" },
      failed: { variant: "destructive", label: "Fallido" },
    };
    const { variant, label } = config[status] || { variant: "default", label: status };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      paypal: "PayPal",
      bank_transfer: "Transferencia Bancaria",
      spei: "SPEI",
    };
    return labels[method] || method;
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
        <CardTitle>Historial de Pagos</CardTitle>
        <CardDescription>
          Todas tus solicitudes de pago
        </CardDescription>
      </CardHeader>
      <CardContent>
        {payouts.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No has solicitado pagos aún
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha Solicitud</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha Pago</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.map((payout) => (
                  <TableRow key={payout.id}>
                    <TableCell>
                      {format(new Date(payout.requested_at), "dd MMM yyyy", { locale: es })}
                    </TableCell>
                    <TableCell className="font-semibold">
                      ${payout.amount_mxn} MXN
                    </TableCell>
                    <TableCell>{getMethodLabel(payout.payout_method)}</TableCell>
                    <TableCell>{getStatusBadge(payout.status)}</TableCell>
                    <TableCell>
                      {payout.completed_at 
                        ? format(new Date(payout.completed_at), "dd MMM yyyy", { locale: es })
                        : "-"
                      }
                    </TableCell>
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
