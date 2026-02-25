

# Plan: Migrar hooks sin cache a React Query para carga instantanea

## Problema
Tres hooks/funciones principales todavia usan `useState` + `useEffect` con fetch manual, lo que significa que cada vez que navegas a una pantalla, se re-ejecuta la query desde cero (loading spinner). Los hooks afectados:

1. **`useWaterIntake`** - Fetch manual con `useState`, sin cache entre navegaciones
2. **`useStreakSystem`** - Fetch manual con `useState`, sin cache
3. **`WeightTrackerWidget`** - Fetch manual interno con `useState`, sin cache
4. **`loadUserStats` y `loadCompletedMeals`** en Dashboard - funciones ad-hoc con `setState`

## Solucion

### 1. Migrar `useWaterIntake` a React Query

**Archivo:** `src/hooks/useWaterIntake.ts`

- Reemplazar `useState` + `useEffect` + `fetchWaterIntake` por `useQuery`
- Query key: `['waterIntake', userId, dateStr]`
- `staleTime: 5 * 60 * 1000` (5 min)
- Las mutaciones (`addGlass`, `removeGlass`, `setDailyGoal`) usaran **optimistic updates**: actualizar cache inmediatamente con `queryClient.setQueryData`, luego hacer upsert en background
- Si el upsert falla, rollback del cache
- Exportar `useInvalidateWaterIntake` para uso externo
- Agregar prefetch en `usePrefetch.ts`

### 2. Migrar `useStreakSystem` a React Query

**Archivo:** `src/hooks/useStreakSystem.ts`

- La query principal (`loadStreakData`) se convierte en `useQuery` con key `['streak', userId]`
- `staleTime: 5 * 60 * 1000`
- La funcion `updateStreakOnCalorieLog` hara invalidation despues de actualizar
- `refreshStreak` se convierte en `invalidateQueries`
- El check de streak reset (ayer sin calorias) se ejecuta dentro del `queryFn` 
- Agregar prefetch en `usePrefetch.ts`

### 3. Migrar `WeightTrackerWidget` a React Query

**Archivo:** `src/components/WeightTrackerWidget.tsx`

- Extraer `loadWeightData` a un `useQuery` con key `['weight', 'widget', userId]`
- `staleTime: 10 * 60 * 1000` (10 min, peso no cambia frecuentemente)
- `updateWeight` usara optimistic update: `setQueryData` inmediato, luego upsert
- Invalidar `['progress']` y `['weight', 'widget']` tras update exitoso

### 4. Migrar `loadUserStats` a React Query

**Archivo:** `src/pages/Dashboard.tsx`

- Reemplazar `loadUserStats` + `setUserStats` por `useQuery` con key `['userStats', userId]`
- `staleTime: 5 * 60 * 1000`
- `updateUserStats` usara `setQueryData` para update optimista + invalidacion
- Agregar prefetch en `usePrefetch.ts`

### 5. Migrar `loadCompletedMeals` a React Query

**Archivo:** `src/pages/Dashboard.tsx`

- Reemplazar `loadCompletedMeals` + `setCompletedMeals(Set)` por `useQuery` que devuelve un array de IDs (siguiendo el patron de serialization constraint)
- Usar `useMemo` para convertir a `Set` en el componente
- Key: `['completedMeals', userId, todayStr]`
- `staleTime: 2 * 60 * 1000`
- `completeMeal` usara optimistic update en el cache del array
- Agregar prefetch en `usePrefetch.ts`

### 6. Actualizar `usePrefetch` con los nuevos queries

**Archivo:** `src/hooks/usePrefetch.ts`

- Agregar `prefetchWaterIntake` (para hoy)
- Agregar `prefetchStreak`  
- Agregar `prefetchUserStats`
- Agregar `prefetchCompletedMeals`
- Incluirlos en `prefetchAll`

### 7. Invalidacion reactiva tras acciones

Garantizar que tras cualquier accion de registro:
- Completar comida: invalidar `['completedMeals']`, `['userStats']`, `['nutritionSummary']`, `['streak']`
- Agregar agua: optimistic update en `['waterIntake']`
- Cambiar peso: optimistic update en `['weight', 'widget']`, invalidar `['progress']`
- Agregar comida (scanner): invalidar `['foodIntake']`, `['nutritionSummary']`, `['completedMeals']`

## Archivos a modificar

1. `src/hooks/useWaterIntake.ts` - Reescribir con React Query
2. `src/hooks/useStreakSystem.ts` - Reescribir con React Query
3. `src/components/WeightTrackerWidget.tsx` - Migrar a React Query
4. `src/pages/Dashboard.tsx` - Migrar `loadUserStats` y `loadCompletedMeals` a React Query
5. `src/hooks/usePrefetch.ts` - Agregar nuevos prefetches

## Resultado esperado

- Navegacion entre paginas sin loading spinners (datos cacheados)
- Acciones (agua, peso, completar comida) reflejadas instantaneamente via optimistic updates
- Cache invalidado automaticamente cuando hay cambios reales
- Prefetch proactivo de todos los datos del dashboard al entrar

