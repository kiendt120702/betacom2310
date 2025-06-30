export type ClassificationType = 'single' | 'double';

export interface SingleVariant {
  name: string;
  price: number;
  stock: number;
  weight: number;
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
  classificationType: ClassificationType;
  groupName1: string;
  variants1: SingleVariant[] | string[]; // SingleVariant[] for 'single', string[] for 'double'
  groupName2?: string;
  variants2?: string[]; // Only for 'double'
  combinations?: Combination[]; // Only for 'double'
  fast: boolean;
  bulky: boolean;
  express: boolean;
}

export interface ProductDisplayData {
  category: string;
  productName: string;
  description: string;
  maxPurchaseQuantity: number; // New field
  maxPurchaseQuantityStartDate: string; // New field
  maxPurchaseQuantityApplyTimeDays: number; // New field
  maxPurchaseQuantityEndDate: string; // New field
  minOrderQuantity: number; // New field
  productSku: string; // New field
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
  coverImage: string; // Placeholder for now
  productImage1: string;
  productImage2: string;
  productImage3: string;
  productImage4: string;
  productImage5: string;
  productImage6: string;
  productImage7: string;
  productImage8: string;
  weight: number;
  length: number;
  width: number;
  height: number;
  fast: boolean;
  bulky: boolean;
  express: boolean;
  preorderDTS: string;
  failureReason: string;
}