

# Plan: Corregir Loop Infinito al Iniciar Sesión en iOS

## Problema Identificado

Al analizar el código del Dashboard y los hooks relacionados, encontré un **ciclo de re-renders infinitos** que causa que la app se "trabe" y parezca reiniciarse después del login.

### Causa Raíz

El problema está en la interacción entre varios `useEffect` en `Dashboard.tsx`:

```text
1. Usuario hace login → authUser cambia
2. useEffect (línea 241-247) → setUserId(authUser.id)
3. useEffect (línea 250-267) → Resetea TODO el estado (preferencesChecked, initialLoadComplete, etc.)
4. useEffect (línea 273-279) → Llama checkPreferencesAndLoadData() + prefetchAll()
5. Pero "prefetchAll" está en las dependencias y cambia en cada render...
6. Esto causa que el efecto se re-ejecute constantemente
```

El `usePrefetch` hook devuelve `prefetchAll` como un `useCallback`, pero este callback **cambia su referencia** cada vez que `userId` cambia, causando que el useEffect de línea 273-279 se re-ejecute en un bucle.

Además, el efecto de "reset" (línea 250-267) no debería ejecutarse en la **primera vez** que se establece `userId`, solo cuando cambia de un usuario a otro.

## Solución Propuesta

### 1. Corregir el useEffect de carga de datos

**Problema**: `prefetchAll` está en las dependencias del useEffect, pero cambia de referencia.

**Solución**: Remover `prefetchAll` de las dependencias y usar un ref para llamarlo sin causar re-renders:

```typescript
// Usar useRef para evitar que prefetchAll cause re-renders
const prefetchAllRef = useRef(prefetchAll);
prefetchAllRef.current = prefetchAll;

useEffect(() => {
  if (userId) {
    checkPreferencesAndLoadData();
    prefetchAllRef.current(); // Llamar sin estar en dependencias
  }
}, [userId]); // Solo userId como dependencia
```

### 2. Corregir el useEffect de reset de estado

**Problema**: El efecto resetea el estado incluso cuando es la primera vez que se establece `userId` (no solo cuando cambia de usuario).

**Solución**: Solo resetear cuando hay un cambio de usuario real (de un userId a otro diferente):

```typescript
const previousUserIdRef = useRef<string | undefined>(undefined);

useEffect(() => {
  const previousUserId = previousUserIdRef.current;
  previousUserIdRef.current = userId;
  
  // Solo resetear si cambiamos de un usuario a OTRO diferente
  // No resetear en el primer mount (previousUserId === undefined)
  if (previousUserId !== undefined && previousUserId !== userId && userId !== undefined) {
    setProfile(null);
    setMealPlan(null);
    // ... resto de resets
  }
}, [userId]);
```

### 3. Simplificar lógica de prefetch

**Problema**: `usePrefetch` tiene demasiadas dependencias anidadas que cambian frecuentemente.

**Solución**: Hacer que `prefetchAll` sea estable usando un patrón de "latest ref":

```typescript
// En usePrefetch.ts
export const usePrefetch = (userId: string | undefined) => {
  const queryClient = useQueryClient();
  const userIdRef = useRef(userId);
  userIdRef.current = userId;

  // Todos los callbacks usan userIdRef.current en vez de userId
  const prefetchAll = useCallback(() => {
    const currentUserId = userIdRef.current;
    if (!currentUserId) return;
    // ... resto de la lógica
  }, [queryClient]); // Solo queryClient que nunca cambia
  
  return { prefetchAll };
};
```

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/Dashboard.tsx` | Corregir useEffects problemáticos, usar refs para callbacks |
| `src/hooks/usePrefetch.ts` | Estabilizar callbacks usando patrón de "latest ref" |

## Detalles Técnicos

### Cambios en Dashboard.tsx

1. **Agregar ref para tracking de userId previo**:
```typescript
const previousUserIdRef = useRef<string | undefined>(undefined);
```

2. **Modificar el useEffect de reset** (línea 250-267):
```typescript
useEffect(() => {
  const prevId = previousUserIdRef.current;
  previousUserIdRef.current = userId;
  
  // Solo resetear si cambiamos de un usuario a otro (no en el primer mount)
  if (prevId !== undefined && userId !== undefined && prevId !== userId) {
    setProfile(null);
    setMealPlan(null);
    setUserStats({ /* defaults */ });
    setCompletedMeals(new Set());
    setPreferencesChecked(false);
    setInitialLoadComplete(false);
    redirectingRef.current = false;
  }
}, [userId]);
```

3. **Modificar el useEffect de carga** (línea 273-279):
```typescript
const prefetchAllRef = useRef(prefetchAll);
prefetchAllRef.current = prefetchAll;

useEffect(() => {
  if (userId) {
    checkPreferencesAndLoadData();
    prefetchAllRef.current();
  }
  // Solo userId - no incluir prefetchAll
}, [userId]);
```

### Cambios en usePrefetch.ts

Usar patrón de "latest ref" para evitar que los callbacks cambien de referencia:

```typescript
export const usePrefetch = (userId: string | undefined) => {
  const queryClient = useQueryClient();
  
  // Ref que siempre tiene el userId actual
  const userIdRef = useRef(userId);
  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  const prefetchAll = useCallback(() => {
    const currentUserId = userIdRef.current;
    if (!currentUserId) return;
    // ... lógica de prefetch usando currentUserId
  }, [queryClient]); // queryClient es estable

  return { prefetchAll };
};
```

## Resultado Esperado

1. **Sin loop infinito**: El Dashboard cargará datos una sola vez cuando el userId se establezca
2. **Sin "flash" de datos**: El reset solo ocurrirá cuando realmente cambies de usuario
3. **Mejor rendimiento**: Menos re-renders innecesarios
4. **App estable**: No más "trabado" o "reinicio" después del login

