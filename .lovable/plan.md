
# Plan: Solucionar Problemas de Layout en iOS

## Problemas Identificados

### Problema 1: Header "Muy Alto" (Apariencia de Doble Header)
Al analizar la captura de pantalla y el código, el problema es que hay **demasiado espacio vertical** entre la barra de estado de iOS y el saludo "¡Buenas noches". Esto crea la apariencia visual de dos headers.

**Causas encontradas:**
1. El `DashboardLayout` aplica `paddingTop: env(safe-area-inset-top)` a todo el contenedor
2. Luego el `Dashboard.tsx` tiene `py-4` (16px) de padding adicional en el `<main>`
3. El `DashboardHeader` tiene un `mb-6` (24px) de margen inferior
4. El total resulta en ~90-100px de espacio superior, creando la ilusión de "doble header"

### Problema 2: Footer que se "Levanta" Intermitentemente
El enfoque actual con `visualViewport` tiene problemas:

1. **Solución actual incompleta:** Solo detecta si el viewport es < 80% de la altura de la ventana
2. **No usa el plugin nativo de Capacitor Keyboard** que proporciona eventos más confiables
3. **Transición abrupta:** El nav desaparece completamente en lugar de reposicionarse suavemente

## Solución Propuesta

### Parte 1: Reducir Altura del Header

**Archivo: `src/components/DashboardHeader.tsx`**
- Reducir el margen inferior de `mb-6` a `mb-4`
- Reducir `min-h-[72px]` a `min-h-[56px]` para compactar más el header

**Archivo: `src/pages/Dashboard.tsx`**
- Reducir el padding superior del main de `py-4` a `pt-2 pb-4` para menos espacio arriba

### Parte 2: Implementar Solución Robusta para el Footer

**Enfoque: Usar el Plugin @capacitor/keyboard**

Según la documentación oficial de Capacitor y patrones de apps como YAZIO/MyFitnessPal:

1. **Instalar el plugin @capacitor/keyboard**
2. **Configurar en capacitor.config.ts:**
   ```typescript
   plugins: {
     Keyboard: {
       resize: "none", // Prevenir que el WebView se redimensione
       style: "dark"
     }
   }
   ```
3. **Actualizar MobileBottomNav.tsx:**
   - Usar eventos nativos del plugin `Keyboard.addListener('keyboardWillShow')` y `keyboardWillHide`
   - Implementar transición animada suave (slide down cuando keyboard aparece)
   - Fallback a `visualViewport` para web

**Nuevo código para MobileBottomNav:**
```typescript
import { Keyboard } from '@capacitor/keyboard';
import { Capacitor } from '@capacitor/core';

// En useEffect:
if (Capacitor.isNativePlatform()) {
  Keyboard.addListener('keyboardWillShow', () => {
    setIsKeyboardOpen(true);
  });
  Keyboard.addListener('keyboardWillHide', () => {
    setIsKeyboardOpen(false);
  });
} else {
  // Fallback visualViewport para web
}
```

### Parte 3: Ajustar Safe Area en DashboardLayout

**Archivo: `src/components/AnimatedRoutes.tsx`**
- El padding-top del safe-area está bien, pero verificar que no haya duplicación

## Pasos de Implementación

1. **Instalar dependencia:** `@capacitor/keyboard`
2. **Actualizar capacitor.config.ts** con configuración del plugin Keyboard
3. **Modificar DashboardHeader.tsx:**
   - `mb-6` → `mb-3`
   - `min-h-[72px]` → `min-h-[56px]`
4. **Modificar Dashboard.tsx:**
   - `py-4` → `pt-2 pb-4`
5. **Refactorizar MobileBottomNav.tsx:**
   - Usar plugin Keyboard nativo con listeners
   - Agregar animación de slide-down suave
   - Mantener fallback visualViewport

## Resultado Esperado

1. **Header más compacto:** ~30px menos de altura superior, apariencia de single header
2. **Footer estable:** El nav inferior se oculta suavemente cuando el teclado aparece usando eventos nativos confiables
3. **Compatibilidad:** Funciona en iOS nativo, Android y web
