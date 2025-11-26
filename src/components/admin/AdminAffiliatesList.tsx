import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X, Eye, Download, Search, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export function AdminAffiliatesList() {
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedAffiliate, setSelectedAffiliate] = useState<any>(null);
  const [editingCommission, setEditingCommission] = useState(false);
  const [newBasicRate, setNewBasicRate] = useState("");
  const [newIntermediateRate, setNewIntermediateRate] = useState("");
  const { toast } = useToast();
  const pageSize = 10;

  useEffect(() => {
    loadAffiliates();
  }, [filter, searchQuery, page]);

  const loadAffiliates = async () => {
    setLoading(true);
    let query = supabase
      .from("affiliate_profiles")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (filter !== "all") {
      query = query.eq("status", filter as any);
    }

    if (searchQuery.trim()) {
      query = query.or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,affiliate_code.ilike.%${searchQuery}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los afiliados",
        variant: "destructive",
      });
    } else {
      setAffiliates(data || []);
      setTotalCount(count || 0);
    }
    setLoading(false);
  };

  const updateCommissions = async () => {
    if (!selectedAffiliate) return;

    const { error } = await supabase
      .from("affiliate_profiles")
      .update({
        commission_rate_basic: Number(newBasicRate),
        commission_rate_intermediate: Number(newIntermediateRate),
      })
      .eq("id", selectedAffiliate.id);

    if (error) {
      toast({
        title: "Error",
        description: "No se pudieron actualizar las comisiones",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Éxito",
        description: "Comisiones actualizadas correctamente",
      });
      setEditingCommission(false);
      loadAffiliates();
    }
  };

  const exportToCSV = () => {
    const headers = ["Nombre", "Email", "Código", "Estado", "Tier", "Conversiones", "Total Ganado", "Balance Pendiente"];
    const rows = affiliates.map(a => [
      a.full_name,
      a.email,
      a.affiliate_code,
      a.status,
      a.current_tier,
      a.total_conversions || 0,
      Number(a.total_earned_mxn || 0).toFixed(2),
      Number(a.pending_balance_mxn || 0).toFixed(2),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `afiliados_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: "Exportación Completa",
      description: "Archivo CSV descargado exitosamente",
    });
  };

  const totalPages = Math.ceil(totalCount / pageSize);
  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("affiliate_profiles")
      .update({ 
        status: status as any,
        approved_at: status === "active" ? new Date().toISOString() : null 
      })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Éxito",
        description: `Afiliado ${status === "active" ? "aprobado" : "rechazado"}`,
      });
      loadAffiliates();
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: "secondary",
      active: "default",
      suspended: "destructive",
      inactive: "outline",
    };

    const labels: Record<string, string> = {
      pending: "Pendiente",
      active: "Activo",
      suspended: "Suspendido",
      inactive: "Inactivo",
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
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle>Gestión de Afiliados ({totalCount})</CardTitle>
            <Button onClick={exportToCSV} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>

          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, email o código..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="pl-8"
              />
            </div>
            <Select value={filter} onValueChange={(v) => { setFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="suspended">Suspendidos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Código</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Conversiones</TableHead>
              <TableHead>Ganado</TableHead>
              <TableHead className="text-right">Balance Pendiente</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {affiliates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                  No se encontraron afiliados
                </TableCell>
              </TableRow>
            ) : (
              affiliates.map((affiliate) => {
                const pendingBalance = Number(affiliate.pending_balance_mxn || 0);
                const canRequestPayout = pendingBalance >= 200;
                
                return (
                <TableRow key={affiliate.id}>
                  <TableCell className="font-medium">{affiliate.full_name}</TableCell>
                  <TableCell className="text-sm">{affiliate.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{affiliate.affiliate_code}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="capitalize">{affiliate.current_tier}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(affiliate.status)}</TableCell>
                  <TableCell>{affiliate.total_conversions || 0}</TableCell>
                  <TableCell className="font-medium">
                    ${Number(affiliate.total_earned_mxn || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className={`font-bold ${canRequestPayout ? 'text-lg text-primary' : ''}`}>
                      ${pendingBalance.toFixed(2)} MXN
                    </div>
                    {canRequestPayout && (
                      <Badge variant="default" className="mt-1 bg-primary">
                        ✓ Puede retirar
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedAffiliate(affiliate);
                              setNewBasicRate(affiliate.commission_rate_basic?.toString() || "20");
                              setNewIntermediateRate(affiliate.commission_rate_intermediate?.toString() || "25");
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Detalles del Afiliado</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm text-muted-foreground">Nombre Completo</Label>
                                <p className="font-medium">{selectedAffiliate?.full_name}</p>
                              </div>
                              <div>
                                <Label className="text-sm text-muted-foreground">Email</Label>
                                <p className="font-medium">{selectedAffiliate?.email}</p>
                              </div>
                              <div>
                                <Label className="text-sm text-muted-foreground">Teléfono</Label>
                                <p className="font-medium">{selectedAffiliate?.phone || "N/A"}</p>
                              </div>
                              <div>
                                <Label className="text-sm text-muted-foreground">País</Label>
                                <p className="font-medium">{selectedAffiliate?.country || "N/A"}</p>
                              </div>
                              <div>
                                <Label className="text-sm text-muted-foreground">Código</Label>
                                <p className="font-medium">{selectedAffiliate?.affiliate_code}</p>
                              </div>
                              <div>
                                <Label className="text-sm text-muted-foreground">Estado</Label>
                                <div className="mt-1">{selectedAffiliate && getStatusBadge(selectedAffiliate.status)}</div>
                              </div>
                              <div>
                                <Label className="text-sm text-muted-foreground">Total Clics</Label>
                                <p className="font-medium">{selectedAffiliate?.total_clicks || 0}</p>
                              </div>
                              <div>
                                <Label className="text-sm text-muted-foreground">Conversiones</Label>
                                <p className="font-medium">{selectedAffiliate?.total_conversions || 0}</p>
                              </div>
                              <div>
                                <Label className="text-sm text-muted-foreground">Total Ganado</Label>
                                <p className="font-medium text-primary">
                                  ${Number(selectedAffiliate?.total_earned_mxn || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                                </p>
                              </div>
                              <div>
                                <Label className="text-sm text-muted-foreground">Balance Pendiente</Label>
                                <p className="font-medium">
                                  ${Number(selectedAffiliate?.pending_balance_mxn || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                                </p>
                              </div>
                            </div>

                            <div className="border-t pt-4">
                              <div className="flex items-center justify-between mb-4">
                                <Label className="text-base font-semibold">Comisiones</Label>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingCommission(!editingCommission)}
                                >
                                  {editingCommission ? "Cancelar" : "Editar"}
                                </Button>
                              </div>
                              {editingCommission ? (
                                <div className="space-y-3">
                                  <div>
                                    <Label>Plan Básico (%)</Label>
                                    <Input
                                      type="number"
                                      value={newBasicRate}
                                      onChange={(e) => setNewBasicRate(e.target.value)}
                                      placeholder="20"
                                    />
                                  </div>
                                  <div>
                                    <Label>Plan Intermedio (%)</Label>
                                    <Input
                                      type="number"
                                      value={newIntermediateRate}
                                      onChange={(e) => setNewIntermediateRate(e.target.value)}
                                      placeholder="25"
                                    />
                                  </div>
                                  <Button onClick={updateCommissions} className="w-full">
                                    Guardar Cambios
                                  </Button>
                                </div>
                              ) : (
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm text-muted-foreground">Plan Básico</Label>
                                    <p className="font-medium">{selectedAffiliate?.commission_rate_basic || 20}%</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm text-muted-foreground">Plan Intermedio</Label>
                                    <p className="font-medium">{selectedAffiliate?.commission_rate_intermediate || 25}%</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      {affiliate.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => updateStatus(affiliate.id, "active")}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateStatus(affiliate.id, "inactive")}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {affiliate.status === "active" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus(affiliate.id, "suspended")}
                        >
                          Suspender
                        </Button>
                      )}
                      {affiliate.status === "suspended" && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => updateStatus(affiliate.id, "active")}
                        >
                          Activar
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
              })
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
