
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

const ReportTable: React.FC<ReportTableProps> = ({ data, sortConfig, requestSort }) => {
  const formatNumber = (num: number | null | undefined) => num != null ? new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(num) : '';

  const getRevenueCellColor = (
    projected: number,
    feasible: number | null | undefined,
    breakthrough: number | null | undefined
  ) => {
    if (feasible == null || breakthrough == null || projected <= 0 || feasible <= 0) {
      return "";
    }
    if (projected > breakthrough) return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200";
    if (projected >= feasible) return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200";
    if (projected >= feasible * 0.8) return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200";
    return "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200";
  };

  return (
    <div className="border rounded-md overflow-x-auto max-h-[70vh] overflow-y-auto">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-background">
          <TableRow>
            <TableHead className="bg-background">STT</TableHead>
            <TableHead className="bg-background">Tên Shop</TableHead>
            <TableHead className="bg-background">Nhân sự</TableHead>
            <TableHead className="bg-background">Leader</TableHead>
            <TableHead className="text-right bg-background">Mục tiêu khả thi (VND)</TableHead>
            <TableHead className="text-right bg-background">Mục tiêu đột phá (VND)</TableHead>
            <TableHead className="text-right bg-background">
              <Button variant="ghost" onClick={() => requestSort('total_revenue')} className="px-2 py-1 h-auto -mx-2">
                Doanh số xác nhận
                {sortConfig?.key === 'total_revenue' ? (
                  sortConfig.direction === 'asc' ? <TrendingUp className="ml-2 h-4 w-4" /> : <TrendingDown className="ml-2 h-4 w-4" />
                ) : (
                  <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground/50" />
                )}
              </Button>
            </TableHead>
            <TableHead className="text-right bg-background">Tăng trưởng</TableHead>
            <TableHead className="text-right bg-background">Doanh số dự kiến</TableHead>
            <TableHead className="text-right bg-background">Doanh số tháng trước</TableHead>
            <TableHead className="text-right bg-background">Doanh số đơn hủy</TableHead>
            <TableHead className="text-right bg-background">Doanh số trả hàng/hoàn tiền</TableHead>
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
                getRevenueCellColor={getRevenueCellColor}
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
};

export default ReportTable;
