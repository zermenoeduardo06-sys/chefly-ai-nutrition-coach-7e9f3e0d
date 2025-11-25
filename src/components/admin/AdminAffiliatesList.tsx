import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Eye } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AdminAffiliatesList() {
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    loadAffiliates();
  }, [filter]);

  const loadAffiliates = async () => {
    setLoading(true);
    let query = supabase
      .from("affiliate_profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (filter !== "all") {
      query = query.eq("status", filter as any);
    }

    const { data, error } = await query;

    if (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los afiliados",
        variant: "destructive",
      });
    } else {
      setAffiliates(data || []);
    }
    setLoading(false);
  };

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
        <div className="flex items-center justify-between">
          <CardTitle>Gestión de Afiliados</CardTitle>
          <Select value={filter} onValueChange={setFilter}>
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
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Código</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Conversiones</TableHead>
              <TableHead>Ganado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {affiliates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No se encontraron afiliados
                </TableCell>
              </TableRow>
            ) : (
              affiliates.map((affiliate) => (
                <TableRow key={affiliate.id}>
                  <TableCell className="font-medium">{affiliate.full_name}</TableCell>
                  <TableCell>{affiliate.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{affiliate.affiliate_code}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(affiliate.status)}</TableCell>
                  <TableCell>{affiliate.total_conversions}</TableCell>
                  <TableCell>${Number(affiliate.total_earned_mxn).toFixed(2)} MXN</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
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
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
