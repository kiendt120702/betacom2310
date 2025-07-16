import { useState } from 'react';
import * as XLSX from 'xlsx';
import { useToast } from '@/hooks/use-toast';
import { ProductFormData, ProductDisplayData, SingleVariant, DoubleVariantOption } from '@/types/product';

export const useProductExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  // Định nghĩa đường dẫn đến file Excel mẫu và tên sheet mục tiêu
  const TEMPLATE_FILE_PATH = '/excel_templates/exported_Shopee_mau_dang_tai_san_pham.xlsx';
  const TARGET_SHEET_NAME = 'bản đăng tải'; // Tên sheet mà bạn muốn điền dữ liệu vào

  const getProductDisplayData = (product: ProductFormData): ProductDisplayData[] => {
    const displayData: ProductDisplayData[] = [];
    const baseData: Omit<ProductDisplayData, 'groupName1' | 'variant1Name' | 'groupName2' | 'variant2Name' | 'price' | 'stock' | 'weight'> = {
      category: product.category,
      productName: product.productName,
      description: product.description || '',
      productSku: '', // Hiện tại không thu thập trong form
      productCode: product.productCode || '',
      instant: product.instant,
      fast: product.fast,
      bulky: product.bulky,
      express: product.express,
      economic: product.economic, // Thêm economic vào baseData
      coverImage: product.coverImage || '',
      imagesPerVariant: '', // Hiện tại không thu thập trong form
      skuClassification: '', // Hiện tại không thu thập trong form
      sizeChartTemplate: '', // Hiện tại không thu thập trong form
      sizeChartImage: '', // Hiện tại không thu thập trong form
      productImage1: product.supplementaryImages[0] || '',
      productImage2: product.supplementaryImages[1] || '',
      productImage3: product.supplementaryImages[2] || '',
      productImage4: product.supplementaryImages[3] || '',
      productImage5: product.supplementaryImages[4] || '',
      productImage6: product.supplementaryImages[5] || '',
      productImage7: product.supplementaryImages[6] || '',
      productImage8: product.supplementaryImages[7] || '',
      preorderDTS: '', // Hiện tại không thu thập trong form
      failureReason: '', // Hiện tại không thu thập trong form
    };

    if (product.classificationType === 'single') {
      (product.variants1 as SingleVariant[]).forEach(variant => {
        displayData.push({
          ...baseData,
          groupName1: product.groupName1,
          variant1Name: variant.name,
          groupName2: '',
          variant2Name: '',
          price: variant.price,
          stock: variant.stock,
          weight: variant.weight,
        });
      });
    } else {
      if (product.combinations && product.combinations.length > 0) {
        product.combinations.forEach(combo => {
          const [variant1, variant2] = combo.combination.split(' - ');
          displayData.push({
            ...baseData,
            groupName1: product.groupName1,
            variant1Name: variant1,
            groupName2: product.groupName2 || '',
            variant2Name: variant2,
            price: combo.price,
            stock: combo.stock,
            weight: combo.weight,
          });
        });
      } else {
        // Fallback cho phân loại kép nếu các tổ hợp chưa được tạo hoặc rỗng
        const variants1 = product.variants1 as DoubleVariantOption[];
        const variants2 = product.variants2 as DoubleVariantOption[] || [];
        variants1.forEach(v1 => {
          variants2.forEach(v2 => {
            displayData.push({
              ...baseData,
              groupName1: product.groupName1,
              variant1Name: v1.name,
              groupName2: product.groupName2 || '',
              variant2Name: v2.name,
              price: 0, // Giá mặc định
              stock: 0, // Tồn kho mặc định
              weight: 0, // Cân nặng mặc định
            });
          });
        });
      }
    }
    return displayData;
  };

  const exportToExcel = async (products: ProductFormData[]) => {
    if (products.length === 0) {
      toast({
        title: "Không có sản phẩm",
        description: "Chưa có sản phẩm nào để xuất Excel.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);

    try {
      // 1. Tải file mẫu Excel
      const templateResponse = await fetch(TEMPLATE_FILE_PATH);
      if (!templateResponse.ok) {
        throw new Error(`Không thể tải file mẫu: ${templateResponse.statusText}`);
      }
      const templateArrayBuffer = await templateResponse.arrayBuffer();

      // 2. Đọc workbook từ file mẫu
      const workbook = XLSX.read(templateArrayBuffer, { type: 'array' });

      // 3. Lấy sheet mục tiêu
      const targetSheet = workbook.Sheets[TARGET_SHEET_NAME];
      if (!targetSheet) {
        throw new Error(`Không tìm thấy sheet "${TARGET_SHEET_NAME}" trong file mẫu.`);
      }

      // Chuẩn bị các hàng dữ liệu để chèn (không bao gồm tiêu đề, vì mẫu đã có)
      const dataRows: (string | number | boolean | null)[][] = [];
      products.forEach((product) => {
        const displayItems = getProductDisplayData(product);
        displayItems.forEach(item => {
          dataRows.push([
            item.category,
            item.productName,
            item.description,
            '', // Số lượng đặt hàng tối thiểu (not in data)
            item.productSku, // SKU sản phẩm (currently empty string)
            item.productCode,
            item.groupName1,
            item.variant1Name,
            item.imagesPerVariant, // Hình ảnh mỗi phân loại (currently empty string)
            item.groupName2,
            item.variant2Name,
            item.price,
            item.stock,
            item.skuClassification, // SKU phân loại (currently empty string)
            item.sizeChartTemplate, // Size Chart Template (currently empty string)
            item.sizeChartImage, // Size Chart Image (currently empty string)
            item.coverImage,
            item.productImage1,
            item.productImage2,
            item.productImage3,
            item.productImage4,
            item.productImage5,
            item.productImage6,
            item.productImage7,
            item.productImage8,
            item.weight,
            '', // Chiều dài (not in data)
            '', // Chiều rộng (not in data)
            '', // Chiều cao (not in data)
            item.instant ? "Bật" : "Tắt",
            item.fast ? "Bật" : "Tắt",
            item.economic ? "Bật" : "Tắt", // Ánh xạ economic sang 'Tiết kiệm'
            item.bulky ? "Bật" : "Tắt", // Ánh xạ bulky sang 'Hàng Cồng Kềnh'
            item.express ? "Bật" : "Tắt",
            item.preorderDTS, // Ngày chuẩn bị hàng cho đặt trước (Pre-order DTS) (currently empty string)
            item.failureReason, // Lý do thất bại (currently empty string)
          ]);
        });
      });

      // Xác định hàng bắt đầu cho dữ liệu mới.
      // Nếu sheet có một phạm vi được định nghĩa, bắt đầu sau hàng cuối cùng được sử dụng.
      // Nếu không, bắt đầu từ A1 (hàng 0).
      let startRow = 0; // Hàng 0-indexed, tương ứng với hàng 1 trong Excel
      if (targetSheet['!ref']) {
        const range = XLSX.utils.decode_range(targetSheet['!ref']);
        startRow = range.e.r + 1; // Bắt đầu từ hàng sau hàng cuối cùng được sử dụng
      }
      
      // Thêm dữ liệu vào sheet mục tiêu
      XLSX.utils.sheet_add_aoa(targetSheet, dataRows, { origin: startRow });

      // 4. Ghi workbook đã sửa đổi
      const now = new Date();
      const timestamp = now.toISOString().slice(0, 19).replace(/[:-]/g, "").replace("T", "_");
      const fileName = `DanhSachSanPham_Filled_${timestamp}.xlsx`; // Tên file mới để chỉ ra rằng nó đã được điền

      XLSX.writeFile(workbook, fileName);
      toast({
        title: "Xuất Excel thành công",
        description: "File Excel đã được tải về với dữ liệu đã điền.",
      });
    } catch (error: any) {
      console.error("Lỗi khi xuất Excel:", error);
      toast({
        title: "Lỗi",
        description: `Có lỗi xảy ra khi xuất file Excel: ${error.message}. Vui lòng thử lại!`,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportToExcel,
    isExporting
  };
};