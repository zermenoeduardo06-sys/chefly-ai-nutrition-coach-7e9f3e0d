import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AffiliateLinkGeneratorProps {
  affiliateCode: string;
}

export function AffiliateLinkGenerator({ affiliateCode }: AffiliateLinkGeneratorProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const baseUrl = window.location.origin;
  const affiliateLink = `${baseUrl}/?ref=${affiliateCode}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(affiliateLink);
      setCopied(true);
      toast({
        title: "¡Copiado!",
        description: "Enlace copiado al portapapeles",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar el enlace",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LinkIcon className="h-5 w-5" />
          Tu Enlace de Afiliado
        </CardTitle>
        <CardDescription>
          Comparte este enlace para ganar comisiones
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={affiliateLink}
            readOnly
            className="font-mono text-sm"
          />
          <Button
            onClick={copyToClipboard}
            variant="outline"
            size="icon"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        <div className="text-sm text-muted-foreground space-y-2">
          <p className="font-semibold">Comisiones:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Plan Básico: {affiliateCode ? '20%' : '0%'} ($48 MXN por venta)</li>
            <li>Plan Intermedio: {affiliateCode ? '25%' : '0%'} ($72.50 MXN por venta)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
