# Capacitor 8 SPM Bug Reproduction

Minimal reproduction for: **CapApp-SPM plugin products not appearing in Xcode**

## Environment

- macOS Sonoma
- Xcode 15.x
- Node.js v20.x
- npm 10.x
- Capacitor CLI 8.0.0
- CocoaPods: NOT installed (explicitly using SPM only)

## Steps to Reproduce

```bash
# 1. Install dependencies
npm install

# 2. Build the web assets
npm run build

# 3. Add iOS platform with SPM
npx cap add ios --packagemanager SPM

# 4. Sync the project
npx cap sync ios

# 5. Open in Xcode
npx cap open ios
```

## Expected Behavior

1. ✅ CapApp-SPM appears in Xcode's "Package Dependencies"
2. ❌ CapApp-SPM products should be available in "Frameworks, Libraries, and Embedded Content"
3. ❌ Products should be auto-linked or manually selectable

## Actual Behavior

1. ✅ CapApp-SPM package is listed under Package Dependencies
2. ❌ **No products from CapApp-SPM are available** when clicking "+" in Frameworks
3. ❌ This makes it impossible to link any Capacitor plugins to the App target

## Console Output

```
[info] Found 2 Capacitor plugins for ios:
       @capacitor/camera@8.0.0
       @capacitor/haptics@8.0.0
[info] All plugins have a Package.swift file and will be included in Package.swift
[info] Writing Package.swift
```

## Screenshots

### Package Dependencies (appears correctly)
<!-- Add screenshot showing CapApp-SPM in Package Dependencies -->

### Frameworks - No Products Available
<!-- Add screenshot showing empty product list when clicking "+" -->

## Workaround Attempted

- Tried "Add Local..." in Package Dependencies → selected CapApp-SPM folder
- Tried "Reset Package Caches" in Xcode
- Tried deleting DerivedData and rebuilding
- None of these expose the plugin products

## Additional Context

- This blocks ALL plugin usage in SPM mode
- CocoaPods mode works correctly but we need SPM for other dependencies
- The Package.swift file is generated correctly with proper dependencies
