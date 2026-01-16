# iOS Lock Screen Widget Setup Guide

Esta guía te ayudará a crear un Lock Screen Widget que muestra el progreso de calorías de Chefly.

## Requisitos Previos

- Xcode 14.0 o superior
- iOS 16.0+ como target mínimo
- Apple Developer Program (para probar en dispositivo físico)

---

## Paso 1: Crear Widget Extension

1. Abre el proyecto en Xcode (`ios/App/App.xcworkspace`)
2. Ve a **File → New → Target**
3. Selecciona **Widget Extension**
4. Configura:
   - **Product Name:** `CaloriesWidget`
   - **Include Configuration Intent:** NO (desmarcar)
   - **Include Live Activity:** NO (desmarcar)
5. Click **Finish**
6. Si pregunta "Activate scheme?", click **Activate**

---

## Paso 2: Configurar App Groups

### En el Target Principal (App):
1. Selecciona el target **App** en el navegador de proyectos
2. Ve a la pestaña **Signing & Capabilities**
3. Click **+ Capability** → **App Groups**
4. Añade el grupo: `group.app.lovable.chefly`

### En el Widget Extension:
1. Selecciona el target **CaloriesWidgetExtension**
2. Ve a **Signing & Capabilities**
3. Click **+ Capability** → **App Groups**
4. Añade el mismo grupo: `group.app.lovable.chefly`

---

## Paso 3: Código del Widget

Reemplaza el contenido de `CaloriesWidget.swift` con:

```swift
import WidgetKit
import SwiftUI

// MARK: - Data Model

struct NutritionData: Codable {
    let currentCalories: Int
    let goalCalories: Int
    let currentProtein: Int
    let goalProtein: Int
    let currentCarbs: Int
    let goalCarbs: Int
    let currentFats: Int
    let goalFats: Int
    let lastUpdated: String
    
    static var placeholder: NutritionData {
        NutritionData(
            currentCalories: 1250,
            goalCalories: 2000,
            currentProtein: 85,
            goalProtein: 120,
            currentCarbs: 150,
            goalCarbs: 250,
            currentFats: 45,
            goalFats: 65,
            lastUpdated: ""
        )
    }
    
    static func load() -> NutritionData {
        guard let userDefaults = UserDefaults(suiteName: "group.app.lovable.chefly"),
              let jsonString = userDefaults.string(forKey: "nutritionData"),
              let jsonData = jsonString.data(using: .utf8),
              let data = try? JSONDecoder().decode(NutritionData.self, from: jsonData)
        else {
            return .placeholder
        }
        return data
    }
    
    var progress: Double {
        guard goalCalories > 0 else { return 0 }
        return min(Double(currentCalories) / Double(goalCalories), 1.0)
    }
    
    var remaining: Int {
        max(goalCalories - currentCalories, 0)
    }
    
    var statusColor: Color {
        let percentage = Double(currentCalories) / Double(goalCalories)
        if percentage > 1.0 { return .red }
        if percentage > 0.85 { return .orange }
        return .green
    }
}

// MARK: - Timeline Entry

struct CaloriesEntry: TimelineEntry {
    let date: Date
    let nutrition: NutritionData
}

// MARK: - Timeline Provider

struct CaloriesProvider: TimelineProvider {
    func placeholder(in context: Context) -> CaloriesEntry {
        CaloriesEntry(date: Date(), nutrition: .placeholder)
    }
    
    func getSnapshot(in context: Context, completion: @escaping (CaloriesEntry) -> Void) {
        let entry = CaloriesEntry(date: Date(), nutrition: NutritionData.load())
        completion(entry)
    }
    
    func getTimeline(in context: Context, completion: @escaping (Timeline<CaloriesEntry>) -> Void) {
        let nutrition = NutritionData.load()
        let entry = CaloriesEntry(date: Date(), nutrition: nutrition)
        
        // Refresh every 15 minutes
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: Date())!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        
        completion(timeline)
    }
}

// MARK: - Lock Screen Widget Views

struct CircularProgressView: View {
    let progress: Double
    let color: Color
    
    var body: some View {
        ZStack {
            // Background circle
            Circle()
                .stroke(color.opacity(0.3), lineWidth: 4)
            
            // Progress circle
            Circle()
                .trim(from: 0, to: progress)
                .stroke(color, style: StrokeStyle(lineWidth: 4, lineCap: .round))
                .rotationEffect(.degrees(-90))
        }
    }
}

struct AccessoryCircularView: View {
    let entry: CaloriesEntry
    
    var body: some View {
        ZStack {
            CircularProgressView(
                progress: entry.nutrition.progress,
                color: entry.nutrition.statusColor
            )
            
            VStack(spacing: 0) {
                Text("\(entry.nutrition.remaining)")
                    .font(.system(size: 14, weight: .bold, design: .rounded))
                    .minimumScaleFactor(0.5)
                Text("kcal")
                    .font(.system(size: 8, weight: .medium))
                    .foregroundColor(.secondary)
            }
        }
    }
}

struct AccessoryRectangularView: View {
    let entry: CaloriesEntry
    
    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            HStack {
                Image(systemName: "flame.fill")
                    .foregroundColor(entry.nutrition.statusColor)
                Text("Calorías")
                    .font(.headline)
                Spacer()
            }
            
            ProgressView(value: entry.nutrition.progress)
                .tint(entry.nutrition.statusColor)
            
            HStack {
                Text("\(entry.nutrition.currentCalories)")
                    .font(.system(.body, design: .rounded).bold())
                Text("/ \(entry.nutrition.goalCalories) kcal")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
    }
}

struct AccessoryInlineView: View {
    let entry: CaloriesEntry
    
    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: "flame.fill")
            Text("\(entry.nutrition.currentCalories) de \(entry.nutrition.goalCalories) kcal")
        }
    }
}

// MARK: - Widget Configuration

struct CaloriesWidgetEntryView: View {
    @Environment(\.widgetFamily) var family
    var entry: CaloriesProvider.Entry
    
    var body: some View {
        switch family {
        case .accessoryCircular:
            AccessoryCircularView(entry: entry)
        case .accessoryRectangular:
            AccessoryRectangularView(entry: entry)
        case .accessoryInline:
            AccessoryInlineView(entry: entry)
        default:
            // Fallback for other sizes (if needed in future)
            AccessoryCircularView(entry: entry)
        }
    }
}

@main
struct CaloriesWidget: Widget {
    let kind: String = "CaloriesWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CaloriesProvider()) { entry in
            CaloriesWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Calorías Chefly")
        .description("Muestra tu progreso de calorías del día.")
        .supportedFamilies([
            .accessoryCircular,
            .accessoryRectangular,
            .accessoryInline
        ])
    }
}

// MARK: - Preview

struct CaloriesWidget_Previews: PreviewProvider {
    static var previews: some View {
        Group {
            CaloriesWidgetEntryView(entry: CaloriesEntry(date: Date(), nutrition: .placeholder))
                .previewContext(WidgetPreviewContext(family: .accessoryCircular))
                .previewDisplayName("Circular")
            
            CaloriesWidgetEntryView(entry: CaloriesEntry(date: Date(), nutrition: .placeholder))
                .previewContext(WidgetPreviewContext(family: .accessoryRectangular))
                .previewDisplayName("Rectangular")
            
            CaloriesWidgetEntryView(entry: CaloriesEntry(date: Date(), nutrition: .placeholder))
                .previewContext(WidgetPreviewContext(family: .accessoryInline))
                .previewDisplayName("Inline")
        }
    }
}
```

