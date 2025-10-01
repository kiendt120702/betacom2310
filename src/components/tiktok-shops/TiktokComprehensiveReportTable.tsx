import React, { useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/numberUtils";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { safeFormatDate } from "@/utils/dateUtils";

interface TiktokComprehensiveReportData {
  shop_id: string;
  shop_name: string;
  shop_status: string;
  type: 'Vận hành' | 'Booking';
  personnel_id?: string;
  personnel_name: string;
  personnel_account: string;
  leader_name: string;
  total_revenue: number;
  total_cancelled_revenue: number;
  total_returned_revenue: number;
  feasible_goal?: number | null;
  breakthrough_goal?: number | null;
  report_id?: string;
  last_report_date?: string;
  total_previous_month_revenue: number;
  like_for_like_previous_month_revenue: number;
  projected_revenue: number;
  platform_subsidized_revenue?: number;
  items_sold?: number;
  total_buyers?: number;
  total_visits?: number;
  store_visits?: number;
  sku_orders?: number;
  total_orders?: number;
  conversion_rate?: number;
}

// Utility functions similar to Shopee
const formatNumber = (num: number | null | undefined): string => 
  num != null ? new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(num) : '';

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
  breakthrough: number | null | undefined
): string => {
  if (projected <= 0) return "";
  if (feasible == null && breakthrough == null) return "";
  if (feasible === 0) {
    return "no-color";
  }

  if (breakthrough != null && projected > breakthrough) {
    return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200";
  } else if (
    feasible != null &&
    feasible > 0 &&
    projected >= feasible
  ) {
    return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200";
  } else if (
    feasible != null &&
    feasible > 0 &&
    projected >= feasible * 0.8 &&
    projected < feasible
  ) {
    return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200";
  } else {
    return "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200";
  }
};

interface TiktokComprehensiveReportTableProps {
  reports: TiktokComprehensiveReportData[];
}

const TiktokComprehensiveReportTable: React.FC<TiktokComprehensiveReportTableProps> = React.memo(({ reports }) => {
  if (reports.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Không có dữ liệu báo cáo cho lựa chọn này.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">STT</TableHead>
            <TableHead>Tên Shop</TableHead>
            <TableHead>Nhân sự</TableHead>
            <TableHead>Loại</TableHead>
            <TableHead className="text-right">Mục tiêu khả thi (VND)</TableHead>
            <TableHead className="text-right">Mục tiêu đột phá (VND)</TableHead>
            <TableHead className="text-right">Doanh số xác nhận</TableHead>
            <TableHead className="text-right">Doanh số dự kiến</TableHead>
            <TableHead className="text-right">Doanh số tháng trước</TableHead>
            <TableHead className="text-right">% Tăng trưởng</TableHead>
            <TableHead className="text-right">Doanh số đơn hủy (₫)</TableHead>
            <TableHead className="text-right">Hoàn tiền (₫)</TableHead>
            <TableHead className="text-right">Tỷ lệ chuyển đổi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report, index) => (
            <TableRow key={report.shop_id}>
              <TableCell className="text-center font-medium">{index + 1}</TableCell>
              <TableCell className="font-medium">{report.shop_name}</TableCell>
              <TableCell>{report.personnel_name}</TableCell>
              <TableCell>
                <Badge variant="outline">{report.type}</Badge>
              </TableCell>
              <TableCell className="text-right">
                {report.feasible_goal ? formatCurrency(report.feasible_goal) : "-"}
              </TableCell>
              <TableCell className="text-right">
                {report.breakthrough_goal ? formatCurrency(report.breakthrough_goal) : "-"}
              </TableCell>
              <TableCell className={cn("text-center", getRevenueCellColor(report.projected_revenue, report.feasible_goal, report.breakthrough_goal))}>
                <div className="text-sm font-semibold">{formatCurrency(report.total_revenue)}</div>
                {report.last_report_date && (
                  <div className="text-xs text-muted-foreground">
                    ({safeFormatDate(report.last_report_date, 'dd/MM/yyyy', report.last_report_date)})
                  </div>
                )}
              </TableCell>
              <TableCell className="text-right font-bold">{formatCurrency(report.projected_revenue)}</TableCell>
              <TableCell className="text-right font-bold">{formatCurrency(report.total_previous_month_revenue)}</TableCell>
              <TableCell className="whitespace-nowrap text-right">
                {(() => {
                  const growth = report.like_for_like_previous_month_revenue > 0
                    ? ((report.total_revenue - report.like_for_like_previous_month_revenue) / report.like_for_like_previous_month_revenue) * 100
                    : report.total_revenue > 0 ? Infinity : 0;
                  
                  if (report.like_for_like_previous_month_revenue > 0) {
                    return (
                      <div className={cn("flex items-center justify-end", 
                        growth > 0 ? "text-green-600" : growth < 0 ? "text-red-600" : "text-gray-600"
                      )}>
                        {growth > 0 && <TrendingUp className="w-4 h-4 mr-1" />}
                        {growth < 0 && <TrendingDown className="w-4 h-4 mr-1" />}
                        <span className="font-semibold">
                          {growth === Infinity ? '∞' : `${growth.toFixed(1)}%`}
                        </span>
                      </div>
                    );
                  } else {
                    return <span className="text-gray-400">-</span>;
                  }
                })()}
              </TableCell>
              <TableCell className="text-right">{formatCurrency(report.total_cancelled_revenue)}</TableCell>
              <TableCell className="text-right">{formatCurrency(report.total_returned_revenue)}</TableCell>
              <TableCell className="text-right">{report.conversion_rate ? `${report.conversion_rate.toFixed(2)}%` : '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
});

TiktokComprehensiveReportTable.displayName = 'TiktokComprehensiveReportTable';

export default TiktokComprehensiveReportTable;