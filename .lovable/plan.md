

# Plan: Eliminar Plugin Apple Sign-In Incompatible con SPM

## Diagnóstico Confirmado

El plugin `@capacitor-community/apple-sign-in@7.1.0` **no tiene soporte oficial para Swift Package Manager (SPM)**. Hay un issue abierto (#116) en GitHub solicitando esta funcionalidad que aún no ha sido implementado.

Cuando Capacitor 8 intenta generar el `Package.swift`, este plugin causa conflictos porque su estructura no es compatible con SPM.

## Solución

Eliminar el plugin problemático y usar el **flujo OAuth web de Apple** para iOS nativo (igual que hacemos con Google). Esto funciona perfectamente y es el enfoque recomendado.

## Cambios Necesarios

### 1. package.json

Eliminar la dependencia del plugin:

```diff
  "dependencies": {
-   "@capacitor-community/apple-sign-in": "^7.1.0",
    "@capacitor-community/in-app-review": "^8.0.0",
```

### 2. vite.config.ts

Eliminar de la lista de exclusiones:

```diff
  optimizeDeps: {
    exclude: [
-     '@capacitor-community/apple-sign-in',
      '@capgo/capacitor-health',
    ],
  },
```

### 3. src/hooks/useNativeAppleAuth.ts

Simplificar para usar OAuth web en todas las plataformas:

```typescript
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
```

### 4. src/components/auth/SocialAuthButtons.tsx

Simplificar la lógica de Apple Sign-In:

```typescript
const handleAppleSignIn = async () => {
  setAppleLoading(true);
  onLoadingChange?.(true);
  try {
    // Use web OAuth flow for all platforms
    const { error } = await nativeAppleSignIn();
    if (error) throw error;
  } catch (error: any) {
    toast({
      variant: 'destructive',
      title: language === 'es' ? 'Error' : 'Error',
      description: error.message || (language === 'es' ? 'Error al conectar con Apple' : 'Error connecting with Apple'),
    });
  } finally {
    setAppleLoading(false);
    onLoadingChange?.(false);
  }
};
```

## Después del Cambio

Una vez implementados los cambios, ejecutar:

```bash
rm -rf ios node_modules
npm install
npm run build
npx cap add ios --skip-appid-validation
npx cap sync ios
npx cap open ios
```

## Plugins que Quedarán (9 total, todos compatibles con SPM)

| Plugin | Versión | Compatible SPM |
|--------|---------|----------------|
| @capacitor-community/in-app-review | 8.0.0 | Si |
| @capacitor/browser | 8.0.0 | Si |
| @capacitor/camera | 8.0.0 | Si |
| @capacitor/filesystem | 8.0.0 | Si |
| @capacitor/haptics | 8.0.0 | Si |
| @capacitor/local-notifications | 8.0.0 | Si |
| @capacitor/share | 8.0.0 | Si |
| @capgo/capacitor-health | 8.2.10 | Si |
| @revenuecat/purchases-capacitor | 12.0.1 | Si |

## Impacto en Usuarios

| Plataforma | Antes | Después |
|------------|-------|---------|
| Web | OAuth redirect | OAuth redirect (sin cambio) |
| iOS Nativo | Plugin nativo (fallaba) | OAuth redirect (funciona) |
| Android | Sin Apple Sign-In | Sin Apple Sign-In (sin cambio) |

El flujo OAuth web de Apple funciona correctamente en iOS a través del navegador integrado de Capacitor.

