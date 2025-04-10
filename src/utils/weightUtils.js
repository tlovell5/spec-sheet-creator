/**
 * Utility functions for weight conversions and calculations
 */

/**
 * Convert weight from one unit to another
 * @param {number} value - The weight value to convert
 * @param {string} fromUnit - The unit to convert from (g, kg, oz, lb/lbs)
 * @param {string} toUnit - The unit to convert to (g, kg, oz, lb/lbs)
 * @returns {number} The converted weight value
 */
export const convertWeight = (value, fromUnit, toUnit) => {
  if (!value) return 0;
  
  // Convert to grams first
  let grams = 0;
  switch (fromUnit.toLowerCase()) {
    case 'g':
      grams = value;
      break;
    case 'kg':
      grams = value * 1000;
      break;
    case 'oz':
      grams = value * 28.35;
      break;
    case 'lb':
    case 'lbs':
      grams = value * 453.59;
      break;
    default:
      grams = value;
  }
  
  // Convert from grams to target unit
  switch (toUnit.toLowerCase()) {
    case 'g':
      return grams;
    case 'kg':
      return grams / 1000;
    case 'oz':
      return grams / 28.35;
    case 'lb':
    case 'lbs':
      return grams / 453.59;
    default:
      return grams;
  }
};

/**
 * Calculate the total weight of ingredients based on percentages
 * @param {Array} ingredients - Array of ingredient objects with percentage properties
 * @param {number} totalWeight - The total weight to calculate from
 * @param {string} weightUnit - The unit of the total weight
 * @returns {Array} Array of ingredients with calculated weights in lbs
 */
export const calculateIngredientWeights = (ingredients, totalWeight, weightUnit) => {
  if (!ingredients || !ingredients.length || !totalWeight) {
    return [];
  }
  
  // Convert total weight to lbs
  const totalWeightLbs = convertWeight(totalWeight, weightUnit, 'lbs');
  
  // Calculate weight for each ingredient
  return ingredients.map(ingredient => {
    const percentage = parseFloat(ingredient.percentage) || 0;
    const weight = (percentage / 100) * totalWeightLbs;
    
    return {
      ...ingredient,
      weight: weight.toFixed(2)
    };
  });
};

/**
 * Calculate the total case weight
 * @param {number} unitNetWeight - Net weight of a single unit in grams
 * @param {number} unitsPerCase - Number of units per case
 * @param {number} caseWeight - Weight of the case itself in grams
 * @returns {number} Total case weight in lbs
 */
export const calculateTotalCaseWeight = (unitNetWeight, unitsPerCase, caseWeight) => {
  const totalUnitWeight = unitNetWeight * unitsPerCase;
  const totalWeightGrams = totalUnitWeight + caseWeight;
  
  // Convert to lbs
  return convertWeight(totalWeightGrams, 'g', 'lbs');
};

/**
 * Calculate the total pallet weight
 * @param {number} totalCaseWeightLbs - Total weight of a case in lbs
 * @param {number} casesPerPallet - Number of cases per pallet
 * @returns {number} Total pallet weight in lbs
 */
export const calculatePalletWeight = (totalCaseWeightLbs, casesPerPallet) => {
  return totalCaseWeightLbs * casesPerPallet;
};
