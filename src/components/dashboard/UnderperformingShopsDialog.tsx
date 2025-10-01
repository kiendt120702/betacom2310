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
import { formatCurrency } from "@/lib/numberUtils";
import type { UnderperformingShop } from "@/types/reports";

interface UnderperformingShopsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  shops: UnderperformingShop[];
}

const UnderperformingShopsDialog: React.FC<UnderperformingShopsDialogProps> = ({
  isOpen,
  onOpenChange,
  shops,
}) => {

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
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
                <TableHead className="text-right">Doanh số xác nhận</TableHead>
                <TableHead className="text-right">Doanh số dự kiến</TableHead>
                <TableHead className="text-right">Mục tiêu khả thi</TableHead>
                <TableHead className="text-right">Mục tiêu đột phá</TableHead>
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
                    {formatCurrency(shop.projected_revenue)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(shop.feasible_goal || 0)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(shop.breakthrough_goal || 0)}
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