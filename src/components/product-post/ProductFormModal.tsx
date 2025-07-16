
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ProductFormData } from '@/types/product';
import ProductForm from './ProductForm';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => void;
  initialData?: ProductFormData | null;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData
}) => {
  const title = initialData ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto bg-background border-border">
        <DialogHeader className="border-b border-border pb-4">
          <DialogTitle className="text-foreground">{title}</DialogTitle>
        </DialogHeader>
        <div className="bg-background">
          <ProductForm 
            onSubmit={onSubmit} 
            onCancel={onClose} 
            initialData={initialData}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormModal;
