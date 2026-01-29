
# Plan: Actualización Instantánea del Cache de Comidas

## Diagnóstico

### Causa Raíz
Cuando se agrega una comida a la base de datos, el cache de React Query **NO se invalida**, lo que causa que los usuarios tengan que esperar hasta 2 minutos (el `staleTime`) para ver sus comidas reflejadas en el dashboard.

### Flujo Actual (con problema)
```
Usuario agrega comida → Insert a Supabase → ✅ Éxito
                      → Cache sigue "fresco" por 2 min
                      → UI muestra datos viejos
                      → Después de 2 min → React Query refetch → UI actualizada
```

### Lugares donde se insertan comidas (sin invalidación)
| Archivo | Contexto |
|---------|----------|
| `FoodScannerPage.tsx` | Escaneo con IA desde cámara |
| `AddFood.tsx` | Selección manual de alimentos |
| `ScannerFoodSearch.tsx` | Búsqueda y añadir alimento rápido |
| `FoodScanner.tsx` | Componente de escáner (dialog) |
| `MealPhotoDialog.tsx` | Foto de comida del plan semanal |
| `ChallengePhotoDialog.tsx` | Foto de reto diario |

---

## Solución

### Estrategia: Invalidar cache después de cada insert

Crear un **hook centralizado** o exportar una función de invalidación que se llame después de cada insert exitoso a `food_scans`.

### Opción Elegida: Hook de Invalidación

```typescript
// En useDailyFoodIntake.ts o nuevo archivo
export const useInvalidateFoodIntake = () => {
  const queryClient = useQueryClient();
  
  return useCallback((dateKey?: string) => {
    // Invalida el cache para una fecha específica o todas
    if (dateKey) {
      queryClient.invalidateQueries({ 
        queryKey: ['foodIntake'],
        predicate: (query) => query.queryKey[2] === dateKey
      });
    } else {
      // Invalida todo el cache de foodIntake
      queryClient.invalidateQueries({ queryKey: ['foodIntake'] });
    }
  }, [queryClient]);
};
```

---

## Cambios por Archivo

### 1. `src/hooks/useDailyFoodIntake.ts`
**Agregar hook de invalidación exportable:**

```typescript
import { useQueryClient } from "@tanstack/react-query";

// Nueva función para invalidar cache
export const useInvalidateFoodIntake = () => {
  const queryClient = useQueryClient();
  
  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['foodIntake'] });
  }, [queryClient]);
};
```

### 2. `src/pages/FoodScannerPage.tsx`
**Después de guardar escaneo exitoso (línea ~170):**

```typescript
// Importar el hook
import { useInvalidateFoodIntake } from '@/hooks/useDailyFoodIntake';

// Dentro del componente
const invalidateFoodIntake = useInvalidateFoodIntake();

// En handleSave, después del insert exitoso:
if (!error) {
  setSaved(true);
  setShowCelebration(true);
  refreshLimits();
  invalidateFoodIntake(); // ← Nuevo
}
```

### 3. `src/pages/AddFood.tsx`
**Después de guardar alimentos (línea ~260):**

```typescript
// Importar
import { useInvalidateFoodIntake } from '@/hooks/useDailyFoodIntake';

// Dentro del componente
const invalidateFoodIntake = useInvalidateFoodIntake();

// En handleDone, después del insert exitoso:
if (!error) {
  // ... celebration code ...
  invalidateFoodIntake(); // ← Nuevo
}
```

### 4. `src/components/scanner/ScannerFoodSearch.tsx`
**Después de añadir alimento (línea ~150):**

```typescript
// Importar
import { useInvalidateFoodIntake } from '@/hooks/useDailyFoodIntake';

// Dentro del componente
const invalidateFoodIntake = useInvalidateFoodIntake();

// En handleAddFood, después del insert:
if (!error) {
  await trackFoodUsage(food.id);
  triggerXP(10, 'food', ...);
  invalidateFoodIntake(); // ← Nuevo
  onFoodAdded();
}
```

### 5. `src/components/FoodScanner.tsx`
**Después de guardar escaneo (línea ~155):**

```typescript
// Importar
import { useInvalidateFoodIntake } from '@/hooks/useDailyFoodIntake';

// Dentro del componente
const invalidateFoodIntake = useInvalidateFoodIntake();

// En handleSave:
if (!error) {
  setSaved(true);
  refreshLimits();
  invalidateFoodIntake(); // ← Nuevo
  onSaveSuccess?.();
}
```

### 6. `src/components/MealPhotoDialog.tsx`
**Después de guardar foto de comida (línea ~140):**

```typescript
// Importar
import { useInvalidateFoodIntake } from '@/hooks/useDailyFoodIntake';

// Dentro del componente
const invalidateFoodIntake = useInvalidateFoodIntake();

// En handleSavePhoto, después del insert:
if (!insertError) {
  invalidateFoodIntake(); // ← Nuevo
  onPhotoSaved(meal.id);
  handleClose();
}
```

### 7. `src/components/ChallengePhotoDialog.tsx`
**Después de guardar foto de reto:**

```typescript
// Importar
import { useInvalidateFoodIntake } from '@/hooks/useDailyFoodIntake';

// Dentro del componente
const invalidateFoodIntake = useInvalidateFoodIntake();

// Después del insert exitoso:
invalidateFoodIntake(); // ← Nuevo
```

---

## Flujo Corregido

```
Usuario agrega comida → Insert a Supabase → ✅ Éxito
                      → invalidateFoodIntake() ← NUEVO
                      → Cache marcado como "stale"
                      → React Query refetch automático
                      → UI actualizada instantáneamente
```

---

## Resumen de Cambios

| Archivo | Cambio |
|---------|--------|
| `src/hooks/useDailyFoodIntake.ts` | Agregar `useInvalidateFoodIntake` hook |
| `src/pages/FoodScannerPage.tsx` | Llamar invalidación después de save |
| `src/pages/AddFood.tsx` | Llamar invalidación después de save |
| `src/components/scanner/ScannerFoodSearch.tsx` | Llamar invalidación después de add |
| `src/components/FoodScanner.tsx` | Llamar invalidación después de save |
| `src/components/MealPhotoDialog.tsx` | Llamar invalidación después de save |
| `src/components/ChallengePhotoDialog.tsx` | Llamar invalidación después de save |

**Total: 7 archivos, ~15 líneas nuevas**

---

## Impacto

| Métrica | Antes | Después |
|---------|-------|---------|
| Tiempo para ver comida agregada | ~2 minutos | Instantáneo (~100ms) |
| Experiencia de usuario | Confusa ("¿se guardó?") | Clara y responsiva |
| Llamadas extra a DB | 0 | 1 por inserción (mínimo) |

---

## Por qué esta solución es segura

1. **No rompe nada existente** - Solo agrega invalidación después de operaciones exitosas
2. **Eficiente** - `invalidateQueries` solo marca como stale, no fuerza refetch inmediato si el componente no está montado
3. **Centralizada** - Un hook reutilizable evita código duplicado
4. **Sin impacto en costos** - No agrega llamadas a APIs de IA ni servicios externos
