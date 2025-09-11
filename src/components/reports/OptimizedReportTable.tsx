import React, { useMemo, useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, ArrowUpDown } from "lucide-react";
import { useReportContext } from "@/contexts/ReportContext";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import type { ShopReportData } from "@/types/reports";

// Pre-computed data type for better performance
interface ComputedShopData extends ShopReportData {
  _computed: {
    growth: number;
    growthDisplay: string;
    statusDisplay: { text: string; color: string };
    revenueCellColor: string;
    formattedRevenue: string;
    formattedProjectedRevenue: string;
    formattedPreviousRevenue: string;
    formattedCancelledRevenue: string;
    formattedReturnedRevenue: string;
    formattedFeasibleGoal: string;
    formattedBreakthroughGoal: string;
    formattedDate: string;
  };
}

// Memoized utility functions
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

// Memoized table row component
const OptimizedTableRow: React.FC<{ 
  shop: ComputedShopData; 
  index: number; 
}> = React.memo(({ shop, index }) => {
  const isStoppedShop = shop.shop_status === 'Đã Dừng';

  return (
    <TableRow 
      key={shop.shop_id}
      className={cn(isStoppedShop && "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800")}
    >
      <TableCell>{index + 1}</TableCell>
      <TableCell>{shop.shop_name}</TableCell>
      <TableCell className="whitespace-nowrap">
        <span className={cn("px-2 py-1 rounded-full text-xs font-medium", shop._computed.statusDisplay.color)}>
          {shop._computed.statusDisplay.text}
        </span>
      </TableCell>
      <TableCell className="whitespace-nowrap">{shop.personnel_name}</TableCell>
      <TableCell className="whitespace-nowrap">{shop.leader_name}</TableCell>
      <TableCell className="whitespace-nowrap text-right">
        {shop.feasible_goal != null ? (
          shop._computed.formattedFeasibleGoal
        ) : (
          <span className="text-red-600 font-bold italic">Chưa điền</span>
        )}
      </TableCell>
      <TableCell className="whitespace-nowrap text-right">
        {shop.breakthrough_goal != null ? (
          shop._computed.formattedBreakthroughGoal
        ) : (
          <span className="text-red-600 font-bold italic">Chưa điền</span>
        )}
      </TableCell>
      <TableCell className={cn("whitespace-nowrap text-center", shop._computed.revenueCellColor)}>
        <div className="text-sm font-semibold">{shop._computed.formattedRevenue}</div>
        {shop.last_report_date && (
          <div className="text-xs text-muted-foreground">
            ({shop._computed.formattedDate})
          </div>
        )}
      </TableCell>
      <TableCell className="whitespace-nowrap text-right font-bold">{shop._computed.formattedProjectedRevenue}</TableCell>
      <TableCell className="whitespace-nowrap text-right">{shop._computed.formattedPreviousRevenue}</TableCell>
      <TableCell className="whitespace-nowrap text-right">{shop._computed.formattedCancelledRevenue}</TableCell>
      <TableCell className="whitespace-nowrap text-right">{shop._computed.formattedReturnedRevenue}</TableCell>
    </TableRow>
  );
});

OptimizedTableRow.displayName = 'OptimizedTableRow';

/**
 * Optimized ReportTable with pre-computed data và memoization
 * Performance: Chỉ re-compute khi data thay đổi, không re-compute mỗi render
 */
const OptimizedReportTable: React.FC = React.memo(() => {
  const { data, sortConfig, requestSort, getShopStatus } = useReportContext();

  // Pre-compute all expensive operations với useMemo
  const computedData = useMemo((): ComputedShopData[] => {
    return data.map(shop => {
      // Calculate growth
      const growth = shop.like_for_like_previous_month_revenue > 0
        ? ((shop.total_revenue - shop.like_for_like_previous_month_revenue) / shop.like_for_like_previous_month_revenue) * 100
        : shop.total_revenue > 0 ? Infinity : 0;

      // Pre-compute all display values
      const statusDisplay = getStatusDisplay(getShopStatus(shop));
      const revenueCellColor = getRevenueCellColor(
        shop.projected_revenue,
        shop.feasible_goal,
        shop.breakthrough_goal
      );

      // Pre-format all numbers
      const formattedRevenue = formatNumber(shop.total_revenue);
      const formattedProjectedRevenue = formatNumber(shop.projected_revenue);
      const formattedPreviousRevenue = formatNumber(shop.total_previous_month_revenue);
      const formattedCancelledRevenue = formatNumber(shop.total_cancelled_revenue);
      const formattedReturnedRevenue = formatNumber(shop.total_returned_revenue);
      const formattedFeasibleGoal = formatNumber(shop.feasible_goal);
      const formattedBreakthroughGoal = formatNumber(shop.breakthrough_goal);
      
      const formattedDate = shop.last_report_date 
        ? format(parseISO(shop.last_report_date), 'dd/MM/yyyy')
        : '';

      const growthDisplay = growth !== Infinity && growth !== 0 ? growth.toFixed(2) + '%' : '';

      return {
        ...shop,
        _computed: {
          growth,
          growthDisplay,
          statusDisplay,
          revenueCellColor,
          formattedRevenue,
          formattedProjectedRevenue,
          formattedPreviousRevenue,
          formattedCancelledRevenue,
          formattedReturnedRevenue,
          formattedFeasibleGoal,
          formattedBreakthroughGoal,
          formattedDate,
        }
      };
    });
  }, [data, getShopStatus]);

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
          {computedData.length > 0 ? (
            computedData.map((shop, index) => (
              <OptimizedTableRow
                key={shop.shop_id}
                shop={shop}
                index={index}
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

OptimizedReportTable.displayName = 'OptimizedReportTable';

export default OptimizedReportTable;