

# Plan: Integración de Apple Health con Chefly AI

## Resumen

Integrar Apple Health en la app iOS nativa para sincronizar automáticamente datos de salud (pasos, calorías quemadas, peso) y mejorar la precisión de los cálculos nutricionales. Los usuarios podrán conectar Apple Health durante el onboarding o desde la página de perfil.

## Diagrama del Flujo

```text
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Onboarding    │     │   Dashboard     │     │    Profile      │
│   (Nuevo paso)  │     │   (Sync auto)   │     │   (Settings)    │
│                 │     │                 │     │                 │
│  ¿Conectar      │────▶│   Pasos/Cal     │◀────│   Conectar/     │
│  Apple Health?  │     │   desde Health  │     │   Desconectar   │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       ▲
        │                       │
        └───────────────────────┘
              Datos sincronizados
```

## Plugin Recomendado

Usaremos **@capgo/capacitor-health** por las siguientes razones:
- Soporte activo para Capacitor 5+
- Compatible con Apple HealthKit (iOS) y Google Health Connect (Android)
- API moderna con TypeScript
- Documentación clara y mantenida

## Componentes a Crear

### 1. Nuevo Hook: `useAppleHealth.ts`
Centraliza toda la lógica de Apple Health:
- Verificar disponibilidad (solo iOS nativo)
- Solicitar permisos de lectura (pasos, calorías activas, peso)
- Leer datos del último período (7 días)
- Sincronizar peso automáticamente con el perfil
- Calcular calorías quemadas diarias para ajustar TDEE

### 2. Nuevo Componente: `AppleHealthCard.tsx`
Widget visual para mostrar datos de Health:
- Estado de conexión (conectado/desconectado)
- Pasos de hoy
- Calorías quemadas de hoy
- Último peso registrado

### 3. Nuevo Componente: `AppleHealthPrompt.tsx`
Modal de conexión con:
- Explicación de beneficios
- Botón "Conectar Apple Health"
- Opción "Ahora no"

### 4. Modificaciones al Onboarding

Agregar un nuevo paso (después del paso de actividad física):
- Solo visible en iOS nativo
- Pregunta si quieren conectar Apple Health
- Botón para solicitar permisos
- Opción para omitir

### 5. Modificaciones a la Página de Perfil

Agregar en Settings:
- Nueva sección "Integraciones" o "Salud"
- Toggle/Botón para conectar/desconectar Apple Health
- Mostrar estado actual de conexión

## Datos a Sincronizar

| Dato | Uso en la App | Frecuencia |
|------|---------------|------------|
| Pasos diarios | Mostrar en dashboard, XP bonus | Cada apertura |
| Calorías activas | Ajustar TDEE automáticamente | Cada apertura |
| Peso corporal | Actualizar perfil automáticamente | Al abrir app |
| Ejercicios | Mostrar en progreso (futuro) | Opcional |

## Detalles de Implementación

### useAppleHealth.ts

```typescript
// Estructura del hook:
interface AppleHealthData {
  isAvailable: boolean;        // Solo true en iOS nativo
  isAuthorized: boolean;       // Permisos concedidos
  steps: number | null;        // Pasos de hoy
  activeCalories: number | null; // Calorías quemadas hoy
  weight: number | null;       // Último peso en kg
  lastSync: Date | null;       // Última sincronización
}

// Funciones expuestas:
- requestAuthorization(): Promise<boolean>
- syncData(): Promise<void>
- disconnectHealth(): void
- isHealthAvailable(): boolean
```

### Nuevo Paso en Onboarding (Paso 14.5 - después de actividad)

```typescript
// Solo visible si Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios'

// Opciones:
// 1. "Sí, conectar Apple Health" → requestAuthorization()
// 2. "Más tarde" → siguiente paso
```

### Persistencia

Guardar estado de conexión en:
- `localStorage` con key `chefly_health_authorized`
- Tabla `user_preferences` con nueva columna `apple_health_connected`

## Archivos a Crear

