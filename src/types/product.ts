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
  coverImage: string | null; // New: URL of the cover image
  supplementaryImages: string[]; // New: URLs of supplementary images (up to 8)
}

export interface ProductDisplayData {
  category: string;
  productName: string;
  description: string;
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
  coverImage: string; // Actual cover image URL
  productImage1: string;
  productImage2: string;
  productImage3: string;
  productImage4: string;
  productImage5: string;
  productImage6: string;
  productImage7: string;
  productImage8: string;
  weight: number;
  fast: boolean;
  bulky: boolean;
  express: boolean;
  preorderDTS: string;
  failureReason: string;
}