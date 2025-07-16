
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Search, Calendar, Package } from 'lucide-react';
import { useProductHistory } from '@/hooks/useProductHistory';
import { ProductFormData } from '@/types/product';
import { format } from 'date-fns';

interface ProductHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadProduct?: (product: ProductFormData) => void;
}

const ProductHistoryDialog: React.FC<ProductHistoryDialogProps> = ({
  isOpen,
  onClose,
  onLoadProduct
}) => {
  const { history, isLoading, deleteProduct, isDeleting } = useProductHistory();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = history.filter(item =>
    item.product_data.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.product_data.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLoadProduct = (product: ProductFormData) => {
    if (onLoadProduct) {
      onLoadProduct(product);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] bg-background border-border">
        <DialogHeader className="border-b border-border pb-4">
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Package className="w-5 h-5" />
            Lịch Sử Sản Phẩm
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Tìm kiếm theo tên sản phẩm hoặc danh mục..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background border-border text-foreground"
            />
          </div>

          <ScrollArea className="h-[500px] pr-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-muted-foreground">Đang tải...</div>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <Package className="w-12 h-12 mb-2 opacity-50" />
                <div>Không có lịch sử sản phẩm nào</div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredHistory.map((item) => (
                  <Card key={item.id} className="border-border bg-card">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg text-card-foreground">
                            {item.product_data.productName}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(item.created_at), 'dd/MM/yyyy HH:mm')}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleLoadProduct(item.product_data)}
                            className="border-border text-foreground hover:bg-accent"
                          >
                            Tải lại
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteProduct(item.id)}
                            disabled={isDeleting}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                            {item.product_data.category}
                          </Badge>
                          <Badge variant="outline" className="border-border text-foreground">
                            {item.product_data.classificationType === 'single' ? 'Phân loại đơn' : 'Phân loại kép'}
                          </Badge>
                        </div>
                        {item.product_data.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {item.product_data.description}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductHistoryDialog;
