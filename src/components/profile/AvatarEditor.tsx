import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/avatarColors";
import { Check, X, Camera, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

// Predefined avatar background colors - Duolingo inspired palette
const AVATAR_COLORS = [
  { id: "coral", color: "bg-[hsl(12,76%,61%)]", hex: "#E07A5F" },
  { id: "orange", color: "bg-[hsl(24,95%,53%)]", hex: "#F77F00" },
  { id: "yellow", color: "bg-[hsl(45,93%,47%)]", hex: "#FCBF49" },
  { id: "green", color: "bg-[hsl(142,76%,36%)]", hex: "#2D9A3E" },
  { id: "teal", color: "bg-[hsl(173,58%,39%)]", hex: "#2A9D8F" },
  { id: "blue", color: "bg-[hsl(207,90%,54%)]", hex: "#3B82F6" },
  { id: "indigo", color: "bg-[hsl(239,84%,67%)]", hex: "#6366F1" },
  { id: "purple", color: "bg-[hsl(271,91%,65%)]", hex: "#A855F7" },
  { id: "pink", color: "bg-[hsl(330,81%,60%)]", hex: "#EC4899" },
  { id: "red", color: "bg-[hsl(0,84%,60%)]", hex: "#EF4444" },
  { id: "slate", color: "bg-[hsl(215,16%,47%)]", hex: "#64748B" },
  { id: "zinc", color: "bg-[hsl(240,4%,46%)]", hex: "#71717A" },
];

interface AvatarEditorProps {
  displayName: string;
  avatarUrl: string | null;
  currentColor: string | null;
  onColorSelect: (colorId: string) => void;
  onUploadClick: () => void;
  onSave: () => void;
  onCancel: () => void;
  uploading?: boolean;
  saving?: boolean;
}

export function AvatarEditor({
  displayName,
  avatarUrl,
  currentColor,
  onColorSelect,
  onUploadClick,
  onSave,
  onCancel,
  uploading = false,
  saving = false,
}: AvatarEditorProps) {
  const { t } = useLanguage();
  const [selectedColor, setSelectedColor] = useState(currentColor || "coral");

  const handleColorSelect = (colorId: string) => {
    setSelectedColor(colorId);
    onColorSelect(colorId);
  };

  const getColorClass = (colorId: string) => {
    return AVATAR_COLORS.find(c => c.id === colorId)?.color || AVATAR_COLORS[0].color;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 bg-background border-b border-border"
      >
        <div className="flex items-center justify-between px-4 py-4">
          <button onClick={onCancel} className="p-2 -ml-2">
            <X className="h-6 w-6 text-muted-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">{t("avatar.editTitle")}</h1>
          <button 
            onClick={onSave} 
            disabled={saving}
            className="text-primary font-semibold disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : "OK"}
          </button>
        </div>
      </motion.div>

      {/* Avatar Preview */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-muted/30 py-12 flex justify-center"
      >
        <div className="relative">
          <Avatar className="h-40 w-40 border-4 border-primary/30 shadow-2xl">
            <AvatarImage src={avatarUrl || undefined} alt={displayName} />
            <AvatarFallback className={`${getColorClass(selectedColor)} text-white text-5xl font-bold`}>
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          {uploading && (
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-white" />
            </div>
          )}
        </div>
      </motion.div>

      {/* Color Selector */}
      <div className="px-4 py-6 space-y-6">
        {/* Upload Photo Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Button
            variant="outline"
            onClick={onUploadClick}
            disabled={uploading}
            className="w-full h-14 rounded-2xl border-2 border-border text-base font-semibold gap-2"
          >
            <Camera className="h-5 w-5" />
            {t("avatar.uploadPhoto")}
          </Button>
        </motion.div>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-sm text-muted-foreground">{t("avatar.orChooseColor")}</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Color Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {t("avatar.backgroundColor")}
          </h3>
          <div className="grid grid-cols-6 gap-3">
            <AnimatePresence>
              {AVATAR_COLORS.map((color, index) => (
                <motion.button
                  key={color.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + index * 0.02 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleColorSelect(color.id)}
                  className={`
                    aspect-square rounded-xl ${color.color} 
                    flex items-center justify-center
                    border-2 transition-all
                    ${selectedColor === color.id 
                      ? "border-primary ring-2 ring-primary/30" 
                      : "border-transparent"
                    }
                  `}
                >
                  {selectedColor === color.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Check className="h-5 w-5 text-white drop-shadow-md" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Preview Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl border border-border p-4"
        >
          <p className="text-sm text-muted-foreground text-center">
            {t("avatar.previewHint")}
          </p>
        </motion.div>
      </div>
    </div>
  );
}

// Export colors for use in other components
export const AVATAR_COLOR_MAP = AVATAR_COLORS.reduce((acc, color) => {
  acc[color.id] = color.color;
  return acc;
}, {} as Record<string, string>);

export function getAvatarColorById(colorId: string | null): string {
  if (!colorId) return AVATAR_COLORS[0].color;
  return AVATAR_COLORS.find(c => c.id === colorId)?.color || AVATAR_COLORS[0].color;
}
