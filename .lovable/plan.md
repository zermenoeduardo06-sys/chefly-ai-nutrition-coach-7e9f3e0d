
# Plan: Corrección del Flash del Nombre de Otro Usuario

## Problema Identificado

Cuando un usuario cambia de cuenta (logout → login con otra cuenta), el saludo "Buenos días, **Carlos**" puede mostrar por un instante el nombre del usuario anterior antes de cargar el nombre correcto.

### Causas Raíz

| Causa | Ubicación | Impacto |
|-------|-----------|---------|
| Estado `profile` no se limpia al cambiar de usuario | Dashboard.tsx | Flash del nombre anterior |
| `userId` no se actualiza si ya existe un valor | Dashboard.tsx línea 236 | Datos del usuario anterior persisten |
| AuthContext solo limpia cache en `SIGNED_OUT` | AuthContext.tsx | No detecta cambios de cuenta sin logout explícito |

### Flujo del Bug

```text
1. Usuario A en Dashboard: profile = { display_name: "Carlos" }
2. Usuario A hace logout
3. queryClient.clear() ← OK, cache limpio
4. Usuario B inicia sesión
5. Dashboard monta/re-renderiza
6. Estado local profile TODAVÍA tiene datos de Carlos ← BUG
7. loadProfile() se ejecuta...
8. Durante ese instante: "Buenos días, Carlos" ← Flash visible
9. Profile de Usuario B llega: "Buenos días, María"
```

---

## Solución

### Estrategia: Limpieza de estado al cambiar de userId

La solución requiere 3 cambios sincronizados:

---

### Cambio 1: `src/contexts/AuthContext.tsx`

Detectar cambios de usuario (no solo logout) y limpiar cache.

```typescript
// Agregar ref para rastrear userId anterior
const previousUserIdRef = useRef<string | null>(null);

useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, currentSession) => {
      const newUserId = currentSession?.user?.id ?? null;
      
      // Limpiar cache si el usuario cambió (no solo en logout)
      if (previousUserIdRef.current && previousUserIdRef.current !== newUserId) {
        queryClient.clear();
      }
      
      previousUserIdRef.current = newUserId;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsLoading(false);

      if (event === "SIGNED_OUT") {
        queryClient.clear();
      }
    }
  );
  // ...resto igual
}, [queryClient]);
```

---

### Cambio 2: `src/pages/Dashboard.tsx`

**2a. Actualizar userId cuando cambie el authUser (línea 235-239):**

```typescript
// ANTES - No actualiza si ya hay un userId
useEffect(() => {
  if (authUser?.id && !userId) {
    setUserId(authUser.id);
  }
}, [authUser?.id, userId]);

// DESPUÉS - Siempre sincroniza con authUser
useEffect(() => {
  if (authUser?.id) {
    setUserId(authUser.id);
  } else {
    setUserId(undefined);
  }
}, [authUser?.id]);
```

**2b. Agregar useEffect para limpiar datos cuando cambia el userId (nuevo):**

```typescript
// Limpiar datos locales cuando cambia el usuario para evitar flash
useEffect(() => {
  // Reset todo el estado local al cambiar de usuario
  setProfile(null);
  setMealPlan(null);
  setUserStats({
    total_points: 0,
    current_streak: 0,
    longest_streak: 0,
    meals_completed: 0,
    level: 1,
  });
  setCompletedMeals(new Set());
  setPreferencesChecked(false);
  setInitialLoadComplete(false);
  redirectingRef.current = false;
}, [userId]);
```

---

### Cambio 3: `src/components/DashboardHeader.tsx` (opcional, defensa extra)

Verificar que el profile pertenece al usuario actual antes de mostrar el nombre.

```typescript
interface DashboardHeaderProps {
  displayName?: string;
  currentStreak: number;
  level: number;
  avatarUrl?: string | null;
  isProfileLoading?: boolean; // Nuevo prop
}

export const DashboardHeader = ({ 
  displayName, 
  currentStreak, 
  level, 
  avatarUrl,
  isProfileLoading = false 
}: DashboardHeaderProps) => {
  // ...
  
  // Si está cargando, no mostrar nombre de nadie
  const name = isProfileLoading 
    ? (language === 'es' ? 'Chef' : 'Chef')
    : (displayName || (language === 'es' ? 'Chef' : 'Chef'));
```

Y en Dashboard.tsx pasar el prop:

```tsx
<DashboardHeader
  displayName={profile?.display_name}
  currentStreak={userStats.current_streak}
  level={userStats.level}
  avatarUrl={profile?.avatar_url}
  isProfileLoading={!profile && initialLoadComplete}
/>
```

---

## Resumen de Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/contexts/AuthContext.tsx` | Detectar cambio de usuario y limpiar cache |
| `src/pages/Dashboard.tsx` | Sincronizar userId + limpiar estado local al cambiar |
| `src/components/DashboardHeader.tsx` | Prop opcional de loading (defensa extra) |

**Total: 3 archivos, ~25 líneas modificadas**

---

## Criterios de Validación

| Test | Resultado Esperado |
|------|-------------------|
| Usuario A logout → Usuario B login | Nunca ver nombre de Usuario A |
| Cerrar pestaña sin logout → abrir → login B | Nombre correcto sin flash |
| Refresh de página logueado | Nombre correcto o "Chef" mientras carga |
| Cambio rápido de cuentas | Cache limpio, sin mezcla de datos |

---

## Por qué Esta Solución Funciona

1. **AuthContext** detecta cambios de userId antes de que Dashboard monte
2. **Dashboard** limpia TODO su estado local cuando userId cambia
3. **DashboardHeader** tiene fallback seguro mientras profile es null

El flujo corregido:

```text
1. Usuario A logout
2. AuthContext: userId cambió → queryClient.clear()
3. Usuario B login
4. Dashboard: nuevo userId detectado → setProfile(null), reset todo
5. UI renderiza: "Buenos días, Chef" (fallback seguro)
6. loadProfile() completa
7. UI actualiza: "Buenos días, María" (nombre correcto)
```

Nunca habrá flash del nombre anterior porque el estado se limpia **antes** de que React renderice el componente.
