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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface ShopPerformanceData {
  shop_name: string;
  personnel_name: string;
  leader_name: string;
  total_revenue: number;
  projected_revenue: number;
  feasible_goal: number | null;
  breakthrough_goal: number | null;
}

interface PerformanceDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryName: string | null;
  shops: ShopPerformanceData[];
}

const PerformanceDetailsDialog: React.FC<PerformanceDetailsDialogProps> = ({
  open,
  onOpenChange,
  categoryName,
  shops,
}) => {
  const formatCurrency = (value: number | null | undefined) => {
    if (value == null) return "N/A";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Danh sách Shop: {categoryName} ({shops.length})
          </DialogTitle>
          <DialogDescription>
            Chi tiết các shop thuộc hạng mục "{categoryName}".
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>STT</TableHead>
                    <TableHead>Tên Shop</TableHead>
                    <TableHead>Nhân sự</TableHead>
                    <TableHead>Leader</TableHead>
                    <TableHead className="text-right">Doanh số</TableHead>
                    <TableHead className="text-right">Dự kiến</TableHead>
                    <TableHead className="text-right">Mục tiêu</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shops.map((shop, index) => (
                    <TableRow key={shop.shop_name}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{shop.shop_name}</TableCell>
                      <TableCell>{shop.personnel_name}</TableCell>
                      <TableCell>{shop.leader_name}</TableCell>
                      <TableCell className="text-right">{formatCurrency(shop.total_revenue)}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(shop.projected_revenue)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(shop.feasible_goal)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PerformanceDetailsDialog;