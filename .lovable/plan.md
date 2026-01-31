

# Plan: Solucionar Error de Build con Apple Sign-In

## El Problema

Rollup (usado por Vite) no puede resolver el import dinámico de `@capacitor-community/apple-sign-in` durante el build. Aunque el paquete está en `package.json`, el dynamic import causa problemas porque Rollup intenta pre-analizar todos los imports.

## Solución

Modificar `vite.config.ts` para marcar los plugins de Capacitor como externos durante el build. Esto permite que el código compile correctamente y los plugins solo se carguen en runtime (cuando la app corre en iOS nativo).

## Cambios Necesarios

### Archivo: `vite.config.ts`

Agregar configuración de `build.rollupOptions.external` para excluir plugins nativos:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      external: [
        '@capacitor-community/apple-sign-in',
        '@capgo/capacitor-health',
        'capacitor-plugin-ios-webview-configurator',
        'capacitor-widgetsbridge-plugin',
      ],
    },
  },
}));
```

## Por Que Funciona

| Aspecto | Explicacion |
|---------|-------------|
| `external` | Le dice a Rollup que no intente resolver estos modulos durante el build |
| Dynamic import | Los plugins se cargan solo cuando se ejecutan en iOS nativo |
| Web build | Funciona porque el codigo nunca llega a ejecutar esos imports en web |

## Despues del Cambio

Una vez aplicado el cambio:

```bash
npm run build        # Deberia compilar sin errores
npx cap add ios --skip-appid-validation
npx cap sync ios
npx cap open ios
```

## Alternativa (Si No Funciona)

Si la solucion anterior no funciona, podemos envolver el import en un try-catch mas defensivo que verifique la plataforma antes de intentar importar:

```typescript
const signInWithApple = async () => {
  if (!isNative || !isIOS) {
    return { error: new Error('Not available') };
  }

  try {
    // Solo intenta importar si estamos en iOS nativo
    const module = await import('@capacitor-community/apple-sign-in');
    const { SignInWithApple } = module;
    // ... resto del codigo
  } catch (e) {
    return { error: e as Error };
  }
};
```

## Seccion Tecnica

### Plugins Afectados

Estos plugins de Capacitor necesitan ser externos porque solo funcionan en plataformas nativas:

- `@capacitor-community/apple-sign-in` - Solo iOS
- `@capgo/capacitor-health` - Solo iOS/Android nativo
- `capacitor-plugin-ios-webview-configurator` - Solo iOS
- `capacitor-widgetsbridge-plugin` - Solo iOS

### Comportamiento en Runtime

| Plataforma | Comportamiento |
|------------|----------------|
| Web (preview) | Import nunca se ejecuta, codigo retorna early |
| iOS Nativo | Import se resuelve correctamente desde el bundle nativo |
| Android | Import nunca se ejecuta para plugins iOS-only |

