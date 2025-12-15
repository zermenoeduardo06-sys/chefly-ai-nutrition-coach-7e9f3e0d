import { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';

// Dynamic import for native platforms only
let GoogleAuth: any = null;

export const useNativeGoogleAuth = () => {
  const [loading, setLoading] = useState(false);
  const isNative = Capacitor.isNativePlatform();

  const initializeGoogleAuth = async () => {
    if (isNative && !GoogleAuth) {
      try {
        const module = await import('@codetrix-studio/capacitor-google-auth');
        GoogleAuth = module.GoogleAuth;
        
        // Initialize with your Google Client IDs
        // You'll need to configure these in Google Cloud Console
        await GoogleAuth.initialize({
          clientId: import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID || '',
          scopes: ['profile', 'email'],
          grantOfflineAccess: true,
        });
      } catch (error) {
        console.error('Failed to initialize Google Auth:', error);
      }
    }
  };

  const signInWithGoogle = async (): Promise<{ error: Error | null }> => {
    setLoading(true);
    
    try {
      if (isNative) {
        // Native flow using Capacitor plugin
        await initializeGoogleAuth();
        
        if (!GoogleAuth) {
          throw new Error('Google Auth not initialized. Please configure Google Client IDs.');
        }

        const result = await GoogleAuth.signIn();
        
        if (!result.authentication?.idToken) {
          throw new Error('No ID token received from Google');
        }

        // Sign in to Supabase with the Google ID token
        const { error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: result.authentication.idToken,
          access_token: result.authentication.accessToken,
        });

        if (error) throw error;
        
        return { error: null };
      } else {
        // Web flow using OAuth redirect
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/dashboard`,
          },
        });
        
        if (error) throw error;
        return { error: null };
      }
    } catch (error: any) {
      console.error('Google Sign In Error:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (isNative && GoogleAuth) {
      try {
        await GoogleAuth.signOut();
      } catch (error) {
        console.error('Google Sign Out Error:', error);
      }
    }
  };

  return {
    signInWithGoogle,
    signOut,
    loading,
    isNative,
  };
};
