

# Plan: Agregar Caché de React Query al NutritionSummaryWidget

## Diagnóstico

### Estado Actual
El `NutritionSummaryWidget` usa el patrón antiguo de `useState` + `useEffect` para cargar datos, causando:

1. **Re-fetch cada vez que se monta** - No hay caché
2. **4 queries a Supabase** por cada carga:
   - `meal_completions` (con join a `meals`)
   - `food_scans`
   - `meal_plans` (para obtener el plan activo)
   - `meals` (para contar comidas del día)
3. **Latencia visible** - Skeleton loader cada vez que abres el Dashboard

### Fuentes de Datos del Widget
```text
NutritionSummaryWidget calcula:
├── meal_completions → Comidas del plan marcadas como completadas
├── food_scans → Alimentos escaneados/añadidos manualmente  
├── meal_plans → Para saber cuántas comidas hay en el día
└── useNutritionGoals → Objetivos personalizados (YA usa React Query ✓)
```

---

## Solución

### Crear un nuevo hook: `useNutritionSummary`

Seguir el mismo patrón de `useDailyFoodIntake` y `useNutritionGoals`:

```typescript
// src/hooks/useNutritionSummary.ts

// Función pura de fetch
async function fetchNutritionSummary(userId: string, dateKey: string) {
  // Las 4 queries actuales consolidadas
  const [completions, scans, mealPlan] = await Promise.all([...]);
  
  // Cálculos de totales
  return { calories, protein, carbs, fats, mealsCompleted, totalMeals };
}

// Hook con React Query
export function useNutritionSummary(userId: string, date: Date) {
  return useQuery({
    queryKey: ['nutritionSummary', userId, dateKey],
    queryFn: () => fetchNutritionSummary(userId, dateKey),
    staleTime: 2 * 60 * 1000, // 2 min
    gcTime: 5 * 60 * 1000,
  });
}

// Hook de invalidación
export const useInvalidateNutritionSummary = () => {
  const queryClient = useQueryClient();
  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['nutritionSummary'] });
  }, [queryClient]);
};
```

---

## Archivos a Modificar/Crear

| Archivo | Acción | Cambio |
|---------|--------|--------|
| `src/hooks/useNutritionSummary.ts` | **CREAR** | Nuevo hook con React Query + invalidación |
| `src/components/NutritionSummaryWidget.tsx` | Modificar | Usar el nuevo hook en lugar de useState/useEffect |
| `src/pages/FoodScannerPage.tsx` | Modificar | Agregar invalidación del nuevo hook |
| `src/pages/AddFood.tsx` | Modificar | Agregar invalidación del nuevo hook |
| `src/components/scanner/ScannerFoodSearch.tsx` | Modificar | Agregar invalidación del nuevo hook |
| `src/components/FoodScanner.tsx` | Modificar | Agregar invalidación del nuevo hook |
| `src/components/MealPhotoDialog.tsx` | Modificar | Agregar invalidación del nuevo hook |
| `src/components/ChallengePhotoDialog.tsx` | Modificar | Agregar invalidación del nuevo hook |
| `src/pages/Dashboard.tsx` | Modificar | Agregar invalidación cuando se complete una comida del plan |

---

## Estructura del Hook `useNutritionSummary.ts`

