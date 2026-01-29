

# Plan Actualizado: Arquitectura SPA Fluida tipo Duolingo

## Ajustes Incorporados

Siguiendo tus indicaciones, el plan se optimiza así:

| Ajuste solicitado | Implementación |
|-------------------|----------------|
| AuthContext solo identidad/sesión | Solo expone `user`, `session`, `isAuthenticated`, `isLoading`, `signOut` |
| React Query exclusivo para datos | Profile, subscription, wellness, goals migrados a `useQuery` |
| Prefetch selectivo | Solo Progress y Wellness (alta probabilidad), sin IA |
| Skeleton loaders prioritarios | Skeletons inmediatos, transiciones no bloquean render |
| Animaciones mínimas en tabs | Reducción de duración a 100ms, sin offset en X |

---

## Archivos a Crear

### 1. `src/contexts/AuthContext.tsx`

Contexto ligero solo para identidad:

```typescript
interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
}
```

- Listener `onAuthStateChange` configurado ANTES de `getSession()`
- NO duplica datos de React Query (profile, subscription van separados)

### 2. `src/hooks/usePrefetch.ts`

Prefetch selectivo para navegación de alta probabilidad:

```typescript
export const usePrefetch = (userId: string | undefined) => {
  // prefetchProgress() - body_measurements, user_stats
  // prefetchWellness() - mood_logs de hoy
  // prefetchRecipes() - meal_plan ID actual
};
```

- NO prefetch de datos pesados ni IA
- staleTime optimizado por tipo de dato

---

## Archivos a Modificar

### 3. `src/App.tsx`

Envolver con `AuthProvider`:

```tsx
<AuthProvider>
  <QueryClientProvider client={queryClient}>
    {/* ... resto igual */}
  </QueryClientProvider>
</AuthProvider>
```

### 4. `src/components/AnimatedRoutes.tsx`

Cambios estructurales para SPA real:

**Antes:**
```tsx
<AnimatePresence mode="wait">
  <Routes location={location} key={location.pathname}>
    <Route path="/dashboard" element={<DashboardLayout><PageTransition><Dashboard /></PageTransition></DashboardLayout>} />
```

**Después:**
```tsx
// Sin key en location.pathname - evita remount
<Routes location={location}>
  {/* Rutas públicas con transición */}
  <Route path="/" element={<PageTransition><Index /></PageTransition>} />
  
  {/* Layout persistente con Outlet */}
  <Route path="/dashboard" element={<DashboardLayout />}>
    <Route index element={<Dashboard />} />
    <Route path="progress" element={<Progress />} />
    <Route path="wellness" element={<Wellness />} />
    <Route path="scanner" element={<FoodScannerPage />} />
    {/* ... más rutas */}
  </Route>
</Routes>
```

El `DashboardLayout` usa `<Outlet />` para renderizar hijos:
```tsx
const DashboardLayout = () => (
  <SidebarProvider>
    <div className="flex h-[100dvh]...">
      <AppSidebar />
      <main className="flex-1">
        <Outlet />  {/* Solo esto cambia entre páginas */}
      </main>
    </div>
    <MobileBottomNav />
  </SidebarProvider>
);
```

### 5. `src/components/PageTransition.tsx`

Optimización de animaciones:

```tsx
const pageVariants = {
  initial: { opacity: 0 },  // Sin offset X
  in: { opacity: 1 },
  out: { opacity: 0 },
};

const pageTransition = {
  type: 'tween',
  ease: 'easeOut',
  duration: 0.1,  // 100ms - casi instantáneo
};
```

### 6. `src/hooks/useSubscription.ts`

Migrar a React Query:

```typescript
export const useSubscription = (userId: string | undefined) => {
  const query = useQuery({
    queryKey: ['subscription', userId],
    queryFn: async () => {
      const { data } = await supabase.functions.invoke("check-subscription");
      return data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,  // 5 min - no refetch en navegación
    gcTime: 10 * 60 * 1000,
  });
  
  return {
    subscribed: query.data?.subscribed ?? false,
    isCheflyPlus: query.data?.subscribed ?? false,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
};
```

