import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Search, ChevronLeft, ChevronRight, Check, X } from "lucide-react";
import { Label } from "@/components/ui/label";

export function AdminAffiliateSales() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const { toast } = useToast();
  const pageSize = 20;

  useEffect(() => {
    loadSales();
  }, [statusFilter, searchQuery, dateFrom, dateTo, page]);

  const loadSales = async () => {
    setLoading(true);
    let query = supabase
      .from("affiliate_sales")
      .select(`
        *,
        affiliate_profiles (
          full_name,
          affiliate_code
        )
      `, { count: "exact" })
      .order("created_at", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (statusFilter !== "all") {
      query = query.eq("commission_status", statusFilter as "pending" | "approved" | "paid" | "rejected");
    }

    if (searchQuery.trim()) {
      query = query.or(`customer_email.ilike.%${searchQuery}%,plan_name.ilike.%${searchQuery}%`);
    }

    if (dateFrom) {
      query = query.gte("created_at", new Date(dateFrom).toISOString());
    }

    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      query = query.lte("created_at", endDate.toISOString());
    }

    const { data, error, count } = await query;

    if (!error && data) {
      setSales(data);
      setTotalCount(count || 0);
    }
    setLoading(false);
  };

  const updateSaleStatus = async (id: string, newStatus: string) => {
    const updates: any = { commission_status: newStatus };
    
    if (newStatus === "approved") {
      updates.approved_at = new Date().toISOString();
    } else if (newStatus === "paid") {
      updates.paid_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("affiliate_sales")
      .update(updates)
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la venta",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Éxito",
        description: "Venta actualizada correctamente",
      });
      loadSales();
    }
  };

  const exportToCSV = () => {
    const headers = ["Fecha", "Afiliado", "Código", "Cliente", "Plan", "Venta (MXN)", "Comisión (MXN)", "Tasa (%)", "Estado"];
    const rows = sales.map(s => [
      format(new Date(s.created_at), "dd/MM/yyyy HH:mm"),
      s.affiliate_profiles?.full_name || "N/A",
      s.affiliate_profiles?.affiliate_code || "N/A",
      s.customer_email,
      s.plan_name,
      Number(s.sale_amount_mxn).toFixed(2),
      Number(s.commission_amount_mxn).toFixed(2),
      Number(s.commission_rate).toFixed(2),
      s.commission_status,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ventas_afiliados_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: "Exportación Completa",
      description: "Archivo CSV descargado exitosamente",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: "secondary",
      approved: "default",
      paid: "outline",
      rejected: "destructive",
    };

    const labels: Record<string, string> = {
      pending: "Pendiente",
      approved: "Aprobado",
      paid: "Pagado",
      rejected: "Rechazado",
    };

    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  const totalPages = Math.ceil(totalCount / pageSize);
  const totalSales = sales.reduce((sum, s) => sum + Number(s.sale_amount_mxn), 0);
  const totalCommissions = sales.reduce((sum, s) => sum + Number(s.commission_amount_mxn), 0);

  if (loading && page === 1) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Historial de Ventas ({totalCount})</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Total Ventas: ${totalSales.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN | 
                Comisiones: ${totalCommissions.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
              </p>
            </div>
            <Button onClick={exportToCSV} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por email o plan..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="pl-8"
              />
            </div>

            <div>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setPage(1);
                }}
                placeholder="Desde"
              />
            </div>

            <div>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setPage(1);
                }}
                placeholder="Hasta"
              />
            </div>

            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="approved">Aprobado</SelectItem>
                <SelectItem value="paid">Pagado</SelectItem>
                <SelectItem value="rejected">Rechazado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
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
              <TableHead>Tasa</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                  No hay ventas registradas con los filtros seleccionados
                </TableCell>
              </TableRow>
            ) : (
              sales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="text-sm">
                    {format(new Date(sale.created_at), "dd MMM yyyy HH:mm", { locale: es })}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-sm">{sale.affiliate_profiles?.full_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {sale.affiliate_profiles?.affiliate_code}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{sale.customer_email}</TableCell>
                  <TableCell className="text-sm">{sale.plan_name}</TableCell>
                  <TableCell className="font-medium">
                    ${Number(sale.sale_amount_mxn).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="font-medium text-primary">
                    ${Number(sale.commission_amount_mxn).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-sm">{Number(sale.commission_rate).toFixed(1)}%</TableCell>
                  <TableCell>{getStatusBadge(sale.commission_status)}</TableCell>
                  <TableCell>
                    {sale.commission_status === "pending" && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => updateSaleStatus(sale.id, "approved")}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateSaleStatus(sale.id, "rejected")}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    {sale.commission_status === "approved" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateSaleStatus(sale.id, "paid")}
                      >
                        Marcar Pagado
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Mostrando {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, totalCount)} de {totalCount}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                      className="min-w-[2rem]"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
