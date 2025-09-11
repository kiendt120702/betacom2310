import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Users, Store } from "lucide-react";
import type { TiktokShop } from "@/types/tiktokShop";

interface TiktokShopListProps {
  shops: TiktokShop[];
  onEdit: (shop: TiktokShop) => void;
  onDelete: (shop: TiktokShop) => void;
  isLoading?: boolean;
}

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "Đang Vận Hành":
      return "default";
    case "Shop mới":
      return "secondary";
    case "Đã Dừng":
      return "destructive";
    default:
      return "outline";
  }
};

export const TiktokShopList: React.FC<TiktokShopListProps> = ({
  shops,
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  const handleDelete = (shop: TiktokShop) => {
    if (confirm(`Bạn có chắc chắn muốn xóa shop "${shop.name}"?`)) {
      onDelete(shop);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Store className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  if (shops.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Store className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Không tìm thấy shop nào</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tên Shop</TableHead>
          <TableHead>Loại</TableHead>
          <TableHead>Trạng thái</TableHead>
          <TableHead>Nhân sự phụ trách</TableHead>
          <TableHead>Ngày tạo</TableHead>
          <TableHead className="text-right">Thao tác</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {shops.map(shop => (
          <TableRow key={shop.id}>
            <TableCell className="font-medium">{shop.name}</TableCell>
            <TableCell>
              <Badge variant="outline">{shop.type}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant={getStatusBadgeVariant(shop.status)}>
                {shop.status}
              </Badge>
            </TableCell>
            <TableCell>
              {shop.profile ? (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {shop.profile.full_name || shop.profile.email}
                </div>
              ) : (
                <span className="text-muted-foreground">Chưa phân công</span>
              )}
            </TableCell>
            <TableCell>
              {new Date(shop.created_at).toLocaleDateString('vi-VN')}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(shop)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(shop)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};