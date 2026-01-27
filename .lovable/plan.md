
## Plan: Modernización de la Página de Progreso con Elementos 3D y Métricas Visuales

### Visión General
Transformar la página de Progreso en una experiencia visualmente impactante, intuitiva y fácil de usar, aplicando el mismo sistema de diseño 3D implementado en el Dashboard. Se simplificará la navegación, se añadirán métricas con efectos visuales modernos y se mejorará la jerarquía visual.

---

## 1. Rediseño del Header y Navegación de Tabs

### Problema Actual
- Los tabs son pequeños y poco visibles
- No hay feedback visual claro del tab activo
- El header es básico sin personalidad

### Solución
- Header con gradiente hero y estadísticas resumidas
- Tabs 3D con efecto de elevación en el activo
- Iconos más grandes con `Icon3D`

```text
╭─────────────────────────────────────────╮
│  📈  Tu Progreso                        │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  🔥 14 días  |  ⭐ 2,450 pts  |  🏆 Lv5 │
╰─────────────────────────────────────────╯

┌─────────────────────────────────────────┐
│  [Nutrición]   Peso   Logros   Stats    │ ← Tab 3D elevado
└─────────────────────────────────────────┘
```

---

## 2. Nuevo Componente: `ProgressHeader3D`

### Descripción
Un header compacto que muestra las estadísticas principales del usuario en cards 3D pequeñas.

### Contenido
- Racha actual con animación de fuego
- Puntos totales con efecto de brillo
- Nivel actual con barra de progreso hacia el siguiente

```typescript
// src/components/progress/ProgressHeader3D.tsx
// Header con 3 métricas principales en cards 3D flotantes
// - Streak con icono animado
// - Points con contador animado
// - Level con mini progress bar
```

---

## 3. Tab de Nutrición Mejorado

### Cambios en `NutritionProgressCharts.tsx`
- Aplicar `Card3D` a todas las secciones
- Selector de días con efecto 3D más pronunciado
- Gráficos con tooltips mejorados y animaciones

### Nuevas Métricas Visuales
- **Círculo de calorías promedio** - Grande y central
- **Barras de macros** - Con gradientes y animación de llenado
- **Indicador de consistencia** - Días activos de la semana

```text
╭──────────────────────────────────────╮
│       ╭────────────╮                 │
│       │   1,850    │  ← Promedio     │
│       │  kcal/día  │     semanal     │
│       ╰────────────╯                 │
│                                      │
│  [Lun] [Mar] [Mié] [Jue] [Vie]...   │ ← Días 3D
╰──────────────────────────────────────╯
```

---

## 4. Tab de Peso con Cards 3D

### Cambios en `WeightMilestones.tsx`
- Convertir a Card3D con efecto flotante
- Milestones como "badges" 3D coleccionables
- Animación de confetti más sutil

### Nuevo Widget: `CurrentWeightCard3D`
- Card central grande con peso actual
- Tendencia con flecha animada (subiendo/bajando)
- Mini gráfico sparkline de los últimos 7 días

```text
╭──────────────────────────────────────╮
│           ╭─────────────╮            │
│           │   75.4 kg   │ ← Grande   │
│           │    ↓ -0.3   │ ← Trend    │
│           │  ▁▂▃▂▁▂▁    │ ← Sparkline│
│           ╰─────────────╯            │
╰──────────────────────────────────────╯
```

---

## 5. Tab de Logros Gamificado

### Cambios en `ProgressAchievementsTab.tsx`
- Cards de logros con efecto 3D y brillo dorado para desbloqueados
- Animación de "flip" al desbloquear
- Barra de progreso hacia el próximo logro
- Categorías con iconos 3D

### Nuevo Diseño de Achievement Card

```text
╭──────────────────────────────────────╮
│  🏆 [═══════════════───] 8/12        │ ← Progress bar
╰──────────────────────────────────────╯

╭────────────────╮  ╭────────────────╮
│   ✅ 🔥        │  │   🔒 💪        │
│  Primera       │  │  Semana        │
│  Semana        │  │  Perfecta      │
│  +50 pts       │  │  +100 pts      │
╰────────────────╯  ╰────────────────╯
      ↑ 3D elevado       ↑ Opaco/bloqueado
```

---

