import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface AffiliatePayoutRequestProps {
  profile: any;
  onSuccess: () => void;
}

export function AffiliatePayoutRequest({ profile, onSuccess }: AffiliatePayoutRequestProps) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [payoutMethod, setPayoutMethod] = useState(profile.payout_method || "paypal");

  const minPayout = 200; // Mínimo $200 MXN
  const availableBalance = parseFloat(profile.pending_balance_mxn || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const requestAmount = parseFloat(amount);
    
    if (requestAmount < minPayout) {
      toast({
        title: t("affiliatePayoutRequest.insufficientAmount"),
        description: `${t("affiliatePayoutRequest.insufficientAmountDesc")}${minPayout} MXN`,
        variant: "destructive",
      });
      return;
    }

    if (requestAmount > availableBalance) {
      toast({
        title: t("affiliatePayoutRequest.insufficientBalance"),
        description: t("affiliatePayoutRequest.insufficientBalanceDesc"),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from("affiliate_payouts")
        .insert({
          affiliate_id: profile.id,
          amount_mxn: requestAmount,
          payout_method: payoutMethod,
          status: "pending",
        });

      if (error) throw error;

      toast({
        title: t("affiliatePayoutRequest.success"),
        description: t("affiliatePayoutRequest.successDesc").replace("{{amount}}", requestAmount.toFixed(2)),
      });

      setAmount("");
      onSuccess();
    } catch (error: any) {
      console.error("Error requesting payout:", error);
      const errorMsg = error?.message || t("affiliatePayoutRequest.error");
      toast({
        title: t("affiliatePayoutRequest.error"),
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          {t("affiliatePayoutRequest.title")}
        </CardTitle>
        <CardDescription>
          {t("affiliatePayoutRequest.available")}: ${availableBalance.toFixed(2)} MXN • {t("affiliatePayoutRequest.processTime")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">{t("affiliatePayoutRequest.amount")}</Label>
            <Input
              id="amount"
              type="number"
              min={minPayout}
              max={availableBalance}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`${t("affiliatePayoutRequest.amountPlaceholder")}${minPayout}`}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="method">{t("affiliatePayoutRequest.method")}</Label>
            <Select value={payoutMethod} onValueChange={setPayoutMethod}>
              <SelectTrigger id="method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paypal">{t("affiliatePayoutRequest.methodPaypal")}</SelectItem>
                <SelectItem value="bank_transfer">{t("affiliatePayoutRequest.methodBank")}</SelectItem>
                <SelectItem value="spei">{t("affiliatePayoutRequest.methodSpei")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={loading || availableBalance < minPayout}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("affiliatePayoutRequest.submitting")}
              </>
            ) : (
              t("affiliatePayoutRequest.submit")
            )}
          </Button>

          {availableBalance < minPayout && (
            <p className="text-xs text-muted-foreground text-center">
              {t("affiliatePayoutRequest.minRequired")} ${minPayout} MXN {t("affiliatePayoutRequest.minRequiredEnd")}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