| Archivo | Descripción |
|---------|-------------|
| `src/hooks/useAppleHealth.ts` | Hook principal con toda la lógica |
| `src/components/health/AppleHealthCard.tsx` | Widget de visualización |
| `src/components/health/AppleHealthPrompt.tsx` | Modal de conexión |
| `src/components/onboarding/OnboardingHealthStep.tsx` | Paso de onboarding |

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/PreOnboarding.tsx` | Agregar nuevo paso de Health (condicional iOS) |
| `src/pages/Settings.tsx` | Agregar sección de integraciones con Apple Health |
| `src/hooks/usePreOnboardingState.ts` | Agregar campo `appleHealthConnected` |
| `package.json` | Instalar `@capgo/capacitor-health` |

## Configuración Nativa Requerida

### iOS (Xcode)

1. Agregar capability "HealthKit" en Signing & Capabilities
2. Agregar permisos en Info.plist:

```xml
<key>NSHealthShareUsageDescription</key>
<string>Chefly AI usa tus datos de Apple Health para personalizar tus metas nutricionales basándose en tu actividad física real.</string>
<key>NSHealthUpdateUsageDescription</key>
<string>Chefly AI puede guardar tu peso en Apple Health para un seguimiento centralizado.</string>
```

## Flujo de Usuario

### En Onboarding (nuevos usuarios)
1. Usuario llega al paso de actividad física
2. Nuevo paso: "¿Quieres conectar Apple Health?"
3. Mascota explica beneficios (cálculos más precisos)
4. Usuario elige "Conectar" o "Más tarde"
5. Si conecta: popup nativo de iOS para permisos
6. Continúa al siguiente paso

### Desde Perfil (usuarios existentes)
1. Usuario va a Settings
2. Nueva sección "Integraciones"
3. Card de Apple Health con estado y botón
4. Al tocar: solicita permisos o muestra datos
5. Opción para desconectar

### Sincronización Automática
1. Al abrir la app: verificar si está conectado
2. Si conectado: leer pasos/calorías/peso
3. Actualizar dashboard con datos
4. Si hay nuevo peso: actualizar perfil automáticamente

## Beneficios para el Usuario

1. **Precisión**: TDEE calculado con actividad real, no estimada
2. **Comodidad**: Peso se actualiza automáticamente
3. **Motivación**: Ver pasos y calorías quemadas en la app
4. **Gamificación**: Bonus XP por alcanzar meta de pasos (futuro)

---

## Sección Técnica

### Permisos de HealthKit

```typescript
const permissions = {
  read: [
    'steps',           // HKQuantityTypeIdentifierStepCount
    'activeCalories',  // HKQuantityTypeIdentifierActiveEnergyBurned
    'weight',          // HKQuantityTypeIdentifierBodyMass
  ],
  write: [
    'weight',          // Para sincronizar peso desde la app
  ],
};
```

### Estructura de la Base de Datos

```sql
ALTER TABLE user_preferences 
ADD COLUMN apple_health_connected BOOLEAN DEFAULT false;

ALTER TABLE user_preferences 
ADD COLUMN health_last_sync TIMESTAMP WITH TIME ZONE;
```

### Cálculo de TDEE Mejorado

Con Apple Health, el TDEE puede ajustarse dinámicamente:

```typescript
const adjustedTDEE = baseTDEE + (activeCaloriesFromHealth * 0.9);
// Factor 0.9 para evitar sobreestimación
```

### Consideraciones de Privacidad

- Los datos de Health nunca salen del dispositivo
- Solo se sincronizan agregados (pasos totales, no ubicación)
- Usuario puede desconectar en cualquier momento
- Cumple con políticas de Apple para HealthKit

### Manejo de Errores

```typescript
// Casos a manejar:
- HealthKit no disponible (Android, web, simulador)
- Permisos denegados por el usuario
- Permisos parciales (algunos tipos denegados)
- Error de lectura de datos
- Sin datos disponibles para el período
```

