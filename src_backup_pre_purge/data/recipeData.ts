import { InventoryItem, MealRecipe } from '../types';
import { InvoOrderItem } from './invoData';

// Initial default recipes linking meals to raw ingredients
export const DEFAULT_MEAL_RECIPES: Record<string, MealRecipe> = {
  // 1. مضغوط دجاج
  'chk-1': {
    mealId: 'chk-1',
    mealName: 'مضغوط دجاج',
    totalFoodCost: 0.650,
    ingredients: [
      { inventoryItemId: 'inv-1', name: 'دجاج مبرد طازج', quantity: 1, unit: 'حبة', unitCost: 0.400 },
      { inventoryItemId: 'inv-4', name: 'أرز بشاور هندي', quantity: 0.35, unit: 'كجم', unitCost: 0.150 },
      { inventoryItemId: 'inv-5', name: 'زيت وسمن بلدي', quantity: 0.05, unit: 'لتر', unitCost: 0.040 },
      { inventoryItemId: 'inv-6', name: 'توابل وبهارات مضغوط', quantity: 0.03, unit: 'كجم', unitCost: 0.030 },
      { inventoryItemId: 'inv-7', name: 'بصل وطماطم طازج', quantity: 0.15, unit: 'كجم', unitCost: 0.030 },
    ],
  },
  // 2. دجاج شواية
  'chk-2': {
    mealId: 'chk-2',
    mealName: 'دجاج شواية',
    totalFoodCost: 0.520,
    ingredients: [
      { inventoryItemId: 'inv-1', name: 'دجاج مبرد طازج', quantity: 1, unit: 'حبة', unitCost: 0.400 },
      { inventoryItemId: 'inv-5', name: 'زيت وسمن بلدي', quantity: 0.04, unit: 'لتر', unitCost: 0.030 },
      { inventoryItemId: 'inv-6', name: 'تتبيلة شواية خاصة', quantity: 0.04, unit: 'كجم', unitCost: 0.050 },
      { inventoryItemId: 'inv-8', name: 'علبة صوص وثومية', quantity: 1, unit: 'حبة', unitCost: 0.040 },
    ],
  },
  // 3. دجاج مظبي
  'chk-3': {
    mealId: 'chk-3',
    mealName: 'دجاج مظبي',
    totalFoodCost: 0.540,
    ingredients: [
      { inventoryItemId: 'inv-1', name: 'دجاج مبرد طازج', quantity: 1, unit: 'حبة', unitCost: 0.400 },
      { inventoryItemId: 'inv-6', name: 'بهارات مظبي صخرية', quantity: 0.04, unit: 'كجم', unitCost: 0.050 },
      { inventoryItemId: 'inv-5', name: 'زيت وسمن بلدي', quantity: 0.03, unit: 'لتر', unitCost: 0.025 },
      { inventoryItemId: 'inv-8', name: 'علبة شطة وصوص', quantity: 1, unit: 'حبة', unitCost: 0.040 },
    ],
  },
  // 4. ربع شواية مع بشاور
  'chk-4': {
    mealId: 'chk-4',
    mealName: 'ربع شواية مع بشاور',
    totalFoodCost: 0.380,
    ingredients: [
      { inventoryItemId: 'inv-1', name: 'دجاج مبرد طازج', quantity: 0.25, unit: 'حبة', unitCost: 0.100 },
      { inventoryItemId: 'inv-4', name: 'أرز بشاور هندي', quantity: 0.30, unit: 'كجم', unitCost: 0.130 },
      { inventoryItemId: 'inv-5', name: 'زيت وسمن بلدي', quantity: 0.03, unit: 'لتر', unitCost: 0.025 },
      { inventoryItemId: 'inv-8', name: 'علبة صوص وثومية', quantity: 1, unit: 'حبة', unitCost: 0.040 },
    ],
  },
  // 5. شواية مع بشاور
  'chk-5': {
    mealId: 'chk-5',
    mealName: 'شواية مع بشاور',
    totalFoodCost: 0.670,
    ingredients: [
      { inventoryItemId: 'inv-1', name: 'دجاج مبرد طازج', quantity: 1, unit: 'حبة', unitCost: 0.400 },
      { inventoryItemId: 'inv-4', name: 'أرز بشاور هندي', quantity: 0.40, unit: 'كجم', unitCost: 0.170 },
      { inventoryItemId: 'inv-5', name: 'زيت وسمن بلدي', quantity: 0.05, unit: 'لتر', unitCost: 0.040 },
      { inventoryItemId: 'inv-8', name: 'علبة صوص وثومية', quantity: 2, unit: 'حبة', unitCost: 0.060 },
    ],
  },
  // 6. مظبي مع بشاور
  'chk-6': {
    mealId: 'chk-6',
    mealName: 'مظبي مع بشاور',
    totalFoodCost: 0.680,
    ingredients: [
      { inventoryItemId: 'inv-1', name: 'دجاج مبرد طازج', quantity: 1, unit: 'حبة', unitCost: 0.400 },
      { inventoryItemId: 'inv-4', name: 'أرز بشاور هندي', quantity: 0.40, unit: 'كجم', unitCost: 0.170 },
      { inventoryItemId: 'inv-6', name: 'بهارات مظبي', quantity: 0.04, unit: 'كجم', unitCost: 0.050 },
      { inventoryItemId: 'inv-8', name: 'علبة صوص وثومية', quantity: 2, unit: 'حبة', unitCost: 0.060 },
    ],
  },
};

