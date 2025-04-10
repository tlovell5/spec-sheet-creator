/**
 * Validation utilities for form inputs
 */

/**
 * Validates if a value is not empty
 * @param {*} value - The value to check
 * @returns {boolean} - True if value is not empty
 */
export const isNotEmpty = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
};

/**
 * Validates if a value is a valid number
 * @param {*} value - The value to check
 * @returns {boolean} - True if value is a valid number
 */
export const isNumber = (value) => {
  if (value === null || value === undefined || value === '') return false;
  return !isNaN(parseFloat(value)) && isFinite(value);
};

/**
 * Validates if a value is a valid percentage (0-100)
 * @param {*} value - The value to check
 * @returns {boolean} - True if value is a valid percentage
 */
export const isValidPercentage = (value) => {
  if (!isNumber(value)) return false;
  const num = parseFloat(value);
  return num >= 0 && num <= 100;
};

/**
 * Validates if a value is a positive number
 * @param {*} value - The value to check
 * @returns {boolean} - True if value is a positive number
 */
export const isPositiveNumber = (value) => {
  if (!isNumber(value)) return false;
  return parseFloat(value) > 0;
};

/**
 * Validates if a value is a non-negative number (zero or positive)
 * @param {*} value - The value to check
 * @returns {boolean} - True if value is a non-negative number
 */
export const isNonNegativeNumber = (value) => {
  if (!isNumber(value)) return false;
  return parseFloat(value) >= 0;
};

/**
 * Validates if a value is a valid email address
 * @param {string} value - The email to validate
 * @returns {boolean} - True if value is a valid email
 */
export const isValidEmail = (value) => {
  if (!value) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
};

/**
 * Validates if a value is within a specified range
 * @param {*} value - The value to check
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {boolean} - True if value is within range
 */
export const isInRange = (value, min, max) => {
  if (!isNumber(value)) return false;
  const num = parseFloat(value);
  return num >= min && num <= max;
};

/**
 * Validates if a date string is valid
 * @param {string} value - The date string to validate
 * @returns {boolean} - True if value is a valid date
 */
export const isValidDate = (value) => {
  if (!value) return false;
  const date = new Date(value);
  return !isNaN(date.getTime());
};

/**
 * Validates if a value matches a specific pattern
 * @param {string} value - The value to check
 * @param {RegExp} pattern - The regular expression pattern
 * @returns {boolean} - True if value matches the pattern
 */
export const matchesPattern = (value, pattern) => {
  if (!value) return false;
  return pattern.test(value);
};

/**
 * Creates a validation result object
 * @param {boolean} isValid - Whether the validation passed
 * @param {string} message - Error message if validation failed
 * @returns {Object} - Validation result object
 */
export const createValidationResult = (isValid, message = '') => ({
  isValid,
  message: isValid ? '' : message
});