---

## Paso 4: Configurar Info.plist del Widget

El Info.plist del widget ya debería estar configurado correctamente. Verifica que contenga:

```xml
<key>NSWidgetWantsLocation</key>
<false/>
```

---

## Paso 5: Build y Test

1. Selecciona el scheme de la App principal (no el del widget)
2. Build y ejecuta en un dispositivo con iOS 16+
3. En el iPhone:
   - Ve a **Configuración → Pantalla de bloqueo**
   - O mantén presionada la pantalla de bloqueo → **Personalizar**
   - Añade el widget "Calorías Chefly"

---

## Troubleshooting

### El widget no aparece
- Verifica que ambos targets (App y Widget) tengan el mismo App Group
- Limpia el build: **Product → Clean Build Folder**
- Reinicia el dispositivo

### El widget muestra datos placeholder
- Asegúrate de haber registrado comida en la app
- El widget se actualiza cada 15 minutos o cuando la app sincroniza
- Verifica en Console.app si hay errores del widget

### "No such module 'WidgetKit'"
- Asegúrate que el Deployment Target del widget sea iOS 16.0+

---

## Cómo Funciona la Sincronización

```
┌─────────────────────────────────────────────────────────────┐
│                         App React                            │
│                                                              │
│  ┌──────────────┐    ┌─────────────────┐    ┌────────────┐  │
│  │ Food Scanner │───▶│ useDailyIntake  │───▶│ syncWidget │  │
│  └──────────────┘    └─────────────────┘    └─────┬──────┘  │
└───────────────────────────────────────────────────┼─────────┘
                                                    │
                                                    ▼
┌─────────────────────────────────────────────────────────────┐
│                    Shared UserDefaults                       │
│                 (App Group: group.app.lovable.chefly)        │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Key: "nutritionData"                                     ││
│  │ Value: { currentCalories, goalCalories, ... }            ││
│  └─────────────────────────────────────────────────────────┘│
└───────────────────────────────────────────────────┬─────────┘
                                                    │
                                                    ▼
┌─────────────────────────────────────────────────────────────┐
│                      iOS Widget                              │
│                                                              │
│  ┌────────────────┐    ┌────────────────┐    ┌────────────┐ │
│  │ TimelineProvider│───▶│ Load from      │───▶│ Display    │ │
│  │                 │    │ UserDefaults   │    │ Progress   │ │
│  └────────────────┘    └────────────────┘    └────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Próximos Pasos

Una vez configurado el widget básico, puedes:

1. **Añadir más datos**: Mostrar macros (proteína, carbos, grasas)
2. **Widget de Home Screen**: Expandir a `systemSmall`, `systemMedium`
3. **Live Activity**: Mostrar progreso en la Dynamic Island
4. **Intents**: Permitir configuración del widget por el usuario
