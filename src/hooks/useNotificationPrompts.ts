import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'notification_prompt_state';
const PROMPT_COOLDOWN_DAYS = 7;
const MAX_PROMPTS_PER_MONTH = 2;
const MAX_DISMISSALS_BEFORE_LONG_COOLDOWN = 5;
const LONG_COOLDOWN_DAYS = 30;

interface NotificationPromptState {
  promptCount: number;
  dismissCount: number;
  lastPromptDate: string | null;
  lastMonthReset: string;
  hasAccepted: boolean;
}

const getDefaultState = (): NotificationPromptState => ({
  promptCount: 0,
  dismissCount: 0,
  lastPromptDate: null,
  lastMonthReset: new Date().toISOString().slice(0, 7), // YYYY-MM
  hasAccepted: false,
});

export type PromptTrigger = 'post_onboarding' | 'periodic' | 'achievement' | 'streak_lost';

export function useNotificationPrompts() {
  const [state, setState] = useState<NotificationPromptState>(getDefaultState);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as NotificationPromptState;
        
        // Reset monthly count if new month
        const currentMonth = new Date().toISOString().slice(0, 7);
        if (parsed.lastMonthReset !== currentMonth) {
          parsed.promptCount = 0;
          parsed.lastMonthReset = currentMonth;
        }
        
        setState(parsed);
      }
    } catch (error) {
      console.error('Error loading notification prompt state:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save state to localStorage
  const saveState = useCallback((newState: NotificationPromptState) => {
    setState(newState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  }, []);

  // Check if in cooldown period
  const isInCooldown = useCallback((): boolean => {
    if (!state.lastPromptDate) return false;
    
    const lastPrompt = new Date(state.lastPromptDate);
    const now = new Date();
    const daysSinceLastPrompt = Math.floor(
      (now.getTime() - lastPrompt.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    // Use longer cooldown if dismissed many times
    const cooldownDays = state.dismissCount >= MAX_DISMISSALS_BEFORE_LONG_COOLDOWN 
      ? LONG_COOLDOWN_DAYS 
      : PROMPT_COOLDOWN_DAYS;
    
    return daysSinceLastPrompt < cooldownDays;
  }, [state.lastPromptDate, state.dismissCount]);

  // Check if we've hit monthly limit
  const hasHitMonthlyLimit = useCallback((): boolean => {
    return state.promptCount >= MAX_PROMPTS_PER_MONTH;
  }, [state.promptCount]);

  // Determine if we should show prompt for a given trigger
  const shouldShowPrompt = useCallback((
    trigger: PromptTrigger,
    options?: {
      isNative?: boolean;
      permissionGranted?: boolean;
      isNewUser?: boolean;
    }
  ): boolean => {
    // Never show if already accepted or not native or permission already granted
    if (state.hasAccepted) return false;
    if (options?.permissionGranted) return false;
    if (options?.isNative === false) return false;
    
    // Check cooldown and monthly limit
    if (isInCooldown() && trigger !== 'post_onboarding') return false;
    if (hasHitMonthlyLimit()) return false;
    
    switch (trigger) {
      case 'post_onboarding':
        // Only show for new users, no cooldown for first time
        return options?.isNewUser === true && state.promptCount === 0;
      
      case 'periodic':
        // Show after cooldown on dashboard visits
        return !isInCooldown();
      
      case 'achievement':
        // Show on achievement unlock, but respect cooldown
        return !isInCooldown();
      
      case 'streak_lost':
        // Good moment to show value of notifications
        return !isInCooldown();
      
      default:
        return false;
    }
  }, [state, isInCooldown, hasHitMonthlyLimit]);

  // Mark that prompt was shown
  const markPromptShown = useCallback(() => {
    const newState: NotificationPromptState = {
      ...state,
      promptCount: state.promptCount + 1,
      lastPromptDate: new Date().toISOString(),
    };
    saveState(newState);
  }, [state, saveState]);

  // Mark that user dismissed the prompt
  const markPromptDismissed = useCallback(() => {
    const newState: NotificationPromptState = {
      ...state,
      dismissCount: state.dismissCount + 1,
      lastPromptDate: new Date().toISOString(),
      promptCount: state.promptCount + 1,
    };
    saveState(newState);
  }, [state, saveState]);

  // Mark that user accepted notifications
  const markPromptAccepted = useCallback(() => {
    const newState: NotificationPromptState = {
      ...state,
      hasAccepted: true,
    };
    saveState(newState);
  }, [state, saveState]);

  // Reset state (for testing)
  const resetState = useCallback(() => {
    saveState(getDefaultState());
  }, [saveState]);

  return {
    isLoaded,
    state,
    shouldShowPrompt,
    isInCooldown,
    hasHitMonthlyLimit,
    markPromptShown,
    markPromptDismissed,
    markPromptAccepted,
    resetState,
  };
}