## 6. Tab de Estadísticas con Métricas 3D

### Cambios en `ProgressStatsTab.tsx`
- `StreakCounter` con efecto glassmorphism
- Stats grid con `Card3D` e iconos 3D
- Animaciones de entrada escalonadas
- Números grandes con animación de conteo

### Nuevo Layout de Stats

```text
╭──────────────────────────────────────╮
│  🔥  14 días                    💎   │ ← Streak 3D
│      ▓▓▓▓▓▓▓▓░░  Récord: 21         │
╰──────────────────────────────────────╯

╭──────────╮  ╭──────────╮
│  ⭐      │  │  🎯      │
│  2,450   │  │  Lv 5    │
│  puntos  │  │  nivel   │
╰──────────╯  ╰──────────╯
     ↑ Cards 3D flotantes
```

---

## 7. Componente: `Stat3DCard`

### Descripción
Card individual para estadísticas con efecto 3D, número grande animado y label descriptivo.

### Propiedades
- `icon`: Icono Lucide
- `value`: Número o string
- `label`: Descripción corta
- `color`: Color del tema
- `animate`: Si animar el número al aparecer

```typescript
// src/components/progress/Stat3DCard.tsx
<Stat3DCard
  icon={Star}
  value={2450}
  label="Puntos totales"
  color="amber"
  animate
/>
```

---

## 8. Componente: `AchievementBadge3D`

### Descripción
Badge individual de logro con efectos 3D, estados bloqueado/desbloqueado y animación de brillo.

### Estados Visuales
- **Desbloqueado**: Borde dorado, sombra glow, icono visible
- **Bloqueado**: Grayscale, icono de candado, opacidad reducida
- **Nuevo**: Animación de pulso/brillo

---

## 9. Mejoras en Body Measurement Charts

### Cambios en `BodyMeasurementCharts.tsx`
- Gráficos con área gradiente bajo la línea
- Puntos de datos más grandes y con tooltip mejorado
- Card3D como contenedor
- Indicadores de cambio (+/- desde inicio)

---

## 10. Animaciones y Transiciones

### Nuevas Animaciones
- `count-up`: Número que cuenta desde 0
- `reveal`: Elementos que aparecen de abajo hacia arriba
- `glow`: Efecto de brillo para elementos destacados
- `float-subtle`: Flotación muy sutil para cards importantes

### Transiciones entre Tabs
- Fade + slide horizontal al cambiar tabs
- Stagger en elementos hijos

---

## Archivos a Crear

| Archivo | Descripción |
|---------|-------------|
| `src/components/progress/ProgressHeader3D.tsx` | Header con stats resumidas |
| `src/components/progress/Stat3DCard.tsx` | Card de estadística individual |
| `src/components/progress/AchievementBadge3D.tsx` | Badge de logro 3D |
| `src/components/progress/WeightCard3D.tsx` | Card de peso actual |

---

## Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/pages/Progress.tsx` | Nuevo layout con header 3D y tabs mejorados |
| `src/components/progress/ProgressStatsTab.tsx` | Usar Stat3DCard y mejor layout |
| `src/components/progress/ProgressAchievementsTab.tsx` | Usar AchievementBadge3D y grid |
| `src/components/NutritionProgressCharts.tsx` | Aplicar Card3D y mejorar selector de días |
| `src/components/BodyMeasurementCharts.tsx` | Card3D y gráficos mejorados |
| `src/components/WeightMilestones.tsx` | Convertir a Card3D con milestones 3D |

---

## Principios de Diseño

1. **Jerarquía clara**: Número grande primero, label después
2. **Feedback visual**: Todo elemento interactivo responde al toque
3. **Consistencia 3D**: Misma dirección de sombras que el Dashboard
4. **Gamificación sutil**: Colores, badges y animaciones motivacionales
5. **Mobile-first**: Touch targets generosos (48px+)

---

## Resultado Visual Esperado

### Antes
- Tabs planos y pequeños
- Cards sin profundidad
- Gráficos básicos
- Logros en lista simple

### Después
- Header con resumen visual impactante
- Tabs con efecto 3D activo
- Cards flotantes con sombras
- Logros como badges coleccionables
- Métricas con números grandes y animaciones
- Gráficos con gradientes y tooltips elegantes
