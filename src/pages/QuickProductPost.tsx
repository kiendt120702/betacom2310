
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ProductFormData } from '@/types/product';
import ProductHeader from '@/components/product-post/ProductHeader';
import ProductFormModal from '@/components/product-post/ProductFormModal';
import ProductTable from '@/components/product-post/ProductTable';
import { useProductExport } from '@/hooks/useProductExport';

const QuickProductPost: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState<ProductFormData[]>([]);
  const { toast } = useToast();
  const { exportToExcel, isExporting } = useProductExport();

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

  const handleExportExcel = () => {
    exportToExcel(products);
  };

  return (
    <div className="space-y-6">
      <Card>
        <ProductHeader
          onAddProduct={handleAddProduct}
          onExportExcel={handleExportExcel}
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
