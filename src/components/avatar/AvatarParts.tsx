// Bitmoji 3D-style Avatar Parts

export interface AvatarConfig {
  // Face
  skinTone: number;
  faceShape: number;
  
  // Eyes
  eyeStyle: number;
  eyeColor: number;
  eyebrowStyle: number;
  
  // Hair
  hairStyle: number;
  hairColor: number;
  
  // Mouth
  mouthStyle: number;
  
  // Facial Hair
  facialHair: number;
  
  // Accessories
  glasses: number;
  earrings: number;
  headwear: number;
  
  // Outfit
  outfit: number;
  outfitColor: number;
}

export const defaultAvatarConfig: AvatarConfig = {
  skinTone: 0,
  faceShape: 0,
  eyeStyle: 0,
  eyeColor: 0,
  eyebrowStyle: 0,
  hairStyle: 0,
  hairColor: 0,
  mouthStyle: 0,
  facialHair: -1,
  glasses: -1,
  earrings: -1,
  headwear: -1,
  outfit: 0,
  outfitColor: 0,
};

// Skin tones with shadow variants
export const SKIN_TONES = [
  { base: "#FFDBB4", shadow: "#E8C49E", highlight: "#FFE8C8" },
  { base: "#F5D0B5", shadow: "#DEB99E", highlight: "#FFE0C5" },
  { base: "#E8B894", shadow: "#D1A17D", highlight: "#F5C8A8" },
  { base: "#D4915E", shadow: "#BD7A47", highlight: "#E8A572" },
  { base: "#C17F4E", shadow: "#AA6837", highlight: "#D59362" },
  { base: "#A0664C", shadow: "#894F35", highlight: "#B47A60" },
  { base: "#8B5A3C", shadow: "#744325", highlight: "#9F6E50" },
  { base: "#6B4423", shadow: "#542D0C", highlight: "#7F5837" },
];

// Hair colors
export const HAIR_COLORS = [
  "#1A1A1A", // Black
  "#3D2314", // Dark brown
  "#6B4423", // Medium brown
  "#8B4513", // Light brown
  "#D4A574", // Blonde
  "#F0D58C", // Light blonde
  "#B7410E", // Red
  "#FF6B35", // Orange/Ginger
  "#708090", // Gray
  "#E8E8E8", // White/Silver
  "#FF69B4", // Pink
  "#9B59B6", // Purple
  "#3498DB", // Blue
  "#2ECC71", // Green
];

// Eye colors
export const EYE_COLORS = [
  "#4A3728", // Dark brown
  "#8B4513", // Brown
  "#6B8E23", // Hazel/Green
  "#228B22", // Green
  "#4169E1", // Blue
  "#87CEEB", // Light blue
  "#708090", // Gray
  "#000000", // Black
];

// Face shapes
export const FACE_SHAPES = ["oval", "round", "square", "heart"];

// Eyes styles
export const EYES_STYLES = [
  "normal", "happy", "wink", "surprised", "sleepy", 
  "flirty", "confident", "cute"
];

// Eyebrow styles
export const EYEBROW_STYLES = [
  "natural", "arched", "straight", "thick", "thin", "angry"
];

// Hair styles (15+ options)
export const HAIR_STYLES = [
  "short", "shortCurly", "medium", "mediumWavy", "long", 
  "longWavy", "ponytail", "ponytailHigh", "bun", "bunMessy",
  "braids", "afro", "mohawk", "spiky", "sidePart", "bald"
];

// Mouth styles
export const MOUTH_STYLES = [
  "smile", "smileOpen", "neutral", "smirk", "surprised", "kiss"
];

// Facial hair styles (-1 = none)
export const FACIAL_HAIR_STYLES = [
  "stubble", "beard", "beardFull", "mustache", "goatee"
];

// Glasses styles (-1 = none)
export const GLASSES_STYLES = [
  "round", "square", "aviator", "catEye", "sunglasses", "sunglassesAviator"
];

// Earring styles (-1 = none)
export const EARRING_STYLES = [
  "studs", "hoops", "hoopsLarge", "dangles"
];

// Headwear styles (-1 = none)
export const HEADWEAR_STYLES = [
  "cap", "beanie", "headband", "bandana", "flowerCrown", "bow"
];

// Outfit styles
export const OUTFIT_STYLES = [
  "tshirt", "hoodie", "jacket", "sweater", "tank", "collar", "vneck"
];

