
# Plan: Carga Automática sin Espera para Diario y Progreso

## Objetivo
Migrar los hooks y componentes restantes a React Query para que las páginas de **Diario (Dashboard)** y **Progreso** carguen instantáneamente sin ningún tiempo de espera visible.

---

## Problema Actual

| Componente | Problema |
|------------|----------|
| `useDailyFoodIntake.ts` | Usa `useState/useEffect` - no comparte caché, recarga cada vez |
| `ProgressStatsTab.tsx` | `useEffect` interno con `setLoading(true)` bloqueante |
| `ProgressAchievementsTab.tsx` | `useEffect` interno con `setLoading(true)` bloqueante |
| `NutritionProgressCharts.tsx` | Carga datos internamente con `getUser()` + queries |
| Prefetch actual | No incluye `useDailyFoodIntake` ni datos del Diario |

---

## Solución

### Estrategia de 3 Partes:

```text
┌─────────────────────────────────────────────────┐
│  1. Migrar hooks a React Query                   │
│     → useDailyFoodIntake con useQuery            │
│     → NutritionProgressCharts con useQuery       │
└─────────────────────────────────────────────────┘
               ↓
┌─────────────────────────────────────────────────┐
│  2. Componentes usan datos cacheados             │
│     → ProgressStatsTab usa useProgressData       │
│     → ProgressAchievementsTab usa useQuery       │
└─────────────────────────────────────────────────┘
               ↓
┌─────────────────────────────────────────────────┐
│  3. Prefetch expandido en Dashboard              │
│     → Incluye datos del diario (food_scans)      │
│     → Datos de achievements                      │
└─────────────────────────────────────────────────┘
```

---

## Cambios por Archivo

### 1. `src/hooks/useDailyFoodIntake.ts` - Migrar a React Query

**Antes:** `useState` + `useEffect` + `fetchDailyIntake()`

**Después:**
```typescript
export function useDailyFoodIntake(userId: string | undefined, date: Date = new Date()) {
  const dateKey = useMemo(() => date.toISOString().split('T')[0], [date.getTime()]);
  
  const query = useQuery({
    queryKey: ['foodIntake', userId, dateKey],
    queryFn: () => fetchDailyIntakeData(userId!, dateKey),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 min
    gcTime: 5 * 60 * 1000,
  });

  return {
    consumedCalories: query.data?.consumedCalories ?? DEFAULT_CALORIES,
    consumedMacros: query.data?.consumedMacros ?? DEFAULT_MACROS,
    recentFoods: query.data?.recentFoods ?? {},
    foodScans: query.data?.foodScans ?? [],
    isLoading: query.isLoading && !query.isFetched,
    refetch: query.refetch,
  };
}
```

### 2. `src/hooks/usePrefetch.ts` - Añadir prefetch del diario

**Añadir `prefetchDiary()`:**
```typescript
const prefetchDiary = useCallback(() => {
  if (!userId) return;
  const today = new Date().toISOString().split('T')[0];
  
  // Today's food intake
  queryClient.prefetchQuery({
    queryKey: ['foodIntake', userId, today],
    queryFn: () => fetchDailyIntakeData(userId, today),
    staleTime: 2 * 60 * 1000,
  });

  // Weekly nutrition data
  queryClient.prefetchQuery({
    queryKey: ['nutritionProgress', 'weekly', userId],
    queryFn: () => fetchWeeklyNutrition(userId),
    staleTime: 5 * 60 * 1000,
  });
}, [userId, queryClient]);

// Añadir achievements
const prefetchAchievements = useCallback(() => {
  if (!userId) return;
  
  queryClient.prefetchQuery({
    queryKey: ['achievements', 'all'],
    queryFn: fetchAllAchievements,
    staleTime: 30 * 60 * 1000, // 30 min - logros cambian poco
  });

  queryClient.prefetchQuery({
    queryKey: ['achievements', 'user', userId],
    queryFn: () => fetchUserAchievements(userId),
    staleTime: 5 * 60 * 1000,
  });
}, [userId, queryClient]);
```

**Actualizar `prefetchAll()`:**
```typescript
const prefetchAll = useCallback(() => {
  if (!userId) return;
  prefetchDiary();        // NUEVO
  prefetchProgress();
  prefetchWellness();
  prefetchRecipes();
  prefetchChat();
  prefetchAchievements(); // NUEVO
}, [...]);
```

### 3. `src/components/progress/ProgressStatsTab.tsx` - Usar React Query

**Antes:** `useEffect` + `loadStats()` con `setLoading(true)`

**Después:**
```typescript
export function ProgressStatsTab({ userId }: ProgressStatsTabProps) {
  const { stats, isLoading } = useProgressData(userId);

  // Skeleton solo si es la primera carga sin datos en caché
  if (isLoading) {
    return <Skeleton ... />;
  }

  // Resto del componente igual
}
```

