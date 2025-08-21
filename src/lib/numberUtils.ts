/**
 * Format a number into Vietnamese currency format (e.g., 1.000.000)
 * @param value The number to format
 * @returns A formatted string
 */
export const formatCurrency = (value: number | null | undefined): string => {
  if (value == null || isNaN(value)) return "";
  return new Intl.NumberFormat('vi-VN').format(value);
};

/**
 * Parse a formatted currency string back into a number
 * @param value The string to parse (e.g., "1.000.000")
 * @returns A number or null if invalid
 */
export const parseCurrency = (value: string | null | undefined): number | null => {
  if (value == null || typeof value !== 'string') return null;
  
  // Remove all non-digit characters
  const numericString = value.replace(/\D/g, '');
  
  if (numericString === '') return null;
  
  const number = parseInt(numericString, 10);
  return isNaN(number) ? null : number;
};