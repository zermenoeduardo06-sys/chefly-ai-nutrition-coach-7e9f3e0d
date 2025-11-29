import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface AffiliateMarketingMaterialsProps {
  affiliateCode: string;
}

export function AffiliateMarketingMaterials({ affiliateCode }: AffiliateMarketingMaterialsProps) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const bannerUrl = `${window.location.origin}/programa-afiliados?ref=${affiliateCode}`;

  const materials = [
    {
      title: "Banner 728x90",
      code: `<a href="${bannerUrl}"><img src="${window.location.origin}/banner-728x90.png" alt="Chefly Banner" /></a>`,
    },
    {
      title: "Banner 300x250",
      code: `<a href="${bannerUrl}"><img src="${window.location.origin}/banner-300x250.png" alt="Chefly Banner" /></a>`,
    },
  ];

  const copyTexts = [
    {
      title: "Texto Promocional - Corto",
      text: `🥗 Transforma tu alimentación con Chefly - Planes personalizados con IA. Usa mi código: ${affiliateCode} y ahorra en tu suscripción. ${bannerUrl}`,
    },
    {
      title: "Texto Promocional - Largo",
      text: `¿Cansado de las dietas genéricas? 💪\n\nDescubre Chefly, la plataforma de nutrición personalizada con IA que se adapta a TUS necesidades:\n\n✅ Planes 100% personalizados\n✅ Recetas deliciosas y fáciles\n✅ Seguimiento de progreso\n✅ Chat con nutricionista IA\n\nUsa mi código de afiliado: ${affiliateCode} para obtener un descuento especial.\n\n👉 ${bannerUrl}`,
    },
    {
      title: "Post para Redes Sociales",
      text: `🌟 Nuevo descubrimiento: Chefly\n\nLlevo usando esta app de nutrición y los resultados son increíbles. Lo mejor es que TODO es personalizado para ti.\n\n🎁 Usa mi código: ${affiliateCode}\n\n🔗 ${bannerUrl}\n\n#Chefly #VidaSaludable #NutriciónPersonalizada`,
    },
  ];

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast({
      title: "¡Copiado!",
      description: "El texto ha sido copiado al portapapeles",
    });
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Materiales de Marketing</CardTitle>
          <CardDescription>
            Descarga banners y copia textos promocionales listos para usar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Banners HTML</h3>
            <div className="space-y-4">
              {materials.map((material, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{material.title}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(material.code, index)}
                    >
                      {copiedIndex === index ? (
                        <Check className="h-4 w-4 mr-2" />
                      ) : (
                        <Copy className="h-4 w-4 mr-2" />
                      )}
                      Copiar código
                    </Button>
                  </div>
                  <code className="block p-3 bg-muted rounded-md text-xs overflow-x-auto">
                    {material.code}
                  </code>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Textos Promocionales</h3>
            <div className="space-y-4">
              {copyTexts.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.title}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(item.text, index + materials.length)}
                    >
                      {copiedIndex === index + materials.length ? (
                        <Check className="h-4 w-4 mr-2" />
                      ) : (
                        <Copy className="h-4 w-4 mr-2" />
                      )}
                      Copiar texto
                    </Button>
                  </div>
                  <div className="p-3 bg-muted rounded-md text-sm whitespace-pre-wrap">
                    {item.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
