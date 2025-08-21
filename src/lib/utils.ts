import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Enhanced secure logging utility
export const secureLog = (message: string, data?: unknown) => {
  if (process.env.NODE_ENV === "development") {
    if (data) {
      // Filter out sensitive data before logging
      const sanitizedData = sanitizeLogData(data);
      console.log(`[${new Date().toISOString()}] ${message}`, sanitizedData);
    } else {
      console.log(`[${new Date().toISOString()}] ${message}`);
    }
  }
};

// Sanitize data for logging - remove sensitive fields
const sanitizeLogData = (data: unknown): unknown => {
  if (!data || typeof data !== "object") return data;

  const sensitive = [
    "password",
    "token",
    "secret",
    "key",
    "auth",
    "session",
    "email",
  ];
  const sanitized = { ...data };

  Object.keys(sanitized).forEach((key) => {
    if (sensitive.some((s) => key.toLowerCase().includes(s))) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof sanitized[key] === "object" && sanitized[key] !== null) {
      sanitized[key] = sanitizeLogData(sanitized[key]);
    }
  });

  return sanitized;
};