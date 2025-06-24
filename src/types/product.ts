
export interface ProductVariation {
  id: string;
  name: string;
  price: number;
  stock: number;
  image?: string;
  tier1?: string;
  tier2?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  weight: number;
  sku: string;
  images: string[];
  variations: ProductVariation[];
  tier1Name?: string;
  tier2Name?: string;
  createdAt: Date;
}

export interface ExcelRow {
  'Ngành hàng': string;
  'Tên sản phẩm': string;
  'Mô tả sản phẩm': string;
  'Số Lượng Mua Tối Đa': number;
  'Số Lượng Mua Tối Da - Ngày Bắt Đầu': string;
  'Số Lượng Mua Tối Da - Thời Gian Kết Thúc': string;
  'Số lượng đặt hàng tối thiểu': number;
  'SKU sản phẩm': string;
  'Mã sản phẩm': string;
  'Tên nhóm phân loại hàng 1': string;
  'Tên phân loại hàng 1': string;
  'Hình Ảnh mối phân loại': string;
  'Tên nhóm phân loại hàng 2': string;
  'Giá': number;
  'Kho hàng': number;
  'SKU phân loại': string;
  'Size Chart Template': string;
  'Size Chart Image': string;
  'Ảnh bìa': string;
  'Hình ảnh sản phẩm 1': string;
  'Hình ảnh sản phẩm 2': string;
  'Hình ảnh sản phẩm 3': string;
  'Hình ảnh sản phẩm 4': string;
  'Hình ảnh sản phẩm 5': string;
  'Hình ảnh sản phẩm 6': string;
  'Hình ảnh sản phẩm 7': string;
  'Hình ảnh sản phẩm 8': string;
  'Cân nặng': number;
  'Chiều dài': number;
  'Chiều rộng': number;
  'Chiều cao': number;
  'Hóa Tốc': string;
  'Nhanh': string;
  'Hàng Công kính': string;
  'Tự Nhận Hàng': string;
}
