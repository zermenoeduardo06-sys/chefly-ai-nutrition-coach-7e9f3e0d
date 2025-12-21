import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Users, Check, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

interface JoinFamilyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const JoinFamilyDialog = ({ open, onOpenChange, onSuccess }: JoinFamilyDialogProps) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    familyName?: string;
    hasSpace?: boolean;
    currentMembers?: number;
    maxMembers?: number;
  } | null>(null);

  const handleCodeChange = async (code: string) => {
    const formattedCode = code.toUpperCase().replace(/[^A-Z0-9-]/g, "");
    setInviteCode(formattedCode);
    setValidationResult(null);

    if (formattedCode.length >= 10) {
      setValidating(true);
      try {
        const { data } = await supabase.functions.invoke("family-management", {
          body: { action: "validate", inviteCode: formattedCode },
        });
        setValidationResult(data);
      } catch (error) {
        console.error("Error validating code:", error);
      } finally {
        setValidating(false);
      }
    }
  };

  const handleJoin = async () => {
    if (!inviteCode || !validationResult?.valid || !validationResult?.hasSpace) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("family-management", {
        body: { action: "join", inviteCode },
      });

      if (error) throw error;

      toast({
        title: language === "es" ? "¡Te uniste a la familia!" : "Joined family!",
        description: language === "es" 
          ? `Ahora eres parte de ${data.family.name}` 
          : `You're now part of ${data.family.name}`,
      });
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: language === "es" ? "Error" : "Error",
        description: error instanceof Error ? error.message : "Error joining family",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            {language === "es" ? "Unirse a una familia" : "Join a family"}
          </DialogTitle>
          <DialogDescription>
            {language === "es" 
              ? "Ingresa el código de invitación que te compartieron" 
              : "Enter the invite code that was shared with you"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="relative">
            <Input
              value={inviteCode}
              onChange={(e) => handleCodeChange(e.target.value)}
              placeholder="FAM-XXXXXX"
              className="text-center font-mono text-lg tracking-widest pr-10"
              maxLength={10}
            />
            {validating && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
            {!validating && validationResult && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {validationResult.valid && validationResult.hasSpace ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-destructive" />
                )}
              </div>
            )}
          </div>

          {validationResult && (
            <div className={`rounded-lg p-3 text-sm ${
              validationResult.valid && validationResult.hasSpace
                ? "bg-green-500/10 text-green-700 dark:text-green-400"
                : "bg-destructive/10 text-destructive"
            }`}>
              {validationResult.valid ? (
                validationResult.hasSpace ? (
                  <p>
                    <span className="font-semibold">{validationResult.familyName}</span>
                    <br />
                    <span className="text-xs opacity-80">
                      {validationResult.currentMembers}/{validationResult.maxMembers} {language === "es" ? "miembros" : "members"}
                    </span>
                  </p>
                ) : (
                  <p>
                    {language === "es" 
                      ? "Esta familia ha alcanzado el límite de miembros" 
                      : "This family has reached its member limit"}
                  </p>
                )
              ) : (
                <p>
                  {language === "es" 
                    ? "Código de invitación inválido" 
                    : "Invalid invite code"}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            {language === "es" ? "Cancelar" : "Cancel"}
          </Button>
          <Button
            onClick={handleJoin}
            disabled={loading || !validationResult?.valid || !validationResult?.hasSpace}
            className="flex-1"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {language === "es" ? "Unirse" : "Join"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
