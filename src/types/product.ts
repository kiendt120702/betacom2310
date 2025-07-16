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
  economic: boolean; // New field for 'Tiết kiệm'

  // Image fields
  coverImage: string | null;
  supplementaryImages: string[];
}

export interface ProductDisplayData {
  category: string;
  productName: string;
  description: string;
  
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
  economic: boolean; // Added to display data

  preorderDTS: string;
  failureReason: string;
}