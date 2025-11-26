import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Wallet } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function AdminAffiliatesPendingPayouts() {
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPending, setTotalPending] = useState(0);

  useEffect(() => {
    loadAffiliates();
  }, []);

  const loadAffiliates = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from("affiliate_profiles")
      .select("*")
      .eq("status", "active")
      .gte("pending_balance_mxn", 200)
      .order("pending_balance_mxn", { ascending: false });

    if (!error && data) {
      setAffiliates(data);
      const total = data.reduce((sum, a) => sum + Number(a.pending_balance_mxn || 0), 0);
      setTotalPending(total);
    }
    
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Alerta destacada */}
      <Alert className="border-2 border-primary bg-gradient-to-r from-primary/10 to-primary/5">
        <Wallet className="h-5 w-5 text-primary" />
        <AlertTitle className="text-lg font-bold text-primary">
          Afiliados listos para cobrar
        </AlertTitle>
        <AlertDescription>
          <p className="text-base mb-2">
            Hay <span className="font-bold text-primary">{affiliates.length}</span> afiliados con saldo disponible para retirar.
          </p>
          <p className="text-2xl font-bold text-primary">
            Total a pagar: ${totalPending.toFixed(2)} MXN
          </p>
        </AlertDescription>
      </Alert>

      {/* Tabla de afiliados */}
      <Card>
        <CardHeader>
          <CardTitle>Afiliados con Balance ≥ $200 MXN</CardTitle>
        </CardHeader>
        <CardContent>
          {affiliates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay afiliados con balance disponible para retirar</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Afiliado</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Método de Pago</TableHead>
                  <TableHead className="text-right">Balance Pendiente</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {affiliates.map((affiliate) => (
                  <TableRow key={affiliate.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div>
                        <div className="font-medium">{affiliate.full_name}</div>
                        <div className="text-xs text-muted-foreground">{affiliate.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="bg-muted px-2 py-1 rounded text-xs">
                        {affiliate.affiliate_code}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {affiliate.current_tier}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize">
                      {affiliate.payout_method === "paypal" && "PayPal"}
                      {affiliate.payout_method === "bank_transfer" && "Transferencia"}
                      {affiliate.payout_method === "spei" && "SPEI"}
                      {!affiliate.payout_method && <span className="text-muted-foreground">No configurado</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-bold text-lg text-primary">
                        ${Number(affiliate.pending_balance_mxn).toFixed(2)} MXN
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Información adicional */}
      {affiliates.length > 0 && (
        <Card className="border-muted-foreground/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>
                Estos afiliados tienen un balance pendiente igual o superior a $200 MXN y pueden solicitar 
                su retiro en cualquier momento. Asegúrate de revisar la sección de "Solicitudes de Pago" 
                para procesar los retiros pendientes.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
