import { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { lovable } from '@/integrations/lovable/index';

export const useNativeAppleAuth = () => {
  const [loading, setLoading] = useState(false);
  const isNative = Capacitor.isNativePlatform();
  const isIOS = Capacitor.getPlatform() === 'ios';

  const signInWithApple = async (): Promise<{ error: Error | null }> => {
    setLoading(true);
    try {
      // Use web OAuth flow for all platforms (including native iOS)
      const { error } = await lovable.auth.signInWithOAuth('apple', {
        redirect_uri: window.location.origin,
      });
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('Apple Sign In Error:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  return {
    signInWithApple,
    loading,
    isNative,
    isIOS,
  };
};
