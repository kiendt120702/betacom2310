
import React from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, Eye } from 'lucide-react';
import { Product } from '@/types/product';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({ products, onEdit, onDelete }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Chưa có sản phẩm nào. Hãy thêm sản phẩm đầu tiên!</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ảnh</TableHead>
            <TableHead>Tên sản phẩm</TableHead>
            <TableHead>Ngành hàng</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Giá</TableHead>
            <TableHead>Tồn kho</TableHead>
            <TableHead>Phân loại</TableHead>
            <TableHead>Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                {product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                    <Eye className="w-4 h-4 text-gray-500" />
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-gray-500 truncate max-w-xs">
                    {product.description.slice(0, 100)}...
                  </div>
                </div>
              </TableCell>
              <TableCell>{product.category}</TableCell>
              <TableCell>
                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                  {product.sku}
                </span>
              </TableCell>
              <TableCell>{formatPrice(product.price)}</TableCell>
              <TableCell>{product.stock}</TableCell>
              <TableCell>
                {product.variations.length > 0 ? (
                  <div className="text-sm">
                    <div>{product.variations.length} phân loại</div>
                    {product.tier1Name && (
                      <div className="text-gray-500">{product.tier1Name}</div>
                    )}
                    {product.tier2Name && (
                      <div className="text-gray-500">{product.tier2Name}</div>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-500">Không có</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(product)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(product.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
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
