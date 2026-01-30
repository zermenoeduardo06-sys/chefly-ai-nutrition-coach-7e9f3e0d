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
      const { SocialLogin } = await import('@capgo/capacitor-social-login');

      // Initialize Apple provider
      await SocialLogin.initialize({
        apple: {
          clientId: 'com.cheflyai.app',
        },
      });

      // Generate a random nonce for security
      const rawNonce = generateNonce();
      const hashedNonce = await sha256(rawNonce);

      // Perform the login
      const result = await SocialLogin.login({
        provider: 'apple',
        options: {
          scopes: ['email', 'name'],
          nonce: hashedNonce,
        },
      });

      if (!result.result) {
        throw new Error('Apple Sign-In failed');
      }

      const appleResult = result.result;
      
      if (!appleResult.idToken) {
        throw new Error('No identity token received from Apple');
      }

      // Use Supabase's signInWithIdToken for native auth
      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: appleResult.idToken,
        nonce: rawNonce,
      });

      if (error) throw error;

      // If Apple provided user info (only on first sign-in), save it
      const profile = appleResult.profile;
      if (profile && (profile.givenName || profile.familyName)) {
        const fullName = [profile.givenName, profile.familyName]
          .filter(Boolean)
          .join(' ');
        
        if (fullName) {
          await supabase.auth.updateUser({
            data: {
              full_name: fullName,
              given_name: profile.givenName,
              family_name: profile.familyName,
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
