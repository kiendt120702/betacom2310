import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, ArrowUpDown } from "lucide-react";
import ReportTableRow from "./ReportTableRow";

interface ReportTableProps {
  data: any[];
  sortConfig: { key: 'total_revenue'; direction: 'asc' | 'desc' } | null;
  requestSort: (key: 'total_revenue') => void;
}

const ReportTable: React.FC<ReportTableProps> = React.memo(({ data, sortConfig, requestSort }) => {
  const formatNumber = (num: number | null | undefined) => num != null ? new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(num) : '';

  const getRevenueCellColor = (
    projected: number,
    feasible: number | null | undefined,
    breakthrough: number | null | undefined,
    shopName?: string
  ) => {
    if (shopName?.includes('Tiệm Giày Bảo Ly')) {
      console.log('🔍 Tiệm Giày Bảo Ly - Color calculation:', { projected, feasible, breakthrough, shopName });
    }
    
    if (projected <= 0) {
      if (shopName?.includes('Tiệm Giày Bảo Ly')) {
        console.log('🔍 Tiệm Giày Bảo Ly - No color - invalid projected <= 0');
      }
      return "";
    }
    
    if (feasible == null && breakthrough == null) {
      if (shopName?.includes('Tiệm Giày Bảo Ly')) {
        console.log('🔍 Tiệm Giày Bảo Ly - No color - both goals missing');
      }
      return "";
    }
    if (breakthrough != null && projected > breakthrough) {
      if (shopName?.includes('Tiệm Giày Bảo Ly')) {
        console.log('🔍 Tiệm Giày Bảo Ly - GREEN - projected > breakthrough');
      }
      return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200";
    }
    if (feasible != null && feasible > 0 && projected >= feasible) {
      if (shopName?.includes('Tiệm Giày Bảo Ly')) {
        console.log('🔍 Tiệm Giày Bảo Ly - YELLOW - projected >= feasible');
      }
      return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200";
    }
    if (feasible != null && feasible > 0 && projected >= feasible * 0.8 && projected < feasible) {
      if (shopName?.includes('Tiệm Giày Bảo Ly')) {
        console.log('🔍 Tiệm Giày Bảo Ly - RED - 80% <= projected < feasible');
      }
      return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200";
    }
    if (shopName?.includes('Tiệm Giày Bảo Ly')) {
      console.log('🔍 Tiệm Giày Bảo Ly - PURPLE - projected < 80% feasible');
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
            <TableHead className="text-right">Tăng trưởng</TableHead>
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
              />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={12} className="text-center h-24">
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