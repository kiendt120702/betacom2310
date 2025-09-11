import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TiktokComprehensiveReport } from "@/hooks/useTiktokComprehensiveReports";
import { formatCurrency } from "@/lib/numberUtils";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";

interface TiktokReportTableProps {
  reports: TiktokComprehensiveReport[];
}

const TiktokReportTable: React.FC<TiktokReportTableProps> = ({ reports }) => {
  return (
    <div className="border rounded-md overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ngày</TableHead>
            <TableHead className="text-right">Tổng giá trị hàng hóa (₫)</TableHead>
            <TableHead className="text-right">Hoàn tiền (₫)</TableHead>
            <TableHead className="text-right">Doanh thu có trợ cấp (₫)</TableHead>
            <TableHead className="text-right">Số món bán ra</TableHead>
            <TableHead className="text-right">Khách hàng</TableHead>
            <TableHead className="text-right">Lượt xem trang</TableHead>
            <TableHead className="text-right">Lượt truy cập Cửa hàng</TableHead>
            <TableHead className="text-right">Đơn hàng SKU</TableHead>
            <TableHead className="text-right">Đơn hàng</TableHead>
            <TableHead className="text-right">Tỷ lệ chuyển đổi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.length > 0 ? (
            reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell>{format(parseISO(report.report_date), "dd/MM/yyyy", { locale: vi })}</TableCell>
                <TableCell className="text-right">{formatCurrency(report.total_revenue)}</TableCell>
                <TableCell className="text-right">{formatCurrency(report.returned_revenue)}</TableCell>
                <TableCell className="text-right">{formatCurrency(report.platform_subsidized_revenue)}</TableCell>
                <TableCell className="text-right">{report.items_sold?.toLocaleString('vi-VN')}</TableCell>
                <TableCell className="text-right">{report.total_buyers?.toLocaleString('vi-VN')}</TableCell>
                <TableCell className="text-right">{report.total_visits?.toLocaleString('vi-VN')}</TableCell>
                <TableCell className="text-right">{report.store_visits?.toLocaleString('vi-VN')}</TableCell>
                <TableCell className="text-right">{report.sku_orders?.toLocaleString('vi-VN')}</TableCell>
                <TableCell className="text-right">{report.total_orders?.toLocaleString('vi-VN')}</TableCell>
                <TableCell className="text-right">{report.conversion_rate?.toFixed(2)}%</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={11} className="text-center h-24">
                Không có dữ liệu báo cáo cho lựa chọn này.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TiktokReportTable;