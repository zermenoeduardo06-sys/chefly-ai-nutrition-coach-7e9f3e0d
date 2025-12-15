import { 
  AvatarConfig, 
  defaultAvatarConfig,
  SKIN_TONES,
  HAIR_COLORS,
  EYE_COLORS,
  FACE_SHAPES,
  EYES_STYLES,
  EYEBROW_STYLES,
  HAIR_STYLES,
  MOUTH_STYLES,
  FACIAL_HAIR_STYLES,
  GLASSES_STYLES,
  EARRING_STYLES,
  HEADWEAR_STYLES,
  OUTFIT_STYLES,
  OUTFIT_COLORS,
  AvatarDefs,
  Face,
  Eyes,
  Eyebrows,
  Mouth,
  FacialHair,
  Hair,
  Body,
  Glasses,
  Earrings,
  Headwear,
} from "./AvatarParts";

interface ModularAvatarProps {
  config?: AvatarConfig | null;
  size?: number;
  className?: string;
}

const ModularAvatar = ({ config, size = 200, className = "" }: ModularAvatarProps) => {
  // Merge with defaults for backwards compatibility
  const avatarConfig: AvatarConfig = {
    ...defaultAvatarConfig,
    ...(config || {}),
    // Map old 'body' to 'outfitColor' for backwards compatibility
    outfitColor: config?.outfitColor ?? (config as any)?.body ?? defaultAvatarConfig.outfitColor,
  };
  
  const skinTone = SKIN_TONES[avatarConfig.skinTone] || SKIN_TONES[0];
  const hairColor = HAIR_COLORS[avatarConfig.hairColor] || HAIR_COLORS[0];
  const eyeColor = EYE_COLORS[avatarConfig.eyeColor] || EYE_COLORS[0];
  const faceShape = FACE_SHAPES[avatarConfig.faceShape] || FACE_SHAPES[0];
  const eyeStyle = EYES_STYLES[avatarConfig.eyeStyle] || EYES_STYLES[0];
  const eyebrowStyle = EYEBROW_STYLES[avatarConfig.eyebrowStyle] || EYEBROW_STYLES[0];
  const hairStyle = HAIR_STYLES[avatarConfig.hairStyle] || HAIR_STYLES[0];
  const mouthStyle = MOUTH_STYLES[avatarConfig.mouthStyle] || MOUTH_STYLES[0];
  const facialHairStyle = avatarConfig.facialHair >= 0 ? FACIAL_HAIR_STYLES[avatarConfig.facialHair] : null;
  const glassesStyle = avatarConfig.glasses >= 0 ? GLASSES_STYLES[avatarConfig.glasses] : null;
  const earringStyle = avatarConfig.earrings >= 0 ? EARRING_STYLES[avatarConfig.earrings] : null;
  const headwearStyle = avatarConfig.headwear >= 0 ? HEADWEAR_STYLES[avatarConfig.headwear] : null;
  const outfitStyle = OUTFIT_STYLES[avatarConfig.outfit] || OUTFIT_STYLES[0];
  const outfitColor = OUTFIT_COLORS[avatarConfig.outfitColor] || OUTFIT_COLORS[0];

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 200 200" 
      className={className}
      style={{ overflow: "visible" }}
    >
      {/* Gradient Definitions */}
      <AvatarDefs skinTone={skinTone} hairColor={hairColor} outfitColor={outfitColor} />
      
      {/* Background circle */}
      <circle cx="100" cy="100" r="95" fill="#E8E8E8" />
      
      {/* Hair behind (for long styles) */}
      {(hairStyle === "long" || hairStyle === "longWavy" || hairStyle === "braids") && (
        <g style={{ transform: "translateY(-5px)" }}>
          <Hair style={hairStyle} color={hairColor} />
        </g>
      )}
      
      {/* Body/Outfit */}
      <Body style={outfitStyle} color={outfitColor} skinTone={skinTone} />
      
      {/* Face */}
      <Face skinTone={skinTone} faceShape={faceShape} />
      
      {/* Earrings (behind face features) */}
      {earringStyle && <Earrings style={earringStyle} />}
      
      {/* Eyebrows */}
      <Eyebrows style={eyebrowStyle} hairColor={hairColor} />
      
      {/* Eyes */}
      <Eyes style={eyeStyle} eyeColor={eyeColor} />
      
      {/* Mouth */}
      <Mouth style={mouthStyle} />
      
      {/* Facial Hair */}
      {facialHairStyle && <FacialHair style={facialHairStyle} color={hairColor} />}
      
      {/* Hair on top (for short styles) */}
      {hairStyle !== "long" && hairStyle !== "longWavy" && hairStyle !== "braids" && (
        <Hair style={hairStyle} color={hairColor} />
      )}
      
      {/* Glasses */}
      {glassesStyle && <Glasses style={glassesStyle} />}
      
      {/* Headwear (on top of everything) */}
      {headwearStyle && <Headwear style={headwearStyle} hairColor={hairColor} />}
    </svg>
  );
};

export default ModularAvatar;
