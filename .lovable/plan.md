
# Plan: Estabilizar Layout Fijo de Header y Footer en iOS

## Resumen Ejecutivo

El layout actual tiene problemas de estabilidad en iOS porque:
- El header no tiene altura fija estricta
- El footer usa animaciones que pueden causar "saltos"
- El contenido no está correctamente aislado del header/footer

Este plan reestructurará el layout para que header y footer sean elementos 100% fijos, con solo el contenido central scrolleable.

---

## Arquitectura Propuesta

```text
┌─────────────────────────────────────────┐
│           HEADER (h-[56px] FIJO)        │
│    - Altura absoluta, nunca cambia      │
│    - No depende del contenido           │
├─────────────────────────────────────────┤
│                                         │
│           CONTENIDO (flex-1)            │
│    - Único elemento scrolleable         │
│    - overflow-y-auto                    │
│                                         │
├─────────────────────────────────────────┤
│           FOOTER (h-[76px] FIJO)        │
│    - Altura absoluta, nunca cambia      │
│    - NO se oculta con teclado           │
│    - position: fixed, bottom: 0         │
└─────────────────────────────────────────┘
```

---

## Cambios Técnicos

### 1. DashboardLayout (AnimatedRoutes.tsx)

**Problema**: El layout actual usa padding dinámico para safe areas y no tiene estructura rígida.

**Solución**:
- Cambiar a estructura flexbox vertical estricta con `h-[100dvh]`
- Usar `flex-shrink-0` en header y footer para prevenir compresión
- El contenido central usa `flex-1 min-h-0 overflow-y-auto`

```tsx
// Antes
<div className="flex h-[100dvh] w-full" style={{ paddingTop: 'env(safe-area-inset-top)' }}>

// Después  
<div className="fixed inset-0 flex flex-col bg-background">
  {/* Safe area top - fijo */}
  <div className="flex-shrink-0 bg-background" style={{ height: 'env(safe-area-inset-top, 0px)' }} />
  
  {/* Contenido principal - scrolleable */}
  <main className="flex-1 min-h-0 overflow-y-auto">
    <Outlet />
  </main>
  
  {/* Footer se posiciona por separado */}
</div>
```

### 2. MobileBottomNav

**Problema**: Usa `AnimatePresence` para ocultarse con teclado, causando remontaje y "saltos".

**Solución**:
- Mantener el nav siempre montado
- Usar CSS `visibility` y `transform` en lugar de desmontar/remontar
- Altura fija de 76px + safe-area
- Usar `position: fixed` con `translate-y` para ocultar en lugar de `AnimatePresence`
- Quitar la lógica de detección de teclado que causa inestabilidad

```tsx
// Antes (inestable)
<AnimatePresence>
  {!isKeyboardOpen && (
    <motion.nav initial={{ y: 100 }}>
      ...
    </motion.nav>
  )}
</AnimatePresence>

// Después (estable)
<nav 
  className="fixed bottom-0 left-0 right-0 h-[76px] z-[9999]"
  style={{ 
    paddingBottom: 'env(safe-area-inset-bottom)',
    transform: 'translateZ(0)',
  }}
>
  ...
</nav>
```

### 3. DashboardHeader

**Problema**: Usa `min-h-[56px]` que permite crecimiento y animaciones de motion.

**Solución**:
- Cambiar a `h-14` (56px) altura fija absoluta
- Quitar `min-h-*` 
- Simplificar animaciones (solo opacity, sin transforms)
- Truncar contenido que exceda

```tsx
// Antes
<motion.div className="mb-3 min-h-[56px]">

// Después
<div className="h-14 flex-shrink-0 px-4 flex items-center justify-between">
```

### 4. Dashboard.tsx y otras páginas

**Problema**: Usan `min-h-full` y `min-h-screen` que causan recálculos.

**Solución**:
- Cambiar a `h-full` donde corresponda
- Asegurar que el contenido respete los límites del contenedor padre
- Agregar `overflow-hidden` al contenedor padre

```tsx
// Antes
<div className="min-h-full bg-gradient-to-b ...">

// Después
<div className="h-full bg-gradient-to-b ... overflow-x-hidden">
```

### 5. index.css - Estilos Base

**Agregar reglas CSS para estabilidad**:

```css
/* Ignorar teclado para safe areas */
html {
  -webkit-touch-callout: none;
}

/* Footer siempre fijo */
.fixed-footer {
  position: fixed !important;
  bottom: 0 !important;
  transform: translateZ(0);
  will-change: auto;
}

/* Contenedor de layout principal */
.app-shell {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-content {
  flex: 1 1 0%;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
}
```

---

## Archivos a Modificar

1. **src/components/AnimatedRoutes.tsx** - Reestructurar DashboardLayout
2. **src/components/MobileBottomNav.tsx** - Simplificar a elemento fijo sin AnimatePresence
3. **src/components/DashboardHeader.tsx** - Altura fija, sin animaciones de layout
4. **src/pages/Dashboard.tsx** - Adaptar contenedor principal
5. **src/index.css** - Agregar clases de utilidad para layout fijo
6. **capacitor.config.ts** - Confirmar `Keyboard: { resize: 'none' }`

---

## Comportamiento Esperado

| Escenario | Header | Footer | Contenido |
|-----------|--------|--------|-----------|
| Normal | Fijo 56px | Fijo 76px | Scrolleable |
| Teclado abierto | Sin cambio | Sin cambio | Scrolleable |
| Animación ruta | Sin cambio | Sin cambio | Fade 80ms |
| Contenido largo | Sin cambio | Sin cambio | Scroll interno |
| Safe areas iOS | Respetadas | Respetadas | - |

---

## Resultado Final

- Header de 56px que nunca cambia de tamaño
- Footer de 76px + safe-area que nunca se levanta ni flota
- Solo el contenido central hace scroll
- Estabilidad 100% en iOS sin importar teclado o navegación
- Rendimiento optimizado sin re-renders innecesarios