```typescript
import { useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface NutritionSummaryData {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  mealsCompleted: number;
  totalMeals: number;
}

const DEFAULT_SUMMARY: NutritionSummaryData = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fats: 0,
  mealsCompleted: 0,
  totalMeals: 3,
};

async function fetchNutritionSummary(
  userId: string, 
  dateKey: string,
  dayOfWeek: number
): Promise<NutritionSummaryData> {
  const dayStartISO = `${dateKey}T00:00:00.000Z`;
  const dayEndISO = `${dateKey}T23:59:59.999Z`;

  // Ejecutar queries en paralelo para mayor velocidad
  const [completionsResult, scansResult, mealPlanResult] = await Promise.all([
    supabase
      .from("meal_completions")
      .select(`id, meal_id, completed_at, meals (calories, protein, carbs, fats)`)
      .eq("user_id", userId)
      .gte("completed_at", dayStartISO)
      .lt("completed_at", dayEndISO),
    
    supabase
      .from("food_scans")
      .select("calories, protein, carbs, fat")
      .eq("user_id", userId)
      .gte("scanned_at", dayStartISO)
      .lt("scanned_at", dayEndISO),
    
    supabase
      .from("meal_plans")
      .select("id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const completions = completionsResult.data || [];
  const scans = scansResult.data || [];
  const mealPlan = mealPlanResult.data;

  // Contar comidas del día
  let totalMealsForDate = 3;
  if (mealPlan) {
    const { count } = await supabase
      .from("meals")
      .select("id", { count: "exact" })
      .eq("meal_plan_id", mealPlan.id)
      .eq("day_of_week", dayOfWeek);
    totalMealsForDate = count || 3;
  }

  // Calcular totales
  let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFats = 0;

  completions.forEach((completion: any) => {
    if (completion.meals) {
      totalCalories += completion.meals.calories || 0;
      totalProtein += completion.meals.protein || 0;
      totalCarbs += completion.meals.carbs || 0;
      totalFats += completion.meals.fats || 0;
    }
  });

  scans.forEach((scan) => {
    totalCalories += scan.calories || 0;
    totalProtein += scan.protein || 0;
    totalCarbs += scan.carbs || 0;
    totalFats += scan.fat || 0;
  });

  return {
    calories: totalCalories,
    protein: totalProtein,
    carbs: totalCarbs,
    fats: totalFats,
    mealsCompleted: completions.length,
    totalMeals: totalMealsForDate,
  };
}

export function useNutritionSummary(userId: string | undefined, date: Date = new Date()) {
  const dateKey = useMemo(() => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, [date.getTime()]);

  const dayOfWeek = date.getDay();

  const query = useQuery({
    queryKey: ['nutritionSummary', userId, dateKey],
    queryFn: () => fetchNutritionSummary(userId!, dateKey, dayOfWeek),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 min
    gcTime: 5 * 60 * 1000,
  });

  return {
    data: query.data ?? DEFAULT_SUMMARY,
    isLoading: query.isLoading && !query.isFetched,
    refetch: query.refetch,
  };
}

// Hook de invalidación para llamar después de agregar comida
export const useInvalidateNutritionSummary = () => {
  const queryClient = useQueryClient();
  
  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['nutritionSummary'] });
  }, [queryClient]);
};
```

---

## Cambios en NutritionSummaryWidget

### Antes (useState/useEffect)
```typescript
const [nutrition, setNutrition] = useState<DailyNutrition | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  loadDateNutrition();
}, [userId, selectedDate]);

const loadDateNutrition = async () => {
  // 4 queries manuales...
};
```

### Después (useNutritionSummary)
```typescript
import { useNutritionSummary } from "@/hooks/useNutritionSummary";

const { data: nutrition, isLoading } = useNutritionSummary(userId, selectedDate);
const { goals: dailyGoals, loading: goalsLoading } = useNutritionGoals(userId);

// Eliminar useState, useEffect y loadDateNutrition
```

---

## Puntos de Invalidación

Todos los lugares donde ya se invalida `foodIntake`, también invalidar `nutritionSummary`:

```typescript
// En cada archivo que agrega comida:
import { useInvalidateFoodIntake } from '@/hooks/useDailyFoodIntake';
import { useInvalidateNutritionSummary } from '@/hooks/useNutritionSummary';

const invalidateFoodIntake = useInvalidateFoodIntake();
const invalidateNutritionSummary = useInvalidateNutritionSummary();

// Después de insert exitoso:
invalidateFoodIntake();
invalidateNutritionSummary();
```

---

## Flujo Resultante

```text
Usuario abre Dashboard
├── Primera vez: fetch desde Supabase → guardar en caché
├── Siguientes veces: datos del caché (instantáneo)
└── Después de agregar comida: invalidar → refetch automático
```

---

## Impacto

| Métrica | Antes | Después |
|---------|-------|---------|
| Queries al abrir Dashboard | 4 cada vez | 0 (si está en caché) |
| Tiempo de carga | ~500ms | Instantáneo |
| Actualización post-scan | Manual/delay | Automática |

