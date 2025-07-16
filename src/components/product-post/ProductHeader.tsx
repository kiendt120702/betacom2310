
import React from 'react';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Download, Loader2 } from 'lucide-react';

interface ProductHeaderProps {
  onAddProduct: () => void;
  onExportExcel: () => void;
  isExporting: boolean;
  productsCount: number;
}

const ProductHeader: React.FC<ProductHeaderProps> = ({
  onAddProduct,
  onExportExcel,
  isExporting,
  productsCount
}) => {
  return (
    <CardHeader>
      <div className="flex justify-between items-center">
        <CardTitle>Danh Sách Sản Phẩm ({productsCount})</CardTitle>
        <div className="flex gap-2">
          <Button onClick={onAddProduct} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Thêm Sản Phẩm
          </Button>
          <Button
            variant="outline"
            onClick={onExportExcel}
            disabled={productsCount === 0 || isExporting}
            className="flex items-center gap-2"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Xuất Excel
          </Button>
        </div>
      </div>
    </CardHeader>
  );
};

export default ProductHeader;
