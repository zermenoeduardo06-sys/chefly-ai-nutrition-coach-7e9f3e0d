import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Loader2, Check, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useHaptics } from "@/hooks/useHaptics";
import { motion } from "framer-motion";

interface ChallengePhotoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  challenge: {
    id: string;
    title: string;
    description: string;
    points_reward: number;
  } | null;
  onComplete: () => void;
}

export function ChallengePhotoDialog({
  open,
  onOpenChange,
  challenge,
  onComplete,
}: ChallengePhotoDialogProps) {
  const { language } = useLanguage();
  const { toast } = useToast();
  const { mediumImpact, successNotification, celebrationPattern } = useHaptics();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const texts = {
    es: {
      title: "Toma una foto",
      description: "Sube una foto para completar el desafío",
      takePhoto: "Tomar foto",
      uploadPhoto: "Subir imagen",
      complete: "Completar desafío",
      cancel: "Cancelar",
      uploading: "Subiendo...",
      successTitle: "¡Desafío completado!",
      successDesc: "Has ganado puntos por completar el desafío",
      errorTitle: "Error",
      errorDesc: "No se pudo subir la foto",
    },
    en: {
      title: "Take a photo",
      description: "Upload a photo to complete the challenge",
      takePhoto: "Take photo",
      uploadPhoto: "Upload image",
      complete: "Complete challenge",
      cancel: "Cancel",
      uploading: "Uploading...",
      successTitle: "Challenge completed!",
      successDesc: "You've earned points for completing the challenge",
      errorTitle: "Error",
      errorDesc: "Could not upload the photo",
    },
  };

  const t = texts[language];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      mediumImpact();
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCapture = () => {
    mediumImpact();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const compressImage = async (base64: string, maxWidth = 800): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ratio = maxWidth / img.width;
        canvas.width = maxWidth;
        canvas.height = img.height * ratio;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.src = base64;
    });
  };

  const handleComplete = async () => {
    if (!selectedImage || !challenge) return;

    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");

      // Compress image
      const compressedImage = await compressImage(selectedImage);
      
      // Convert base64 to blob
      const base64Data = compressedImage.split(",")[1];
      const binaryData = atob(base64Data);
      const bytes = new Uint8Array(binaryData.length);
      for (let i = 0; i < binaryData.length; i++) {
        bytes[i] = binaryData.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: "image/jpeg" });

      // Upload to storage
      const fileName = `challenge_${challenge.id}_${Date.now()}.jpg`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("food-scans")
        .upload(filePath, blob, {
          contentType: "image/jpeg",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("food-scans")
        .getPublicUrl(filePath);

      // Save to food_scans table
      const { error: insertError } = await supabase
        .from("food_scans")
        .insert({
          user_id: user.id,
          dish_name: challenge.title,
          notes: challenge.description,
          image_url: urlData.publicUrl,
          scanned_at: new Date().toISOString(),
        });

      if (insertError) throw insertError;

      // Mark challenge as completed
      const { error: progressError } = await supabase
        .from("user_daily_challenges")
        .upsert({
          user_id: user.id,
          challenge_id: challenge.id,
          progress: 1,
          is_completed: true,
        });

      if (progressError) throw progressError;

      // Update user points
      const { data: stats } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (stats) {
        const newPoints = stats.total_points + challenge.points_reward;
        const newLevel = Math.floor(newPoints / 100) + 1;

        await supabase
          .from("user_stats")
          .update({
            total_points: newPoints,
            level: newLevel,
          })
          .eq("user_id", user.id);
      }

      // Haptic celebration
      successNotification();
      setTimeout(() => celebrationPattern(), 200);

      toast({
        title: `🎉 ${t.successTitle}`,
        description: `+${challenge.points_reward} ${language === "es" ? "puntos" : "points"}`,
      });

      onComplete();
      onOpenChange(false);
      setSelectedImage(null);

    } catch (error: any) {
      console.error("Error completing challenge:", error);
      toast({
        variant: "destructive",
        title: t.errorTitle,
        description: t.errorDesc,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedImage(null);
    onOpenChange(false);
  };

  if (!challenge) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            {t.title}
          </DialogTitle>
          <DialogDescription>
            {challenge.title} - {t.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image preview or capture area */}
          {selectedImage ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              <img
                src={selectedImage}
                alt="Challenge"
                className="w-full h-64 object-cover rounded-2xl"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full"
                onClick={() => setSelectedImage(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </motion.div>
          ) : (
            <div 
              onClick={handleCapture}
              className="w-full h-64 border-2 border-dashed border-primary/30 rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
            >
              <div className="p-4 rounded-full bg-primary/10">
                <Camera className="h-10 w-10 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground text-center px-4">
                {language === "es" 
                  ? "Toca para tomar o subir una foto"
                  : "Tap to take or upload a photo"
                }
              </p>
            </div>
          )}

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isUploading}
            >
              {t.cancel}
            </Button>
            <Button
              onClick={handleComplete}
              disabled={!selectedImage || isUploading}
              className="flex-1"
              variant="duolingo"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {t.uploading}
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  {t.complete}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
