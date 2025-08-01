import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Enhanced secure logging utility
export const secureLog = (message: string, data?: any) => {
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
const sanitizeLogData = (data: any): any => {
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

// Enhanced password validation with security requirements
export const validatePassword = (password: string) => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Mật khẩu phải có ít nhất 8 ký tự");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Mật khẩu phải chứa ít nhất 1 chữ hoa");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Mật khẩu phải chứa ít nhất 1 chữ thường");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Mật khẩu phải chứa ít nhất 1 số");
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt");
  }

  // Check for common weak patterns
  const weakPatterns = [/123456/, /password/i, /qwerty/i, /abc123/i, /admin/i];

  if (weakPatterns.some((pattern) => pattern.test(password))) {
    errors.push("Mật khẩu không được chứa các mẫu dễ đoán");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Enhanced input sanitization
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== "string") return "";

  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, "") // Remove event handlers
    .slice(0, 1000); // Limit length
};

// File validation utility
export const validateFile = (
  file: File,
  options: {
    maxSize?: number;
    allowedTypes?: string[];
    allowedExtensions?: string[];
  },
) => {
  const errors: string[] = [];
  const {
    maxSize = 10 * 1024 * 1024,
    allowedTypes = [],
    allowedExtensions = [],
  } = options;

  // Check file size
  if (file.size > maxSize) {
    errors.push(
      `Kích thước file vượt quá ${Math.round(maxSize / (1024 * 1024))}MB`,
    );
  }

  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    errors.push(
      `Loại file không được phép. Chỉ chấp nhận: ${allowedTypes.join(", ")}`,
    );
  }

  // Check file extension
  if (allowedExtensions.length > 0) {
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !allowedExtensions.includes(extension)) {
      errors.push(
        `Phần mở rộng file không được phép. Chỉ chấp nhận: ${allowedExtensions.join(", ")}`,
      );
    }
  }

  // Check for suspicious file names
  const suspiciousPatterns = [
    /\.exe$/i,
    /\.bat$/i,
    /\.cmd$/i,
    /\.scr$/i,
    /\.php$/i,
    /\.jsp$/i,
    /\.asp$/i,
  ];

  if (suspiciousPatterns.some((pattern) => pattern.test(file.name))) {
    errors.push("Tên file có vẻ nguy hiểm");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Rate limiting utility
export const createRateLimiter = (maxRequests: number, windowMs: number) => {
  const requests = new Map<string, number[]>();

  return (identifier: string): boolean => {
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!requests.has(identifier)) {
      requests.set(identifier, []);
    }

    const userRequests = requests.get(identifier)!;
    // Remove old requests outside the window
    const validRequests = userRequests.filter((time) => time > windowStart);

    if (validRequests.length >= maxRequests) {
      return false; // Rate limit exceeded
    }

    validRequests.push(now);
    requests.set(identifier, validRequests);
    return true;
  };
};

// Enhanced URL validation
export const validateUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    // Only allow https and http protocols
    return ["https:", "http:"].includes(parsedUrl.protocol);
  } catch {
    return false;
  }
};

// Content security validation
export const validateContent = (
  content: string,
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check for script tags
  if (/<script/i.test(content)) {
    errors.push("Nội dung chứa script tag không được phép");
  }

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /javascript:/i,
    /vbscript:/i,
    /onload=/i,
    /onerror=/i,
    /onclick=/i,
  ];

  if (suspiciousPatterns.some((pattern) => pattern.test(content))) {
    errors.push("Nội dung chứa mã độc hại");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
