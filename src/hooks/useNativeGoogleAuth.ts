import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useNativeGoogleAuth = () => {
  const [loading, setLoading] = useState(false);

  const signInWithGoogle = async (): Promise<{ error: Error | null }> => {
    setLoading(true);
    
    try {
      // Use standard OAuth redirect flow for all platforms
      // Native Google Auth plugin is not compatible with Capacitor 8 yet
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('Google Sign In Error:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    // No native cleanup needed with web-only flow
  };

  return {
    signInWithGoogle,
    signOut,
    loading,
    isNative: false,
  };
};