// Outfit colors
export const OUTFIT_COLORS = [
  "#4A90D9", // Blue
  "#58CC02", // Green
  "#FF6B6B", // Coral/Red
  "#9B59B6", // Purple
  "#F39C12", // Orange
  "#1ABC9C", // Teal
  "#E91E63", // Pink
  "#333333", // Black
  "#F5F5F5", // White
  "#8B4513", // Brown
  "#FFD700", // Yellow
  "#2C3E50", // Navy
];

// SVG Gradient Definitions
export const AvatarDefs = ({ skinTone, hairColor, outfitColor }: { 
  skinTone: typeof SKIN_TONES[0]; 
  hairColor: string;
  outfitColor: string;
}) => (
  <defs>
    {/* Skin gradients */}
    <radialGradient id="skinGradient" cx="50%" cy="30%" r="70%">
      <stop offset="0%" stopColor={skinTone.highlight} />
      <stop offset="50%" stopColor={skinTone.base} />
      <stop offset="100%" stopColor={skinTone.shadow} />
    </radialGradient>
    <linearGradient id="skinShadow" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor={skinTone.base} />
      <stop offset="100%" stopColor={skinTone.shadow} />
    </linearGradient>
    
    {/* Hair gradient */}
    <linearGradient id="hairGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor={hairColor} />
      <stop offset="100%" stopColor={adjustColor(hairColor, -30)} />
    </linearGradient>
    
    {/* Outfit gradient */}
    <linearGradient id="outfitGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor={outfitColor} />
      <stop offset="100%" stopColor={adjustColor(outfitColor, -40)} />
    </linearGradient>
    
    {/* Highlight */}
    <radialGradient id="cheekBlush" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#FF9999" stopOpacity="0.5" />
      <stop offset="100%" stopColor="#FF9999" stopOpacity="0" />
    </radialGradient>
    
    {/* Nose highlight */}
    <linearGradient id="noseHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
      <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
    </linearGradient>
  </defs>
);

