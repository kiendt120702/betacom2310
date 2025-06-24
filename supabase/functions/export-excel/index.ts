
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Product {
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
}

interface ProductVariation {
  id: string;
  name: string;
  price: number;
  stock: number;
  image?: string;
  tier1?: string;
  tier2?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { products } = await req.json();
    
    if (!products || !Array.isArray(products)) {
      throw new Error('Invalid products data');
    }

    // Create Excel data
    const excelData = [];
    
    for (const product of products) {
      if (product.variations && product.variations.length > 0) {
        // Product with variations
        for (const variation of product.variations) {
          const row = createExcelRow(product, variation);
          excelData.push(row);
        }
      } else {
        // Product without variations
        const row = createExcelRow(product);
        excelData.push(row);
      }
    }

    // Convert to CSV format (simple implementation)
    const headers = [
      'Ngành hàng', 'Tên sản phẩm', 'Mô tả sản phẩm', 'Số Lượng Mua Tối Đa',
      'Số Lượng Mua Tối Da - Ngày Bắt Đầu', 'Số Lượng Mua Tối Da - Thời Gian Kết Thúc',
      'Số lượng đặt hàng tối thiểu', 'SKU sản phẩm', 'Mã sản phẩm',
      'Tên nhóm phân loại hàng 1', 'Tên phân loại hàng 1', 'Hình Ảnh mối phân loại',
      'Tên nhóm phân loại hàng 2', 'Giá', 'Kho hàng', 'SKU phân loại',
      'Size Chart Template', 'Size Chart Image', 'Ảnh bìa',
      'Hình ảnh sản phẩm 1', 'Hình ảnh sản phẩm 2', 'Hình ảnh sản phẩm 3',
      'Hình ảnh sản phẩm 4', 'Hình ảnh sản phẩm 5', 'Hình ảnh sản phẩm 6',
      'Hình ảnh sản phẩm 7', 'Hình ảnh sản phẩm 8', 'Cân nặng',
      'Chiều dài', 'Chiều rộng', 'Chiều cao', 'Hóa Tốc', 'Nhanh',
      'Hàng Công kính', 'Tự Nhận Hàng'
    ];

    let csvContent = headers.join(',') + '\n';
    
    for (const row of excelData) {
      const values = headers.map(header => {
        const value = row[header] || '';
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvContent += values.join(',') + '\n';
    }

    // Convert CSV to Excel-like format
    const blob = new TextEncoder().encode(csvContent);

    return new Response(blob, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/vnd.ms-excel',
        'Content-Disposition': 'attachment; filename="san-pham-shopee.csv"',
      },
    });

  } catch (error) {
    console.error('Error in export-excel function:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function createExcelRow(product: Product, variation?: ProductVariation) {
  const baseRow = {
    'Ngành hàng': product.category,
    'Tên sản phẩm': product.name,
    'Mô tả sản phẩm': product.description,
    'Số Lượng Mua Tối Đa': 999999,
    'Số Lượng Mua Tối Da - Ngày Bắt Đầu': '',
    'Số Lượng Mua Tối Da - Thời Gian Kết Thúc': '',
    'Số lượng đặt hàng tối thiểu': 1,
    'SKU sản phẩm': product.sku,
    'Mã sản phẩm': product.sku,
    'Tên nhóm phân loại hàng 1': variation ? (product.tier1Name || 'Điều kiện bắt buộc') : 'Tùy chọn',
    'Tên phân loại hàng 1': variation ? (variation.tier1 || 'Điều kiện bắt buộc') : 'Điều kiện bắt buộc',
    'Hình Ảnh mối phân loại': 'Tùy chọn',
    'Tên nhóm phân loại hàng 2': variation && product.tier2Name ? product.tier2Name : 'Điều kiện bắt buộc',
    'Giá': variation ? variation.price : product.price,
    'Kho hàng': variation ? variation.stock : product.stock,
    'SKU phân loại': variation ? `${product.sku}-${variation.id}` : 'Tùy chọn',
    'Size Chart Template': 'Điều kiện bắt buộc',
    'Size Chart Image': 'Điều kiện bắt buộc',
    'Ảnh bìa': product.images[0] || 'Tùy chọn',
    'Hình ảnh sản phẩm 1': product.images[1] || 'Tùy chọn',
    'Hình ảnh sản phẩm 2': product.images[2] || 'Tùy chọn',
    'Hình ảnh sản phẩm 3': product.images[3] || 'Tùy chọn',
    'Hình ảnh sản phẩm 4': product.images[4] || 'Tùy chọn',
    'Hình ảnh sản phẩm 5': product.images[5] || 'Tùy chọn',
    'Hình ảnh sản phẩm 6': product.images[6] || 'Tùy chọn',
    'Hình ảnh sản phẩm 7': product.images[7] || 'Tùy chọn',
    'Hình ảnh sản phẩm 8': product.images[8] || 'Tùy chọn',
    'Cân nặng': product.weight,
    'Chiều dài': 10,
    'Chiều rộng': 10,
    'Chiều cao': 10,
    'Hóa Tốc': 'Điều kiện bắt buộc',
    'Nhanh': 'Điều kiện bắt buộc',
    'Hàng Công kính': 'Điều kiện bắt buộc',
    'Tự Nhận Hàng': 'Điều kiện bắt buộc'
  };

  // Handle second tier variation
  if (variation && variation.tier2) {
    baseRow['Tên nhóm phân loại hàng 2'] = product.tier2Name || 'Điều kiện bắt buộc';
  }

  return baseRow;
}
