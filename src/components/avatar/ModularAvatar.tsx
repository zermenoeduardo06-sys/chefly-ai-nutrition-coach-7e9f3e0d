import { 
  AvatarConfig, 
  defaultAvatarConfig,
  SKIN_TONES,
  HAIR_COLORS,
  BODY_COLORS,
  EYES_STYLES,
  HAIR_STYLES,
  GLASSES_STYLES,
  ACCESSORY_STYLES,
  Face,
  Eyes,
  Mouth,
  Hair,
  Body,
  Glasses,
  Accessory,
} from "./AvatarParts";

interface ModularAvatarProps {
  config?: AvatarConfig | null;
  size?: number;
  className?: string;
}

const ModularAvatar = ({ config, size = 200, className = "" }: ModularAvatarProps) => {
  const avatarConfig = config || defaultAvatarConfig;
  
  const skinColor = SKIN_TONES[avatarConfig.skinTone] || SKIN_TONES[0];
  const hairColor = HAIR_COLORS[avatarConfig.hair] || HAIR_COLORS[0];
  const bodyColor = BODY_COLORS[avatarConfig.body] || BODY_COLORS[0];
  const eyeStyle = EYES_STYLES[avatarConfig.eyes] || EYES_STYLES[0];
  const hairStyle = HAIR_STYLES[avatarConfig.hair] || HAIR_STYLES[0];
  const glassesStyle = avatarConfig.glasses >= 0 ? GLASSES_STYLES[avatarConfig.glasses] : null;
  const accessoryStyle = avatarConfig.accessory >= 0 ? ACCESSORY_STYLES[avatarConfig.accessory] : null;

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 200 220" 
      className={className}
      style={{ overflow: "visible" }}
    >
      {/* Background circle */}
      <circle cx="100" cy="100" r="95" fill="#E8E8E8" />
      
      {/* Body */}
      <Body color={bodyColor} skinColor={skinColor} />
      
      {/* Face */}
      <Face skinColor={skinColor} />
      
      {/* Hair (behind if long) */}
      {hairStyle === "long" && (
        <g style={{ transform: "translateY(-5px)" }}>
          <Hair style={hairStyle} color={hairColor} />
        </g>
      )}
      
      {/* Eyes */}
      <Eyes style={eyeStyle} />
      
      {/* Mouth */}
      <Mouth />
      
      {/* Hair (on top) */}
      {hairStyle !== "long" && <Hair style={hairStyle} color={hairColor} />}
      
      {/* Glasses */}
      {glassesStyle && <Glasses style={glassesStyle} />}
      
      {/* Accessory */}
      {accessoryStyle && <Accessory style={accessoryStyle} hairColor={hairColor} />}
    </svg>
  );
};

export default ModularAvatar;