// Helper to adjust color brightness
function adjustColor(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(hex.slice(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.slice(2, 4), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.slice(4, 6), 16) + amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Face component with 3D effect
export const Face = ({ skinTone, faceShape }: { skinTone: typeof SKIN_TONES[0]; faceShape: string }) => {
  const getHeadPath = () => {
    switch (faceShape) {
      case "round":
        return <ellipse cx="100" cy="90" rx="52" ry="55" />;
      case "square":
        return <rect x="48" y="35" width="104" height="110" rx="25" />;
      case "heart":
        return <path d="M100 145 Q48 120 48 75 Q48 35 100 35 Q152 35 152 75 Q152 120 100 145" />;
      default: // oval
        return <ellipse cx="100" cy="88" rx="50" ry="58" />;
    }
  };

  return (
    <g>
      {/* Shadow under face */}
      <ellipse cx="100" cy="150" rx="45" ry="8" fill={skinTone.shadow} opacity="0.3" />
      
      {/* Main face */}
      <g fill="url(#skinGradient)">
        {getHeadPath()}
      </g>
      
      {/* Ears */}
      <ellipse cx="48" cy="90" rx="8" ry="14" fill={skinTone.base} />
      <ellipse cx="48" cy="90" rx="5" ry="9" fill={skinTone.shadow} opacity="0.3" />
      <ellipse cx="152" cy="90" rx="8" ry="14" fill={skinTone.base} />
      <ellipse cx="152" cy="90" rx="5" ry="9" fill={skinTone.shadow} opacity="0.3" />
      
      {/* Nose */}
      <ellipse cx="100" cy="100" rx="6" ry="8" fill={skinTone.shadow} opacity="0.25" />
      <ellipse cx="98" cy="98" rx="3" ry="4" fill="url(#noseHighlight)" />
      
      {/* Cheeks blush */}
      <ellipse cx="68" cy="105" rx="14" ry="10" fill="url(#cheekBlush)" />
      <ellipse cx="132" cy="105" rx="14" ry="10" fill="url(#cheekBlush)" />
    </g>
  );
};

// Eyes with iris colors
export const Eyes = ({ style, eyeColor }: { style: string; eyeColor: string }) => {
  const renderEye = (cx: number, isWinking = false) => {
    if (isWinking) {
      return <path d={`M${cx - 12} 78 Q${cx} 68 ${cx + 12} 78`} stroke="#333" strokeWidth="3" fill="none" strokeLinecap="round" />;
    }
    
    return (
      <g>
        {/* Eye white with shadow */}
        <ellipse cx={cx} cy="78" rx="14" ry="16" fill="white" />
        <ellipse cx={cx} cy="75" rx="13" ry="8" fill="#F0F0F0" opacity="0.5" />
        
        {/* Iris */}
        <ellipse cx={cx} cy="80" rx="9" ry="11" fill={eyeColor} />
        
        {/* Pupil */}
        <ellipse cx={cx} cy="80" rx="5" ry="6" fill="#1A1A1A" />
        
        {/* Highlight */}
        <circle cx={cx - 3} cy="76" r="3" fill="white" />
        <circle cx={cx + 2} cy="82" r="1.5" fill="white" opacity="0.7" />
      </g>
    );
  };

  switch (style) {
    case "happy":
      return (
        <g>
          <path d="M62 78 Q75 65 88 78" stroke="#333" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M112 78 Q125 65 138 78" stroke="#333" strokeWidth="4" fill="none" strokeLinecap="round" />
        </g>
      );
    case "wink":
      return (
        <g>
          {renderEye(75)}
          {renderEye(125, true)}
        </g>
      );
    case "surprised":
      return (
        <g>
          <ellipse cx="75" cy="78" rx="16" ry="18" fill="white" />
          <ellipse cx="75" cy="80" rx="10" ry="12" fill={eyeColor} />
          <ellipse cx="75" cy="80" rx="6" ry="7" fill="#1A1A1A" />
          <circle cx="72" cy="76" r="3" fill="white" />
          
          <ellipse cx="125" cy="78" rx="16" ry="18" fill="white" />
          <ellipse cx="125" cy="80" rx="10" ry="12" fill={eyeColor} />
          <ellipse cx="125" cy="80" rx="6" ry="7" fill="#1A1A1A" />
          <circle cx="122" cy="76" r="3" fill="white" />
        </g>
      );
    case "sleepy":
      return (
        <g>
          <path d="M62 80 L88 80" stroke="#333" strokeWidth="4" strokeLinecap="round" />
          <path d="M112 80 L138 80" stroke="#333" strokeWidth="4" strokeLinecap="round" />
          <path d="M65 76 L85 76" stroke="#333" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
          <path d="M115 76 L135 76" stroke="#333" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        </g>
      );
    case "flirty":
      return (
        <g>
          {renderEye(75)}
          <path d="M112 78 Q125 68 138 78" stroke="#333" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* Eyelashes */}
          <path d="M60 72 L55 65" stroke="#333" strokeWidth="2" strokeLinecap="round" />
          <path d="M68 68 L65 60" stroke="#333" strokeWidth="2" strokeLinecap="round" />
          <path d="M82 68 L85 60" stroke="#333" strokeWidth="2" strokeLinecap="round" />
        </g>
      );
    case "confident":
      return (
        <g>
          {renderEye(75)}
          {renderEye(125)}
          {/* Slight squint effect */}
          <path d="M60 72 Q75 70 90 72" stroke="#333" strokeWidth="2" fill="none" opacity="0.3" />
          <path d="M110 72 Q125 70 140 72" stroke="#333" strokeWidth="2" fill="none" opacity="0.3" />
        </g>
      );
    case "cute":
      return (
        <g>
          {/* Bigger, rounder eyes */}
          <ellipse cx="75" cy="80" rx="16" ry="18" fill="white" />
          <ellipse cx="75" cy="82" rx="11" ry="13" fill={eyeColor} />
          <ellipse cx="75" cy="82" rx="6" ry="7" fill="#1A1A1A" />
          <circle cx="71" cy="77" r="4" fill="white" />
          <circle cx="78" cy="85" r="2" fill="white" opacity="0.7" />
          
          <ellipse cx="125" cy="80" rx="16" ry="18" fill="white" />
          <ellipse cx="125" cy="82" rx="11" ry="13" fill={eyeColor} />
          <ellipse cx="125" cy="82" rx="6" ry="7" fill="#1A1A1A" />
          <circle cx="121" cy="77" r="4" fill="white" />
          <circle cx="128" cy="85" r="2" fill="white" opacity="0.7" />
        </g>
      );
    default: // normal
      return (
        <g>
          {renderEye(75)}
          {renderEye(125)}
        </g>
      );
  }
};

// Eyebrows
export const Eyebrows = ({ style, hairColor }: { style: string; hairColor: string }) => {
  const browColor = adjustColor(hairColor, -20);
  
  switch (style) {
    case "arched":
      return (
        <g stroke={browColor} strokeWidth="3" fill="none" strokeLinecap="round">
          <path d="M58 62 Q75 54 90 60" />
          <path d="M110 60 Q125 54 142 62" />
        </g>
      );
    case "straight":
      return (
        <g stroke={browColor} strokeWidth="3" fill="none" strokeLinecap="round">
          <path d="M60 60 L88 60" />
          <path d="M112 60 L140 60" />
        </g>
      );
    case "thick":
      return (
        <g fill={browColor}>
          <path d="M58 56 Q75 50 90 56 L88 62 Q75 58 60 62 Z" />
          <path d="M110 56 Q125 50 142 56 L140 62 Q125 58 112 62 Z" />
        </g>
      );
    case "thin":
      return (
        <g stroke={browColor} strokeWidth="1.5" fill="none" strokeLinecap="round">
          <path d="M62 60 Q75 56 88 60" />
          <path d="M112 60 Q125 56 138 60" />
        </g>
      );
    case "angry":
      return (
        <g stroke={browColor} strokeWidth="3" fill="none" strokeLinecap="round">
          <path d="M60 64 Q75 56 90 58" />
          <path d="M110 58 Q125 56 140 64" />
        </g>
      );
    default: // natural
      return (
        <g stroke={browColor} strokeWidth="2.5" fill="none" strokeLinecap="round">
          <path d="M60 62 Q75 56 88 60" />
          <path d="M112 60 Q125 56 140 62" />
        </g>
      );
  }
};

// Mouth styles
export const Mouth = ({ style }: { style: string }) => {
  switch (style) {
    case "smileOpen":
      return (
        <g>
          <path d="M80 118 Q100 135 120 118" fill="#333" />
          <path d="M85 118 Q100 128 115 118" fill="white" />
          <path d="M88 126 Q100 130 112 126" fill="#E57373" />
        </g>
      );
    case "neutral":
      return <path d="M85 120 L115 120" stroke="#333" strokeWidth="3" strokeLinecap="round" />;
    case "smirk":
      return <path d="M80 118 Q100 118 115 112" stroke="#333" strokeWidth="3" fill="none" strokeLinecap="round" />;
    case "surprised":
      return (
        <g>
          <ellipse cx="100" cy="122" rx="10" ry="12" fill="#333" />
          <ellipse cx="100" cy="120" rx="8" ry="8" fill="#6B1A1A" />
        </g>
      );
    case "kiss":
      return (
        <g>
          <ellipse cx="100" cy="120" rx="8" ry="6" fill="#E57373" />
          <ellipse cx="100" cy="118" rx="4" ry="3" fill="#F48FB1" />
        </g>
      );
    default: // smile
      return (
        <g>
          <path d="M80 115 Q100 130 120 115" stroke="#333" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* Lip color hint */}
          <path d="M85 117 Q100 125 115 117" stroke="#E57373" strokeWidth="1.5" fill="none" opacity="0.5" />
        </g>
      );
  }
};

