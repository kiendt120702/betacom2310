import { format, parseISO, isValid } from 'date-fns';
import { vi } from 'date-fns/locale';

/**
 * Safely parses a date string and returns a Date object or null.
 * Handles ISO strings and common date formats.
 * @param dateString The date string to parse.
 * @returns A valid Date object or null.
 */
export const safeParseDate = (dateString: string | Date | null | undefined): Date | null => {
  if (!dateString) return null;
  if (dateString instanceof Date) {
    return isValid(dateString) ? dateString : null;
  }
  try {
    // parseISO is strict and good for YYYY-MM-DD
    const date = parseISO(dateString);
    if (isValid(date)) {
      return date;
    }
  } catch (e) {
    // Fallback for other formats
  }

  // A more lenient fallback
  const date = new Date(dateString);
  if (isValid(date)) {
    return date;
  }

  return null;
};

/**
 * Safely formats a date string into a specified format.
 * @param dateString The date string to format.
 * @param formatStr The desired format string.
 * @param fallback A fallback string if formatting fails.
 * @returns The formatted date string or the fallback.
 */
export const safeFormatDate = (
  dateString: string | Date | null | undefined,
  formatStr: string = "dd/MM/yyyy",
  fallback: string = "N/A"
): string => {
  const date = safeParseDate(dateString);
  if (!date) {
    // If the original string is a valid string, return it as a fallback
    if (typeof dateString === 'string' && dateString.trim() !== '') {
      return dateString;
    }
    return fallback;
  }
  try {
    return format(date, formatStr, { locale: vi });
  } catch (e) {
    return fallback;
  }
};