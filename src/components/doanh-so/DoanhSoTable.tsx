
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { ComprehensiveReport } from "@/hooks/useComprehensiveReports";

interface DoanhSoTableProps {
  data: ComprehensiveReport[];
  isLoading: boolean;
}

const DoanhSoTable: React.FC<DoanhSoTableProps> = ({ data, isLoading }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatPercentage = (rate: number) => {
    return `${(rate * 100).toFixed(2)}%`;
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: vi });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Chưa có dữ liệu doanh số</p>
        <p className="text-sm mt-2">Vui lòng import file Excel để xem dữ liệu</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">Ngày</TableHead>
            <TableHead className="whitespace-nowrap">Tổng doanh số (VND)</TableHead>
            <TableHead className="whitespace-nowrap">Tổng số đơn hàng</TableHead>
            <TableHead className="whitespace-nowrap">Doanh số trung bình/đơn</TableHead>
            <TableHead className="whitespace-nowrap">Lượt nhấp sản phẩm</TableHead>
            <TableHead className="whitespace-nowrap">Lượt truy cập</TableHead>
            <TableHead className="whitespace-nowrap">Tỷ lệ chuyển đổi</TableHead>
            <TableHead className="whitespace-nowrap">Đơn đã hủy</TableHead>
            <TableHead className="whitespace-nowrap">Doanh số đã hủy</TableHead>
            <TableHead className="whitespace-nowrap">Đơn hoàn trả</TableHead>
            <TableHead className="whitespace-nowrap">Doanh số hoàn trả</TableHead>
            <TableHead className="whitespace-nowrap">Số người mua</TableHead>
            <TableHead className="whitespace-nowrap">Người mua mới</TableHead>
            <TableHead className="whitespace-nowrap">Người mua hiện tại</TableHead>
            <TableHead className="whitespace-nowrap">Người mua tiềm năng</TableHead>
            <TableHead className="whitespace-nowrap">Tỷ lệ quay lại</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((report) => (
            <TableRow key={report.id}>
              <TableCell className="font-medium">
                {formatDate(report.report_date)}
              </TableCell>
              <TableCell className="text-green-600 font-semibold">
                {formatCurrency(report.total_revenue)}
              </TableCell>
              <TableCell>{report.total_orders.toLocaleString('vi-VN')}</TableCell>
              <TableCell>{formatCurrency(report.average_order_value)}</TableCell>
              <TableCell>{report.product_clicks.toLocaleString('vi-VN')}</TableCell>
              <TableCell>{report.total_visits.toLocaleString('vi-VN')}</TableCell>
              <TableCell>{formatPercentage(report.conversion_rate)}</TableCell>
              <TableCell className="text-red-600">
                {report.cancelled_orders.toLocaleString('vi-VN')}
              </TableCell>
              <TableCell className="text-red-600">
                {formatCurrency(report.cancelled_revenue)}
              </TableCell>
              <TableCell className="text-orange-600">
                {report.returned_orders.toLocaleString('vi-VN')}
              </TableCell>
              <TableCell className="text-orange-600">
                {formatCurrency(report.returned_revenue)}
              </TableCell>
              <TableCell className="text-blue-600">
                {report.total_buyers.toLocaleString('vi-VN')}
              </TableCell>
              <TableCell className="text-blue-500">
                {report.new_buyers.toLocaleString('vi-VN')}
              </TableCell>
              <TableCell className="text-blue-700">
                {report.existing_buyers.toLocaleString('vi-VN')}
              </TableCell>
              <TableCell className="text-purple-600">
                {report.potential_buyers.toLocaleString('vi-VN')}
              </TableCell>
              <TableCell>{formatPercentage(report.buyer_return_rate)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DoanhSoTable;
