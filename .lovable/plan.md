
# Plan: Transiciones Automáticas Tipo Duolingo

## Objetivo
Lograr que las transiciones entre páginas del dashboard sean **instantáneas** (0ms de espera visible) como en Duolingo, donde los datos ya están cargados antes de que el usuario toque la pantalla.

---

## Problema Actual

Aunque ya tienes una base SPA sólida, las páginas siguen mostrando spinners porque:

| Componente | Problema |
|------------|----------|
| `useWellness.ts` | Usa `useState/useEffect` en lugar de React Query |
| `Progress.tsx` | Hace queries dentro de `useEffect` sin cache |
| `Wellness.tsx` | Depende de `isLoading` de useWellness bloqueando todo |
| `Recipes.tsx` | Carga recetas desde cero cada vez |
| Prefetch actual | Solo guarda en cache, pero las páginas no lo usan |

---

## Solución: "Datos Antes del Clic"

### Estrategia de 3 Capas:

```
┌─────────────────────────────────────────────────┐
│  Capa 1: Prefetch Automático al Montar Dashboard │
│  → Datos de Progress, Wellness, Recipes cargados │
│    en background cuando el usuario entra         │
└─────────────────────────────────────────────────┘
               ↓
┌─────────────────────────────────────────────────┐
│  Capa 2: Hooks con React Query                   │
│  → Cache compartido entre todas las páginas     │
│  → Datos disponibles instantáneamente           │
└─────────────────────────────────────────────────┘
               ↓
┌─────────────────────────────────────────────────┐
│  Capa 3: Skeleton-First Rendering               │
│  → UI se renderiza inmediatamente con skeletons │
│  → Datos rellenan los espacios sin flash        │
└─────────────────────────────────────────────────┘
```

---

## Cambios Técnicos

### 1. Migrar `useWellness` a React Query

**Archivo:** `src/hooks/useWellness.ts`

Actualmente usa `useState` + `useEffect`, lo que:
- No comparte cache entre componentes
- Recarga datos en cada navegación
- No se beneficia del prefetch

Cambio: Convertir a múltiples `useQuery` con keys específicos:
- `['wellness', 'mood', 'today', userId]`
- `['wellness', 'mood', 'weekly', userId]`
- `['wellness', 'insights', userId]`
- `['wellness', 'bodyScans', userId]`

### 2. Crear `useProgressData` con React Query

**Archivo nuevo:** `src/hooks/useProgressData.ts`

Centralizar las queries de Progress:
- `['progress', 'latestWeight', userId]`
- `['progress', 'measurements', userId]`
- `['progress', 'stats', userId]`

### 3. Migrar `loadRecipes` a React Query

**Archivo:** `src/pages/Recipes.tsx`

Cambiar el `useEffect` + `setRecipes` por:
```typescript
const { data: recipes, isLoading } = useQuery({
  queryKey: ['recipes', userId],
  queryFn: loadRecipes,
  staleTime: 10 * 60 * 1000,
});
```

### 4. Prefetch Automático en Dashboard

**Archivo:** `src/pages/Dashboard.tsx`

Al montar el Dashboard por primera vez, prefetch todas las secciones principales:

```typescript
useEffect(() => {
  if (userId) {
    // Prefetch datos de las otras tabs en background
    prefetchProgress();
    prefetchWellness();
    prefetchRecipes();
  }
}, [userId]);
```

### 5. Skeleton-First en Páginas

**Archivos:** `Progress.tsx`, `Wellness.tsx`, `Recipes.tsx`

En lugar de:
```tsx
if (isLoading) return <Loader2 />;
```

Usar:
```tsx
// Renderizar siempre la UI, solo los datos usan skeletons
<WeightCard3D userId={userId} /> // Skeleton interno
<MoodHistoryChart moods={moods ?? []} isLoading={isLoading} />
```

### 6. Optimizar Prefetch en MobileBottomNav

**Archivo:** `src/hooks/usePrefetch.ts`

Expandir el prefetch para incluir:
- Datos de Progress (measurements, stats)
- Datos de Wellness (mood logs, insights)
- Datos de Recipes (meal plan completo)
- Datos de ChefIA (historial de mensajes)

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/hooks/useWellness.ts` | Refactorizar a React Query |
| `src/hooks/usePrefetch.ts` | Expandir con más datos |
| `src/hooks/useProgressData.ts` | **NUEVO** - Hook centralizado |
| `src/pages/Dashboard.tsx` | Añadir prefetch automático |
| `src/pages/Progress.tsx` | Usar React Query + skeletons |
| `src/pages/Wellness.tsx` | Eliminar isLoading bloqueante |
| `src/pages/Recipes.tsx` | Migrar a React Query |
| `src/pages/ChefIA.tsx` | Cache de mensajes |

---

## Flujo de Datos Optimizado

```
Usuario abre app → Dashboard
         │
         ├── Carga datos del Dashboard
         │
         └── [Background] Prefetch automático:
                  ├── Progress: measurements, weight
                  ├── Wellness: mood, insights
                  ├── Recipes: meal plan
                  └── ChefIA: messages
         
Usuario toca "Progreso" 
         │
         └── Datos YA en cache → Render instantáneo (0ms)
```

---

## Resultado Esperado

| Métrica | Actual | Objetivo |
|---------|--------|----------|
| Transición Dashboard → Progress | 200-500ms | 0ms |
| Transición Dashboard → Wellness | 300-600ms | 0ms |
| Transición Dashboard → Recipes | 400-800ms | 0ms |
| Spinner visible | Frecuente | Nunca* |
| Skeleton visible | Nunca | Solo primera carga |

*Solo se muestra skeleton en la primera visita de la sesión, después todo es instantáneo.

---

## Experiencia del Usuario

**Antes:**
1. Toca "Progreso"
2. Ve spinner 0.5s
3. Ve la página

**Después:**
1. Toca "Progreso"
2. Ve la página inmediatamente (datos ya cargados)

Esto es exactamente como funciona Duolingo: cuando tocas una lección, ya sabe qué ejercicios mostrar porque los cargó mientras veías la lista.