// Facial Hair
export const FacialHair = ({ style, color }: { style: string; color: string }) => {
  const darkColor = adjustColor(color, -40);
  
  switch (style) {
    case "stubble":
      return (
        <g fill={darkColor} opacity="0.3">
          {Array.from({ length: 30 }).map((_, i) => (
            <circle 
              key={i} 
              cx={70 + Math.random() * 60} 
              cy={115 + Math.random() * 30} 
              r="0.8" 
            />
          ))}
        </g>
      );
    case "beard":
      return (
        <path 
          d="M60 110 Q60 150 100 155 Q140 150 140 110" 
          fill={darkColor} 
          opacity="0.8"
        />
      );
    case "beardFull":
      return (
        <g fill={darkColor}>
          <path d="M55 100 Q50 160 100 170 Q150 160 145 100" opacity="0.8" />
          <path d="M70 95 Q75 100 80 95" stroke={darkColor} strokeWidth="3" fill="none" />
          <path d="M120 95 Q125 100 130 95" stroke={darkColor} strokeWidth="3" fill="none" />
        </g>
      );
    case "mustache":
      return (
        <path 
          d="M75 112 Q85 118 100 115 Q115 118 125 112 Q120 108 100 110 Q80 108 75 112" 
          fill={darkColor}
        />
      );
    case "goatee":
      return (
        <g fill={darkColor}>
          <path d="M85 112 Q90 115 100 115 Q110 115 115 112 Q110 108 100 110 Q90 108 85 112" />
          <path d="M90 125 Q100 145 110 125 Q105 135 100 138 Q95 135 90 125" />
        </g>
      );
    default:
      return null;
  }
};

