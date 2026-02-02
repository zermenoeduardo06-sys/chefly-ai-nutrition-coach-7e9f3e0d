

# Plan: Corrección de Problemas de UX Detectados

## Resumen de Problemas

1. **Bulk Add para Premium** - Los usuarios premium no pueden agregar múltiples comidas eficientemente
2. **Footer inestable** - A veces se mueve o cambia de posición
3. **Header con tamaño variable** - Aumenta inesperadamente en algunas situaciones
4. **Chef IA desordenado** - Problemas de layout y espaciado

---

## 1. Bulk Add para Usuarios Premium

### Problema Actual
`AddFood.tsx` ya soporta selección múltiple, pero el flujo no es óptimo para agregar muchos alimentos rápidamente.

### Solución Propuesta

**Mejorar la experiencia de selección múltiple:**

- Agregar un contador flotante más visible con las calorías totales seleccionadas
- Mostrar un mini-resumen de los alimentos seleccionados expandible
- Botón "Agregar todos" más prominente con feedback inmediato

**Cambios en `AddFood.tsx`:**

```text
1. Agregar un "selection bar" sticky debajo del header que muestra:
   - Número de items seleccionados
   - Calorías totales
   - Botón para ver/editar selección
   - Botón "X" para limpiar selección

2. Mejorar feedback visual:
   - Animación más obvia al seleccionar (checkmark con bounce)
   - Haptic feedback al seleccionar cada item

3. Agregar "quick add" con cantidad predefinida (100g, porción, etc.)
```

---

## 2. Footer Inestable (MobileBottomNav)

### Problema Actual
El footer puede moverse debido a:
- El teclado virtual que empuja el footer hacia arriba
- Animaciones que afectan el layout
- Transiciones de página que no mantienen el footer fijo

### Solución Propuesta

**Modificar `MobileBottomNav.tsx`:**

```typescript
// Agregar protección contra el teclado virtual
const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

useEffect(() => {
  const handleResize = () => {
    // En iOS, cuando el teclado aparece, visualViewport.height < window.innerHeight
    const isKeyboard = window.visualViewport 
      ? window.visualViewport.height < window.innerHeight * 0.8
      : false;
    setIsKeyboardOpen(isKeyboard);
  };

  window.visualViewport?.addEventListener('resize', handleResize);
  return () => window.visualViewport?.removeEventListener('resize', handleResize);
}, []);

// Ocultar nav cuando el teclado está abierto
if (isKeyboardOpen) return null;
```

**Reforzar estilos CSS:**

```typescript
style={{
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  paddingBottom: 'env(safe-area-inset-bottom, 0px)',
  transform: 'translate3d(0, 0, 0)', // Hardware acceleration
  willChange: 'transform',
  zIndex: 9999,
}}
```

---

## 3. Header con Tamaño Variable (DashboardHeader)

### Problema Actual
El header puede cambiar de tamaño por:
- Contenido dinámico (nombre largo, badges de streak/level)
- Animaciones de entrada que afectan el layout

### Solución Propuesta

**Modificar `DashboardHeader.tsx`:**

```typescript
// 1. Establecer altura fija mínima
className="mb-6 min-h-[72px]"

// 2. Limitar largo del nombre con truncate
<span className="text-primary max-w-[150px] truncate inline-block align-bottom">
  {name}
</span>

// 3. Prevenir CLS (Cumulative Layout Shift) con animaciones
// Cambiar initial={{ opacity: 0, y: -10 }} a solo opacity
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
// Eliminar el y: -10 que causa el "salto"

// 4. Usar flex-shrink-0 en los badges para evitar colapso
className="flex items-center gap-2 flex-shrink-0"
```

---

## 4. Chef IA Desordenado

### Problema Actual
La pantalla de ChefIA tiene problemas de:
- Espaciado inconsistente entre mensajes y elementos
- El área de input puede quedar cubierta o mal posicionada
- La transición entre WelcomeScreen y mensajes puede ser abrupta

### Solución Propuesta

**Modificar `ChefIA.tsx`:**

```typescript
// 1. Mejorar estructura del layout principal
<div className="h-[100dvh] bg-background flex flex-col overflow-hidden">
  {/* Header - altura fija */}
  <header className="flex-shrink-0 h-16 border-b ...">
  
  {/* Mensajes - área scrollable con flex-1 y min-h-0 */}
  <div className="flex-1 min-h-0 overflow-y-auto">
  
  {/* Input - altura fija con flex-shrink-0 */}
  <div className="flex-shrink-0 border-t ...">
```

**Corregir espaciado del WelcomeScreen:**

```typescript
// Reducir padding y centrar mejor
<div className="flex flex-col items-center justify-center px-4 py-6 min-h-full">
  
// Reducir tamaño de mascota
className="w-24 h-24 object-contain" // antes: w-32 h-32

// Mejorar espaciado de sugerencias
className="grid grid-cols-1 gap-2 w-full max-w-sm mt-4"
```

**Corregir área de input:**

```typescript
// Asegurar que el input siempre sea visible
<motion.div 
  className="flex-shrink-0 border-t bg-card/95 backdrop-blur-xl"
  style={{ 
    paddingBottom: 'max(env(safe-area-inset-bottom), 12px)',
    // Agregar margen para el nav cuando está visible
    marginBottom: 'calc(76px + env(safe-area-inset-bottom, 0px))'
  }}
>
```

**Nota importante:** ChefIA usa su propio layout fullscreen (`h-[100dvh]`), por lo que no debe mostrar el bottom nav. Verificar que la ruta esté fuera del DashboardLayout.

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/AddFood.tsx` | Mejorar UX de selección múltiple con barra de resumen |
| `src/components/MobileBottomNav.tsx` | Agregar detección de teclado y reforzar posición fija |
| `src/components/DashboardHeader.tsx` | Altura fija, truncar nombre, eliminar animación Y |
| `src/pages/ChefIA.tsx` | Corregir layout flexbox, espaciado de WelcomeScreen |

---

## Orden de Implementación

1. **MobileBottomNav** - Crítico para estabilidad general
2. **DashboardHeader** - Solución rápida, alto impacto visual
3. **ChefIA** - Corregir problemas de layout
4. **AddFood** - Mejora de UX premium

---

## Consideraciones Técnicas

### Para el Footer:
- Usar `position: fixed` con `bottom: 0`
- Hardware acceleration con `transform: translate3d(0,0,0)`
- Ocultar cuando el teclado virtual está abierto
- z-index: 9999 para asegurar que esté por encima de todo

### Para el Header:
- Altura mínima fija para evitar CLS
- Truncar texto largo con `truncate`
- Animaciones solo de opacity, no de posición

### Para ChefIA:
- Layout flexbox correcto: `flex-1 min-h-0` para scroll area
- `flex-shrink-0` para header e input
- Usar `overflow-hidden` en el contenedor principal

