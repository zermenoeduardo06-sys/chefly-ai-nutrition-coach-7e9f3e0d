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
 * 
 * NOTE: capacitor-widgetsbridge-plugin was removed due to Capacitor 8 incompatibility.
 * Widget sync is now handled via localStorage as a fallback.
 * For native iOS widget support, implement in Swift via AppDelegate.
 */
export async function syncToWidget(data: WidgetData): Promise<void> {
  // Only sync on native iOS
  if (Capacitor.getPlatform() !== "ios") {
    return;
  }

  try {
    // Store data in localStorage as fallback
    // Native widget sync should be implemented in AppDelegate.swift
    localStorage.setItem("chefly_widget_data", JSON.stringify({
      ...data,
      appGroupId: APP_GROUP_ID,
    }));

    console.log("[WidgetSync] Data stored for widget:", data);
  } catch (error) {
    // Silently fail if storage not available
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