// Hair styles with 3D gradient effect
export const Hair = ({ style, color }: { style: string; color: string }) => {
  const darkColor = adjustColor(color, -30);
  
  switch (style) {
    case "short":
      return (
        <g>
          <path d="M50 65 Q50 30 100 28 Q150 30 150 65 Q140 50 100 48 Q60 50 50 65" fill="url(#hairGradient)" />
          <path d="M55 60 Q55 40 100 38 Q145 40 145 60" fill={darkColor} opacity="0.3" />
        </g>
      );
    case "shortCurly":
      return (
        <g fill="url(#hairGradient)">
          <circle cx="60" cy="45" r="14" />
          <circle cx="80" cy="35" r="14" />
          <circle cx="100" cy="30" r="16" />
          <circle cx="120" cy="35" r="14" />
          <circle cx="140" cy="45" r="14" />
          <circle cx="52" cy="60" r="10" />
          <circle cx="148" cy="60" r="10" />
        </g>
      );
    case "medium":
      return (
        <g>
          <path d="M45 70 Q45 25 100 22 Q155 25 155 70 L150 85 Q100 60 50 85 Z" fill="url(#hairGradient)" />
          <path d="M50 65 Q50 35 100 32 Q150 35 150 65" fill={darkColor} opacity="0.3" />
        </g>
      );
    case "mediumWavy":
      return (
        <g fill="url(#hairGradient)">
          <path d="M45 70 Q45 25 100 22 Q155 25 155 70 Q145 90 140 100 Q135 85 125 95 Q115 80 105 95 Q95 80 85 95 Q75 85 65 100 Q55 90 45 70" />
        </g>
      );
    case "long":
      return (
        <g>
          <path d="M40 70 Q40 20 100 18 Q160 20 160 70 L160 140 Q155 150 145 145 L145 75 Q100 50 55 75 L55 145 Q45 150 40 140 Z" fill="url(#hairGradient)" />
          <path d="M45 65 Q45 30 100 28 Q155 30 155 65" fill={darkColor} opacity="0.3" />
        </g>
      );
    case "longWavy":
      return (
        <g fill="url(#hairGradient)">
          <path d="M40 70 Q40 20 100 18 Q160 20 160 70 Q165 100 160 130 Q155 150 150 140 Q155 110 150 85 Q140 70 130 90 Q120 70 110 95 Q100 75 90 95 Q80 70 70 90 Q60 70 50 85 Q45 110 50 140 Q45 150 40 130 Q35 100 40 70" />
        </g>
      );
    case "ponytail":
      return (
        <g fill="url(#hairGradient)">
          <path d="M50 60 Q50 28 100 25 Q150 28 150 60 Q140 50 100 48 Q60 50 50 60" />
          <ellipse cx="158" cy="55" rx="12" ry="35" />
          <circle cx="155" cy="30" r="8" />
        </g>
      );
    case "ponytailHigh":
      return (
        <g fill="url(#hairGradient)">
          <path d="M50 60 Q50 28 100 25 Q150 28 150 60 Q140 50 100 48 Q60 50 50 60" />
          <ellipse cx="100" cy="10" rx="20" ry="25" />
          <circle cx="100" cy="-5" r="12" />
        </g>
      );
    case "bun":
      return (
        <g fill="url(#hairGradient)">
          <path d="M50 60 Q50 28 100 25 Q150 28 150 60 Q140 50 100 48 Q60 50 50 60" />
          <circle cx="100" cy="15" r="20" />
        </g>
      );
    case "bunMessy":
      return (
        <g fill="url(#hairGradient)">
          <path d="M50 60 Q50 28 100 25 Q150 28 150 60 Q140 50 100 48 Q60 50 50 60" />
          <circle cx="100" cy="12" r="22" />
          <circle cx="85" cy="5" r="8" />
          <circle cx="115" cy="5" r="8" />
          <circle cx="100" cy="-5" r="6" />
        </g>
      );
    case "braids":
      return (
        <g fill="url(#hairGradient)">
          <path d="M50 60 Q50 28 100 25 Q150 28 150 60 Q140 50 100 48 Q60 50 50 60" />
          {/* Left braid */}
          <ellipse cx="45" cy="80" rx="8" ry="12" />
          <ellipse cx="42" cy="105" rx="7" ry="10" />
          <ellipse cx="40" cy="128" rx="6" ry="9" />
          {/* Right braid */}
          <ellipse cx="155" cy="80" rx="8" ry="12" />
          <ellipse cx="158" cy="105" rx="7" ry="10" />
          <ellipse cx="160" cy="128" rx="6" ry="9" />
        </g>
      );
    case "afro":
      return (
        <g fill="url(#hairGradient)">
          <ellipse cx="100" cy="60" rx="65" ry="55" />
          <ellipse cx="100" cy="55" rx="60" ry="50" fill={darkColor} opacity="0.2" />
        </g>
      );
    case "mohawk":
      return (
        <g fill="url(#hairGradient)">
          <path d="M80 65 L85 10 L95 40 L100 5 L105 40 L115 10 L120 65 Q100 55 80 65" />
        </g>
      );
    case "spiky":
      return (
        <g fill="url(#hairGradient)">
          <path d="M50 60 L58 25 L70 50 L82 15 L95 45 L105 10 L115 45 L130 15 L142 50 L150 25 L155 60 Q100 45 50 60" />
        </g>
      );
    case "sidePart":
      return (
        <g fill="url(#hairGradient)">
          <path d="M45 70 Q45 30 100 25 Q155 30 155 60 Q145 50 100 48 Q55 55 45 70" />
          <path d="M45 70 Q40 90 48 100 L52 75 Q55 65 45 70" />
        </g>
      );
    case "bald":
    default:
      return null;
  }
};

