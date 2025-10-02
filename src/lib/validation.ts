import { z } from 'zod';

// Enhanced validation schemas using Zod
export const userValidationSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Họ tên phải có ít nhất 2 ký tự')
    .max(100, 'Họ tên không được vượt quá 100 ký tự')
    .regex(/^[a-zA-ZÀ-ỹ\s]+$/, 'Họ tên chỉ được chứa chữ cái và khoảng trắng'),
  
  email: z
    .string()
    .email('Email không hợp lệ')
    .max(255, 'Email không được vượt quá 255 ký tự')
    .refine(
      (email) => !email.includes('..'),
      'Email không được chứa hai dấu chấm liên tiếp'
    ),
  
  password: z
    .string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .max(128, 'Mật khẩu không được vượt quá 128 ký tự')
    .regex(/^(?=.*[a-z])/, 'Mật khẩu phải chứa ít nhất 1 chữ thường')
    .regex(/^(?=.*[A-Z])/, 'Mật khẩu phải chứa ít nhất 1 chữ hoa')
    .regex(/^(?=.*\d)/, 'Mật khẩu phải chứa ít nhất 1 số')
    .regex(/^(?=.*[!@#$%^&*(),.?":{}|<>])/, 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt')
    .refine(
      (password) => !/^(password|123456|qwerty|abc123|admin)$/i.test(password),
      'Mật khẩu không được là các mẫu dễ đoán'
    ),
  
  role: z.enum(['admin', 'leader', 'chuyên viên', 'trưởng phòng', 'học việc/thử việc'], {
    errorMap: () => ({ message: 'Vai trò không hợp lệ' })
  }),
  
  department_id: z
    .string()
    .uuid('ID phòng ban không hợp lệ')
    .optional()
    .or(z.literal(''))
});

export const bannerValidationSchema = z.object({
  title: z
    .string()
    .min(1, 'Tiêu đề không được để trống')
    .max(200, 'Tiêu đề không được vượt quá 200 ký tự')
    .refine(
      (title) => !/<script|javascript:|on\w+=/i.test(title),
      'Tiêu đề chứa nội dung không an toàn'
    ),
  
  description: z
    .string()
    .max(1000, 'Mô tả không được vượt quá 1000 ký tự')
    .optional()
    .refine(
      (desc) => !desc || !/<script|javascript:|on\w+=/i.test(desc),
      'Mô tả chứa nội dung không an toàn'
    ),
  
  image_url: z
    .string()
    .url('URL hình ảnh không hợp lệ')
    .refine(
      (url) => /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(url),
      'URL phải là hình ảnh hợp lệ (jpg, jpeg, png, gif, webp)'
    ),
  
  category_id: z
    .string()
    .uuid('ID danh mục không hợp lệ')
    .optional(),
  
  priority: z
    .number()
    .int('Độ ưu tiên phải là số nguyên')
    .min(1, 'Độ ưu tiên tối thiểu là 1')
    .max(10, 'Độ ưu tiên tối đa là 10')
    .optional()
    .default(5)
});

export const seoValidationSchema = z.object({
  product_name: z
    .string()
    .min(1, 'Tên sản phẩm không được để trống')
    .max(200, 'Tên sản phẩm không được vượt quá 200 ký tự')
    .refine(
      (name) => !/<script|javascript:|on\w+=/i.test(name),
      'Tên sản phẩm chứa nội dung không an toàn'
    ),
  
  keywords: z
    .string()
    .max(500, 'Từ khóa không được vượt quá 500 ký tự')
    .optional(),
  
  description: z
    .string()
    .min(10, 'Mô tả phải có ít nhất 10 ký tự')
    .max(2000, 'Mô tả không được vượt quá 2000 ký tự')
    .optional()
});

export const fileValidationSchema = z.object({
  name: z
    .string()
    .min(1, 'Tên file không được để trống')
    .refine(
      (name) => !/\.(exe|bat|cmd|scr|php|jsp|asp)$/i.test(name),
      'Loại file không được phép'
    ),
  
  size: z
    .number()
    .max(10 * 1024 * 1024, 'Kích thước file không được vượt quá 10MB'),
  
  type: z
    .string()
    .refine(
      (type) => /^(image|video|audio|application\/pdf|text)\//.test(type),
      'Loại file không được hỗ trợ'
    )
});

export const searchValidationSchema = z.object({
  query: z
    .string()
    .max(100, 'Từ khóa tìm kiếm không được vượt quá 100 ký tự')
    .refine(
      (query) => !/<script|javascript:|on\w+=/i.test(query),
      'Từ khóa tìm kiếm chứa nội dung không an toàn'
    ),
  
  filters: z
    .record(z.string(), z.unknown())
    .optional()
});

export const paginationSchema = z.object({
  page: z
    .number()
    .int('Số trang phải là số nguyên')
    .min(1, 'Số trang tối thiểu là 1')
    .max(1000, 'Số trang tối đa là 1000'),
  
  limit: z
    .number()
    .int('Giới hạn phải là số nguyên')
    .min(1, 'Giới hạn tối thiểu là 1')
    .max(100, 'Giới hạn tối đa là 100')
});

// Utility function to validate data with better error handling
export const validateData = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string[]> } => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {};
      
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(err.message);
      });
      
      return { success: false, errors };
    }
    
    return {
      success: false,
      errors: { general: ['Lỗi validation không xác định'] }
    };
  }
};

// Custom validation functions for specific use cases
export const validateVietnameseText = (text: string): boolean => {
  // Allow Vietnamese characters, letters, numbers, and basic punctuation
  return /^[a-zA-ZÀ-ỹ0-9\s.,!?()-]+$/.test(text);
};

export const validatePhoneNumber = (phone: string): boolean => {
  // Vietnamese phone number format
  return /^(\+84|84|0)(3|5|7|8|9)[0-9]{8}$/.test(phone);
};

export const validateSlug = (slug: string): boolean => {
  // URL-friendly slug format
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
};

export const sanitizeHtml = (html: string): string => {
  // Basic HTML sanitization - remove script tags and event handlers
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '');
};

// Form validation helpers
export const createFormValidator = <T>(schema: z.ZodSchema<T>) => {
  return (data: unknown) => {
    const result = validateData(schema, data);
    
    if (!result.success) {
      // Explicitly assert the type of result to ensure 'errors' property is recognized
      const { errors } = result as { success: false; errors: Record<string, string[]> }; 
      const formErrors: Record<string, { message: string }> = {};
      
      Object.entries(errors).forEach(([field, messages]) => {
        formErrors[field] = { message: messages[0] };
      });
      
      return formErrors;
    }
    
    return {};
  };
};

// Export common validators
export type UserValidation = z.infer<typeof userValidationSchema>;
export type BannerValidation = z.infer<typeof bannerValidationSchema>;
export type SeoValidation = z.infer<typeof seoValidationSchema>;
export type FileValidation = z.infer<typeof fileValidationSchema>;
export type SearchValidation = z.infer<typeof searchValidationSchema>;
export type PaginationValidation = z.infer<typeof paginationSchema>;