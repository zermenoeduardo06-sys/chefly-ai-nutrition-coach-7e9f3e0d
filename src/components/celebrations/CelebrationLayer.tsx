import React from 'react';
import { XPGainAnimation } from './XPGainAnimation';

interface CelebrationLayerProps {
  children: React.ReactNode;
}

/**
 * Global layer that wraps the app to enable celebration animations
 * Renders XP gain floaters and other global celebration effects
 */
export const CelebrationLayer: React.FC<CelebrationLayerProps> = ({ children }) => {
  return (
    <XPGainAnimation>
      {children}
    </XPGainAnimation>
  );
};

export default CelebrationLayer;
