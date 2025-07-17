import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ProductFormData } from '@/types/product';
import ProductHeader from '@/components/product-post/ProductHeader';
import ProductFormModal from '@/components/product-post/ProductFormModal';
import ProductTable from '@/components/product-post/ProductTable';
import ProductHistoryDialog from '@/components/product-post/ProductHistoryDialog';
import { useProductExport } from '@/hooks/useProductExport';
import { useProductHistory } from '@/hooks/useProductHistory';
// Removed: import AverageRatingCalculator from '@/components/product-post/AverageRatingCalculator';

const QuickProductPost: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [products, setProducts] = useState<ProductFormData[]>([]);
  const [editingProduct, setEditingProduct] = useState<ProductFormData | null>(null);
  const { toast } = useToast();
  const { exportToExcel, isExporting } = useProductExport();
  const { saveProduct } = useProductHistory();

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (data: ProductFormData) => {
    setProducts((prev) => [...prev, data]);
    
    // Lưu vào lịch sử
    saveProduct(data);
    
    toast({
      title: "Thành công",
      description: "Sản phẩm đã được thêm vào danh sách và lưu vào lịch sử.",
    });
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleExportExcel = () => {
    exportToExcel(products);
  };

  const handleViewHistory = () => {
    setIsHistoryOpen(true);
  };

  const handleLoadProductFromHistory = (product: ProductFormData) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <ProductHeader
          onAddProduct={handleAddProduct}
          onExportExcel={handleExportExcel}
          onViewHistory={handleViewHistory}
          isExporting={isExporting}
          productsCount={products.length}
        />
        <CardContent className="p-0">
          <ProductTable products={products} />
        </CardContent>
      </Card>

      {/* Removed: <AverageRatingCalculator /> */}

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingProduct}
      />

      <ProductHistoryDialog
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onLoadProduct={handleLoadProductFromHistory}
      />
    </div>
  );
};

export default QuickProductPost;