// Glasses
export const Glasses = ({ style }: { style: string }) => {
  switch (style) {
    case "square":
      return (
        <g>
          <rect x="52" y="65" width="40" height="30" rx="4" fill="none" stroke="#333" strokeWidth="3" />
          <rect x="108" y="65" width="40" height="30" rx="4" fill="none" stroke="#333" strokeWidth="3" />
          <path d="M92 80 L108 80" stroke="#333" strokeWidth="3" />
          <path d="M52 75 L42 72" stroke="#333" strokeWidth="3" />
          <path d="M148 75 L158 72" stroke="#333" strokeWidth="3" />
        </g>
      );
    case "aviator":
      return (
        <g>
          <path d="M50 70 Q50 60 65 60 L85 60 Q95 60 95 75 Q95 95 72 95 Q50 95 50 70" fill="none" stroke="#B8860B" strokeWidth="2.5" />
          <path d="M105 70 Q105 60 120 60 L140 60 Q150 60 150 75 Q150 95 128 95 Q105 95 105 70" fill="none" stroke="#B8860B" strokeWidth="2.5" />
          <path d="M95 72 L105 72" stroke="#B8860B" strokeWidth="2.5" />
          <path d="M50 70 L40 68" stroke="#B8860B" strokeWidth="2.5" />
          <path d="M150 70 L160 68" stroke="#B8860B" strokeWidth="2.5" />
        </g>
      );
    case "catEye":
      return (
        <g>
          <path d="M50 85 Q50 65 75 65 Q95 65 95 80 Q95 95 75 95 Q50 95 50 85" fill="none" stroke="#9C27B0" strokeWidth="2.5" />
          <path d="M50 65 L45 58" stroke="#9C27B0" strokeWidth="2.5" />
          <path d="M105 85 Q105 65 125 65 Q145 65 145 80 Q145 95 125 95 Q105 95 105 85" fill="none" stroke="#9C27B0" strokeWidth="2.5" />
          <path d="M145 65 L150 58" stroke="#9C27B0" strokeWidth="2.5" />
          <path d="M95 78 L105 78" stroke="#9C27B0" strokeWidth="2.5" />
        </g>
      );
    case "sunglasses":
      return (
        <g>
          <ellipse cx="72" cy="80" rx="25" ry="20" fill="#1a1a1a" />
          <ellipse cx="128" cy="80" rx="25" ry="20" fill="#1a1a1a" />
          <path d="M97 78 L103 78" stroke="#333" strokeWidth="4" />
          <path d="M47 78 L40 74" stroke="#333" strokeWidth="3" />
          <path d="M153 78 L160 74" stroke="#333" strokeWidth="3" />
          {/* Reflection */}
          <ellipse cx="65" cy="75" rx="8" ry="5" fill="white" opacity="0.15" />
          <ellipse cx="121" cy="75" rx="8" ry="5" fill="white" opacity="0.15" />
        </g>
      );
    case "sunglassesAviator":
      return (
        <g>
          <path d="M48 72 Q48 58 68 58 L82 58 Q97 58 97 78 Q97 98 72 98 Q48 98 48 72" fill="#1a1a1a" />
          <path d="M103 72 Q103 58 123 58 L137 58 Q152 58 152 78 Q152 98 127 98 Q103 98 103 72" fill="#1a1a1a" />
          <path d="M97 72 L103 72" stroke="#B8860B" strokeWidth="2.5" />
          <path d="M48 70 L38 66" stroke="#B8860B" strokeWidth="2.5" />
          <path d="M152 70 L162 66" stroke="#B8860B" strokeWidth="2.5" />
          {/* Reflection */}
          <path d="M58 68 Q68 65 78 70" stroke="white" strokeWidth="2" opacity="0.2" fill="none" />
          <path d="M113 68 Q123 65 133 70" stroke="white" strokeWidth="2" opacity="0.2" fill="none" />
        </g>
      );
    default: // round
      return (
        <g>
          <circle cx="72" cy="80" r="22" fill="none" stroke="#333" strokeWidth="3" />
          <circle cx="128" cy="80" r="22" fill="none" stroke="#333" strokeWidth="3" />
          <path d="M94 80 L106 80" stroke="#333" strokeWidth="3" />
          <path d="M50 78 L40 74" stroke="#333" strokeWidth="3" />
          <path d="M150 78 L160 74" stroke="#333" strokeWidth="3" />
        </g>
      );
  }
};

// Earrings
export const Earrings = ({ style }: { style: string }) => {
  switch (style) {
    case "hoops":
      return (
        <g stroke="#FFD700" strokeWidth="2" fill="none">
          <circle cx="44" cy="102" r="8" />
          <circle cx="156" cy="102" r="8" />
        </g>
      );
    case "hoopsLarge":
      return (
        <g stroke="#FFD700" strokeWidth="2.5" fill="none">
          <circle cx="42" cy="108" r="14" />
          <circle cx="158" cy="108" r="14" />
        </g>
      );
    case "dangles":
      return (
        <g fill="#FFD700">
          <circle cx="44" cy="98" r="3" />
          <ellipse cx="44" cy="112" rx="4" ry="8" />
          <circle cx="156" cy="98" r="3" />
          <ellipse cx="156" cy="112" rx="4" ry="8" />
        </g>
      );
    default: // studs
      return (
        <g fill="#FFD700">
          <circle cx="45" cy="95" r="4" />
          <circle cx="155" cy="95" r="4" />
          {/* Sparkle effect */}
          <circle cx="45" cy="95" r="2" fill="white" opacity="0.5" />
          <circle cx="155" cy="95" r="2" fill="white" opacity="0.5" />
        </g>
      );
  }
};

// Headwear
export const Headwear = ({ style, hairColor }: { style: string; hairColor: string }) => {
  switch (style) {
    case "cap":
      return (
        <g>
          <ellipse cx="100" cy="38" rx="55" ry="12" fill="#333" />
          <path d="M50 38 Q50 15 100 12 Q150 15 150 38" fill="#333" />
          <path d="M45 38 L60 45 L45 50" fill="#333" />
        </g>
      );
    case "beanie":
      return (
        <g>
          <path d="M48 55 Q48 15 100 12 Q152 15 152 55" fill="#E74C3C" />
          <ellipse cx="100" cy="55" rx="52" ry="8" fill="#C0392B" />
          <circle cx="100" cy="5" r="8" fill="#E74C3C" />
        </g>
      );
    case "headband":
      return (
        <path d="M45 55 Q100 42 155 55" stroke="#FF6B6B" strokeWidth="10" fill="none" strokeLinecap="round" />
      );
    case "bandana":
      return (
        <g fill="#E74C3C">
          <path d="M45 60 Q100 45 155 60 L155 50 Q100 35 45 50 Z" />
          <path d="M45 55 L35 75 L30 70 L38 52" />
        </g>
      );
    case "flowerCrown":
      return (
        <g>
          <path d="M45 50 Q100 35 155 50" stroke="#228B22" strokeWidth="4" fill="none" />
          <circle cx="60" cy="42" r="8" fill="#FF69B4" />
          <circle cx="80" cy="36" r="9" fill="#FFD700" />
          <circle cx="100" cy="34" r="10" fill="#FF6B6B" />
          <circle cx="120" cy="36" r="9" fill="#9B59B6" />
          <circle cx="140" cy="42" r="8" fill="#3498DB" />
          {/* Flower centers */}
          <circle cx="60" cy="42" r="3" fill="#FFD700" />
          <circle cx="80" cy="36" r="3" fill="#FF6B6B" />
          <circle cx="100" cy="34" r="4" fill="#FFD700" />
          <circle cx="120" cy="36" r="3" fill="#FFD700" />
          <circle cx="140" cy="42" r="3" fill="#FF69B4" />
        </g>
      );
    case "bow":
      return (
        <g fill="#FF69B4">
          <ellipse cx="70" cy="35" rx="18" ry="12" />
          <ellipse cx="130" cy="35" rx="18" ry="12" />
          <circle cx="100" cy="38" r="10" />
          <circle cx="100" cy="38" r="5" fill="#E91E63" />
        </g>
      );
    default:
      return null;
  }
};

