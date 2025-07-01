import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import AppHeader from '@/components/AppHeader';
import { useToast } from '@/hooks/use-toast';
import { ProductFormData, SingleVariant, Combination, ProductDisplayData } from '@/types/product';
import ProductHeaderActions from '@/components/product-post/ProductHeaderActions';
import ProductForm from '@/components/product-post/ProductForm';
import ProductTableDisplay from '@/components/product-post/ProductTableDisplay';

const QuickProductPost: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState<ProductFormData[]>([]);
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);

  const handleAddProduct = () => {
    setIsModalOpen(true);
  };

  const handleFormSubmit = (data: ProductFormData) => {
    setProducts((prev) => [...prev, data]);
    toast({
      title: "Thành công",
      description: "Sản phẩm đã được thêm vào danh sách.",
    });
    setIsModalOpen(false);
  };

  const handleFormCancel = () => {
    setIsModalOpen(false);
  };

  const getProductDisplayDataForExport = (product: ProductFormData): ProductDisplayData[] => {
    const displayData: ProductDisplayData[] = [];
    const baseData = {
      category: product.category,
      productName: product.productName,
      description: product.description || '',
      productSku: '', // Placeholder
      productCode: product.productCode,
      fast: product.fast,
      bulky: product.bulky,
      express: product.express,
      coverImage: product.coverImage || '', // Use actual cover image
      imagesPerVariant: '', // Placeholder, usually for variant-specific images
      skuClassification: '', // Placeholder
      sizeChartTemplate: '', // Placeholder
      sizeChartImage: '', // Placeholder
      productImage1: product.supplementaryImages[0] || '',
      productImage2: product.supplementaryImages[1] || '',
      productImage3: product.supplementaryImages[2] || '',
      productImage4: product.supplementaryImages[3] || '',
      productImage5: product.supplementaryImages[4] || '',
      productImage6: product.supplementaryImages[5] || '',
      productImage7: product.supplementaryImages[6] || '',
      productImage8: product.supplementaryImages[7] || '',
      weight: 0, // Placeholder, will be set by variant/combination
      preorderDTS: '', // Placeholder
      failureReason: '', // Placeholder
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
        const variants1 = product.variants1 as string[];
        const variants2 = product.variants2 || [];
        variants1.forEach(v1 => {
          variants2.forEach(v2 => {
            displayData.push({
              ...baseData,
              groupName1: product.groupName1,
              variant1Name: v1,
              groupName2: product.groupName2 || '',
              variant2Name: v2,
              price: 0,
              stock: 0,
              weight: 0,
            });
          });
        });
      }
    }
    return displayData;
  };

  const handleExportExcel = () => {
    if (products.length === 0) {
      toast({
        title: "Không có sản phẩm",
        description: "Chưa có sản phẩm nào để xuất Excel.",
        variant: "destructive",
      });
      return;
    }

    setExporting(true);

    const excelData: (string | number | boolean | null)[][] = []; // Allow null in excelData

    const headers = [
      "Ngành hàng",
      "Tên sản phẩm",
      "Mô tả sản phẩm",
      "SKU sản phẩm",
      "Mã sản phẩm",
      "Tên nhóm phân loại hàng 1",
      "Tên phân loại hàng cho nhóm phân loại hàng 1",
      "Hình ảnh mỗi phân loại",
      "Tên nhóm phân loại hàng 2",
      "Tên phân loại hàng cho nhóm phân loại hàng 2",
      "Giá (VNĐ)",
      "Kho hàng",
      "SKU phân loại",
      "Size Chart Template",
      "Size Chart Image",
      "Ảnh bìa",
      "Hình ảnh sản phẩm 1",
      "Hình ảnh sản phẩm 2",
      "Hình ảnh sản phẩm 3",
      "Hình ảnh sản phẩm 4",
      "Hình ảnh sản phẩm 5",
      "Hình ảnh sản phẩm 6",
      "Hình ảnh sản phẩm 7",
      "Hình ảnh sản phẩm 8",
      "Cân nặng (g)",
      "Hỏa Tốc",
      "Nhanh", // New column
      "Hàng Cồng Kềnh",
      "Tủ Nhận Hàng",
      "Ngày chuẩn bị hàng cho đặt trước (Pre-order DTS)",
      "Lý do thất bại"
    ];

    excelData.push(headers);

    products.forEach((product) => {
      const displayItems = getProductDisplayDataForExport(product);
      displayItems.forEach(item => {
        excelData.push([
          item.category,
          item.productName,
          item.description,
          item.productSku,
          item.productCode,
          item.groupName1,
          item.variant1Name,
          item.imagesPerVariant,
          item.groupName2,
          item.variant2Name,
          item.price,
          item.stock,
          item.skuClassification,
          item.sizeChartTemplate,
          item.sizeChartImage,
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
          item.fast ? "Bật" : "Tắt",
          "Tắt", // Placeholder for 'Nhanh'
          item.bulky ? "Bật" : "Tắt",
          item.express ? "Bật" : "Tắt",
          item.preorderDTS,
          item.failureReason,
        ]);
      });
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelData);

    const colWidths = headers.map(header => ({ wch: Math.max(header.length, 15) }));
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, "Danh sách sản phẩm");

    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace(/[:-]/g, "").replace("T", "_");
    const fileName = `DanhSachSanPham_${timestamp}.xlsx`;

    try {
      XLSX.writeFile(wb, fileName);
      toast({
        title: "Xuất Excel thành công",
        description: "File Excel đã được tải về.",
      });
    } catch (error) {
      console.error("Lỗi khi xuất Excel:", error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi xuất file Excel. Vui lòng thử lại!",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <ProductHeaderActions
            onAddProduct={handleAddProduct}
            onExportExcel={handleExportExcel}
            exporting={exporting}
            productsCount={products.length}
          />
          <CardContent className="p-0">
            <ProductTableDisplay products={products} />
          </CardContent>
        </Card>
      </div>

      {/* Product Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Thêm Sản Phẩm Mới</DialogTitle>
          </DialogHeader>
          <ProductForm onSubmit={handleFormSubmit} onCancel={handleFormCancel} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuickProductPost;