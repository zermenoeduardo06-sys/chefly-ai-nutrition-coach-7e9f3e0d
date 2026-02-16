

# Plan: Optimizacion de Rendimiento y Reduccion de Costos

Basado en el analisis de la arquitectura actual, estas son las tecnicas de mayor impacto que se pueden implementar sin romper nada existente.

---

## Fase 1: Partial Selects (Reducir transferencia de datos)

Actualmente varias queries usan `select("*")` cuando solo necesitan 2-3 campos. Esto transfiere datos innecesarios en cada request.

### Cambios

| Archivo | Query actual | Select optimizado |
|---------|-------------|-------------------|
| `Dashboard.tsx` (profile) | `.select("*")` | `.select("id, name, avatar_url")` |
| `Dashboard.tsx` (loadUserStats) | `.select("*")` | `.select("user_id, total_points, current_streak, longest_streak, meals_completed, level, last_activity_date, streak_freeze_available")` |
| `Dashboard.tsx` (loadCompletedMeals) | `.select("meal_id")` | Ya optimizado |
| `useNutritionGoals.ts` (user_preferences) | `.select("age, weight, height, ...")` | Ya optimizado |
| `usePrefetch.ts` (body_measurements) | `.select("*")` | `.select("id, weight, measurement_date")` |
| `usePrefetch.ts` (user_stats) | `.select("*")` | `.select("user_id, total_points, current_streak, longest_streak, meals_completed, level")` |
| `usePrefetch.ts` (body_scans) | `.select("*")` | `.select("id, body_fat_percentage, muscle_mass_percentage, scanned_at, image_url")` |
| `usePrefetch.ts` (wellness_insights) | `.select("*")` | `.select("id, insight_type, content, generated_at")` |

Reduccion estimada de datos transferidos: **30-50%** en las queries principales del Dashboard.

---

## Fase 2: Optimistic Updates en completeMeal

Actualmente `completeMeal` espera la respuesta del servidor antes de actualizar la UI. El flujo es:

1. Usuario toca "completar comida"
2. INSERT en `meal_completions` (espera ~200-500ms)
3. Actualiza UI
4. Recalcula stats (otra query)

### Cambio propuesto

1. Usuario toca "completar comida"
2. UI se actualiza INMEDIATAMENTE (setState + haptics + celebracion)
3. INSERT en `meal_completions` en background
4. Si falla, revertir estado y mostrar error

Archivo: `src/pages/Dashboard.tsx`, funcion `completeMeal`

```
// Pseudocodigo del cambio:
const completeMeal = async (mealId) => {
  // 1. Optimistic update PRIMERO
  setCompletedMeals(prev => new Set([...prev, mealId]));
  successNotification();
  triggerCelebration();
  invalidateNutritionSummary();

  // 2. Server request en background
  const { error } = await supabase
    .from("meal_completions")
    .insert({ ... });

  // 3. Rollback si falla
  if (error) {
    setCompletedMeals(prev => {
      const next = new Set(prev);
      next.delete(mealId);
      return next;
    });
    toast({ variant: "destructive", ... });
    return;
  }

  // 4. Stats update en background
  await updateUserStats(userId);
};
```

Mejora en velocidad percibida: **~300-500ms** menos de espera visible para el usuario.

---

## Fase 3: Optimistic Update en AddFood (handleDone)

Similar a completeMeal, actualmente `AddFood.tsx` espera el INSERT antes de mostrar la celebracion.

### Cambio propuesto

1. Mostrar celebracion y navegar INMEDIATAMENTE
2. INSERT en background
3. Si falla, mostrar toast de error en la pantalla anterior

Archivo: `src/pages/AddFood.tsx`, funcion `handleDone`

---

## Fase 4: Prefetch del perfil en AuthContext

Actualmente el perfil se carga cuando el Dashboard se monta. Se puede pre-cargar en cuanto el usuario se autentica.

### Cambio

En `src/hooks/usePrefetch.ts`, agregar un `prefetchProfile` que cargue `profiles.select("id, name, avatar_url")` con staleTime de 10 min. Llamarlo desde el Dashboard junto con `prefetchAll`.

---

## Resumen de impacto

| Tecnica | Velocidad percibida | Ahorro en requests/datos | Complejidad |
|---------|---------------------|--------------------------|-------------|
| Partial selects | Marginal | 30-50% menos datos | Baja |
| Optimistic completeMeal | -300ms percibidos | Sin cambio | Media |
| Optimistic addFood | -200ms percibidos | Sin cambio | Media |
| Prefetch perfil | Elimina "Chef" fallback | Sin cambio | Baja |

## Archivos a modificar

1. `src/pages/Dashboard.tsx` - Partial selects + optimistic completeMeal
2. `src/pages/AddFood.tsx` - Optimistic handleDone
3. `src/hooks/usePrefetch.ts` - Partial selects + prefetchProfile
4. `src/components/NutritionSummaryWidget.tsx` - Sin cambios (ya optimizado)

