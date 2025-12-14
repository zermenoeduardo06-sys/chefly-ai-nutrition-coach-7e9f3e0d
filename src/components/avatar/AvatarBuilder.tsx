import { useState } from "react";
import { motion } from "framer-motion";
import { User, Eye, Scissors, Glasses, Sparkles, Check } from "lucide-react";
import { 
  AvatarConfig, 
  SKIN_TONES, 
  BODY_COLORS, 
  EYES_STYLES, 
  HAIR_STYLES,
  HAIR_COLORS,
  GLASSES_STYLES,
  ACCESSORY_STYLES,
} from "./AvatarParts";
import ModularAvatar from "./ModularAvatar";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface AvatarBuilderProps {
  config: AvatarConfig;
  onChange: (config: AvatarConfig) => void;
}

type TabType = "body" | "eyes" | "hair" | "glasses" | "accessories";

const AvatarBuilder = ({ config, onChange }: AvatarBuilderProps) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>("body");

  const tabs = [
    { id: "body" as TabType, icon: User, label: t("avatar.body") },
    { id: "eyes" as TabType, icon: Eye, label: t("avatar.eyes") },
    { id: "hair" as TabType, icon: Scissors, label: t("avatar.hair") },
    { id: "glasses" as TabType, icon: Glasses, label: t("avatar.glasses") },
    { id: "accessories" as TabType, icon: Sparkles, label: t("avatar.accessories") },
  ];

  const updateConfig = (key: keyof AvatarConfig, value: number) => {
    onChange({ ...config, [key]: value });
  };

  const renderColorOption = (
    colors: string[],
    selectedIndex: number,
    onSelect: (index: number) => void,
    label: string
  ) => (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-foreground">{label}</h3>
      <div className="flex flex-wrap gap-3">
        {colors.map((color, index) => (
          <motion.button
            key={index}
            whileTap={{ scale: 0.9 }}
            onClick={() => onSelect(index)}
            className={cn(
              "w-12 h-12 rounded-xl border-2 transition-all",
              selectedIndex === index 
                ? "border-primary ring-2 ring-primary/30" 
                : "border-border hover:border-primary/50"
            )}
            style={{ backgroundColor: color }}
          >
            {selectedIndex === index && (
              <Check className="w-5 h-5 text-white mx-auto drop-shadow-md" />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );

  const renderStyleOption = (
    styles: string[],
    selectedIndex: number,
    onSelect: (index: number) => void,
    label: string,
    allowNone = false
  ) => (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-foreground">{label}</h3>
      <div className="grid grid-cols-3 gap-3">
        {allowNone && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(-1)}
            className={cn(
              "aspect-square rounded-xl border-2 flex items-center justify-center text-sm font-medium transition-all",
              selectedIndex === -1
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card hover:border-primary/50"
            )}
          >
            {t("avatar.none")}
          </motion.button>
        )}
        {styles.map((style, index) => (
          <motion.button
            key={index}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(index)}
            className={cn(
              "aspect-square rounded-xl border-2 p-2 transition-all overflow-hidden",
              selectedIndex === index
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:border-primary/50"
            )}
          >
            <div className="w-full h-full flex items-center justify-center">
              <ModularAvatar 
                config={{
                  ...config,
                  [activeTab === "eyes" ? "eyes" : 
                   activeTab === "hair" ? "hair" :
                   activeTab === "glasses" ? "glasses" : "accessory"]: index
                }} 
                size={70} 
              />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Avatar Preview */}
      <div className="flex justify-center py-6 bg-muted/30 rounded-2xl">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring" }}
        >
          <ModularAvatar config={config} size={180} />
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex justify-around border-b border-border pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-all",
              activeTab === tab.id
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="w-5 h-5" />
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
      <div className="space-y-6 pb-4">
        {activeTab === "body" && (
          <>
            {renderColorOption(
              SKIN_TONES,
              config.skinTone,
              (i) => updateConfig("skinTone", i),
              t("avatar.skinTone")
            )}
            {renderColorOption(
              BODY_COLORS,
              config.body,
              (i) => updateConfig("body", i),
              t("avatar.shirtColor")
            )}
          </>
        )}

        {activeTab === "eyes" && (
          renderStyleOption(
            EYES_STYLES,
            config.eyes,
            (i) => updateConfig("eyes", i),
            t("avatar.eyeStyle")
          )
        )}

        {activeTab === "hair" && (
          <>
            {renderStyleOption(
              HAIR_STYLES,
              config.hair,
              (i) => updateConfig("hair", i),
              t("avatar.hairStyle")
            )}
          </>
        )}

        {activeTab === "glasses" && (
          renderStyleOption(
            GLASSES_STYLES,
            config.glasses,
            (i) => updateConfig("glasses", i),
            t("avatar.glassesStyle"),
            true
          )
        )}

        {activeTab === "accessories" && (
          renderStyleOption(
            ACCESSORY_STYLES,
            config.accessory,
            (i) => updateConfig("accessory", i),
            t("avatar.accessoryStyle"),
            true
          )
        )}
      </div>
    </div>
  );
};

export default AvatarBuilder;
