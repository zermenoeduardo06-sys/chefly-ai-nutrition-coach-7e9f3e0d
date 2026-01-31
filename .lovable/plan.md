

# Plan: Resolución Definitiva del Error "Missing package product 'CapApp-SPM'"

## Estado Actual del Proyecto

### Verificación de Compatibilidad SPM
He verificado que **todos los plugins instalados son compatibles con Capacitor 8 + SPM**:

| Plugin | Versión | Package.swift usa | Estado |
|--------|---------|-------------------|--------|
| `@capacitor/core` | ^8.0.0 | nativo | ✅ Compatible |
| `@capacitor/ios` | ^8.0.0 | nativo | ✅ Compatible |
| `@capacitor-community/in-app-review` | ^8.0.0 | `from: "8.0.0"` | ✅ Compatible |
| `@revenuecat/purchases-capacitor` | ^12.0.1 | `from: "8.0.0"` | ✅ Compatible |
| Plugins oficiales (@capacitor/*) | ^8.0.0 | nativo | ✅ Compatible |

Los plugins problemáticos (`capacitor-plugin-ios-webview-configurator` y `capacitor-widgetsbridge-plugin`) **ya fueron eliminados** del `package.json` en la sesión anterior.

### Causa del Error Persistente
El error persiste porque:
1. El proyecto iOS local tiene archivos corruptos/cacheados de la configuración anterior
2. Xcode mantiene caches de SPM que no se actualizaron
3. El `CapApp-SPM` no se regeneró correctamente después de los cambios

---

## Solución Definitiva

### Paso 1: Verificar Estado del package.json (Ya Completado)
El `package.json` ya no contiene los plugins incompatibles. Las dependencias actuales son:

```json
{
  "@capacitor-community/in-app-review": "^8.0.0",
  "@capacitor/android": "^8.0.0",
  "@capacitor/browser": "^8.0.0",
  "@capacitor/camera": "^8.0.0",
  "@capacitor/cli": "^8.0.0",
  "@capacitor/core": "^8.0.0",
  "@capacitor/filesystem": "^8.0.0",
  "@capacitor/haptics": "^8.0.0",
  "@capacitor/ios": "^8.0.0",
  "@capacitor/local-notifications": "^8.0.0",
  "@capacitor/share": "^8.0.0",
  "@revenuecat/purchases-capacitor": "^12.0.1"
}
```

### Paso 2: Comandos de Regeneración Completa (Ejecutar en Terminal Local)

```bash
# 1. Obtener los últimos cambios del repositorio
git pull origin main

# 2. Limpiar node_modules y reinstalar
rm -rf node_modules
rm -f package-lock.json
npm install

# 3. Eliminar el proyecto iOS corrupto completamente
rm -rf ios

# 4. Limpiar las caches globales de SPM
rm -rf ~/Library/Caches/org.swift.swiftpm
rm -rf ~/Library/Developer/Xcode/DerivedData

# 5. Regenerar el proyecto iOS (SPM es el default en Capacitor 8)
npx cap add ios

# 6. Verificar que CapApp-SPM se creó correctamente
ls -la ios/App/CapApp-SPM/

# 7. Build del proyecto web
npm run build

# 8. Sincronizar con iOS
npx cap sync ios

# 9. Abrir en Xcode
npx cap open ios
```

### Paso 3: Configuración en Xcode (Después de Abrir el Proyecto)

Una vez en Xcode:

1. **Resolver paquetes SPM:**
   - Ve a `File > Packages > Resolve Package Versions`
   - Espera a que termine (puede tardar 1-2 minutos)

2. **Si persisten problemas de paquetes:**
   - Ve a `File > Packages > Reset Package Caches`
   - Luego `File > Packages > Resolve Package Versions`

3. **Limpiar Build:**
   - Presiona `Shift + Cmd + K` (Clean Build Folder)
   - Luego `Cmd + B` (Build)

4. **Configurar Signing:**
   - Selecciona el target "App"
   - Ve a "Signing & Capabilities"
   - Selecciona tu Team

### Paso 4: Implementar Scroll Bounce Nativo (Manual en Swift)

Después de regenerar el proyecto, edita `ios/App/App/AppDelegate.swift`:

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
    
    // MARK: - Capacitor URL Handling
    
    func application(_ app: UIApplication, open url: URL, 
                     options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }
    
    func application(_ application: UIApplication, 
                     continue userActivity: NSUserActivity, 
                     restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(
            application, continue: userActivity, restorationHandler: restorationHandler
        )
    }
}
```

---

## Verificación del Éxito

Después de completar todos los pasos, deberías ver:

```text
✅ Carpeta ios/App/CapApp-SPM/ existe y contiene Package.swift
✅ Xcode abre sin errores de "Missing package product"
✅ El proyecto compila exitosamente (Cmd + B)
✅ La app corre en simulador o dispositivo
✅ import Capacitor funciona en AppDelegate.swift
```

---

## Estructura Esperada de ios/App/CapApp-SPM/

```text
ios/App/CapApp-SPM/
├── Package.swift          ← Generado automáticamente por Capacitor CLI
├── Sources/
│   └── CapApp-SPM/
│       └── CapApp_SPM.swift
```

El `Package.swift` generado debería incluir dependencias como:

```swift
dependencies: [
    .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0"),
    // ... plugins adicionales
]
```

---

## Resumen de Cambios Necesarios

| Componente | Estado | Acción Requerida |
|------------|--------|------------------|
| `package.json` | ✅ Correcto | Ya actualizado (sin plugins incompatibles) |
| `src/main.tsx` | ✅ Correcto | Ya actualizado (sin import del plugin) |
| `src/hooks/useWidgetSync.ts` | ✅ Correcto | Ya usa localStorage fallback |
| Carpeta `ios/` | ❌ Corrupta | **Eliminar y regenerar** |
| Caches de SPM | ❌ Corruptas | **Limpiar manualmente** |
| `AppDelegate.swift` | ⚠️ Pendiente | **Editar manualmente después de regenerar** |

---

## Notas Técnicas

### Por qué NO usar `--packagemanager SPM`
En Capacitor 8, SPM es el gestor de paquetes **por defecto**. El flag `--packagemanager SPM` no es necesario ni recomendado.

### Por qué NO usar `--skip-appid-validation`
Este flag no existe en Capacitor CLI. El Bundle ID `com.cheflyai.app` es válido y no requiere validación especial.

### Alternativa si Todo Falla
Si después de seguir todos los pasos el problema persiste:

```bash
# Nuclear option - eliminar TODO y empezar de cero
rm -rf ios node_modules package-lock.json
rm -rf ~/Library/Caches/org.swift.swiftpm
rm -rf ~/Library/Developer/Xcode/DerivedData

# Cerrar Xcode completamente
killall Xcode

# Reinstalar
npm install
npx cap add ios
npm run build
npx cap sync ios
npx cap open ios
```

