import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Award, Medal, Crown, Star, Gem, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TIER_ICONS = {
  bronce: Award,
  plata: Medal,
  oro: Crown,
  platino: Star,
  diamante: Gem,
};

interface Tier {
  tier: string;
  name_es: string;
  min_sales_mxn: number;
  min_conversions: number;
  commission_bonus_percentage: number;
  display_order: number;
  color: string;
  icon: string;
  benefits: any;
}

interface AffiliateTierProgressProps {
  profile: any;
}

export function AffiliateTierProgress({ profile }: AffiliateTierProgressProps) {
  const { toast } = useToast();
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTiers();
  }, []);

  const loadTiers = async () => {
    try {
      const { data, error } = await supabase
        .from("affiliate_tiers")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setTiers(data || []);
    } catch (error: any) {
      console.error("Error loading tiers:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los niveles de afiliado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || tiers.length === 0) return null;

  const currentTier = tiers.find((t) => t.tier === profile.current_tier);
  const currentIndex = currentTier ? currentTier.display_order - 1 : 0;
  const nextTier = tiers[currentIndex + 1];

  const lifetimeSales = parseFloat(profile.lifetime_sales_mxn || "0");
  const totalConversions = profile.total_conversions || 0;

  const salesProgress = nextTier
    ? Math.min(100, (lifetimeSales / nextTier.min_sales_mxn) * 100)
    : 100;

  const conversionsProgress = nextTier
    ? Math.min(100, (totalConversions / nextTier.min_conversions) * 100)
    : 100;

  const CurrentIcon = currentTier ? TIER_ICONS[currentTier.tier as keyof typeof TIER_ICONS] : Award;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CurrentIcon className="h-6 w-6" style={{ color: currentTier?.color }} />
              Nivel: {currentTier?.name_es}
            </CardTitle>
            <CardDescription>
              {nextTier ? `Próximo nivel: ${nextTier.name_es}` : "¡Nivel máximo alcanzado!"}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            +{currentTier?.commission_bonus_percentage}% bonificación
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {nextTier ? (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Ventas totales</span>
                <span className="font-medium">
                  ${lifetimeSales.toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN / $
                  {nextTier.min_sales_mxn.toLocaleString("es-MX")} MXN
                </span>
              </div>
              <Progress value={salesProgress} className="h-3" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Conversiones totales</span>
                <span className="font-medium">
                  {totalConversions} / {nextTier.min_conversions}
                </span>
              </div>
              <Progress value={conversionsProgress} className="h-3" />
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Beneficios del siguiente nivel
              </h4>
              <ul className="space-y-2">
                {(Array.isArray(nextTier.benefits) ? nextTier.benefits : []).map((benefit: string, index: number) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <Gem className="h-16 w-16 mx-auto mb-4" style={{ color: currentTier?.color }} />
            <h3 className="text-xl font-semibold mb-2">¡Felicitaciones!</h3>
            <p className="text-muted-foreground">
              Has alcanzado el nivel más alto. Continúa generando ventas y disfruta de todos los beneficios.
            </p>
          </div>
        )}

        <div className="pt-4 border-t">
          <h4 className="font-semibold mb-3">Beneficios actuales</h4>
          <ul className="space-y-2">
            {(Array.isArray(currentTier?.benefits) ? currentTier.benefits : []).map((benefit: string, index: number) => (
              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-primary">✓</span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
