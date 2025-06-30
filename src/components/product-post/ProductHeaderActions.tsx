import React from 'react';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Download, Package, Loader2 } from 'lucide-react';

interface ProductHeaderActionsProps {
  onAddProduct: () => void;
  onExportExcel: () => void;
  exporting: boolean;
  productsCount: number;
}

const ProductHeaderActions: React.FC<ProductHeaderActionsProps> = ({
  onAddProduct,
  onExportExcel,
  exporting,
  productsCount,
}) => {
  return (
    <CardHeader className="border-b border-gray-100 bg-white/60">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <CardTitle className="text-2xl text-gray-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-primary" />
            Đăng Nhanh Sản Phẩm
          </CardTitle>
          <p className="text-gray-600 mt-1">
            Thêm sản phẩm và xuất file Excel để đăng lên sàn thương mại điện tử.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={onAddProduct} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" />
            Thêm Sản Phẩm
          </Button>
          <Button onClick={onExportExcel} disabled={exporting || productsCount === 0} className="bg-success hover:bg-success/90 text-success-foreground">
            {exporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang xuất...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" /> Xuất Excel
              </>
            )}
          </Button>
        </div>
      </div>
    </CardHeader>
  );
};

export default ProductHeaderActions;