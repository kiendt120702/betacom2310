import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ProductFormData } from '@/types/product';
import ProductHeader from '@/components/product-post/ProductHeader';
import ProductFormModal from '@/components/product-post/ProductFormModal';
import ProductTable from '@/components/product-post/ProductTable';
import ProductSidebar from '@/components/product-post/ProductSidebar';
import { useProductExport } from '@/hooks/useProductExport';
import { useProductSessions } from '@/hooks/useProductSessions';

const QuickProductPost: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const { exportToExcel, isExporting } = useProductExport();
  
  const {
    sessions,
    currentSessionId,
    currentProducts,
    hasUnsavedChanges,
    createNewSession,
    selectSession,
    saveCurrentSession,
    deleteSession,
    renameSession,
    addProduct,
    clearCurrentProducts,
  } = useProductSessions();

  const handleAddProduct = () => {
    setIsModalOpen(true);
  };

  const handleFormSubmit = (data: ProductFormData) => {
    addProduct(data);
    toast({
      title: "Thành công",
      description: "Sản phẩm đã được thêm vào phiên làm việc hiện tại.",
    });
    setIsModalOpen(false);
  };

  const handleExportExcel = () => {
    exportToExcel(currentProducts);
  };

  const handleClearHistory = () => {
    clearCurrentProducts();
    toast({
      title: "Đã xóa",
      description: "Đã xóa toàn bộ sản phẩm trong phiên làm việc hiện tại.",
    });
  };

  const currentSession = sessions.find(s => s.id === currentSessionId);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <ProductSidebar
        sessions={sessions}
        selectedSessionId={currentSessionId}
        onSelectSession={selectSession}
        onNewSession={createNewSession}
        onDeleteSession={deleteSession}
        onRenameSession={renameSession}
        onSaveCurrentSession={saveCurrentSession}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-6">
          <div className="space-y-6">
            <Card>
              <ProductHeader
                onAddProduct={handleAddProduct}
                onExportExcel={handleExportExcel}
                onClearHistory={handleClearHistory}
                isExporting={isExporting}
                productsCount={currentProducts.length}
                sessionTitle={currentSession?.title || "Phiên làm việc"}
                hasUnsavedChanges={hasUnsavedChanges}
              />
              <CardContent className="p-0">
                <ProductTable products={currentProducts} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};

export default QuickProductPost;