/**
 * Utility functions for managing shopping list cache
 */

/**
 * Clears the shopping list cache for a specific meal plan
 * @param mealPlanId - The ID of the meal plan to clear cache for
 */
export const clearShoppingListCache = (mealPlanId: string) => {
  const cacheKey = `chefly_shopping_${mealPlanId}`;
  localStorage.removeItem(cacheKey);
  console.log(`Cleared shopping list cache for meal plan: ${mealPlanId}`);
};

/**
 * Clears all shopping list caches
 * Used when a completely new meal plan is generated
 */
export const clearAllShoppingListCaches = () => {
  const keysToRemove: string[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('chefly_shopping_')) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  // Also clear purchased items when generating a new plan
  localStorage.removeItem('chefly_purchased_items');
  
  console.log(`Cleared ${keysToRemove.length} shopping list caches`);
};
