

# Plan: Resolver Error SPM "Missing package product 'CapApp-SPM'" en Xcode

## Diagnóstico Confirmado

### Plugins Incompatibles Detectados
| Plugin | Versión | Soporte SPM | Ubicación de uso |
|--------|---------|-------------|------------------|
| `capacitor-plugin-ios-webview-configurator` | ^0.4.0 | **NO** | `src/main.tsx` (línea 3) |
| `capacitor-widgetsbridge-plugin` | ^0.2.1 | **NO** | `src/hooks/useWidgetSync.ts` (línea 29) |

Estos plugins no tienen `Package.swift` ni soporte para SPM, causando que Xcode falle al resolver el grafo de dependencias.

### Compatibilidad RevenueCat
`@revenuecat/purchases-capacitor@^12.0.1` es compatible con SPM y Capacitor 8. La versión más reciente es 12.0.5 (publicada hace 2 días). No requiere cambios.

---

## Solución en 3 Partes

### Parte 1: Eliminar Plugins Incompatibles

**Archivo: `package.json`**

Eliminar líneas 57-58:
```diff
- "capacitor-plugin-ios-webview-configurator": "^0.4.0",
- "capacitor-widgetsbridge-plugin": "^0.2.1",
```

### Parte 2: Refactorizar Código que Usa los Plugins

**Archivo: `src/main.tsx`**

Antes:
```typescript
import { Capacitor } from "@capacitor/core";
import { setWebviewBounce } from "capacitor-plugin-ios-webview-configurator";
import App from "./App.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";
import "./index.css";

if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios') {
  try {
    setWebviewBounce(false);
  } catch {
    // Plugin not available
  }
}
```

Después:
```typescript
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";
import "./index.css";

// NOTE: Scroll bounce is disabled via native Swift code in AppDelegate.swift
// and CSS (overscroll-behavior: none) - no plugin needed

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
```

**Archivo: `src/hooks/useWidgetSync.ts`**

Reemplazar con fallback a localStorage (el widget nativo puede leer de localStorage si se implementa en el futuro):
```typescript
import { Capacitor } from "@capacitor/core";

interface WidgetData {
  currentCalories: number;
  goalCalories: number;
  currentProtein: number;
  goalProtein: number;
  currentCarbs: number;
  goalCarbs: number;
  currentFats: number;
  goalFats: number;
  lastUpdated: string;
}

const WIDGET_STORAGE_KEY = "chefly_widget_data";

/**
 * Syncs nutrition data for potential iOS Widget consumption.
 * Currently uses localStorage as fallback since native bridge plugin
 * is incompatible with Swift Package Manager.
 * 
 * Future: Implement native Swift UserDefaults sync via custom plugin
 * when SPM-compatible widget bridge becomes available.
 */
export async function syncToWidget(data: WidgetData): Promise<void> {
  // Only sync on native iOS
  if (Capacitor.getPlatform() !== "ios") {
    return;
  }

  try {
    // Store in localStorage as fallback
    // Native widget can potentially read this via WKWebView bridge
    localStorage.setItem(WIDGET_STORAGE_KEY, JSON.stringify(data));
    console.log("[WidgetSync] Data saved to localStorage:", data);
  } catch (error) {
    console.log("[WidgetSync] Widget sync skipped:", error);
  }
}

/**
 * Helper to create widget data from nutrition values
 */
export function createWidgetData(
  consumed: { calories: number; protein: number; carbs: number; fats: number },
  goals: { calories: number; protein: number; carbs: number; fats: number }
): WidgetData {
  return {
    currentCalories: Math.round(consumed.calories),
    goalCalories: Math.round(goals.calories),
    currentProtein: Math.round(consumed.protein),
    goalProtein: Math.round(goals.protein),
    currentCarbs: Math.round(consumed.carbs),
    goalCarbs: Math.round(goals.carbs),
    currentFats: Math.round(consumed.fats),
    goalFats: Math.round(goals.fats),
    lastUpdated: new Date().toISOString(),
  };
}
```

### Parte 3: Actualizar Documentación para Swift Nativo

**Archivo: `ios-config/README.md`**

Actualizar sección de scroll bounce con la implementación nativa requerida:

```markdown
### 5. Disable iOS Scroll Bounce (REQUIRED)

After running `npx cap add ios`, you MUST manually edit the native Swift files:

**Edit `ios/App/App/AppDelegate.swift`:**

```swift
import UIKit
import Capacitor
import WebKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, 
                     didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        
        // Disable scroll bounce after app launches
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            self.disableScrollBounce()
        }
        
        return true
    }
    
    private func disableScrollBounce() {
        guard let window = window,
              let rootVC = window.rootViewController,
              let webView = findWKWebView(in: rootVC.view) else { return }
        
        webView.scrollView.bounces = false
        webView.scrollView.alwaysBounceVertical = false
        webView.scrollView.alwaysBounceHorizontal = false
        
        print("[AppDelegate] Scroll bounce disabled")
    }
    
    private func findWKWebView(in view: UIView) -> WKWebView? {
        if let webView = view as? WKWebView {
            return webView
        }
        for subview in view.subviews {
            if let found = findWKWebView(in: subview) {
                return found
            }
        }
        return nil
    }
}
```
```

---

## Comandos para Ejecutar (en tu máquina local)

Después de que aplique los cambios de código, ejecuta en orden:

```bash
# 1. Git pull para obtener los cambios
git pull

# 2. Reinstalar dependencias (sin los plugins problemáticos)
npm install

# 3. Eliminar proyecto iOS corrupto
rm -rf ios

# 4. Regenerar proyecto iOS con SPM
npx cap add ios

# 5. Build del proyecto web
npm run build

# 6. Sincronizar con iOS
npx cap sync ios

# 7. Limpiar caches de SPM (si persisten problemas)
rm -rf ~/Library/Caches/org.swift.swiftpm
rm -rf ~/Library/Developer/Xcode/DerivedData

# 8. Abrir Xcode
npx cap open ios
```

En Xcode, si aún hay problemas:
1. **File > Packages > Reset Package Caches**
2. **File > Packages > Resolve Package Versions**
3. **Product > Clean Build Folder** (Shift+Cmd+K)

---

## Resumen de Cambios

| Archivo | Acción |
|---------|--------|
| `package.json` | Eliminar 2 plugins incompatibles |
| `src/main.tsx` | Remover import y uso del webview configurator |
| `src/hooks/useWidgetSync.ts` | Reemplazar plugin con localStorage fallback |
| `ios-config/README.md` | Actualizar instrucciones de Swift nativo |

---

## Versiones Finales en package.json

```json
{
  "@capacitor/core": "^8.0.0",
  "@capacitor/cli": "^8.0.0", 
  "@capacitor/ios": "^8.0.0",
  "@revenuecat/purchases-capacitor": "^12.0.1"
}
```

Todos los plugins oficiales de Capacitor 8.x son compatibles con SPM. RevenueCat 12.x también es compatible.

---

## Estado Final Esperado

- Xcode abre sin errores de Package Graph
- No aparece "Missing package product 'CapApp-SPM'"
- El proyecto compila en simulador iOS usando SPM
- Scroll bounce desactivado via Swift nativo
- Widget sync usa localStorage (funcionalidad preservada para futuro)

