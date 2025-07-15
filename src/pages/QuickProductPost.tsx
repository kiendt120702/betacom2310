import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ProductFormData } from '@/types/product';
import ProductHeader from '@/components/product-post/ProductHeader';
import ProductFormModal from '@/components/product-post/ProductFormModal';
import ProductTable from '@/components/product-post/ProductTable';
import { useProductExport } from '@/hooks/useProductExport';

const STORAGE_KEY = 'quick-product-post-history';

const QuickProductPost: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState<ProductFormData[]>([]);
  const { toast } = useToast();
  const { exportToExcel, isExporting } = useProductExport();

  // Load dữ liệu từ localStorage khi component mount
  useEffect(() => {
    try {
      const savedProducts = localStorage.getItem(STORAGE_KEY);
      if (savedProducts) {
        const parsedProducts = JSON.parse(savedProducts);
        setProducts(parsedProducts);
        toast({
          title: "Khôi phục dữ liệu",
          description: `Đã khôi phục ${parsedProducts.length} sản phẩm từ lịch sử.`,
        });
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu từ localStorage:', error);
      toast({
        title: "Lỗi",
        description: "Không thể khôi phục dữ liệu từ lịch sử.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Lưu dữ liệu vào localStorage mỗi khi products thay đổi
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch (error) {
      console.error('Lỗi khi lưu dữ liệu vào localStorage:', error);
      toast({
        title: "Cảnh báo",
        description: "Không thể lưu dữ liệu vào lịch sử.",
        variant: "destructive",
      });
    }
  }, [products, toast]);

  const handleAddProduct = () => {
    setIsModalOpen(true);
  };

  const handleFormSubmit = (data: ProductFormData) => {
    setProducts((prev) => [...prev, data]);
    toast({
      title: "Thành công",
      description: "Sản phẩm đã được thêm vào danh sách và lưu vào lịch sử.",
    });
    setIsModalOpen(false);
  };

  const handleExportExcel = () => {
    exportToExcel(products);
  };

  const handleClearHistory = () => {
    setProducts([]);
    localStorage.removeItem(STORAGE_KEY);
    toast({
      title: "Đã xóa",
      description: "Đã xóa toàn bộ lịch sử sản phẩm.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <ProductHeader
          onAddProduct={handleAddProduct}
          onExportExcel={handleExportExcel}
          onClearHistory={handleClearHistory}
          isExporting={isExporting}
          productsCount={products.length}
        />
        <CardContent className="p-0">
          <ProductTable products={products} />
        </CardContent>
      </Card>

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};

export default QuickProductPost;