// Outfit/Body
export const Body = ({ style, color, skinTone }: { 
  style: string; 
  color: string; 
  skinTone: typeof SKIN_TONES[0];
}) => {
  const renderOutfit = () => {
    switch (style) {
      case "hoodie":
        return (
          <g>
            <path d="M45 200 Q45 165 100 158 Q155 165 155 200 L155 220 L45 220 Z" fill="url(#outfitGradient)" />
            {/* Hood */}
            <path d="M55 165 Q55 150 100 145 Q145 150 145 165" fill="url(#outfitGradient)" stroke={adjustColor(color, -30)} strokeWidth="2" />
            {/* Strings */}
            <path d="M85 175 L82 195" stroke={adjustColor(color, -40)} strokeWidth="2" />
            <path d="M115 175 L118 195" stroke={adjustColor(color, -40)} strokeWidth="2" />
            {/* Pocket */}
            <path d="M70 195 L130 195 L130 210 L70 210 Z" fill={adjustColor(color, -20)} opacity="0.5" />
          </g>
        );
      case "jacket":
        return (
          <g>
            <path d="M45 200 Q45 165 100 158 Q155 165 155 200 L155 220 L45 220 Z" fill="url(#outfitGradient)" />
            {/* Zipper */}
            <path d="M100 165 L100 220" stroke={adjustColor(color, -50)} strokeWidth="3" />
            {/* Collar */}
            <path d="M80 162 L100 175 L120 162" stroke="url(#outfitGradient)" strokeWidth="8" fill="none" />
            <path d="M75 160 L85 175" stroke={adjustColor(color, -30)} strokeWidth="2" />
            <path d="M125 160 L115 175" stroke={adjustColor(color, -30)} strokeWidth="2" />
          </g>
        );
      case "sweater":
        return (
          <g>
            <path d="M45 200 Q45 165 100 158 Q155 165 155 200 L155 220 L45 220 Z" fill="url(#outfitGradient)" />
            {/* Texture lines */}
            <path d="M50 180 L150 180" stroke={adjustColor(color, -15)} strokeWidth="1" opacity="0.5" />
            <path d="M50 190 L150 190" stroke={adjustColor(color, -15)} strokeWidth="1" opacity="0.5" />
            <path d="M50 200 L150 200" stroke={adjustColor(color, -15)} strokeWidth="1" opacity="0.5" />
            {/* Collar */}
            <ellipse cx="100" cy="162" rx="20" ry="8" fill={adjustColor(color, -20)} />
          </g>
        );
      case "tank":
        return (
          <g>
            <path d="M60 200 Q60 175 100 168 Q140 175 140 200 L140 220 L60 220 Z" fill="url(#outfitGradient)" />
            {/* Straps */}
            <path d="M70 168 L70 155" stroke="url(#outfitGradient)" strokeWidth="12" />
            <path d="M130 168 L130 155" stroke="url(#outfitGradient)" strokeWidth="12" />
          </g>
        );
      case "collar":
        return (
          <g>
            <path d="M45 200 Q45 165 100 158 Q155 165 155 200 L155 220 L45 220 Z" fill="url(#outfitGradient)" />
            {/* Collar */}
            <path d="M70 160 L100 180 L130 160" fill="white" />
            <path d="M70 160 L100 180 L130 160" stroke={adjustColor(color, -20)} strokeWidth="1" fill="none" />
            {/* Buttons */}
            <circle cx="100" cy="190" r="3" fill={adjustColor(color, -40)} />
            <circle cx="100" cy="205" r="3" fill={adjustColor(color, -40)} />
          </g>
        );
      case "vneck":
        return (
          <g>
            <path d="M45 200 Q45 165 100 158 Q155 165 155 200 L155 220 L45 220 Z" fill="url(#outfitGradient)" />
            {/* V-neck */}
            <path d="M80 158 L100 185 L120 158" fill={skinTone.shadow} />
          </g>
        );
      default: // tshirt
        return (
          <g>
            <path d="M45 200 Q45 165 100 158 Q155 165 155 200 L155 220 L45 220 Z" fill="url(#outfitGradient)" />
            {/* Collar */}
            <ellipse cx="100" cy="162" rx="15" ry="6" fill={skinTone.shadow} />
            {/* Sleeve hints */}
            <path d="M50 175 Q45 180 48 190" stroke={adjustColor(color, -30)} strokeWidth="1.5" fill="none" />
            <path d="M150 175 Q155 180 152 190" stroke={adjustColor(color, -30)} strokeWidth="1.5" fill="none" />
          </g>
        );
    }
  };

  return (
    <g>
      {/* Neck */}
      <rect x="85" y="142" width="30" height="20" fill={skinTone.base} />
      <rect x="85" y="142" width="30" height="20" fill={skinTone.shadow} opacity="0.2" />
      
      {/* Outfit */}
      {renderOutfit()}
    </g>
  );
};

// Export helper for backwards compatibility
export { adjustColor };
