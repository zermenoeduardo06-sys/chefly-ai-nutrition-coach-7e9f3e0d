

# Plan: Navegación Inferior más Fluida

## Problema Actual

1. **Sin transiciones entre páginas del dashboard**: Las rutas anidadas (Progress, Wellness, etc.) no usan `PageTransition`, causando cambios abruptos de contenido
2. **Animaciones de tap pesadas**: El `whileTap` actual tiene `scale: 0.85` y `y: 2` con spring stiffness 500, que puede sentirse "pegajoso"
3. **Transición de página lenta**: Aunque es 100ms, hay un breve momento de "nada" visible

## Solución Propuesta

### 1. Simplificar animaciones del botón (MobileBottomNav.tsx)

**Antes:**
```typescript
whileTap={{ scale: 0.85, y: 2 }}
transition={{ type: "spring", stiffness: 500, damping: 25 }}
```

**Después:**
```typescript
whileTap={{ scale: 0.92 }}
transition={{ type: "tween", duration: 0.1 }}
```

- Escala menos agresiva (0.92 vs 0.85)
- Sin desplazamiento en Y (elimina sensación de hundimiento)
- Transición lineal más rápida en lugar de spring

### 2. Acelerar transición del indicador activo

**Antes:**
```typescript
transition={{ type: "spring", stiffness: 500, damping: 30 }}
```

**Después:**
```typescript
transition={{ type: "spring", stiffness: 700, damping: 35 }}
```

### 3. Agregar transiciones suaves al Outlet del Dashboard

Modificar `DashboardLayout` para envolver el `<Outlet />` con una animación mínima usando `AnimatePresence`:

```typescript
import { AnimatePresence, motion } from 'framer-motion';

// En el return:
<AnimatePresence mode="wait" initial={false}>
  <motion.div
    key={location.pathname}
    initial={{ opacity: 0.5 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0.5 }}
    transition={{ duration: 0.08 }}
  >
    <Outlet />
  </motion.div>
</AnimatePresence>
```

- `mode="wait"` evita superposiciones
- `initial={false}` evita animación en primer montaje
- 80ms de duración, casi imperceptible pero suaviza el cambio

### 4. Optimizar el botón central elevado

Reducir la complejidad de la animación del botón central (Progreso):

**Antes:** Animación de boxShadow infinita con 3 keyframes
**Después:** Animación simplificada solo cuando está activo

```typescript
whileTap={{ scale: 0.95 }} // más sutil que y: 3
```

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/MobileBottomNav.tsx` | Simplificar animaciones de tap y transiciones |
| `src/components/AnimatedRoutes.tsx` | Agregar AnimatePresence al Outlet del DashboardLayout |

## Resultado Esperado

- Navegación se siente más "instantánea" y ligera
- Transiciones suaves sin sensación de lag
- Botones responden de inmediato sin animaciones pesadas
- El contenido cambia con un fade ultra-rápido en vez de un corte abrupto

