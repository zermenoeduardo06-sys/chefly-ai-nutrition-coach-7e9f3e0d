/**
 * Utilidades de fecha para el manejo correcto de timestamps en registro de comidas.
 * Resuelve el problema de conversión de timezone donde las fechas locales se
 * desplazan al día anterior cuando se convierten a UTC.
 */

/**
 * Mapa de tiempos por defecto para cada tipo de comida
 */
const MEAL_TIME_MAP: Record<string, string> = {
  breakfast: '08:00:00',
  lunch: '13:00:00',
  dinner: '20:00:00',
  snack: '16:00:00',
};

/**
 * Obtiene la fecha local actual en formato YYYY-MM-DD.
 * NUNCA usa toISOString() que convierte a UTC.
 * 
 * @returns Fecha local como string (ej: "2026-01-29")
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Construye un timestamp ISO que preserva la fecha local seleccionada
 * sin sufrir conversiones de timezone al guardarse en la base de datos.
 * 
 * PROBLEMA QUE RESUELVE:
 * - `new Date("2026-01-28T08:00:00").toISOString()` en UTC-6 → "2026-01-27T14:00:00.000Z"
 * - El día 28 se convierte al 27, causando que la comida aparezca en el día incorrecto
 * 
 * SOLUCIÓN:
 * - Construir el string ISO directamente con sufijo 'Z' para que la fecha se preserve
 * - `"2026-01-28T08:00:00.000Z"` se guarda tal cual, preservando el día 28
 * 
 * @param selectedDate - Fecha en formato YYYY-MM-DD (ej: "2026-01-28")
 * @param mealType - Tipo de comida: 'breakfast', 'lunch', 'dinner', 'snack'
 * @returns Timestamp ISO con la fecha preservada (ej: "2026-01-28T08:00:00.000Z")
 * 
 * @example
 * createMealTimestamp("2026-01-28", "breakfast") 
 * // → "2026-01-28T08:00:00.000Z"
 */
export function createMealTimestamp(
  selectedDate: string,
  mealType: string
): string {
  // Validar formato de fecha
  if (!selectedDate || !/^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
    console.warn('[dateUtils] Invalid selectedDate format, using today:', selectedDate);
    selectedDate = getLocalDateString();
  }
  
  const time = MEAL_TIME_MAP[mealType] || '12:00:00';
  
  // Construir como UTC directamente para evitar conversión de timezone
  return `${selectedDate}T${time}.000Z`;
}

/**
 * Construye un timestamp ISO usando la fecha seleccionada y la hora actual.
 * Útil para el escáner de comida donde queremos capturar la hora exacta del escaneo.
 * 
 * @param selectedDate - Fecha en formato YYYY-MM-DD
 * @returns Timestamp ISO con fecha seleccionada y hora actual
 * 
 * @example
 * // Si son las 14:35:22
 * createScanTimestamp("2026-01-28")
 * // → "2026-01-28T14:35:22.000Z"
 */
export function createScanTimestamp(selectedDate: string): string {
  // Validar formato de fecha
  if (!selectedDate || !/^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
    console.warn('[dateUtils] Invalid selectedDate format, using today:', selectedDate);
    selectedDate = getLocalDateString();
  }
  
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  // Construir como UTC directamente
  return `${selectedDate}T${hours}:${minutes}:${seconds}.000Z`;
}
