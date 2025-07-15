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
  productName: string;
  description?: string;

  // Removed fields:
  // purchaseLimit?: number;
  // purchaseLimitStartDate?: string;
  // purchaseLimitEndDate?: string;
  // minOrderQuantity?: number;
  // length?: number;
  // width?: number;
  // height?: number;

  classificationType: ClassificationType;
  groupName1: string;
  variants1: SingleVariant[] | DoubleVariantOption[]; // Updated type to include DoubleVariantOption[]
  groupName2?: string;
  variants2?: DoubleVariantOption[]; // Updated type to DoubleVariantOption[] and made optional as per schema
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
  productName: string;
  description: string;
  
  // Removed fields:
  // purchaseLimit: number | string;
  // purchaseLimitStartDate: string;
  // purchaseLimitEndDate: string;
  // minOrderQuantity: number | string;
  // length: number | string;
  // width: number | string;
  // height: number | string;

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