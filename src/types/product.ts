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
  productCode: string;
  groupName1: string;
  variant1Name: string;
  groupName2: string;
  variant2Name: string;
  price: number;
  stock: number;
  coverImage: string; // Placeholder for now
  weight: number;
  fast: boolean;
  bulky: boolean;
  express: boolean;
  // Add other fields from the Excel headers if needed
  imagesPerVariant: string;
  skuClassification: string;
  sizeChartTemplate: string;
  sizeChartImage: string;
  productImage1: string;
  productImage2: string;
  productImage3: string;
  productImage4: string;
  productImage5: string;
  productImage6: string;
  productImage7: string;
  productImage8: string;
  length: number;
  width: number;
  height: number;
  preorderDTS: string;
  failureReason: string;
}