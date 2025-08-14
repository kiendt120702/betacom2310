import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useComprehensiveReports } from "@/hooks/useComprehensiveReports";
import { BarChart3, Calendar } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import ComprehensiveReportUpload from "@/components/admin/ComprehensiveReportUpload";

const generateMonthOptions = () => {
  const options = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    options.push({
      value: format(date, "yyyy-MM"),
      label: format(date, "MMMM yyyy", { locale: vi }),
    });
  }
  return options;
};

const ComprehensiveReportsPage = () => {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
  const monthOptions = useMemo(() => generateMonthOptions(), []);

  const { data: reports = [], isLoading } = useComprehensiveReports({ month: selectedMonth });

  const formatNumber = (num: number | null | undefined) => num != null ? new Intl.NumberFormat('vi-VN').format(num) : 'N/A';
  const formatPercentage = (num: number | null | undefined) => num != null ? `${num.toFixed(2)}%` : 'N/A';

  const columns = [
    { header: "Ngày", accessor: "report_date" },
    { header: "Tổng doanh số (VND)", accessor: "total_revenue", format: formatNumber },
    { header: "Tổng số đơn hàng", accessor: "total_orders", format: formatNumber },
    { header: "Doanh số TB/đơn", accessor: "average_order_value", format: formatNumber },
    { header: "Lượt nhấp SP", accessor: "product_clicks", format: formatNumber },
    { header: "Lượt truy cập", accessor: "total_visits", format: formatNumber },
    { header: "Tỷ lệ chuyển đổi", accessor: "conversion_rate", format: formatPercentage },
    { header: "Đơn đã hủy", accessor: "cancelled_orders", format: formatNumber },
    { header: "Doanh số hủy", accessor: "cancelled_revenue", format: formatNumber },
    { header: "Đơn hoàn trả", accessor: "returned_orders", format: formatNumber },
    { header: "Doanh số hoàn trả", accessor: "returned_revenue", format: formatNumber },
    { header: "Tổng người mua", accessor: "total_buyers", format: formatNumber },
    { header: "Người mua mới", accessor: "new_buyers", format: formatNumber },
    { header: "Người mua hiện tại", accessor: "existing_buyers", format: formatNumber },
    { header: "Người mua tiềm năng", accessor: "potential_buyers", format: formatNumber },
    { header: "Tỷ lệ quay lại", accessor: "buyer_return_rate", format: formatPercentage },
  ];

  return (
    <div className="space-y-6">
      <ComprehensiveReportUpload />
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Báo cáo Doanh số
            </CardTitle>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Chọn tháng" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? <p>Đang tải báo cáo...</p> : (
            <div className="border rounded-md overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map(col => <TableHead key={col.accessor}>{col.header}</TableHead>)}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.length > 0 ? (
                    reports.map((report) => (
                      <TableRow key={report.id}>
                        {columns.map(col => (
                          <TableCell key={col.accessor} className="whitespace-nowrap">
                            {col.accessor === 'report_date' 
                              ? format(new Date(report.report_date), 'dd/MM/yyyy')
                              : col.format 
                                ? col.format(report[col.accessor as keyof typeof report] as number) 
                                : report[col.accessor as keyof typeof report]}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="text-center h-24">
                        Không có dữ liệu cho tháng đã chọn.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ComprehensiveReportsPage;