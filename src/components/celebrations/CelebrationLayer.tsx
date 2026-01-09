import React from 'react';
import { XPAnimationProvider } from '@/contexts/XPAnimationContext';
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
    <XPAnimationProvider>
      <XPGainAnimation />
      {children}
    </XPAnimationProvider>
  );
};

export default CelebrationLayer;
