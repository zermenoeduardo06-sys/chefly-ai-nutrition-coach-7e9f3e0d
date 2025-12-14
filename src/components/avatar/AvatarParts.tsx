// Duolingo-style Avatar Parts

export interface AvatarConfig {
  skinTone: number;
  body: number;
  eyes: number;
  hair: number;
  glasses: number;
  accessory: number;
}

export const defaultAvatarConfig: AvatarConfig = {
  skinTone: 0,
  body: 0,
  eyes: 0,
  hair: 0,
  glasses: -1,
  accessory: -1,
};

// Skin tones
export const SKIN_TONES = [
  "#FFDBB4", // Light
  "#E8B894", // Light-medium
  "#D4915E", // Medium
  "#C17F4E", // Medium-dark
  "#A0664C", // Dark
  "#6B4423", // Darker
];

// Hair colors
export const HAIR_COLORS = [
  "#3D2314", // Dark brown
  "#1A1A1A", // Black
  "#8B4513", // Brown
  "#D4A574", // Blonde
  "#B7410E", // Red
  "#708090", // Gray
];

// Body/shirt colors
export const BODY_COLORS = [
  "#4A90D9", // Blue
  "#58CC02", // Green
  "#FF6B6B", // Red
  "#9B59B6", // Purple
  "#F39C12", // Orange
  "#1ABC9C", // Teal
];

// Eyes styles
export const EYES_STYLES = [
  "normal",
  "happy",
  "wink",
  "surprised",
  "sleepy",
];

// Hair styles
export const HAIR_STYLES = [
  "curly",
  "short",
  "long",
  "spiky",
  "bald",
  "ponytail",
];

// Glasses styles (-1 = none)
export const GLASSES_STYLES = [
  "round",
  "square",
  "sunglasses",
];

// Accessories (-1 = none)
export const ACCESSORY_STYLES = [
  "hat",
  "headband",
  "earrings",
];

// SVG Components for each part
export const SkinBase = ({ color }: { color: string }) => (
  <ellipse cx="100" cy="120" rx="70" ry="80" fill={color} />
);

export const Face = ({ skinColor }: { skinColor: string }) => (
  <>
    {/* Head */}
    <ellipse cx="100" cy="85" rx="55" ry="60" fill={skinColor} />
    {/* Ears */}
    <ellipse cx="45" cy="85" rx="8" ry="12" fill={skinColor} />
    <ellipse cx="155" cy="85" rx="8" ry="12" fill={skinColor} />
    {/* Nose */}
    <ellipse cx="100" cy="95" rx="6" ry="8" fill={skinColor} opacity="0.7" />
    {/* Cheeks */}
    <circle cx="65" cy="100" r="10" fill="#FFB6B6" opacity="0.4" />
    <circle cx="135" cy="100" r="10" fill="#FFB6B6" opacity="0.4" />
  </>
);

export const Eyes = ({ style }: { style: string }) => {
  switch (style) {
    case "happy":
      return (
        <>
          <path d="M70 75 Q80 65 90 75" stroke="#333" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M110 75 Q120 65 130 75" stroke="#333" strokeWidth="4" fill="none" strokeLinecap="round" />
        </>
      );
    case "wink":
      return (
        <>
          <ellipse cx="75" cy="75" rx="10" ry="12" fill="white" />
          <ellipse cx="75" cy="75" rx="6" ry="8" fill="#333" />
          <path d="M110 75 Q120 65 130 75" stroke="#333" strokeWidth="4" fill="none" strokeLinecap="round" />
        </>
      );
    case "surprised":
      return (
        <>
          <ellipse cx="75" cy="75" rx="12" ry="14" fill="white" />
          <ellipse cx="75" cy="75" rx="8" ry="10" fill="#333" />
          <ellipse cx="125" cy="75" rx="12" ry="14" fill="white" />
          <ellipse cx="125" cy="75" rx="8" ry="10" fill="#333" />
        </>
      );
    case "sleepy":
      return (
        <>
          <path d="M65 75 L85 75" stroke="#333" strokeWidth="4" strokeLinecap="round" />
          <path d="M115 75 L135 75" stroke="#333" strokeWidth="4" strokeLinecap="round" />
        </>
      );
    default: // normal
      return (
        <>
          <ellipse cx="75" cy="75" rx="10" ry="12" fill="white" />
          <ellipse cx="75" cy="77" rx="6" ry="8" fill="#333" />
          <circle cx="73" cy="73" r="2" fill="white" />
          <ellipse cx="125" cy="75" rx="10" ry="12" fill="white" />
          <ellipse cx="125" cy="77" rx="6" ry="8" fill="#333" />
          <circle cx="123" cy="73" r="2" fill="white" />
        </>
      );
  }
};

export const Mouth = () => (
  <path d="M85 110 Q100 125 115 110" stroke="#333" strokeWidth="3" fill="none" strokeLinecap="round" />
);

export const Hair = ({ style, color }: { style: string; color: string }) => {
  switch (style) {
    case "short":
      return (
        <path d="M50 60 Q50 25 100 25 Q150 25 150 60 L145 50 Q100 35 55 50 Z" fill={color} />
      );
    case "long":
      return (
        <>
          <path d="M45 60 Q45 20 100 20 Q155 20 155 60 L155 120 Q155 130 145 130 L145 70 Q100 50 55 70 L55 130 Q45 130 45 120 Z" fill={color} />
          <path d="M50 55 Q50 25 100 25 Q150 25 150 55" fill={color} />
        </>
      );
    case "spiky":
      return (
        <path d="M50 60 L55 30 L70 50 L80 20 L95 45 L105 15 L115 45 L130 20 L140 50 L145 30 L150 60 Q100 40 50 60" fill={color} />
      );
    case "bald":
      return null;
    case "ponytail":
      return (
        <>
          <path d="M50 55 Q50 25 100 25 Q150 25 150 55" fill={color} />
          <ellipse cx="155" cy="40" rx="15" ry="25" fill={color} />
        </>
      );
    default: // curly
      return (
        <>
          <circle cx="55" cy="40" r="15" fill={color} />
          <circle cx="75" cy="30" r="15" fill={color} />
          <circle cx="100" cy="25" r="18" fill={color} />
          <circle cx="125" cy="30" r="15" fill={color} />
          <circle cx="145" cy="40" r="15" fill={color} />
          <circle cx="50" cy="55" r="12" fill={color} />
          <circle cx="150" cy="55" r="12" fill={color} />
        </>
      );
  }
};

export const Body = ({ color, skinColor }: { color: string; skinColor: string }) => (
  <>
    {/* Neck */}
    <rect x="85" y="140" width="30" height="20" fill={skinColor} />
    {/* Shirt */}
    <path d="M50 200 Q50 160 100 155 Q150 160 150 200 L150 220 L50 220 Z" fill={color} />
    {/* Collar */}
    <path d="M85 160 L100 175 L115 160" stroke={color} strokeWidth="8" fill="none" />
  </>
);

export const Glasses = ({ style }: { style: string }) => {
  switch (style) {
    case "square":
      return (
        <>
          <rect x="55" y="65" width="35" height="25" rx="3" fill="none" stroke="#333" strokeWidth="3" />
          <rect x="110" y="65" width="35" height="25" rx="3" fill="none" stroke="#333" strokeWidth="3" />
          <line x1="90" y1="77" x2="110" y2="77" stroke="#333" strokeWidth="3" />
          <line x1="55" y1="77" x2="45" y2="75" stroke="#333" strokeWidth="3" />
          <line x1="145" y1="77" x2="155" y2="75" stroke="#333" strokeWidth="3" />
        </>
      );
    case "sunglasses":
      return (
        <>
          <ellipse cx="75" cy="77" rx="22" ry="18" fill="#1a1a1a" />
          <ellipse cx="125" cy="77" rx="22" ry="18" fill="#1a1a1a" />
          <line x1="97" y1="77" x2="103" y2="77" stroke="#333" strokeWidth="4" />
          <line x1="53" y1="77" x2="45" y2="73" stroke="#333" strokeWidth="3" />
          <line x1="147" y1="77" x2="155" y2="73" stroke="#333" strokeWidth="3" />
        </>
      );
    default: // round
      return (
        <>
          <circle cx="75" cy="77" r="18" fill="none" stroke="#333" strokeWidth="3" />
          <circle cx="125" cy="77" r="18" fill="none" stroke="#333" strokeWidth="3" />
          <line x1="93" y1="77" x2="107" y2="77" stroke="#333" strokeWidth="3" />
          <line x1="57" y1="77" x2="45" y2="73" stroke="#333" strokeWidth="3" />
          <line x1="143" y1="77" x2="155" y2="73" stroke="#333" strokeWidth="3" />
        </>
      );
  }
};

export const Accessory = ({ style, hairColor }: { style: string; hairColor: string }) => {
  switch (style) {
    case "headband":
      return (
        <path d="M45 55 Q100 45 155 55" stroke="#FF6B6B" strokeWidth="8" fill="none" strokeLinecap="round" />
      );
    case "earrings":
      return (
        <>
          <circle cx="45" cy="95" r="5" fill="#FFD700" />
          <circle cx="155" cy="95" r="5" fill="#FFD700" />
        </>
      );
    default: // hat
      return (
        <>
          <ellipse cx="100" cy="30" rx="60" ry="10" fill="#333" />
          <rect x="55" y="5" width="90" height="25" rx="5" fill="#333" />
        </>
      );
  }
};
