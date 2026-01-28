
## Plan: Corrección del Bug de Fecha en Registro de Comidas

### Problema Detectado
Cuando un usuario agrega comida, el `scanned_at` se guarda con un día de diferencia debido a la conversión de zona horaria. Por ejemplo:
- Usuario selecciona: **28 de enero, 08:00** (hora local México UTC-6)
- Se guarda como: **27 de enero, 14:00 UTC** (día anterior)

### Causa Técnica
```typescript
// PROBLEMA: Esta fecha local se convierte a UTC, perdiendo el día correcto
new Date(`${selectedDate}T${mealTime}`).toISOString()
```

La función `toISOString()` convierte la hora local a UTC, restando el offset del timezone y potencialmente cambiando la fecha al día anterior.

---

## Solución Propuesta

### 1. Crear Función Utilitaria para Timestamps

Crear una función helper que construya un timestamp ISO preservando la fecha local seleccionada:

```text
src/lib/dateUtils.ts (NUEVO ARCHIVO)
```

```typescript
/**
 * Construye un timestamp ISO que preserva la fecha local seleccionada
 * sin sufrir conversiones de timezone al guardarse.
 * 
 * Ejemplo: Si selectedDate = "2026-01-28" y mealTime = "08:00:00"
 * Retorna: "2026-01-28T08:00:00.000Z" (la fecha 28 se preserva)
 */
export function createMealTimestamp(
  selectedDate: string, 
  mealType: string
): string {
  const mealTimeMap: Record<string, string> = {
    breakfast: '08:00:00',
    lunch: '13:00:00', 
    dinner: '20:00:00',
    snack: '16:00:00',
  };
  
  const time = mealTimeMap[mealType] || '12:00:00';
  
  // Construir como UTC directamente para evitar conversión
  return `${selectedDate}T${time}.000Z`;
}
```

---

### 2. Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/lib/dateUtils.ts` | Crear nuevo archivo con la función helper |
| `src/components/scanner/ScannerFoodSearch.tsx` | Usar nueva función para `scanned_at` |
| `src/pages/AddFood.tsx` | Usar nueva función para `scanned_at` |
| `src/pages/FoodScannerPage.tsx` | Usar nueva función para `scanned_at` |

---

### 3. Cambios Específicos

#### `ScannerFoodSearch.tsx` (líneas 113-138)
Reemplazar:
```typescript
const getTimeForMeal = (type: string): string => { ... };

// En handleAddFood:
const mealTime = getTimeForMeal(mealType);
let scannedAtDate = new Date(`${selectedDate}T${mealTime}`);
if (isNaN(scannedAtDate.getTime())) {
  scannedAtDate = new Date();
}
const scannedAt = scannedAtDate.toISOString();
```

Por:
```typescript
import { createMealTimestamp } from '@/lib/dateUtils';

// En handleAddFood:
const scannedAt = createMealTimestamp(selectedDate, mealType);
```

#### `AddFood.tsx` (líneas 191-227)
Reemplazar la lógica de construcción de fecha por la función helper.

#### `FoodScannerPage.tsx` (líneas 132-136)
Para el scanner de IA, usar la hora actual pero con la fecha seleccionada:
```typescript
const now = new Date();
const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:00`;
const scannedAt = `${selectedDate}T${timeStr}.000Z`;
```

---

### 4. Verificación de Consultas

Revisar que `useDailyFoodIntake.ts` usa correctamente los límites de día local para filtrar. Actualmente usa `startOfDay()` y `endOfDay()` de date-fns que respetan la zona horaria local.

---

### Resultado Esperado

| Escenario | Antes (Bug) | Después (Corregido) |
|-----------|-------------|---------------------|
| Usuario en UTC-6 registra comida para hoy 08:00 | Se guarda como ayer 14:00 UTC | Se guarda como hoy 08:00 UTC |
| Dashboard muestra comidas del día | No aparece (día incorrecto) | Aparece correctamente |

---

### Resumen Técnico

- **Problema**: `new Date(localString).toISOString()` aplica conversión timezone
- **Solución**: Construir el string ISO directamente con sufijo `Z` para que la fecha se preserve tal cual
- **Impacto**: 3 archivos de entrada de comida + 1 nuevo archivo utilitario
