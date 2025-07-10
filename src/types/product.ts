export type ClassificationType = 'single' | 'double';

export interface SingleVariant {
  name: string;
  price: number;
  stock: number;
  weight: number;
}

// New interface for variants in double classification
export interface DoubleVariantOption {
  name: string;
}

export interface Combination {
  combination: string; // e.g., "Đỏ - M"
  price: number;
  stock: number;
  weight: number;
}

export interface ProductFormData {
  category: string;
  productCode: string;
  rawProductName: string; // New: User's initial product name
  seoProductName?: string; // New: AI-generated SEO product name
  description?: string;

  // New fields for SEO title generation
  mainKeywords?: string;
  productDetails?: string;
  brand?: string;
  existingSeoName?: string;

  purchaseLimit?: number;
  purchaseLimitStartDate?: string;
  purchaseLimitEndDate?: string;
  minOrderQuantity?: number;
  length?: number;
  width?: number;
  height?: number;

  classificationType: ClassificationType;
  groupName1: string;
  variants1: SingleVariant[] | DoubleVariantOption[];
  groupName2?: string;
  variants2?: DoubleVariantOption[];
  combinations?: Combination[];
  
  // Shipping
  instant: boolean;
  fast: boolean;
  bulky: boolean;
  express: boolean;

  coverImage: string | null;
  supplementaryImages: string[];
}

export interface ProductDisplayData {
  category: string;
  productName: string; // This will now represent seoProductName
  description: string;
  
  // New fields
  purchaseLimit: number | string;
  purchaseLimitStartDate: string;
  purchaseLimitEndDate: string;
  minOrderQuantity: number | string;
  length: number | string;
  width: number | string;
  height: number | string;

  productSku: string;
  productCode: string;
  groupName1: string;
  variant1Name: string;
  imagesPerVariant: string;
  groupName2: string;
  variant2Name: string;
  price: number;
  stock: number;
  skuClassification: string;
  sizeChartTemplate: string;
  sizeChartImage: string;
  coverImage: string;
  productImage1: string;
  productImage2: string;
  productImage3: string;
  productImage4: string;
  productImage5: string;
  productImage6: string;
  productImage7: string;
  productImage8: string;
  weight: number;
  
  // Shipping
  instant: boolean;
  fast: boolean;
  bulky: boolean;
  express: boolean;

  preorderDTS: string;
  failureReason: string;
}