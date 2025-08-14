
import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { SalesReport } from "@/hooks/useSalesReports";
import { Skeleton } from "@/components/ui/skeleton";

interface SalesReportTableProps {
  salesReports: SalesReport[];
  isLoading: boolean;
}

const SalesReportTable = ({ salesReports, isLoading }: SalesReportTableProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getMonthName = (month: number) => {
    const months = [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];
    return months[month - 1];
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tháng</TableHead>
            <TableHead>Shop</TableHead>
            <TableHead>Nhân sự</TableHead>
            <TableHead>Leader</TableHead>
            <TableHead className="text-right">Doanh số xác nhận</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {salesReports.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                Chưa có dữ liệu báo cáo
              </TableCell>
            </TableRow>
          ) : (
            salesReports.map((report) => (
              <TableRow key={report.id}>
                <TableCell className="font-medium">
                  {getMonthName(report.month)} {report.year}
                </TableCell>
                <TableCell>{report.shops?.name || 'N/A'}</TableCell>
                <TableCell>{report.shops?.personnel?.name || 'N/A'}</TableCell>
                <TableCell>{report.shops?.leaders?.name || 'N/A'}</TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(report.total_sales)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default SalesReportTable;
