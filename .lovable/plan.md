
## Plan: Corregir la fecha de registro de comidas en todos los flujos

### Problema Identificado

Las entradas de comida aparecen en el día equivocado porque varios componentes **no envían el campo `scanned_at`** al insertar en la tabla `food_scans`. Esto causa que Postgres use el valor por defecto `now()` (hora actual del servidor UTC), en lugar de la fecha que el usuario tiene seleccionada en el Dashboard.

### Análisis de la Base de Datos

Los registros recientes muestran el problema claramente:
- Registros con `scanned_at: 2026-01-26 01:06:31` fueron creados el 26 de enero, pero el usuario quería registrarlos para el **25 de enero**
- Registros con `scanned_at: 2026-01-25 14:00:00` SÍ tienen la fecha correcta porque usaron el código ya corregido

### Componentes que Requieren Corrección

| Componente | Problema | Estado |
|------------|----------|--------|
| `AddFood.tsx` | Ya tiene `scanned_at` | Correcto |
| `ScannerFoodSearch.tsx` | Ya tiene `scanned_at` | Correcto |
| `FoodScannerPage.tsx` | Ya tiene `scanned_at` | Correcto |
| `FoodScanner.tsx` | **NO tiene `scanned_at`** | A corregir |
| `MealPhotoDialog.tsx` | **NO tiene `scanned_at`** | A corregir |
| `MealDetail.tsx` | No pasa `date` al navegar | A corregir |

---

## Cambios Técnicos

### 1. `src/components/FoodScanner.tsx`

**Problema**: El componente no recibe ni usa la fecha seleccionada del Dashboard.

**Solución**: 
- Agregar prop `selectedDate?: string` a la interfaz
- Usar esta fecha para construir el timestamp `scanned_at`
- Añadir el campo `scanned_at` a la inserción de Supabase

```typescript
// Cambio en la interfaz (línea ~15-20)
interface FoodScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mealType?: string;
  selectedDate?: string;  // Agregar esta prop
  onSaveSuccess?: () => void;
}

// Cambio en handleSave (línea ~123-139)
// Construir scanned_at usando selectedDate o fecha actual
const now = new Date();
let scannedAt: Date;

if (selectedDate) {
  const [year, month, day] = selectedDate.split('-').map(Number);
  scannedAt = new Date(year, month - 1, day, now.getHours(), now.getMinutes(), now.getSeconds());
} else {
  scannedAt = now;
}

const { error } = await supabase
  .from('food_scans')
  .insert({
    // ... campos existentes
    scanned_at: scannedAt.toISOString(), // Agregar este campo
  });
```

### 2. `src/pages/Dashboard.tsx`

**Problema**: No pasa `selectedDate` al componente `FoodScanner`.

**Solución**: Pasar la fecha seleccionada como prop.

```typescript
// Cambio en línea ~1256-1259
<FoodScanner
  open={showFoodScanner}
  onOpenChange={setShowFoodScanner}
  selectedDate={selectedDate.toISOString().split('T')[0]}  // Agregar esta prop
/>
```

### 3. `src/components/MealPhotoDialog.tsx`

**Problema**: No incluye `scanned_at` en la inserción a `food_scans`.

**Solución**:
- Agregar prop `selectedDate?: string` a la interfaz
- Construir el timestamp usando la fecha seleccionada
- Añadir `scanned_at` a la inserción

```typescript
// Cambio en la interfaz
interface MealPhotoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meal: Meal | null;
  selectedDate?: string;  // Agregar esta prop
  onPhotoSaved: (mealId: string) => void;
}

// Cambio en handleConfirm (línea ~104-119)
// Construir timestamp
const now = new Date();
let scannedAt: Date;

if (selectedDate) {
  const [year, month, day] = selectedDate.split('-').map(Number);
  scannedAt = new Date(year, month - 1, day, now.getHours(), now.getMinutes(), now.getSeconds());
} else {
  scannedAt = now;
}

const { error: insertError } = await supabase
  .from('food_scans')
  .insert({
    // ... campos existentes
    scanned_at: scannedAt.toISOString(),  // Agregar este campo
  });
```

### 4. `src/pages/Dashboard.tsx` (MealPhotoDialog)

**Problema**: No pasa `selectedDate` al componente `MealPhotoDialog`.

**Solución**: Pasar la fecha seleccionada como prop.

```typescript
// Buscar donde se renderiza MealPhotoDialog y agregar:
<MealPhotoDialog
  open={showMealPhotoDialog}
  onOpenChange={setShowMealPhotoDialog}
  meal={mealToComplete}
  selectedDate={selectedDate.toISOString().split('T')[0]}  // Agregar esta prop
  onPhotoSaved={(mealId) => completeMeal(mealId)}
/>
```

### 5. `src/pages/MealDetail.tsx`

**Problema**: El botón "Registrar ahora" navega a AI Camera sin pasar el parámetro `date`.

**Solución**: Agregar el parámetro de fecha a la navegación.

```typescript
// Línea ~353
// Necesita obtener date de searchParams primero
const [searchParams] = useSearchParams();
const selectedDate = searchParams.get('date') || new Date().toISOString().split('T')[0];

// Cambiar la navegación:
onClick={() => navigate(`/dashboard/ai-camera/${validMealType}?date=${selectedDate}`)}
```

---

## Resumen de Archivos a Modificar

1. **`src/components/FoodScanner.tsx`**
   - Agregar prop `selectedDate`
   - Agregar campo `scanned_at` a la inserción

2. **`src/components/MealPhotoDialog.tsx`**
   - Agregar prop `selectedDate`
   - Agregar campo `scanned_at` a la inserción

3. **`src/pages/Dashboard.tsx`**
   - Pasar `selectedDate` a `FoodScanner`
   - Pasar `selectedDate` a `MealPhotoDialog`

4. **`src/pages/MealDetail.tsx`**
   - Pasar parámetro `date` en la navegación

---

## Resultado Esperado

Después de implementar estos cambios:
- Todas las entradas de comida aparecerán en el día correcto según la selección del usuario
- Los círculos de progreso en el Dashboard se llenarán para el día visualizado
- No habrá más confusión entre "día actual" y "día seleccionado"