### 4. `src/components/progress/ProgressAchievementsTab.tsx` - Migrar a React Query

**Antes:** `useEffect` + dos queries separadas

**Después:**
```typescript
export function ProgressAchievementsTab({ userId }: ProgressAchievementsTabProps) {
  // Achievements definition (cambia poco, staleTime largo)
  const achievementsQuery = useQuery({
    queryKey: ['achievements', 'all'],
    queryFn: async () => {
      const { data } = await supabase
        .from("achievements")
        .select("*")
        .order("requirement_value", { ascending: true });
      return data || [];
    },
    staleTime: 30 * 60 * 1000, // 30 min
  });

  // User's unlocked achievements
  const userAchievementsQuery = useQuery({
    queryKey: ['achievements', 'user', userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_achievements")
        .select("achievement_id")
        .eq("user_id", userId);
      return new Set(data?.map(ua => ua.achievement_id) || []);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  // isLoading solo en primera carga
  const isLoading = achievementsQuery.isLoading && !achievementsQuery.data;
  
  // ...resto del componente
}
```

### 5. `src/components/NutritionProgressCharts.tsx` - Migrar a React Query

**Problema:** Carga userId con `getUser()` y luego hace queries internas.

**Solución:** Recibir `userId` como prop + usar `useQuery`:

```typescript
// Nuevo hook interno o extraer a hook separado
const useWeeklyNutrition = (userId: string | null, selectedDate: Date) => {
  return useQuery({
    queryKey: ['nutritionProgress', 'weekly', userId, format(selectedDate, 'yyyy-ww')],
    queryFn: () => loadWeeklyNutritionData(userId!, selectedDate),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
};

export const NutritionProgressCharts = ({ userId }: { userId: string }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { data: weeklyData, isLoading } = useWeeklyNutrition(userId, selectedDate);
  
  // Skeleton-first en vez de loader bloqueante
  // ...
};
```

### 6. `src/hooks/useProgressData.ts` - Añadir stats

El hook ya existe, pero necesita incluir stats para `ProgressStatsTab`:

```typescript
// Ya tienes:
// - latestWeight
// - measurements

// Añadir user_stats al hook existente
const statsQuery = useQuery({
  queryKey: ['progress', 'stats', userId],
  queryFn: () => fetchUserStats(userId!),
  enabled: !!userId,
  staleTime: 5 * 60 * 1000,
});

return {
  latestWeight: ...,
  measurements: ...,
  stats: statsQuery.data ?? null,  // NUEVO
  isLoading: ...,
  refetchStats: statsQuery.refetch,
};
```

---

## Flujo de Datos Optimizado

```text
Usuario abre Dashboard
         │
         ├── Carga datos del Dashboard (diario)
         │
         └── [Background] prefetchAll():
                  ├── prefetchDiary() - food_scans de hoy
                  ├── prefetchProgress() - weight, measurements, stats
                  ├── prefetchWellness() - moods
                  ├── prefetchRecipes() - meal plan
                  ├── prefetchChat() - messages
                  └── prefetchAchievements() - achievements
         
Usuario toca "Progreso" 
         │
         └── Datos YA en caché → Render instantáneo (0ms)

Usuario cambia de fecha en Diario
         │
         └── Prefetch de fecha siguiente/anterior en background
```

---

## Resultado Esperado

| Métrica | Antes | Después |
|---------|-------|---------|
| Dashboard → Progress | 200-500ms | 0ms (datos en caché) |
| Cambio de tab en Progress | 100-300ms | 0ms |
| Skeleton visible | Cada navegación | Solo primera carga de sesión |
| Refetch en navegación | Siempre | Nunca (usa staleTime) |

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/hooks/useDailyFoodIntake.ts` | Migrar a useQuery |
| `src/hooks/usePrefetch.ts` | Añadir prefetchDiary, prefetchAchievements |
| `src/hooks/useProgressData.ts` | Añadir stats query |
| `src/components/progress/ProgressStatsTab.tsx` | Usar useProgressData |
| `src/components/progress/ProgressAchievementsTab.tsx` | Migrar a useQuery |
| `src/components/NutritionProgressCharts.tsx` | Recibir userId + useQuery |
| `src/pages/Progress.tsx` | Pasar userId a NutritionProgressCharts |

---

## Orden de Implementación

1. **useDailyFoodIntake.ts** - Base del diario
2. **useProgressData.ts** - Añadir stats
3. **usePrefetch.ts** - Expandir con diary + achievements
4. **ProgressStatsTab.tsx** - Consumir desde useProgressData
5. **ProgressAchievementsTab.tsx** - Migrar a useQuery
6. **NutritionProgressCharts.tsx** - Recibir userId + useQuery
7. **Progress.tsx** - Pasar userId al componente
