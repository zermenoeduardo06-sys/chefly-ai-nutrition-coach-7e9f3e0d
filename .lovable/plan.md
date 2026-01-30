
# Plan: Solucionar Error "Missing package product 'CapApp-SPM'" en Xcode

## Diagnóstico

### Causa del Error
El proyecto usa **Capacitor 8** que por defecto utiliza **Swift Package Manager (SPM)** para gestionar dependencias iOS. Sin embargo, tienes instalados dos plugins que **NO son compatibles con SPM**:

| Plugin | Compatibilidad SPM |
|--------|-------------------|
| `capacitor-plugin-ios-webview-configurator` | No |
| `capacitor-widgetsbridge-plugin` | No |

Cuando Xcode intenta resolver los paquetes SPM, no encuentra estos plugins y falla con "Missing package product 'CapApp-SPM'".

---

## Solución: Eliminar Plugins Incompatibles + Implementar Funcionalidad Manualmente

### Paso 1: Eliminar los plugins de package.json

Remover las dependencias que causan el conflicto:
- `capacitor-plugin-ios-webview-configurator`
- `capacitor-widgetsbridge-plugin`

### Paso 2: Limpiar el proyecto iOS

Ejecutar en terminal:
```bash
# Eliminar carpeta ios para regenerarla limpia
rm -rf ios

# Reinstalar dependencias
npm install

# Regenerar proyecto iOS
npx cap add ios --skip-appid-validation

# Sincronizar
npx cap sync ios
```

### Paso 3: Limpiar caches de Xcode (si el problema persiste)

```bash
# Limpiar caches de SPM
rm -rf ~/Library/Caches/org.swift.swiftpm
rm -rf ~/Library/Developer/Xcode/DerivedData

# Abrir Xcode
npx cap open ios
```

En Xcode:
1. **File > Packages > Reset Package Caches**
2. **File > Packages > Resolve Package Versions**
3. **Product > Clean Build Folder** (Shift+Cmd+K)

### Paso 4: Implementar funcionalidades manualmente en Swift

Ya que los plugins no funcionan con SPM, las funcionalidades se implementan directamente en `AppDelegate.swift`:

**Para desactivar scroll bounce (reemplaza capacitor-plugin-ios-webview-configurator):**

Editar `ios/App/App/AppDelegate.swift`:
```swift
import UIKit
import Capacitor
import WebKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, 
                     didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        
        // Desactivar scroll bounce después de que la app inicie
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

**Para widgets (reemplaza capacitor-widgetsbridge-plugin):**

La sincronización de widgets usará localStorage como fallback (ya documentado en el proyecto).

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `package.json` | Eliminar `capacitor-plugin-ios-webview-configurator` y `capacitor-widgetsbridge-plugin` |
| `src/hooks/useWidgetSync.ts` | Actualizar para usar solo localStorage (sin el plugin) |
| Cualquier archivo que importe estos plugins | Remover imports y uso |

---

## Comandos a Ejecutar (en tu máquina local)

```bash
# 1. Eliminar plugins incompatibles
npm uninstall capacitor-plugin-ios-webview-configurator capacitor-widgetsbridge-plugin

# 2. Eliminar y regenerar proyecto iOS
rm -rf ios
npx cap add ios --skip-appid-validation
npx cap sync ios

# 3. Limpiar caches (si es necesario)
rm -rf ~/Library/Caches/org.swift.swiftpm
rm -rf ~/Library/Developer/Xcode/DerivedData

# 4. Abrir Xcode
npx cap open ios
```

---

## Impacto

| Antes | Después |
|-------|---------|
| Error "Missing package product 'CapApp-SPM'" | Build exitoso |
| Plugins incompatibles con SPM | Funcionalidad implementada nativamente en Swift |
| Widgets sincronizados via plugin | Widgets sincronizados via localStorage (fallback) |

---

## Nota Técnica

Esta es la solución recomendada porque:
1. **No requiere CocoaPods** - Mantienes SPM que es más moderno y rápido
2. **Menos dependencias** - Código nativo Swift es más estable que plugins de terceros
3. **Compatible con App Store** - Sin plugins problemáticos que puedan causar rechazos
