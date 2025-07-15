import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Download, Trash2, Circle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ProductHeaderProps {
  onAddProduct: () => void;
  onExportExcel: () => void;
  onClearHistory: () => void;
  isExporting: boolean;
  productsCount: number;
  sessionTitle?: string;
  hasUnsavedChanges?: boolean;
}

const ProductHeader: React.FC<ProductHeaderProps> = ({
  onAddProduct,
  onExportExcel,
  onClearHistory,
  isExporting,
  productsCount,
  sessionTitle = "Phiên làm việc",
  hasUnsavedChanges = false,
}) => {
  return (
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
      <div>
        <div className="flex items-center gap-2">
          <CardTitle className="text-2xl font-bold">Đăng Sản Phẩm Nhanh</CardTitle>
          {hasUnsavedChanges && (
            <div className="flex items-center gap-1 text-orange-600">
              <Circle className="w-2 h-2 fill-current" />
              <span className="text-xs font-medium">Chưa lưu</span>
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          <span className="font-medium">{sessionTitle}</span> • {productsCount} sản phẩm
          {hasUnsavedChanges && " • Có thay đổi chưa lưu"}
        </p>
      </div>
      <div className="flex gap-2">
        <Button onClick={onAddProduct} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Thêm Sản Phẩm
        </Button>
        
        <Button
          onClick={onExportExcel}
          disabled={productsCount === 0 || isExporting}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          {isExporting ? 'Đang xuất...' : 'Xuất Excel'}
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              disabled={productsCount === 0}
              variant="outline"
              className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
              Xóa Sản Phẩm
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận xóa sản phẩm</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc chắn muốn xóa toàn bộ {productsCount} sản phẩm trong phiên làm việc hiện tại? 
                Hành động này không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={onClearHistory}
                className="bg-red-600 hover:bg-red-700"
              >
                Xóa
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </CardHeader>
  );
};

export default ProductHeader;