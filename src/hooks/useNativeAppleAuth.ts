import { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';

export const useNativeAppleAuth = () => {
  const [loading, setLoading] = useState(false);
  const isNative = Capacitor.isNativePlatform();
  const isIOS = Capacitor.getPlatform() === 'ios';

  const signInWithApple = async (): Promise<{ error: Error | null }> => {
    if (!isNative || !isIOS) {
      return { error: new Error('Native Apple Sign-In is only available on iOS') };
    }

    setLoading(true);

    try {
      // Dynamically import the plugin to avoid issues on non-iOS platforms
      const { SignInWithApple } = await import('@capacitor-community/apple-sign-in');

      // Generate a random nonce for security
      const rawNonce = generateNonce();
      const hashedNonce = await sha256(rawNonce);

      const result = await SignInWithApple.authorize({
        clientId: 'com.cheflyai.app', // Your app's bundle ID
        redirectURI: 'https://ppprnzkuivsnhrntkbyj.supabase.co/auth/v1/callback',
        scopes: 'email name',
        nonce: hashedNonce,
      });

      if (!result.response?.identityToken) {
        throw new Error('No identity token received from Apple');
      }

      // Use Supabase's signInWithIdToken for native auth
      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: result.response.identityToken,
        nonce: rawNonce,
      });

      if (error) throw error;

      // If Apple provided user info (only on first sign-in), save it
      if (result.response.givenName || result.response.familyName) {
        const fullName = [result.response.givenName, result.response.familyName]
          .filter(Boolean)
          .join(' ');
        
        if (fullName) {
          await supabase.auth.updateUser({
            data: {
              full_name: fullName,
              given_name: result.response.givenName,
              family_name: result.response.familyName,
            },
          });
        }
      }

      return { error: null };
    } catch (error: any) {
      console.error('Native Apple Sign In Error:', error);
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

// Helper function to generate a random nonce
function generateNonce(length = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }
  return result;
}

// Helper function to hash the nonce with SHA256
async function sha256(plain: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
