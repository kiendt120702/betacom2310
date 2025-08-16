import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ShopPerformanceData {
  shop_name: string;
  total_revenue: number;
  feasible_goal: number | null | undefined;
  deficit: number;
}

interface UnderperformingShopsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  shops: ShopPerformanceData[];
}

const UnderperformingShopsDialog: React.FC<UnderperformingShopsDialogProps> = ({
  isOpen,
  onOpenChange,
  shops,
}) => {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(value);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Các Shop không đạt mục tiêu</DialogTitle>
          <DialogDescription>
            Danh sách các shop chưa đạt được mục tiêu khả thi trong tháng.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên Shop</TableHead>
                <TableHead className="text-right">Doanh thu</TableHead>
                <TableHead className="text-right">Mục tiêu</TableHead>
                <TableHead className="text-right">Còn thiếu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shops.map((shop) => (
                <TableRow key={shop.shop_name}>
                  <TableCell className="font-medium">{shop.shop_name}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(shop.total_revenue)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(shop.feasible_goal || 0)}
                  </TableCell>
                  <TableCell className="text-right text-red-600">
                    {formatCurrency(shop.deficit)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UnderperformingShopsDialog;