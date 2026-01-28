

# Plan: Mejora de Animaciones + Sistema de Prompts de Notificaciones

## Resumen Ejecutivo
Implementar un sistema de animaciones más rico en toda la app y crear un flujo inteligente para pedir permisos de notificaciones en momentos estratégicos: después del onboarding y periódicamente para usuarios que las rechazaron.

---

## Parte 1: Sistema de Prompts de Notificaciones

### 1.1 Nuevo Componente: `NotificationPermissionPrompt`
Un modal atractivo que aparecerá en momentos estratégicos para pedir permisos de notificaciones.

```text
src/components/NotificationPermissionPrompt.tsx (NUEVO)
```

**Características:**
- Diseño visual atractivo con mascota animada
- Muestra beneficios claros (recordatorios de comidas, alertas de racha)
- Botones "Activar" y "Ahora no"
- Animaciones de entrada/salida con Framer Motion

### 1.2 Momentos de Aparición

| Momento | Condición | Delay |
|---------|-----------|-------|
| Post-onboarding | Primera vez en Dashboard después de registro | 2 segundos |
| Dashboard periódico | Si rechazó, cada 7 días | 5 segundos |
| Después de logro | Al desbloquear achievement (max 1 vez/semana) | Inmediato |
| Al perder racha | Cuando pierde una racha de 3+ días | Inmediato |

### 1.3 Nuevo Hook: `useNotificationPrompts`

```text
src/hooks/useNotificationPrompts.ts (NUEVO)
```

**Funcionalidades:**
- Tracking de cuántas veces se ha mostrado el prompt
- Cooldown entre prompts (7 días mínimo)
- Detección de momentos óptimos
- Límite de prompts por mes (máximo 2)

---

## Parte 2: Sistema de Animaciones Mejorado

### 2.1 Nuevos Keyframes en Tailwind

```text
tailwind.config.ts (EDITAR)
```

Agregar animaciones:
- `shimmer`: Efecto de brillo que pasa por elementos
- `heartbeat`: Pulso tipo latido para elementos importantes
- `shake`: Sacudida suave para errores o alertas
- `confetti-fall`: Caída de confetti para celebraciones
- `slide-in-bounce`: Entrada con rebote
- `scale-bounce`: Escala con rebote
- `gradient-shift`: Movimiento de gradientes

### 2.2 Componente: `AnimatedNumber`

```text
src/components/ui/animated-number.tsx (NUEVO)
```

Contador animado que se usa para:
- Calorías consumidas
- Puntos XP
- Días de racha
- Cualquier número que cambie

### 2.3 Componente: `AnimatedProgress`

```text
src/components/ui/animated-progress.tsx (NUEVO)
```

Barra de progreso con:
- Animación de llenado suave
- Pulso al completarse
- Partículas al llegar a milestones
- Colores que cambian según porcentaje

### 2.4 Mejoras a Componentes Existentes

#### Dashboard (`src/pages/Dashboard.tsx`)
- Animación de entrada escalonada para tarjetas de comidas
- Efecto shimmer en elementos cargando
- Microanimación al hover en botones

#### MealModulesSection (`src/components/diary/MealModulesSection.tsx`)
- Entrada con stagger animation
- Efecto de pulsación al completar comida
- Iconos que rebotan al interactuar

#### WaterTrackerWidget (`src/components/WaterTrackerWidget.tsx`)
- Animación de olas en el agua
- Splash al agregar vaso
- Celebración al completar meta

#### WeightTrackerWidget (`src/components/WeightTrackerWidget.tsx`)
- Animación del número de peso con AnimatedNumber
- Flecha animada de tendencia
- Confetti al alcanzar meta

#### MobileBottomNav (`src/components/MobileBottomNav.tsx`)
- Efecto de press 3D en tabs
- Indicador activo animado
- Micro-bounce al seleccionar

### 2.5 Nuevo Componente: `AnimatedIcon`

```text
src/components/ui/animated-icon.tsx (NUEVO)
```

Wrapper para iconos con animaciones predefinidas:
- `bounce`: Rebote al aparecer
- `spin`: Rotación continua (para loading)
- `pulse`: Pulso suave
- `wiggle`: Sacudida juguetona

---

## Parte 3: Animaciones de Celebración Mejoradas

### 3.1 Mejora a `XPGainAnimation`
- Trayectoria curva (no solo lineal)
- Partículas que siguen el número
- Sonido sutil opcional

### 3.2 Nuevo: `LevelUpAnimation`

```text
src/components/celebrations/LevelUpAnimation.tsx (NUEVO)
```

Overlay fullscreen cuando subes de nivel:
- Explosión de partículas doradas
- Nuevo nivel con efecto 3D
- Mascota celebrando
- Vibración haptic

### 3.3 Nuevo: `DailyGoalAnimation`

```text
src/components/celebrations/DailyGoalAnimation.tsx (NUEVO)
```

Al completar 100% del día:
- Confetti con colores de la marca
- "¡Día Perfecto!" con efecto neón
- Contador de días perfectos

---

## Archivos a Crear/Modificar

