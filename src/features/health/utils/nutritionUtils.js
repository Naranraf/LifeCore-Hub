/**
 * nutritionUtils — Local calculation engine for TIER 2 Nutrition.
 * 
 * Contains a local database of common foods and logic to calculate
 * macros based on weight in grams.
 */

export const FOOD_DATABASE = {
  pollo: { name: 'Pechuga de Pollo', protein: 0.31, carbs: 0, fat: 0.036 },
  arroz: { name: 'Arroz Blanco (Cocido)', protein: 0.027, carbs: 0.28, fat: 0.003 },
  huevo: { name: 'Huevo (Unidad ~50g)', protein: 0.13, carbs: 0.011, fat: 0.11 },
  avena: { name: 'Avena', protein: 0.169, carbs: 0.66, fat: 0.069 },
  carne_res: { name: 'Carne de Res', protein: 0.26, carbs: 0, fat: 0.15 },
  salmon: { name: 'Salmón', protein: 0.2, carbs: 0, fat: 0.13 },
  aguacate: { name: 'Aguacate', protein: 0.02, carbs: 0.085, fat: 0.15 },
};

/**
 * Calculates macros for a given weight and food type.
 * @param {string} foodId - Key in FOOD_DATABASE
 * @param {number} weightGrams - Weight in grams
 * @returns {object} { protein, carbs, fat, calories }
 */
export const calculateMacros = (foodId, weightGrams) => {
  const food = FOOD_DATABASE[foodId];
  if (!food) return { protein: 0, carbs: 0, fat: 0, calories: 0 };

  const protein = parseFloat((food.protein * weightGrams).toFixed(1));
  const carbs = parseFloat((food.carbs * weightGrams).toFixed(1));
  const fat = parseFloat((food.fat * weightGrams).toFixed(1));
  
  // Standard calorie calculation: 4 per P/C, 9 per F
  const calories = Math.round((protein * 4) + (carbs * 4) + (fat * 9));

  return { protein, carbs, fat, calories };
};
