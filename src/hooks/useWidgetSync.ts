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
 * Syncs nutrition data for potential iOS Widget consumption.
 * Currently uses localStorage as fallback since native bridge plugin
 * is incompatible with Swift Package Manager.
 * 
 * Future: Implement native Swift UserDefaults sync via custom plugin
 * when SPM-compatible widget bridge becomes available.
 */
export async function syncToWidget(data: WidgetData): Promise<void> {
  // Only sync on native iOS
  if (Capacitor.getPlatform() !== "ios") {
    return;
  }

  try {
    // Store in localStorage as fallback
    // Native widget can potentially read this via WKWebView bridge
    localStorage.setItem(WIDGET_STORAGE_KEY, JSON.stringify(data));
    console.log("[WidgetSync] Data saved to localStorage:", data);
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
