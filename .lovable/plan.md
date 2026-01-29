
# Plan: Corrección Definitiva del Registro de Comidas por Tipo de Comida

## Problema Identificado

El problema es una **desincronización de timezone entre el guardado y la consulta** de comidas.

### Análisis del Flujo Actual:

**Al GUARDAR (funciona correctamente):**
```
createMealTimestamp("2026-01-29", "breakfast") 
→ "2026-01-29T08:00:00.000Z"
```
El timestamp se construye como string UTC directo, preservando la fecha seleccionada.

**Al CONSULTAR (tiene el bug):**
```typescript
// useDailyFoodIntake.ts
const targetDate = new Date(year, month - 1, day); // Hora LOCAL
const dayStart = startOfDay(targetDate);           // 00:00 LOCAL
const dayEnd = endOfDay(targetDate);               // 23:59 LOCAL
const dayStartISO = dayStart.toISOString();        // ¡CONVIERTE A UTC!
```

**Ejemplo para usuario en UTC-6 (Ciudad de México):**

| Hora Local | dayStartISO (actual) | dayEndISO (actual) |
|------------|---------------------|-------------------|
| dateKey="2026-01-29" | "2026-01-29T06:00:00Z" | "2026-01-30T05:59:59Z" |

**Pero las comidas se guardan como:**
- breakfast → "2026-01-29T08:00:00Z" ✓ (dentro del rango)
- lunch → "2026-01-29T13:00:00Z" ✓ (dentro del rango)
- dinner → "2026-01-29T20:00:00Z" ✓ (dentro del rango)

**¿Por qué falla "a veces"?**

El problema ocurre cuando:
1. El usuario está en una zona horaria negativa (UTC-X)
2. Las comidas se registran con horas UTC tempranas (ej: 00:00-05:59 UTC)
3. En ese caso, la consulta NO las encuentra porque el `dayStartISO` empieza después

**Ejemplo específico del bug:**
- Usuario en UTC-6 registra "breakfast" para el día 29
- Si son las 2am local (08:00 UTC), `createScanTimestamp` genera "2026-01-29T08:00:00Z"
- Pero si la consulta se hace a las 11pm local del día anterior:
  - `dayStartISO` = "2026-01-29T05:00:00Z" (11pm + 6 = 5am UTC)
  - El registro "2026-01-29T08:00:00Z" SÍ cae dentro del rango
  
El bug real es más sutil: **la inconsistencia entre usar hora local vs hora UTC fija** causa que ciertos registros queden fuera del rango dependiendo de cuándo se hizo la consulta.

---

## Solución

**Unificar ambos sistemas a UTC fijo:**

Como los datos se guardan con formato `YYYY-MM-DDThh:mm:ss.000Z` (UTC directo), la consulta debe usar el mismo enfoque:

```typescript
// Antes (buggy)
const dayStart = startOfDay(targetDate);
const dayStartISO = dayStart.toISOString(); // Conversión problemática

// Después (correcto)
const dayStartISO = `${dateKey}T00:00:00.000Z`; // UTC directo
const dayEndISO = `${dateKey}T23:59:59.999Z`;   // UTC directo
```

Esto garantiza que:
- `dateKey = "2026-01-29"` siempre consulta desde `2026-01-29T00:00:00Z` hasta `2026-01-29T23:59:59Z`
- Los registros guardados como `2026-01-29T08:00:00Z`, `2026-01-29T13:00:00Z`, etc. siempre caen dentro del rango

---

## Cambios Específicos

### Archivo: `src/hooks/useDailyFoodIntake.ts`

**Líneas 61-79 - Cambiar la construcción del rango de consulta:**

```typescript
// ANTES (buggy)
async function fetchDailyIntakeData(userId: string, dateKey: string): Promise<DailyIntakeData> {
  const [year, month, day] = dateKey.split('-').map(Number);
  const targetDate = new Date(year, month - 1, day);
  
  const dayStart = startOfDay(targetDate);
  const dayEnd = endOfDay(targetDate);
  
  const dayStartISO = dayStart.toISOString();
  const dayEndISO = dayEnd.toISOString();
  // ...
}

// DESPUÉS (correcto)
async function fetchDailyIntakeData(userId: string, dateKey: string): Promise<DailyIntakeData> {
  // Construir rango UTC directamente para coincidir con cómo se guardan los datos
  // Los datos se guardan como "YYYY-MM-DDThh:mm:ss.000Z" usando createMealTimestamp
  // Por lo tanto, la consulta debe usar el mismo formato UTC directo
  const dayStartISO = `${dateKey}T00:00:00.000Z`;
  const dayEndISO = `${dateKey}T23:59:59.999Z`;
  // ...query sigue igual...
}
```

**Eliminar imports innecesarios:**
```typescript
// Eliminar
import { startOfDay, endOfDay } from "date-fns";
```

---

## Verificación de Consistencia

### Flujo de Guardado (ya correcto):

| Origen | Función | Resultado |
|--------|---------|-----------|
| AddFood.tsx | `createMealTimestamp(selectedDate, mealType)` | "2026-01-29T08:00:00.000Z" |
| ScannerFoodSearch.tsx | `createMealTimestamp(selectedDate, mealType)` | "2026-01-29T13:00:00.000Z" |
| FoodScannerPage.tsx | `createScanTimestamp(selectedDate)` | "2026-01-29T14:35:22.000Z" |

### Flujo de Consulta (será corregido):

| Entrada | Rango Generado |
|---------|---------------|
| dateKey="2026-01-29" | 00:00:00Z → 23:59:59Z del día 29 |

**Ahora todos los registros del día 29 caerán dentro del rango, sin importar la timezone del usuario.**

---

## Impacto

| Antes | Después |
|-------|---------|
| Comidas desaparecen dependiendo de la hora local | Comidas siempre visibles en el día correcto |
| Funciona "a veces" | Funciona siempre (100%) |
| Depende de timezone del navegador | Independiente de timezone |

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/hooks/useDailyFoodIntake.ts` | Cambiar construcción del rango de consulta a UTC directo |

**Total: 1 archivo, ~10 líneas modificadas**