### Archivos Nuevos (6)
| Archivo | Propósito |
|---------|-----------|
| `src/components/NotificationPermissionPrompt.tsx` | Modal para pedir permisos |
| `src/hooks/useNotificationPrompts.ts` | Lógica de timing de prompts |
| `src/components/ui/animated-number.tsx` | Números con animación |
| `src/components/ui/animated-progress.tsx` | Barras de progreso animadas |
| `src/components/ui/animated-icon.tsx` | Iconos con animaciones |
| `src/components/celebrations/LevelUpAnimation.tsx` | Celebración de subida de nivel |

### Archivos a Editar (7)
| Archivo | Cambios |
|---------|---------|
| `tailwind.config.ts` | Nuevos keyframes y animaciones |
| `src/pages/Dashboard.tsx` | Integrar prompts de notificación y animaciones |
| `src/components/diary/MealModulesSection.tsx` | Animaciones de entrada |
| `src/components/WaterTrackerWidget.tsx` | Efecto de olas y splash |
| `src/components/MobileBottomNav.tsx` | Animaciones de tabs |
| `src/components/celebrations/XPGainAnimation.tsx` | Trayectoria mejorada |
| `src/hooks/useNotifications.ts` | Helpers para verificar estado |

---

## Flujo de Notificaciones

```text
┌─────────────────────────────────────────────────────────────┐
│                    Usuario Nuevo                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Completa Onboarding                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ (2 segundos después)
┌─────────────────────────────────────────────────────────────┐
│         Muestra NotificationPermissionPrompt                 │
│  "¡No te pierdas ninguna comida! Activa notificaciones"     │
└─────────────────────────────────────────────────────────────┘
                        │           │
                  [Activar]    [Ahora no]
                        │           │
                        ▼           ▼
              ┌──────────────┐  ┌──────────────────────────────┐
              │ Permisos     │  │ Guardar:                     │
              │ Concedidos ✓ │  │ - notification_prompt_count  │
              │              │  │ - notification_prompt_last   │
              │ Programar    │  │                              │
              │ recordatorios│  │ Mostrar de nuevo en 7 días   │
              └──────────────┘  └──────────────────────────────┘
```

---

## Sección Técnica

### Estructura del Hook de Prompts

```typescript
// useNotificationPrompts.ts
interface NotificationPromptState {
  hasBeenPrompted: boolean;
  promptCount: number;
  lastPromptDate: string | null;
  canShowPrompt: boolean;
}

const PROMPT_COOLDOWN_DAYS = 7;
const MAX_PROMPTS_PER_MONTH = 2;

export const useNotificationPrompts = () => {
  // Verifica si es momento de mostrar prompt
  const shouldShowPrompt = (trigger: 'post_onboarding' | 'periodic' | 'achievement' | 'streak_lost'): boolean;
  
  // Marca que se mostró el prompt
  const markPromptShown = (): void;
  
  // Verifica si el usuario está en cooldown
  const isInCooldown = (): boolean;
  
  return { shouldShowPrompt, markPromptShown, isInCooldown };
};
```

### Nuevos Keyframes de Tailwind

```typescript
keyframes: {
  "shimmer": {
    "0%": { backgroundPosition: "-200% 0" },
    "100%": { backgroundPosition: "200% 0" }
  },
  "heartbeat": {
    "0%, 100%": { transform: "scale(1)" },
    "14%": { transform: "scale(1.1)" },
    "28%": { transform: "scale(1)" },
    "42%": { transform: "scale(1.1)" },
    "70%": { transform: "scale(1)" }
  },
  "slide-in-bounce": {
    "0%": { transform: "translateY(20px)", opacity: "0" },
    "50%": { transform: "translateY(-5px)", opacity: "1" },
    "100%": { transform: "translateY(0)" }
  },
  "scale-bounce": {
    "0%": { transform: "scale(0.9)", opacity: "0" },
    "50%": { transform: "scale(1.05)" },
    "100%": { transform: "scale(1)", opacity: "1" }
  }
}
```

### Integración en Dashboard

```typescript
// En Dashboard.tsx, después de checkAuth():
useEffect(() => {
  const checkNotificationPrompt = async () => {
    if (!isNative || permissionGranted) return;
    
    const isNewUser = /* verificar si es nuevo */;
    const { shouldShowPrompt } = useNotificationPrompts();
    
    if (isNewUser && shouldShowPrompt('post_onboarding')) {
      setTimeout(() => setShowNotificationPrompt(true), 2000);
    } else if (shouldShowPrompt('periodic')) {
      setTimeout(() => setShowNotificationPrompt(true), 5000);
    }
  };
  
  checkNotificationPrompt();
}, [isNative, permissionGranted, userId]);
```

---

## Resultado Esperado

### Experiencia Visual Mejorada
- Transiciones fluidas entre estados
- Feedback inmediato en cada interacción
- Celebraciones que motivan al usuario
- UI que se siente viva y responsive

### Mejor Adopción de Notificaciones
- Prompt en momento óptimo (post-onboarding)
- Re-prompts no invasivos (7 días de cooldown)
- Contexto claro del valor de las notificaciones
- Límite mensual para no molestar

