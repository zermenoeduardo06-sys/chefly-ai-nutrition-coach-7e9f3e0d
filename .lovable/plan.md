

# Plan: Modernización de la Página de Escanear/Agregar Comida

## Objetivo
Rediseñar la página del escáner de comida (`FoodScannerPage`) para que sea más moderna, visualmente atractiva, simple de entender, y con elementos visuales 3D que sigan el sistema de diseño existente.

---

## Resumen de Cambios

### Lo que cambiará:
- Header más limpio y moderno con estilo glassmorphism
- Tabs con estilo 3D elevado (floating tabs)
- Cámara/Upload con diseño 3D moderno y animaciones mejoradas
- Tarjeta de resultados con efecto 3D y mejor jerarquía visual
- Historial con tarjetas 3D individuales
- Estadísticas con componentes `Card3D` y `Stat3DCard`
- Búsqueda manual con estilo consistente

### Lo que permanece igual:
- Toda la lógica de negocio (análisis IA, guardado, etc.)
- La estructura de 4 tabs (Escanear, Buscar, Historial, Stats)
- Los flujos de navegación

---

## Cambios Detallados

### 1. Header Modernizado
**Archivo:** `FoodScannerPage.tsx`

Cambios:
- Aplicar glassmorphism más fuerte (`backdrop-blur-xl`)
- Agregar sombra 3D sutil al header
- Badge de "IA Avanzada" con efecto pill 3D flotante
- Animación suave de entrada

### 2. Tabs 3D Flotantes
**Archivo:** `FoodScannerPage.tsx`

Cambios:
- Reemplazar tabs planos por estilo "floating tabs" con sombras 3D
- Indicador activo con efecto elevado y sombra
- Transición suave entre tabs
- Iconos con micro-animaciones al activarse

### 3. Scanner Camera Modernizado
**Archivo:** `ScannerCamera.tsx`

Cambios:
- **Estado inicial (sin imagen):**
  - Contenedor con `Card3D` variant glass
  - Mascota con animación de flotación
  - Botones 3D con estilo `modern3d`
  - Fondo con gradiente sutil animado
  - Instrucciones más claras y grandes

- **Estado con imagen/analizando:**
  - Marco de escaneo más elegante con esquinas redondeadas 3D
  - Animación de "láser" con efecto glow más pronunciado
  - Overlay de análisis con blur y gradiente mejorado
  - Spinner 3D con sombra

### 4. Resultado del Escaneo 3D
**Archivo:** `ScanResultCard.tsx`

Cambios:
- **Hero Card (nombre + calorías):**
  - Usar `Card3D` variant="elevated"
  - Efecto de profundidad con sombras múltiples
  - Número de calorías con animación de contador
  - Badge de confianza con estilo pill 3D

- **Grid de Macros:**
  - Cada macro en un `Card3D` mini
  - Iconos con `Icon3D` 
  - Números animados
  - Hover con elevación

- **Ingredientes:**
  - Pills 3D con sombra sutil
  - Animación stagger al aparecer

- **Botones de acción:**
  - Estilo `modern3d` con efecto press
  - Gradientes más vibrantes

### 5. Búsqueda Manual Mejorada
**Archivo:** `ScannerFoodSearch.tsx`

Cambios:
- Input de búsqueda con estilo 3D (sombra inset)
- Filter tabs con estilo pill 3D
- Items de comida en `Card3D` compactas
- Botón "+" con efecto 3D circular
- Estados vacíos con ilustración mejorada

### 6. Historial 3D
**Archivo:** `ScanHistory.tsx`

Cambios:
- Cada entrada en `Card3D` con hover elevation
- Imagen con overlay sutil y borde redondeado
- Badges de meal type con estilo 3D
- Animaciones stagger más fluidas
- Botón eliminar con estilo ghost 3D

### 7. Estadísticas Modernizadas
**Archivo:** `ScannerStats.tsx`

Cambios:
- Usar `Stat3DCard` existente para las 3 métricas principales
- Gráfico semanal dentro de `Card3D`
- Barras con gradiente y sombra
- Achievement hint con `Card3D` variant="glass"

---

## Componentes Nuevos a Crear

### `ScannerUploadCard.tsx`
Nuevo componente para el estado inicial del scanner con:
- Diseño hero centrado
- Animación de mascota flotante
- Call-to-action claro con 2 opciones (cámara/galería)
- Efecto de partículas sutiles opcionales

---

## Flujo Visual Simplificado

```text
┌─────────────────────────────────────┐
│  ← Escáner IA    [IA Avanzada] 🔋  │  ← Header glass
├─────────────────────────────────────┤
│  [📷 Escanear] [🔍] [📋] [📊]      │  ← Tabs 3D flotantes
├─────────────────────────────────────┤
│                                     │
│     ┌───────────────────────┐      │
│     │    🍋 (mascota)       │      │
│     │                       │      │  ← Card3D glass
│     │  Toma una foto de     │      │
│     │  tu comida            │      │
│     │                       │      │
│     │  [📷 Cámara] [Galería]│      │  ← Botones 3D
│     └───────────────────────┘      │
│                                     │
└─────────────────────────────────────┘
```

---

## Paleta de Colores 3D

Se mantiene la paleta existente con mejoras de profundidad:
- **Primary (lime):** Para acciones principales
- **Shadows:** Múltiples capas para efecto 3D
- **Glass:** `bg-card/80 backdrop-blur-xl`
- **Borders:** Sutiles con transparencia

---

## Sección Técnica

### Archivos a Modificar:
1. `src/pages/FoodScannerPage.tsx` - Layout principal y tabs
2. `src/components/scanner/ScannerCamera.tsx` - Upload y preview
3. `src/components/scanner/ScanResultCard.tsx` - Resultados
4. `src/components/scanner/ScannerFoodSearch.tsx` - Búsqueda
5. `src/components/scanner/ScanHistory.tsx` - Historial
6. `src/components/scanner/ScannerStats.tsx` - Estadísticas

### Componentes Existentes a Reutilizar:
- `Card3D` (variant: default, elevated, glass)
- `Icon3D` (con colores: primary, amber, emerald, etc.)
- `Stat3DCard` para estadísticas
- Variante de botón `modern3d` si existe, o crear estilos similares

### Dependencias:
- `framer-motion` (ya instalado)
- `lucide-react` (ya instalado)
- No se requieren nuevas dependencias

### Animaciones Clave:
- `whileHover` y `whileTap` para interactividad 3D
- Stagger animations para listas
- Counter animations para números
- Float animation para mascota

---

## Resultado Esperado

Una experiencia de escaneo que se siente:
- **Premium:** Efectos 3D y animaciones suaves
- **Simple:** Jerarquía visual clara, menos ruido
- **Moderna:** Siguiendo tendencias de diseño 2024-2025
- **Consistente:** Usa el mismo sistema 3D del resto de la app

