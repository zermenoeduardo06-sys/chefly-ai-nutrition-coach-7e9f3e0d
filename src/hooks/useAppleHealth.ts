import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';

export interface AppleHealthData {
  isAvailable: boolean;
  isAuthorized: boolean;
  steps: number | null;
  activeCalories: number | null;
  weight: number | null;
  lastSync: Date | null;
  isLoading: boolean;
  error: string | null;
}

const STORAGE_KEY = 'chefly_health_authorized';

// Helper to get today's date range
const getTodayRange = () => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  return { startOfDay, endOfDay };
};

export const useAppleHealth = () => {
  const [healthData, setHealthData] = useState<AppleHealthData>({
    isAvailable: false,
    isAuthorized: false,
    steps: null,
    activeCalories: null,
    weight: null,
    lastSync: null,
    isLoading: true,
    error: null,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [Health, setHealth] = useState<any>(null);

  // Check if Apple Health is available (only on iOS native)
  const isHealthAvailable = useCallback(() => {
    return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
  }, []);

  // Initialize the plugin
  useEffect(() => {
    const initPlugin = async () => {
      if (!isHealthAvailable()) {
        setHealthData(prev => ({ ...prev, isAvailable: false, isLoading: false }));
        return;
      }

      try {
        const { Health: HealthPlugin } = await import('@capgo/capacitor-health');
        setHealth(HealthPlugin);
        
        // Check if Health is available on this device
        const { available } = await HealthPlugin.isAvailable();
        
        // Check if we have stored authorization
        const storedAuth = localStorage.getItem(STORAGE_KEY);
        
        setHealthData(prev => ({
          ...prev,
          isAvailable: available,
          isAuthorized: storedAuth === 'true' && available,
          isLoading: false,
        }));
      } catch (error) {
        console.error('[AppleHealth] Failed to initialize plugin:', error);
        setHealthData(prev => ({
          ...prev,
          isAvailable: false,
          isLoading: false,
          error: 'Failed to initialize HealthKit plugin',
        }));
      }
    };

    initPlugin();
  }, [isHealthAvailable]);

  // Request authorization
  const requestAuthorization = useCallback(async (): Promise<boolean> => {
    if (!Health || !isHealthAvailable()) {
      console.warn('[AppleHealth] Health plugin not available');
      return false;
    }

    setHealthData(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Request permissions for reading steps, calories (active energy), and weight
      await Health.requestAuthorization({
        read: ['steps', 'calories', 'weight'],
        write: ['weight'],
      });

      // If no error thrown, assume authorization was successful or user made a choice
      // (HealthKit doesn't tell us if user denied, only if there was an error)
      const isAuthorized = true;
      
      // Store authorization state
      localStorage.setItem(STORAGE_KEY, 'true');

      setHealthData(prev => ({
        ...prev,
        isAuthorized,
        isLoading: false,
      }));

      // Automatically sync data after authorization
      await syncDataInternal();

      return isAuthorized;
    } catch (error: any) {
      console.error('[AppleHealth] Authorization error:', error);
      setHealthData(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Authorization failed',
      }));
      return false;
    }
  }, [Health, isHealthAvailable]);

  // Internal sync function
  const syncDataInternal = useCallback(async (): Promise<void> => {
    if (!Health) {
      return;
    }

    try {
      const { startOfDay, endOfDay } = getTodayRange();

      // Fetch steps for today using readSamples
      let steps: number | null = null;
      try {
        const stepsResult = await Health.readSamples({
          dataType: 'steps',
          startDate: startOfDay.toISOString(),
          endDate: endOfDay.toISOString(),
          limit: 1000,
        });
        
        // Sum all step samples for today
        if (stepsResult.samples && stepsResult.samples.length > 0) {
          steps = stepsResult.samples.reduce((sum: number, sample: any) => sum + (sample.value || 0), 0);
          steps = Math.round(steps);
        }
      } catch (e) {
        console.warn('[AppleHealth] Failed to fetch steps:', e);
      }

      // Fetch active calories for today
      let activeCalories: number | null = null;
      try {
        const caloriesResult = await Health.readSamples({
          dataType: 'calories',
          startDate: startOfDay.toISOString(),
          endDate: endOfDay.toISOString(),
          limit: 1000,
        });
        
        // Sum all calorie samples for today
        if (caloriesResult.samples && caloriesResult.samples.length > 0) {
          activeCalories = caloriesResult.samples.reduce((sum: number, sample: any) => sum + (sample.value || 0), 0);
          activeCalories = Math.round(activeCalories);
        }
      } catch (e) {
        console.warn('[AppleHealth] Failed to fetch calories:', e);
      }

      // Fetch latest weight
      let weight: number | null = null;
      try {
        const weightResult = await Health.readSamples({
          dataType: 'weight',
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
          endDate: endOfDay.toISOString(),
          limit: 1,
        });
        
        if (weightResult.samples && weightResult.samples.length > 0) {
          weight = Math.round(weightResult.samples[0].value * 10) / 10; // Round to 1 decimal
        }
      } catch (e) {
        console.warn('[AppleHealth] Failed to fetch weight:', e);
      }

      setHealthData(prev => ({
        ...prev,
        steps,
        activeCalories,
        weight,
        lastSync: new Date(),
        isLoading: false,
      }));
    } catch (error: any) {
      console.error('[AppleHealth] Sync error:', error);
      setHealthData(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to sync health data',
      }));
    }
  }, [Health]);

  // Public sync function
  const syncData = useCallback(async (): Promise<void> => {
    if (!healthData.isAuthorized) {
      return;
    }
    setHealthData(prev => ({ ...prev, isLoading: true, error: null }));
    await syncDataInternal();
  }, [healthData.isAuthorized, syncDataInternal]);

  // Disconnect from Apple Health
  const disconnectHealth = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setHealthData(prev => ({
      ...prev,
      isAuthorized: false,
      steps: null,
      activeCalories: null,
      weight: null,
      lastSync: null,
    }));
  }, []);

  // Auto-sync on mount if authorized
  useEffect(() => {
    if (healthData.isAuthorized && Health && !healthData.lastSync) {
      syncData();
    }
  }, [healthData.isAuthorized, Health, healthData.lastSync, syncData]);

  return {
    ...healthData,
    isHealthAvailable: isHealthAvailable(),
    requestAuthorization,
    syncData,
    disconnectHealth,
  };
};
