import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
}

/**
 * Secure logging function that only logs in development environment.
 * Prevents sensitive information from being logged in production.
 */
export const secureLog = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development' || import.meta.env.DEV) {
    console.log(`[SECURE_LOG] ${message}`, data);
  }
};

/**
 * Validates a file based on size, type, and extension.
 */
export const validateFile = (file: File, options: { maxSize: number; allowedTypes: string[]; allowedExtensions: string[] }) => {
  const errors: string[] = [];
  const fileExtension = file.name.split('.').pop()?.toLowerCase();

  if (file.size > options.maxSize) {
    errors.push(`Kích thước file không được vượt quá ${options.maxSize / (1024 * 1024)}MB.`);
  }

  if (!options.allowedTypes.includes(file.type)) {
    errors.push(`Loại file không hợp lệ. Chỉ chấp nhận: ${options.allowedTypes.map(t => t.split('/')[1]).join(', ')}.`);
  }

  if (fileExtension && !options.allowedExtensions.includes(fileExtension)) {
    errors.push(`Định dạng file không hợp lệ. Chỉ chấp nhận: ${options.allowedExtensions.join(', ')}.`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Sanitizes input string to prevent XSS or other injection attacks.
 */
export const sanitizeInput = (input: string): string => {
  // Basic sanitization: remove HTML tags and common script patterns
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/[<>"']/g, (match) => {
      switch (match) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '"': return '&quot;';
        case "'": return '&#x27;';
        default: return match;
      }
    });
};

/**
 * Creates a simple rate limiter.
 * @param limit Max calls within the time window.
 * @param windowMs Time window in milliseconds.
 * @returns A function that returns true if call is allowed, false otherwise.
 */
export const createRateLimiter = (limit: number, windowMs: number) => {
  const calls = new Map<string, number[]>(); // Map<userId, [timestamps]>

  return (key: string): boolean => {
    const now = Date.now();
    const userCalls = calls.get(key) || [];

    // Remove old calls outside the window
    const recentCalls = userCalls.filter(timestamp => now - timestamp < windowMs);

    if (recentCalls.length >= limit) {
      return false; // Rate limit exceeded
    }

    recentCalls.push(now);
    calls.set(key, recentCalls);
    return true; // Call allowed
  };
};

/**
 * Validates password strength based on common criteria.
 */
export const validatePassword = (password: string) => {
  const errors: string[] = [];

  if (password.length < 6) {
    errors.push("Mật khẩu phải có ít nhất 6 ký tự.");
  }
  if (!/[a-zA-Z]/.test(password)) {
    errors.push("Mật khẩu phải chứa ít nhất một chữ cái.");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Mật khẩu phải chứa ít nhất một số.");
  }
  // Optional: Add special character requirement
  // if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
  //   errors.push("Mật khẩu phải chứa ít nhất một ký tự đặc biệt.");
  // }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates if a string is a valid URL.
 */
export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};