# iOS Configuration for Chefly AI

## Setup Instructions

After running `npx cap add ios`, follow these steps:

### 1. App Icons

Generate your App Icons from your 1024x1024 logo:

1. Use [App Icon Generator](https://www.appicon.co/) or [MakeAppIcon](https://makeappicon.com/)
2. Upload `src/assets/chefly-logo.png`
3. Download the generated icons
4. Replace contents of `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

Required icon sizes:
- 20pt (1x, 2x, 3x) - Notifications
- 29pt (1x, 2x, 3x) - Settings
- 40pt (1x, 2x, 3x) - Spotlight
- 60pt (2x, 3x) - App Icon
- 76pt (1x, 2x) - iPad App
- 83.5pt (2x) - iPad Pro
- 1024pt (1x) - App Store

### 2. Privacy Descriptions (Info.plist)

Open `ios/App/App/Info.plist` in Xcode and add the privacy keys from `Info.plist.additions`:

```xml
<key>NSCameraUsageDescription</key>
<string>Chefly AI necesita acceso a tu cámara para escanear alimentos y analizar su información nutricional con inteligencia artificial.</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>Chefly AI necesita acceso a tu galería para seleccionar fotos de alimentos y analizar su información nutricional.</string>

<key>NSPhotoLibraryAddUsageDescription</key>
<string>Chefly AI necesita permiso para guardar las imágenes de tus escaneos de alimentos.</string>

<key>CFBundleDisplayName</key>
<string>Chefly AI</string>
```

### 3. Launch Screen (LaunchScreen.storyboard)

The Launch Screen is configured in `ios/App/App/Base.lproj/LaunchScreen.storyboard`.

To customize:

1. Open project in Xcode
2. Navigate to `App > App > Base.lproj > LaunchScreen.storyboard`
3. Delete default content
4. Add an ImageView with your logo centered
5. Set background color to `#0a0a0a` (dark theme)
6. Add constraints for centering

Or use the provided `LaunchScreen.storyboard` file in this folder.

### 4. Build and Run

```bash
# Sync changes
npx cap sync ios

# Open in Xcode
npx cap open ios

# Build for device
# In Xcode: Product > Build (Cmd+B)
```

### 5. Disable iOS Scroll Bounce (Optional)

If CSS solutions don't fully prevent the black line on overscroll, add this native Swift configuration.

Edit `ios/App/App/AppDelegate.swift` and add after `super.application`:
```swift
// Disable scroll bounce to prevent black lines
if let window = window,
   let rootVC = window.rootViewController,
   let webView = findWKWebView(in: rootVC.view) {
    webView.scrollView.bounces = false
    webView.scrollView.alwaysBounceVertical = false
    webView.scrollView.alwaysBounceHorizontal = false
}

// Helper function to find WKWebView
func findWKWebView(in view: UIView) -> WKWebView? {
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
```

### 6. App Store Submission Checklist

- [ ] App Icons configured
- [ ] Privacy descriptions added
- [ ] Launch Screen customized
- [ ] Bundle ID matches App Store Connect
- [ ] Version and build numbers set
- [ ] Provisioning profiles configured
- [ ] Screenshots captured (all device sizes)
- [ ] App description and keywords ready
- [ ] Scroll bounce disabled (if needed)