/**
 * Deduct raw inventory materials based on order items sold.
 * Returns the updated inventory list and an array of low-stock alert strings.
 */
export function deductInventoryForOrder(
  items: InvoOrderItem[],
  currentInventory: InventoryItem[],
  customRecipes: Record<string, MealRecipe> = DEFAULT_MEAL_RECIPES
): { updatedInventory: InventoryItem[]; alerts: string[]; totalCogs: number } {
  const updated = currentInventory.map(item => ({ ...item }));
  const alerts: string[] = [];
  let totalCogs = 0;

  items.forEach(orderItem => {
    // Find recipe by matching ID or item name
    const recipe = customRecipes[orderItem.id] || 
      Object.values(customRecipes).find(r => r.mealName === orderItem.name);

    if (recipe && recipe.ingredients && recipe.ingredients.length > 0) {
      recipe.ingredients.forEach(ing => {
        const totalNeeded = ing.quantity * orderItem.qty;
        totalCogs += (ing.unitCost || 0) * totalNeeded;

        // Find inventory item by ID, SKU, or name
        const invIdx = updated.findIndex(
          inv => inv.id === ing.inventoryItemId || inv.sku === ing.inventoryItemId || inv.name.includes(ing.name)
        );

        if (invIdx !== -1) {
          const prevStock = updated[invIdx].currentStock;
          const newStock = Math.max(0, Math.round((prevStock - totalNeeded) * 100) / 100);
          updated[invIdx].currentStock = newStock;

          // Check if it triggered low stock alert
          if (newStock <= updated[invIdx].minStock && prevStock > updated[invIdx].minStock) {
            alerts.push(`تنبيه مستودع: المادة (${updated[invIdx].name}) بلغت الحد الأدنى: ${newStock} ${updated[invIdx].unit}`);
          }
        }
      });
    } else {
      // Default heuristic: 30% of meal price as generic COGS if no recipe mapped
      totalCogs += orderItem.price * orderItem.qty * 0.32;
    }
  });

  return {
    updatedInventory: updated,
    alerts,
    totalCogs: Math.round(totalCogs * 1000) / 1000,
  };
}

/**
 * Calculate total COGS (Food Cost) for a list of settled invoices.
 */
export function calculateInvoicesCogs(
  orders: { items: InvoOrderItem[] }[],
  recipes: Record<string, MealRecipe> = DEFAULT_MEAL_RECIPES
): number {
  let cogs = 0;
  orders.forEach(ord => {
    ord.items.forEach(item => {
      const rec = recipes[item.id] || Object.values(recipes).find(r => r.mealName === item.name);
      if (rec && rec.totalFoodCost) {
        cogs += rec.totalFoodCost * item.qty;
      } else {
        cogs += item.price * item.qty * 0.32;
      }
    });
  });
  return Math.round(cogs * 1000) / 1000;
}
