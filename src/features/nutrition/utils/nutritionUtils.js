/**
 * Nutrition Utilities — Macro Calculation & Database
 */

export const FOOD_DATABASE = {
  pollo: { name: 'Chicken Breast', protein: 31, carbs: 0, fat: 3.6, calories: 165 },
  arroz: { name: 'White Rice (Cooked)', protein: 2.7, carbs: 28, fat: 0.3, calories: 130 },
  huevo: { name: 'Boiled Egg', protein: 13, carbs: 1.1, fat: 11, calories: 155 },
  avena: { name: 'Oats', protein: 13, carbs: 68, fat: 7, calories: 389 },
  manzana: { name: 'Apple', protein: 0.3, carbs: 14, fat: 0.2, calories: 52 },
  platano: { name: 'Banana', protein: 1.1, carbs: 23, fat: 0.3, calories: 89 },
  aguacate: { name: 'Avocado', protein: 2, carbs: 8.5, fat: 15, calories: 160 },
  atun: { name: 'Canned Tuna', protein: 25, carbs: 0, fat: 1, calories: 116 },
  leche: { name: 'Milk (100ml)', protein: 3.3, carbs: 4.8, fat: 1.5, calories: 42 },
};

/**
 * Calculates macros based on weight in grams.
 * @param {string} foodId - Key in FOOD_DATABASE
 * @param {number} weightGrams - Weight in grams
 */
export function calculateMacros(foodId, weightGrams) {
  const food = FOOD_DATABASE[foodId];
  if (!food) return { protein: 0, carbs: 0, fat: 0, calories: 0 };

  const ratio = weightGrams / 100;
  return {
    protein: parseFloat((food.protein * ratio).toFixed(1)),
    carbs: parseFloat((food.carbs * ratio).toFixed(1)),
    fat: parseFloat((food.fat * ratio).toFixed(1)),
    calories: Math.round(food.calories * ratio)
  };
}
