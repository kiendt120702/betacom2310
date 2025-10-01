import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

interface ReportTableRowProps {
  shopTotal: any;
  index: number;
  formatNumber: (num: number | null | undefined) => string;
  getRevenueCellColor: (projected: number, feasible: number | null | undefined, breakthrough: number | null | undefined, shopName?: string) => string;
  getShopStatus?: (shopData: any) => string;
  getStatusDisplay?: (status: string) => { text: string; color: string };
}

const ReportTableRow: React.FC<ReportTableRowProps> = React.memo(({ shopTotal, index, formatNumber, getRevenueCellColor, getShopStatus, getStatusDisplay }) => {
  const growth = shopTotal.like_for_like_previous_month_revenue > 0
    ? ((shopTotal.total_revenue - shopTotal.like_for_like_previous_month_revenue) / shopTotal.like_for_like_previous_month_revenue) * 100
    : shopTotal.total_revenue > 0 ? Infinity : 0;

  const cellColor = getRevenueCellColor(
    shopTotal.projected_revenue,
    shopTotal.feasible_goal,
    shopTotal.breakthrough_goal,
    shopTotal.shop_name
  );

  // Get shop status to determine row background color
  const shopStatus = getShopStatus ? getShopStatus(shopTotal) : '';
  const isStoppedShop = shopStatus === 'Đã Dừng';

  return (
    <TableRow 
      key={shopTotal.shop_id}
      className={cn(isStoppedShop && "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800")}
    >
      <TableCell>{index + 1}</TableCell>
      <TableCell>{shopTotal.shop_name}</TableCell>
      <TableCell className="whitespace-nowrap">
        {getShopStatus && getStatusDisplay ? (
          (() => {
            const status = getShopStatus(shopTotal);
            const statusDisplay = getStatusDisplay(status);
            return (
              <span className={cn("px-2 py-1 rounded-full text-xs font-medium", statusDisplay.color)}>
                {statusDisplay.text}
              </span>
            );
          })()
        ) : (
          'N/A'
        )}
      </TableCell>
      <TableCell className="whitespace-nowrap">{shopTotal.personnel_name}</TableCell>
      <TableCell className="whitespace-nowrap">{shopTotal.leader_name}</TableCell>
      <TableCell className="whitespace-nowrap text-right">
        {shopTotal.feasible_goal != null ? (
          formatNumber(shopTotal.feasible_goal)
        ) : (
          <span className="text-red-600 font-bold italic">Chưa điền</span>
        )}
      </TableCell>
      <TableCell className="whitespace-nowrap text-right">
        {shopTotal.breakthrough_goal != null ? (
          formatNumber(shopTotal.breakthrough_goal)
        ) : (
          <span className="text-red-600 font-bold italic">Chưa điền</span>
        )}
      </TableCell>
      <TableCell className={cn("whitespace-nowrap text-center", cellColor)}>
        <div className="text-sm font-semibold">{formatNumber(shopTotal.total_revenue)}</div>
        {shopTotal.last_report_date && (
          <div className="text-xs text-muted-foreground">
            {(() => {
              try {
                return `(${format(parseISO(shopTotal.last_report_date), 'dd/MM/yyyy')})`;
              } catch {
                return `(${shopTotal.last_report_date})`;
              }
            })()}
          </div>
        )}
      </TableCell>
      <TableCell className="whitespace-nowrap text-right font-bold">{formatNumber(shopTotal.projected_revenue)}</TableCell>
      <TableCell className="whitespace-nowrap text-right">{formatNumber(shopTotal.total_previous_month_revenue)}</TableCell>
      <TableCell className="whitespace-nowrap text-right">
        {shopTotal.like_for_like_previous_month_revenue > 0 ? (
          <div className={cn("flex items-center justify-end", 
            growth > 0 ? "text-green-600" : growth < 0 ? "text-red-600" : "text-gray-600"
          )}>
            {growth > 0 && <TrendingUp className="w-4 h-4 mr-1" />}
            {growth < 0 && <TrendingDown className="w-4 h-4 mr-1" />}
            <span className="font-semibold">
              {growth === Infinity ? '∞' : `${growth.toFixed(1)}%`}
            </span>
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </TableCell>
      <TableCell className="whitespace-nowrap text-right">{formatNumber(shopTotal.total_cancelled_revenue)}</TableCell>
      <TableCell className="whitespace-nowrap text-right">{formatNumber(shopTotal.total_returned_revenue)}</TableCell>
    </TableRow>
  );
});

ReportTableRow.displayName = "ReportTableRow";

export default ReportTableRow;