### 7. `src/hooks/useNutritionGoals.ts`

Migrar a React Query:

```typescript
export const useNutritionGoals = (userId: string | null) => {
  const query = useQuery({
    queryKey: ['nutritionGoals', userId],
    queryFn: () => fetchAndCalculateGoals(userId),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000,  // 10 min
  });
  
  return {
    goals: query.data ?? DEFAULT_GOALS,
    loading: query.isLoading,
    // ...
  };
};
```

### 8. `src/hooks/useSubscriptionLimits.ts`

Migrar a React Query:

```typescript
export const useSubscriptionLimits = (userId: string | undefined) => {
  const query = useQuery({
    queryKey: ['subscriptionLimits', userId],
    queryFn: () => loadSubscriptionLimits(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,  // 2 min
  });
  
  return {
    limits: query.data ?? DEFAULT_LIMITS,
    refreshLimits: query.refetch,
  };
};
```

### 9. `src/pages/Dashboard.tsx`

Simplificar usando AuthContext:

**Antes:**
```tsx
useEffect(() => {
  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) navigate("/auth");
    // ... más lógica
  };
  checkAuth();
}, []);
```

**Después:**
```tsx
const { user, isLoading: authLoading, isAuthenticated } = useAuth();

useEffect(() => {
  if (!authLoading && !isAuthenticated) {
    navigate("/auth");
  }
}, [authLoading, isAuthenticated]);

// userId disponible inmediatamente desde context
const userId = user?.id;
```

Similar para: `Progress.tsx`, `ChefIA.tsx`, `Wellness.tsx`, `Recipes.tsx`

### 10. `src/components/MobileBottomNav.tsx`

Agregar prefetch en hover/touch:

```tsx
const { prefetchProgress, prefetchWellness } = usePrefetch(userId);

// En el NavLink de Progress
<NavLink 
  to="/dashboard/progress"
  onMouseEnter={prefetchProgress}
  onTouchStart={prefetchProgress}
>
```

---

## Skeleton Loaders

Priorizar skeletons sobre animaciones en páginas con datos:

```tsx
// En Dashboard.tsx
if (isLoadingData) {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-32 w-full rounded-2xl" />
      <Skeleton className="h-24 w-full rounded-2xl" />
      <div className="grid grid-cols-3 gap-3">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
      </div>
    </div>
  );
}
```

---

## Invalidaciones de Cache

Control desde React Query en acciones críticas:

```typescript
// En logout
queryClient.clear();

// En compra de suscripción
queryClient.invalidateQueries({ queryKey: ['subscription'] });
queryClient.invalidateQueries({ queryKey: ['subscriptionLimits'] });

// En completar comida
queryClient.invalidateQueries({ queryKey: ['foodIntake'] });
```

---

## Resultado Esperado

| Métrica | Antes | Después |
|---------|-------|---------|
| Tiempo entre páginas del dashboard | 300-800ms | 50-100ms |
| Llamadas a getUser() | 1 por página | 1 por sesión |
| Llamadas a check-subscription | 1 por página | 1 cada 5 min |
| Remount de DashboardLayout | Cada navegación | Nunca |
| Animaciones de tab interno | 200-300ms | 100ms |
| Sensación de usuario | "Páginas web" | "App nativa fluida" |

---

## Orden de Implementación

1. Crear `AuthContext.tsx`
2. Crear `usePrefetch.ts`
3. Modificar `App.tsx` (envolver con AuthProvider)
4. Modificar `AnimatedRoutes.tsx` (nested routes + Outlet)
5. Modificar `PageTransition.tsx` (animaciones mínimas)
6. Migrar hooks a React Query (`useSubscription`, `useNutritionGoals`, `useSubscriptionLimits`)
7. Simplificar páginas principales (Dashboard, Progress, etc.)
8. Agregar prefetch a MobileBottomNav
9. Añadir skeleton loaders donde falten

