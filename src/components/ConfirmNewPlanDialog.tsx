import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";

interface ConfirmNewPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (forceNew: boolean) => void;
  isGenerating: boolean;
}

export function ConfirmNewPlanDialog({
  open,
  onOpenChange,
  onConfirm,
  isGenerating,
}: ConfirmNewPlanDialogProps) {
  const { t } = useLanguage();
  const [generationType, setGenerationType] = useState<"cached" | "new">("cached");

  const handleConfirm = () => {
    onConfirm(generationType === "new");
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>{t('confirmPlan.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('confirmPlan.description')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <RadioGroup value={generationType} onValueChange={(value) => setGenerationType(value as "cached" | "new")} className="space-y-3 py-4">
          <div className="flex items-start space-x-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => setGenerationType("cached")}>
            <RadioGroupItem value="cached" id="cached" />
            <div className="flex-1 space-y-1">
              <Label htmlFor="cached" className="text-sm font-medium cursor-pointer">
                {t('confirmPlan.cached')}
              </Label>
              <p className="text-xs text-muted-foreground">
                {t('confirmPlan.cachedDesc')}
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => setGenerationType("new")}>
            <RadioGroupItem value="new" id="new" />
            <div className="flex-1 space-y-1">
              <Label htmlFor="new" className="text-sm font-medium cursor-pointer">
                {t('confirmPlan.new')}
              </Label>
              <p className="text-xs text-muted-foreground">
                {t('confirmPlan.newDesc')}
              </p>
            </div>
          </div>
        </RadioGroup>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isGenerating}>{t('confirmPlan.cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={isGenerating}>
            {isGenerating ? t('confirmPlan.generating') : t('confirmPlan.generate')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
