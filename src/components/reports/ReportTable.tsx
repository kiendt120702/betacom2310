import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, ArrowUpDown } from "lucide-react";
import ReportTableRow from "./ReportTableRow";

interface ReportTableProps {
  data: any[];
  sortConfig: { key: 'total_revenue'; direction: 'asc' | 'desc' } | null;
  requestSort: (key: 'total_revenue') => void;
  getShopStatus?: (shopData: any) => string;
}

const ReportTable: React.FC<ReportTableProps> = React.memo(({ data, sortConfig, requestSort, getShopStatus }) => {
  const formatNumber = (num: number | null | undefined) => num != null ? new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(num) : '';

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'Đang Vận Hành':
        return { text: 'Đang Vận Hành', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200' };
      case 'Shop mới':
        return { text: 'Shop mới', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' };
      case 'Đã Dừng':
        return { text: 'Đã Dừng', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200' };
      default:
        return { text: 'Chưa có', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200' };
    }
  };

  const getRevenueCellColor = (
    projected: number,
    feasible: number | null | undefined,
    breakthrough: number | null | undefined,
    shopName?: string
  ) => {
    if (projected <= 0) {
      return "";
    }
    
    if (feasible == null && breakthrough == null) {
      return "";
    }
    if (breakthrough != null && projected > breakthrough) {
      return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200";
    }
    if (feasible != null && feasible > 0 && projected >= feasible) {
      return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200";
    }
    if (feasible != null && feasible > 0 && projected >= feasible * 0.8 && projected < feasible) {
      return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200";
    }
    return "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200";
  };

  return (
    <div className="border rounded-md overflow-x-auto">
      <Table className="text-sm">
        <TableHeader>
          <TableRow>
            <TableHead>STT</TableHead>
            <TableHead>Tên Shop</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Nhân sự</TableHead>
            <TableHead>Leader</TableHead>
            <TableHead className="text-right">Mục tiêu khả thi (VND)</TableHead>
            <TableHead className="text-right">Mục tiêu đột phá (VND)</TableHead>
            <TableHead className="text-right">
              <Button variant="ghost" onClick={() => requestSort('total_revenue')} className="px-2 py-1 h-auto -mx-2">
                Doanh số xác nhận
                {sortConfig?.key === 'total_revenue' ? (
                  sortConfig.direction === 'asc' ? <TrendingUp className="ml-2 h-4 w-4" /> : <TrendingDown className="ml-2 h-4 w-4" />
                ) : (
                  <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground/50" />
                )}
              </Button>
            </TableHead>
            <TableHead className="text-right">Doanh số dự kiến</TableHead>
            <TableHead className="text-right">Doanh số tháng trước</TableHead>
            <TableHead className="text-right">Doanh số đơn hủy</TableHead>
            <TableHead className="text-right">Doanh số trả hàng/hoàn tiền</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((shopTotal, index) => (
              <ReportTableRow
                key={shopTotal.shop_id}
                shopTotal={shopTotal}
                index={index}
                formatNumber={formatNumber}
                getRevenueCellColor={(projected, feasible, breakthrough) => 
                  getRevenueCellColor(projected, feasible, breakthrough, shopTotal.shop_name)
                }
                getShopStatus={getShopStatus}
                getStatusDisplay={getStatusDisplay}
              />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={11} className="text-center h-24">
                Không có dữ liệu cho tháng đã chọn.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
});

ReportTable.displayName = "ReportTable";

export default ReportTable;