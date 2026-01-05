import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type MascotMood = 'idle' | 'happy' | 'motivated' | 'sleepy' | 'hungry' | 'proud' | 'encouraging' | 'celebrating';

interface MascotState {
  mood: MascotMood;
  message: string | null;
  isVisible: boolean;
  isExpanded: boolean;
  lastInteraction: Date | null;
}

interface MascotContextType {
  state: MascotState;
  setMood: (mood: MascotMood) => void;
  setMessage: (message: string | null) => void;
  showMascot: () => void;
  hideMascot: () => void;
  toggleExpanded: () => void;
  triggerCelebration: (message?: string) => void;
  recordInteraction: () => void;
}

const MascotContext = createContext<MascotContextType | undefined>(undefined);

const initialState: MascotState = {
  mood: 'idle',
  message: null,
  isVisible: true,
  isExpanded: false,
  lastInteraction: null,
};

export const MascotProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<MascotState>(initialState);

  const setMood = useCallback((mood: MascotMood) => {
    setState(prev => ({ ...prev, mood }));
  }, []);

  const setMessage = useCallback((message: string | null) => {
    setState(prev => ({ ...prev, message }));
  }, []);

  const showMascot = useCallback(() => {
    setState(prev => ({ ...prev, isVisible: true }));
  }, []);

  const hideMascot = useCallback(() => {
    setState(prev => ({ ...prev, isVisible: false, isExpanded: false }));
  }, []);

  const toggleExpanded = useCallback(() => {
    setState(prev => ({ ...prev, isExpanded: !prev.isExpanded }));
  }, []);

  const triggerCelebration = useCallback((message?: string) => {
    setState(prev => ({ 
      ...prev, 
      mood: 'celebrating',
      message: message || null,
      isExpanded: true 
    }));
    
    // Reset after animation
    setTimeout(() => {
      setState(prev => ({ 
        ...prev, 
        mood: 'happy',
        isExpanded: false,
        message: null 
      }));
    }, 3000);
  }, []);

  const recordInteraction = useCallback(() => {
    setState(prev => ({ ...prev, lastInteraction: new Date() }));
  }, []);

  return (
    <MascotContext.Provider value={{
      state,
      setMood,
      setMessage,
      showMascot,
      hideMascot,
      toggleExpanded,
      triggerCelebration,
      recordInteraction,
    }}>
      {children}
    </MascotContext.Provider>
  );
};

export const useMascot = (): MascotContextType => {
  const context = useContext(MascotContext);
  if (!context) {
    throw new Error('useMascot must be used within a MascotProvider');
  }
  return context;
};
