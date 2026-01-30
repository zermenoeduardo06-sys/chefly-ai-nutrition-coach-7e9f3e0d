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

const APP_GROUP_ID = "group.app.lovable.chefly";

/**
 * Syncs nutrition data to iOS Widget via shared UserDefaults
 * This allows the Lock Screen Widget to display current calorie progress
 */
export async function syncToWidget(data: WidgetData): Promise<void> {
  // Only sync on native iOS
  if (Capacitor.getPlatform() !== "ios") {
    return;
  }

  try {
    // Dynamically import the widget bridge plugin
    const plugin = await import("capacitor-widgetsbridge-plugin");
    const WidgetsBridge = plugin.WidgetsBridgePlugin;

    // Save data to shared UserDefaults (App Group)
    await WidgetsBridge.setItem({
      key: "nutritionData",
      value: JSON.stringify(data),
      group: APP_GROUP_ID,
    });

    // Request widget timeline reload
    await WidgetsBridge.reloadTimelines({
      ofKind: "CaloriesWidget",
    });

    console.log("[WidgetSync] Data synced to widget:", data);
  } catch (error) {
    // Silently fail if plugin not available or widget not configured
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
