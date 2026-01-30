import { Capacitor } from "@capacitor/core";

interface WidgetData {
  currentCalories: number;
  goalCalories: number;
  currentProtein: number;
  goalProtein: number;
  currentCarbs: number;
  goalCarbs: number;
  currentFats: number;
  goalFats: number;
  lastUpdated: string;
}

const WIDGET_STORAGE_KEY = "chefly_widget_data";

/**
 * Syncs nutrition data for iOS Widget via localStorage fallback
 * Note: Native widget bridge plugin was removed due to SPM incompatibility
 * The widget data is stored in localStorage for potential future native implementation
 */
export async function syncToWidget(data: WidgetData): Promise<void> {
  try {
    // Store in localStorage as fallback
    localStorage.setItem(WIDGET_STORAGE_KEY, JSON.stringify(data));
    
    // Only log on native iOS for debugging
    if (Capacitor.getPlatform() === "ios") {
      console.log("[WidgetSync] Data stored in localStorage:", data);
    }
  } catch (error) {
    console.log("[WidgetSync] Widget sync skipped:", error);
  }
}

/**
 * Helper to create widget data from nutrition values
 */
export function createWidgetData(
  consumed: { calories: number; protein: number; carbs: number; fats: number },
  goals: { calories: number; protein: number; carbs: number; fats: number }
): WidgetData {
  return {
    currentCalories: Math.round(consumed.calories),
    goalCalories: Math.round(goals.calories),
    currentProtein: Math.round(consumed.protein),
    goalProtein: Math.round(goals.protein),
    currentCarbs: Math.round(consumed.carbs),
    goalCarbs: Math.round(goals.carbs),
    currentFats: Math.round(consumed.fats),
    goalFats: Math.round(goals.fats),
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Retrieve widget data from localStorage (for debugging)
 */
export function getWidgetData(): WidgetData | null {
  try {
    const data = localStorage.getItem(WIDGET_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}
