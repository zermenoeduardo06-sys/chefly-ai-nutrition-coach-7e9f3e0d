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

interface ConfirmNewPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isGenerating: boolean;
}

export function ConfirmNewPlanDialog({
  open,
  onOpenChange,
  onConfirm,
  isGenerating,
}: ConfirmNewPlanDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Generar nuevo plan semanal?</AlertDialogTitle>
          <AlertDialogDescription>
            Esto reemplazará tu plan actual con uno completamente nuevo. Todas las comidas
            actuales serán reemplazadas. ¿Estás seguro de que quieres continuar?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isGenerating}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isGenerating}>
            {isGenerating ? "Generando..." : "Sí, generar nuevo plan"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
