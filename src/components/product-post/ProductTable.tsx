
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ProductFormData } from '@/types/product';

interface ProductTableProps {
  products: ProductFormData[];
}

const ProductTable: React.FC<ProductTableProps> = ({ products }) => {
  if (products.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>Chưa có sản phẩm nào được thêm.</p>
        <p className="text-sm mt-1">Nhấn "Thêm Sản Phẩm" để bắt đầu.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tên Sản Phẩm</TableHead>
            <TableHead>Mã SP</TableHead>
            <TableHead>Ngành Hàng</TableHead>
            <TableHead>Phân Loại</TableHead>
            <TableHead>Số Biến Thể</TableHead>
            <TableHead>Vận Chuyển</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{product.productName}</TableCell>
              <TableCell className="font-mono text-sm">{product.productCode}</TableCell>
              <TableCell>{product.category}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {product.classificationType === 'single' ? 'Đơn' : 'Kép'}
                </Badge>
              </TableCell>
              <TableCell>
                {product.classificationType === 'single' 
                  ? product.variants1.length 
                  : product.combinations?.length || 0}
              </TableCell>
              <TableCell>
                <div className="flex gap-1 flex-wrap">
                  {product.instant && <Badge variant="secondary" className="text-xs">Hỏa tốc</Badge>}
                  {product.fast && <Badge variant="secondary" className="text-xs">Nhanh</Badge>}
                  {product.bulky && <Badge variant="secondary" className="text-xs">Tiết kiệm</Badge>}
                  {product.express && <Badge variant="secondary" className="text-xs">Tủ nhận</Badge>}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductTable;
