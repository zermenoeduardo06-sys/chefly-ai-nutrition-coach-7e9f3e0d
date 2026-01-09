import React, { createContext, useContext, useState, useCallback } from 'react';

export interface XPGain {
  id: string;
  amount: number;
  x: number;
  y: number;
  type: 'food' | 'meal' | 'challenge' | 'streak' | 'achievement';
}

interface XPAnimationContextType {
  gains: XPGain[];
  triggerXP: (amount: number, type?: XPGain['type'], position?: { x: number; y: number }) => void;
  removeGain: (id: string) => void;
}

const XPAnimationContext = createContext<XPAnimationContextType | undefined>(undefined);

export const XPAnimationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gains, setGains] = useState<XPGain[]>([]);

  const triggerXP = useCallback((
    amount: number,
    type: XPGain['type'] = 'food',
    position?: { x: number; y: number }
  ) => {
    const x = position?.x ?? window.innerWidth / 2;
    const y = position?.y ?? window.innerHeight / 2;
    const id = `${Date.now()}-${Math.random()}`;
    
    setGains(prev => [...prev, { id, amount, type, x, y }]);
  }, []);

  const removeGain = useCallback((id: string) => {
    setGains(prev => prev.filter(g => g.id !== id));
  }, []);

  return (
    <XPAnimationContext.Provider value={{ gains, triggerXP, removeGain }}>
      {children}
    </XPAnimationContext.Provider>
  );
};

export const useXPAnimation = () => {
  const context = useContext(XPAnimationContext);
  if (!context) {
    throw new Error('useXPAnimation must be used within XPAnimationProvider');
  }
  return context;
};

export default XPAnimationContext;
