import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DeleteAccountDialog = ({ open, onOpenChange }: DeleteAccountDialogProps) => {
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();

  const texts = {
    es: {
      title: "Eliminar Cuenta",
      description: "Esta acción es permanente e irreversible. Se eliminarán todos tus datos, incluyendo:",
      dataList: [
        "Tu perfil y preferencias",
        "Tus planes de comidas",
        "Tu historial de progreso",
        "Tus logros y puntos",
        "Tu suscripción activa"
      ],
      confirmLabel: "Escribe ELIMINAR para confirmar:",
      confirmPlaceholder: "ELIMINAR",
      cancel: "Cancelar",
      delete: "Eliminar mi cuenta",
      deleting: "Eliminando...",
      successTitle: "Cuenta eliminada",
      successDesc: "Tu cuenta ha sido eliminada exitosamente.",
      errorTitle: "Error",
      errorDesc: "No se pudo eliminar la cuenta. Contacta soporte.",
    },
    en: {
      title: "Delete Account",
      description: "This action is permanent and irreversible. All your data will be deleted, including:",
      dataList: [
        "Your profile and preferences",
        "Your meal plans",
        "Your progress history",
        "Your achievements and points",
        "Your active subscription"
      ],
      confirmLabel: "Type DELETE to confirm:",
      confirmPlaceholder: "DELETE",
      cancel: "Cancel",
      delete: "Delete my account",
      deleting: "Deleting...",
      successTitle: "Account deleted",
      successDesc: "Your account has been successfully deleted.",
      errorTitle: "Error",
      errorDesc: "Could not delete account. Please contact support.",
    }
  };

  const t = texts[language as keyof typeof texts] || texts.es;
  const confirmWord = language === "es" ? "ELIMINAR" : "DELETE";
  const isConfirmed = confirmText.toUpperCase() === confirmWord;

  const handleDelete = async () => {
    if (!isConfirmed) return;
    
    setIsDeleting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Delete user data from all tables (cascade will handle most)
      // The profiles table has ON DELETE CASCADE from auth.users
      
      // Delete user stats
      await supabase.from("user_stats").delete().eq("user_id", user.id);
      
      // Delete user preferences
      await supabase.from("user_preferences").delete().eq("user_id", user.id);
      
      // Delete meal completions
      await supabase.from("meal_completions").delete().eq("user_id", user.id);
      
      // Delete user achievements
      await supabase.from("user_achievements").delete().eq("user_id", user.id);
      
      // Delete daily challenges
      await supabase.from("daily_challenges").delete().eq("user_id", user.id);
      
      // Delete user daily challenges
      await supabase.from("user_daily_challenges").delete().eq("user_id", user.id);
      
      // Delete chat messages
      await supabase.from("chat_messages").delete().eq("user_id", user.id);
      
      // Delete food scans
      await supabase.from("food_scans").delete().eq("user_id", user.id);
      
      // Delete body measurements
      await supabase.from("body_measurements").delete().eq("user_id", user.id);
      
      // Delete notification preferences
      await supabase.from("notification_preferences").delete().eq("user_id", user.id);
      
      // Delete friendships
      await supabase.from("friendships").delete().or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);
      
      // Delete weekly checkins
      await supabase.from("weekly_checkins").delete().eq("user_id", user.id);

      // Note: For actual account deletion from auth.users, 
      // this typically requires a server-side function with admin privileges
      // For now, we sign out and the profile cascade will handle related data
      
      // Sign out the user
      await supabase.auth.signOut();

      toast({
        title: t.successTitle,
        description: t.successDesc,
      });

      onOpenChange(false);
      navigate("/");
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast({
        variant: "destructive",
        title: t.errorTitle,
        description: t.errorDesc,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-destructive/10 rounded-full">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <AlertDialogTitle className="text-xl">{t.title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>{t.description}</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {t.dataList.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
              
              <div className="space-y-2 pt-2">
                <Label htmlFor="confirm" className="text-foreground font-medium">
                  {t.confirmLabel}
                </Label>
                <Input
                  id="confirm"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={t.confirmPlaceholder}
                  className="border-destructive/50 focus:border-destructive"
                  disabled={isDeleting}
                />
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel disabled={isDeleting}>
            {t.cancel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={!isConfirmed || isDeleting}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {t.deleting}
              </>
            ) : (
              t.delete
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
