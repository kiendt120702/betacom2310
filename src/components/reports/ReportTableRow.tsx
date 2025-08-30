import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

interface ReportTableRowProps {
  shopTotal: any;
  index: number;
  formatNumber: (num: number | null | undefined) => string;
  getRevenueCellColor: (projected: number, feasible: number | null | undefined, breakthrough: number | null | undefined) => string;
}

const ReportTableRow: React.FC<ReportTableRowProps> = ({ shopTotal, index, formatNumber, getRevenueCellColor }) => {
  const growth = shopTotal.like_for_like_previous_month_revenue > 0
    ? ((shopTotal.total_revenue - shopTotal.like_for_like_previous_month_revenue) / shopTotal.like_for_like_previous_month_revenue) * 100
    : shopTotal.total_revenue > 0 ? Infinity : 0;

  const cellColor = getRevenueCellColor(
    shopTotal.projected_revenue,
    shopTotal.feasible_goal,
    shopTotal.breakthrough_goal
  );

  return (
    <TableRow key={shopTotal.shop_id}>
      <TableCell>{index + 1}</TableCell>
      <TableCell>{shopTotal.shop_name}</TableCell>
      <TableCell className="whitespace-nowrap">{shopTotal.personnel_name}</TableCell>
      <TableCell className="whitespace-nowrap">{shopTotal.leader_name}</TableCell>
      <TableCell className="whitespace-nowrap text-right">
        {shopTotal.feasible_goal != null ? (
          formatNumber(shopTotal.feasible_goal)
        ) : (
          <span className="text-muted-foreground italic">Chưa điền</span>
        )}
      </TableCell>
      <TableCell className="whitespace-nowrap text-right">
        {shopTotal.breakthrough_goal != null ? (
          formatNumber(shopTotal.breakthrough_goal)
        ) : (
          <span className="text-muted-foreground italic">Chưa điền</span>
        )}
      </TableCell>
      <TableCell className={cn("whitespace-nowrap text-center", cellColor)}>
        <div className="text-sm font-semibold">{formatNumber(shopTotal.total_revenue)}</div>
        {shopTotal.last_report_date && (
          <div className="text-xs text-muted-foreground">
            ({format(parseISO(shopTotal.last_report_date), 'dd/MM/yyyy')})
          </div>
        )}
      </TableCell>
      <TableCell className="whitespace-nowrap text-right">
        {growth === Infinity ? (
          <span className="text-green-600 flex items-center justify-end gap-1">
            <TrendingUp className="h-4 w-4" /> Mới
          </span>
        ) : growth !== 0 ? (
          <span className={cn("flex items-center justify-end gap-1", growth > 0 ? "text-green-600" : "text-red-600")}>
            {growth > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {growth.toFixed(2)}%
          </span>
        ) : (
          <span className="text-muted-foreground">0.00%</span>
        )}
      </TableCell>
      <TableCell className="whitespace-nowrap text-right font-bold">{formatNumber(shopTotal.projected_revenue)}</TableCell>
      <TableCell className="whitespace-nowrap text-right">{formatNumber(shopTotal.total_previous_month_revenue)}</TableCell>
      <TableCell className="whitespace-nowrap text-right">{formatNumber(shopTotal.total_cancelled_revenue)}</TableCell>
      <TableCell className="whitespace-nowrap text-right">{formatNumber(shopTotal.total_returned_revenue)}</TableCell>
    </TableRow>
  );
};

export default ReportTableRow;