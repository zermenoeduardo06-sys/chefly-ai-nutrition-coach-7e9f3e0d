import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X, Download, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AdminAffiliatePayouts() {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const { toast } = useToast();
  const pageSize = 15;

  useEffect(() => {
    loadPayouts();
  }, [statusFilter, searchQuery, page]);

  const loadPayouts = async () => {
    setLoading(true);
    let query = supabase
      .from("affiliate_payouts")
      .select(`
        *,
        affiliate_profiles (
          full_name,
          email,
          affiliate_code
        )
      `, { count: "exact" })
      .order("requested_at", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter as "pending" | "processing" | "completed" | "failed");
    }

    if (searchQuery.trim()) {
      // Buscar en datos del afiliado relacionado
      const { data: affiliateProfiles } = await supabase
        .from("affiliate_profiles")
        .select("id")
        .or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
      
      if (affiliateProfiles && affiliateProfiles.length > 0) {
        const affiliateIds = affiliateProfiles.map(a => a.id);
        query = query.in("affiliate_id", affiliateIds);
      }
    }

    const { data, error, count } = await query;

    if (!error && data) {
      setPayouts(data);
      setTotalCount(count || 0);
    }
    setLoading(false);
  };

  const updatePayoutStatus = async (id: string, status: string) => {
    const updates: any = { status };
    
    if (status === "completed") {
      updates.completed_at = new Date().toISOString();
      updates.processed_at = new Date().toISOString();
    } else if (status === "rejected") {
      updates.processed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("affiliate_payouts")
      .update(updates)
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el pago",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Éxito",
        description: `Pago ${status === "completed" ? "aprobado" : "rechazado"}`,
      });
      loadPayouts();
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: "secondary",
      processing: "default",
      completed: "outline",
      rejected: "destructive",
    };

    const labels: Record<string, string> = {
      pending: "Pendiente",
      processing: "Procesando",
      completed: "Completado",
      rejected: "Rechazado",
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
        <CardTitle>Solicitudes de Pago</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Afiliado</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payouts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No hay solicitudes de pago
                </TableCell>
              </TableRow>
            ) : (
              payouts.map((payout) => (
                <TableRow key={payout.id}>
                  <TableCell>
                    {format(new Date(payout.requested_at), "dd MMM yyyy", { locale: es })}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{payout.affiliate_profiles?.full_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {payout.affiliate_profiles?.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{payout.payout_method}</TableCell>
                  <TableCell className="font-medium">
                    ${Number(payout.amount_mxn).toFixed(2)} MXN
                  </TableCell>
                  <TableCell>{getStatusBadge(payout.status)}</TableCell>
                  <TableCell>
                    {payout.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => updatePayoutStatus(payout.id, "completed")}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Aprobar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updatePayoutStatus(payout.id, "rejected")}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Rechazar
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
