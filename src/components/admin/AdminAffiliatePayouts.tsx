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

  const totalPendingPayouts = payouts
    .filter(p => p.status === "pending")
    .reduce((sum, p) => sum + Number(p.amount_mxn || 0), 0);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumen de Pagos Pendientes */}
      <Card className="border-2 border-primary bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>💰 Total a Pagar</span>
            <span className="text-3xl font-bold text-primary">
              ${totalPendingPayouts.toFixed(2)} MXN
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Tienes {payouts.filter(p => p.status === "pending").length} solicitudes de pago pendientes
          </p>
        </CardContent>
      </Card>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o email..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="processing">Procesando</SelectItem>
                <SelectItem value="completed">Completado</SelectItem>
                <SelectItem value="rejected">Rechazado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

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
                  <TableCell>
                    <div className="font-bold text-lg text-primary">
                      ${Number(payout.amount_mxn).toFixed(2)} MXN
                    </div>
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

        {/* Paginación */}
        {totalCount > pageSize && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-muted-foreground">
              Mostrando {((page - 1) * pageSize) + 1} a {Math.min(page * pageSize, totalCount)} de {totalCount} solicitudes
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => p + 1)}
                disabled={page * pageSize >= totalCount}
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
    </div>
  );
}
