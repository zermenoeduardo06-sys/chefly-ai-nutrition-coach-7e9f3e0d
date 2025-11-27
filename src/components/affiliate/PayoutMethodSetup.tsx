import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CreditCard, CheckCircle2, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface PayoutMethodSetupProps {
  profile: any;
}

export function PayoutMethodSetup({ profile }: PayoutMethodSetupProps) {
  const { t } = useLanguage();
  
  const hasPayoutMethod = profile.payout_method && (
    (profile.payout_method === "paypal" && profile.paypal_email) ||
    (profile.payout_method === "bank_transfer" && profile.bank_account && profile.bank_name) ||
    (profile.payout_method === "spei" && profile.bank_clabe)
  );

  const getMethodLabel = (method: string) => {
    switch (method) {
      case "paypal": return "PayPal";
      case "bank_transfer": return t("affiliatePayoutRequest.methodBank");
      case "spei": return "SPEI";
      default: return method;
    }
  };

  if (hasPayoutMethod) {
    return (
      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <CheckCircle2 className="h-5 w-5" />
            {t("affiliatePayoutMethod.configured")}
          </CardTitle>
          <CardDescription>
            {getMethodLabel(profile.payout_method)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="border-primary/20 bg-primary/10">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <AlertTitle className="text-primary">{t("affiliatePayoutMethod.allSet")}</AlertTitle>
            <AlertDescription>
              {t("affiliatePayoutMethod.allSetDesc")}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-dashed">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          {t("affiliatePayoutMethod.setup")}
        </CardTitle>
        <CardDescription>
          {t("affiliatePayoutMethod.setupDesc")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("affiliatePayoutMethod.configRequired")}</AlertTitle>
          <AlertDescription>
            {t("affiliatePayoutMethod.configRequiredDesc")}
          </AlertDescription>
        </Alert>
        
        <div className="space-y-2">
          <h4 className="font-medium">{t("affiliatePayoutMethod.available")}</h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>{t("affiliatePayoutMethod.paypal")}</li>
            <li>{t("affiliatePayoutMethod.bankTransfer")}</li>
            <li>{t("affiliatePayoutMethod.spei")}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
