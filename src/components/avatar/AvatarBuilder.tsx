import { useState } from "react";
import { motion } from "framer-motion";
import { 
  User, Eye, Scissors, Glasses, Sparkles, Check, 
  Smile, Shirt
} from "lucide-react";
import { 
  AvatarConfig, 
  SKIN_TONES, 
  FACE_SHAPES,
  EYE_COLORS,
  EYES_STYLES, 
  EYEBROW_STYLES,
  HAIR_STYLES,
  HAIR_COLORS,
  MOUTH_STYLES,
  FACIAL_HAIR_STYLES,
  GLASSES_STYLES,
  EARRING_STYLES,
  HEADWEAR_STYLES,
  OUTFIT_STYLES,
  OUTFIT_COLORS,
} from "./AvatarParts";
import ModularAvatar from "./ModularAvatar";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AvatarBuilderProps {
  config: AvatarConfig;
  onChange: (config: AvatarConfig) => void;
}

type TabType = "face" | "eyes" | "hair" | "mouth" | "outfit" | "accessories";

const AvatarBuilder = ({ config, onChange }: AvatarBuilderProps) => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>("face");

  const tabs = [
    { id: "face" as TabType, icon: User, label: language === "es" ? "Cara" : "Face" },
    { id: "eyes" as TabType, icon: Eye, label: language === "es" ? "Ojos" : "Eyes" },
    { id: "hair" as TabType, icon: Scissors, label: language === "es" ? "Cabello" : "Hair" },
    { id: "mouth" as TabType, icon: Smile, label: language === "es" ? "Boca" : "Mouth" },
    { id: "outfit" as TabType, icon: Shirt, label: language === "es" ? "Ropa" : "Outfit" },
    { id: "accessories" as TabType, icon: Sparkles, label: language === "es" ? "Accesorios" : "Accessories" },
  ];

  const updateConfig = (key: keyof AvatarConfig, value: number) => {
    onChange({ ...config, [key]: value });
  };

  const renderColorOption = (
    colors: (string | { base: string })[],
    selectedIndex: number,
    onSelect: (index: number) => void,
    label: string
  ) => (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-foreground">{label}</h3>
      <div className="flex flex-wrap gap-2">
        {colors.map((color, index) => {
          const bgColor = typeof color === 'string' ? color : color.base;
          return (
            <motion.button
              key={index}
              whileTap={{ scale: 0.9 }}
              onClick={() => onSelect(index)}
              className={cn(
                "w-10 h-10 rounded-xl border-2 transition-all",
                selectedIndex === index 
                  ? "border-primary ring-2 ring-primary/30" 
                  : "border-border hover:border-primary/50"
              )}
              style={{ backgroundColor: bgColor }}
            >
              {selectedIndex === index && (
                <Check className="w-4 h-4 text-white mx-auto drop-shadow-md" />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );

  const renderStyleOption = (
    styles: string[],
    selectedIndex: number,
    onSelect: (index: number) => void,
    label: string,
    configKey: keyof AvatarConfig,
    allowNone = false
  ) => (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-foreground">{label}</h3>
      <div className="grid grid-cols-4 gap-2">
        {allowNone && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(-1)}
            className={cn(
              "aspect-square rounded-xl border-2 flex items-center justify-center text-xs font-medium transition-all",
              selectedIndex === -1
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card hover:border-primary/50"
            )}
          >
            {language === "es" ? "Ninguno" : "None"}
          </motion.button>
        )}
        {styles.map((_, index) => (
          <motion.button
            key={index}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(index)}
            className={cn(
              "aspect-square rounded-xl border-2 p-1 transition-all overflow-hidden",
              selectedIndex === index
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:border-primary/50"
            )}
          >
            <div className="w-full h-full flex items-center justify-center">
              <ModularAvatar 
                config={{
                  ...config,
                  [configKey]: index
                }} 
                size={55} 
              />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Avatar Preview */}
      <div className="flex justify-center py-4 bg-muted/30 rounded-2xl">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring" }}
        >
          <ModularAvatar config={config} size={160} />
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex justify-around border-b border-border pb-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex flex-col items-center gap-1 py-2 px-2 rounded-lg transition-all min-w-[50px]",
              activeTab === tab.id
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="w-5 h-5" />
            <span className="text-[10px]">{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="h-0.5 w-full bg-primary rounded-full"
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <ScrollArea className="h-[280px] pr-2">
        <div className="space-y-4 pb-4">
          {activeTab === "face" && (
            <>
              {renderColorOption(
                SKIN_TONES,
                config.skinTone,
                (i) => updateConfig("skinTone", i),
                language === "es" ? "Tono de Piel" : "Skin Tone"
              )}
              {renderStyleOption(
                FACE_SHAPES,
                config.faceShape,
                (i) => updateConfig("faceShape", i),
                language === "es" ? "Forma de Cara" : "Face Shape",
                "faceShape"
              )}
            </>
          )}

          {activeTab === "eyes" && (
            <>
              {renderStyleOption(
                EYES_STYLES,
                config.eyeStyle,
                (i) => updateConfig("eyeStyle", i),
                language === "es" ? "Estilo de Ojos" : "Eye Style",
                "eyeStyle"
              )}
              {renderColorOption(
                EYE_COLORS,
                config.eyeColor,
                (i) => updateConfig("eyeColor", i),
                language === "es" ? "Color de Ojos" : "Eye Color"
              )}
              {renderStyleOption(
                EYEBROW_STYLES,
                config.eyebrowStyle,
                (i) => updateConfig("eyebrowStyle", i),
                language === "es" ? "Estilo de Cejas" : "Eyebrow Style",
                "eyebrowStyle"
              )}
            </>
          )}

          {activeTab === "hair" && (
            <>
              {renderStyleOption(
                HAIR_STYLES,
                config.hairStyle,
                (i) => updateConfig("hairStyle", i),
                language === "es" ? "Estilo de Cabello" : "Hair Style",
                "hairStyle"
              )}
              {renderColorOption(
                HAIR_COLORS,
                config.hairColor,
                (i) => updateConfig("hairColor", i),
                language === "es" ? "Color de Cabello" : "Hair Color"
              )}
              {renderStyleOption(
                FACIAL_HAIR_STYLES,
                config.facialHair,
                (i) => updateConfig("facialHair", i),
                language === "es" ? "Vello Facial" : "Facial Hair",
                "facialHair",
                true
              )}
            </>
          )}

          {activeTab === "mouth" && (
            <>
              {renderStyleOption(
                MOUTH_STYLES,
                config.mouthStyle,
                (i) => updateConfig("mouthStyle", i),
                language === "es" ? "Estilo de Boca" : "Mouth Style",
                "mouthStyle"
              )}
            </>
          )}

          {activeTab === "outfit" && (
            <>
              {renderStyleOption(
                OUTFIT_STYLES,
                config.outfit,
                (i) => updateConfig("outfit", i),
                language === "es" ? "Estilo de Ropa" : "Outfit Style",
                "outfit"
              )}
              {renderColorOption(
                OUTFIT_COLORS,
                config.outfitColor,
                (i) => updateConfig("outfitColor", i),
                language === "es" ? "Color de Ropa" : "Outfit Color"
              )}
            </>
          )}

          {activeTab === "accessories" && (
            <>
              {renderStyleOption(
                GLASSES_STYLES,
                config.glasses,
                (i) => updateConfig("glasses", i),
                language === "es" ? "Lentes" : "Glasses",
                "glasses",
                true
              )}
              {renderStyleOption(
                HEADWEAR_STYLES,
                config.headwear,
                (i) => updateConfig("headwear", i),
                language === "es" ? "Sombreros" : "Headwear",
                "headwear",
                true
              )}
              {renderStyleOption(
                EARRING_STYLES,
                config.earrings,
                (i) => updateConfig("earrings", i),
                language === "es" ? "Aretes" : "Earrings",
                "earrings",
                true
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default AvatarBuilder;
