
# Plan: Pantalla de Compromiso Post-Autenticación

## Resumen
Crear una pantalla de compromiso psicológico que aparece después del inicio de sesión y antes del paywall. El usuario debe mantener presionado un botón para confirmar su compromiso, lo cual genera engagement emocional y aumenta la tasa de conversión.

## Flujo de Usuario

```text
[Onboarding Steps] 
       |
       v
[Auth Step - Login/Signup]
       |
       v
[NEW: Commitment Screen]  <-- Mantener presionado 1.5s
       |
       v
[Post-Register Paywall]
       |
       v
[Dashboard]
```

## Archivos a Crear/Modificar

### 1. Crear: `src/components/onboarding/CommitmentScreen.tsx`

Nuevo componente que implementa:

**Estructura Visual:**
- Fondo con gradiente premium (similar a WelcomePlusScreen)
- Mascota animada (mascot-strong.png)
- Mensaje personalizado: "{Nombre}, te comprometes a lograr tu meta?"
- Botón grande con efecto de long-press

**Long Press Button:**
- Progreso circular SVG que se llena en 1.5-2 segundos
- Efecto de escala (1.0 -> 1.05) mientras se presiona
- Glow animado alrededor del botón
- Haptic feedback suave cada 0.3s mientras se llena

**Al Completar:**
- Haptic fuerte de exito
- Checkmark grande con animacion de escala
- Explosion de confetti
- Texto: "Creando tu plan personalizado con IA..."
- Loader animado 1-2 segundos
- Navegacion automatica al paywall

### 2. Modificar: `src/pages/PreOnboarding.tsx`

Cambios en `handleAuthSuccess`:
- En lugar de navegar directamente a `/post-register-paywall`
- Navegar a `/commitment` para nuevos usuarios

### 3. Modificar: `src/components/AnimatedRoutes.tsx`

Agregar nueva ruta:
```typescript
<Route path="/commitment" element={<PageTransition><CommitmentScreen /></PageTransition>} />
```

## Detalles Tecnicos

### Componente CommitmentScreen

```text
Estructura de Props:
- userName: string (del localStorage o auth)
- userGoal: string (del localStorage)

Estados internos:
- progress: number (0-100)
- isHolding: boolean
- isCompleted: boolean
- showLoader: boolean
```

### Logica del Long Press

```text
onTouchStart / onMouseDown:
  1. isHolding = true
  2. Iniciar intervalo cada 50ms:
     - progress += (100 / 30) // 1.5s total
     - Si progress >= cada 30%, lightImpact()
     - Si progress >= 100, completar

onTouchEnd / onMouseUp:
  1. Si no completado, resetear progress a 0
  2. isHolding = false
```

### Animaciones Framer Motion

**Mascota:**
```text
animate: { y: [0, -10, 0] }
transition: { duration: 2, repeat: Infinity }
```

**Boton durante press:**
```text
animate: { 
  scale: isHolding ? 1.05 : 1,
  boxShadow: isHolding ? "0 0 30px rgba(163,230,53,0.5)" : "none"
}
```

**Circulo de progreso (SVG):**
```text
- Circulo de fondo (muted)
- Circulo de progreso con strokeDashoffset animado
- Color: gradiente lime/cyan
```

**Checkmark al completar:**
```text
initial: { scale: 0, rotate: -180 }
animate: { scale: 1, rotate: 0 }
transition: { type: "spring", stiffness: 300 }
```

### Haptic Feedback Pattern

```text
Durante el hold (cada 300ms):
  - lightImpact()

Al 50%:
  - mediumImpact()

Al completar:
  - successNotification()
  - celebrationPattern()
```

### Integracion con Sistema Existente

- Usar `useHaptics` para feedback tactil
- Usar `canvas-confetti` para la celebracion
- Usar `useLanguage` para textos en ES/EN
- Usar `usePreOnboardingState` para obtener el nombre y meta del usuario

## Textos (ES/EN)

```text
ES:
  title: "{name}, te comprometes a lograr tu meta?"
  button: "Si, me comprometo"
  loading: "Creando tu plan personalizado con IA..."

EN:
  title: "{name}, do you commit to reaching your goal?"
  button: "Yes, I commit"
  loading: "Creating your personalized AI plan..."
```

## Consideraciones de UX

1. **Prevencion de abandono**: El boton de "saltar" no existe, pero el boton de atras del dispositivo permite volver

2. **Feedback constante**: El usuario siempre sabe que esta pasando gracias a:
   - Progreso visual del circulo
   - Vibracion periodica
   - Efecto de glow

3. **Momento de dopamina**: La explosion de confetti y checkmark crea un micro-momento de celebracion que predispone positivamente al usuario antes del paywall

4. **Compromiso psicologico**: El acto de mantener presionado crea una sensacion de inversion y compromiso que aumenta la probabilidad de conversion

## Orden de Implementacion

1. Crear `CommitmentScreen.tsx` con toda la logica
2. Agregar ruta en `AnimatedRoutes.tsx`
3. Modificar `handleAuthSuccess` en `PreOnboarding.tsx`
4. Probar el flujo completo en dispositivo movil
