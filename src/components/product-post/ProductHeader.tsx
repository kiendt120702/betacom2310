
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Download, History } from 'lucide-react';

interface ProductHeaderProps {
  onAddProduct: () => void;
  onExportExcel: () => void;
  onViewHistory?: () => void;
  isExporting: boolean;
  productsCount: number;
}

const ProductHeader: React.FC<ProductHeaderProps> = ({
  onAddProduct,
  onExportExcel,
  onViewHistory,
  isExporting,
  productsCount
}) => {
  return (
    <CardHeader className="border-b border-border">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <CardTitle className="text-xl font-semibold text-card-foreground">
            Đăng Sản Phẩm Nhanh
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý và đăng sản phẩm lên Shopee một cách nhanh chóng
          </p>
        </div>
        <div className="flex items-center gap-3">
          {onViewHistory && (
            <Button
              variant="outline"
              onClick={onViewHistory}
              className="border-border text-foreground hover:bg-accent"
            >
              <History className="w-4 h-4 mr-2" />
              Lịch Sử
            </Button>
          )}
          <Button
            variant="outline"
            onClick={onExportExcel}
            disabled={productsCount === 0 || isExporting}
            className="border-border text-foreground hover:bg-accent"
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Đang xuất...' : 'Xuất Excel'}
          </Button>
          <Button 
            onClick={onAddProduct}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm Sản Phẩm
          </Button>
        </div>
      </div>
    </CardHeader>
  );
};

export default ProductHeader;
