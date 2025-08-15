import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useComprehensiveReports } from "@/hooks/useComprehensiveReports";
import { BarChart3, Calendar, Users } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import ComprehensiveReportUpload from "@/components/admin/ComprehensiveReportUpload";
import MultiDayReportUpload from "@/components/admin/MultiDayReportUpload";
import ShopManagement from "@/components/admin/ShopManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminUserManagement from "@/components/admin/AdminUserManagement";

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
    { header: "Tên Shop", accessor: "shops.name" },
    { header: "Nhân sự", accessor: "shops.profiles.full_name" },
    { header: "Leader", accessor: "shops.leader_profile.full_name" },
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

  const monthlyColumns = useMemo(() => [
    { header: "Tháng", accessor: "report_date" },
    ...columns.slice(1)
  ], []);

  const totals = useMemo(() => {
    if (!reports || reports.length === 0) {
      return null;
    }

    const initialTotals = {
      total_revenue: 0,
      total_orders: 0,
      product_clicks: 0,
      total_visits: 0,
      cancelled_orders: 0,
      cancelled_revenue: 0,
      returned_orders: 0,
      returned_revenue: 0,
      total_buyers: 0,
      new_buyers: 0,
      existing_buyers: 0,
      potential_buyers: 0,
    };

    const summedTotals = reports.reduce((acc, report) => {
      acc.total_revenue += report.total_revenue || 0;
      acc.total_orders += report.total_orders || 0;
      acc.product_clicks += report.product_clicks || 0;
      acc.total_visits += report.total_visits || 0;
      acc.cancelled_orders += report.cancelled_orders || 0;
      acc.cancelled_revenue += report.cancelled_revenue || 0;
      acc.returned_orders += report.returned_orders || 0;
      acc.returned_revenue += report.returned_revenue || 0;
      acc.total_buyers += report.total_buyers || 0;
      acc.new_buyers += report.new_buyers || 0;
      acc.existing_buyers += report.existing_buyers || 0;
      acc.potential_buyers += report.potential_buyers || 0;
      return acc;
    }, initialTotals);

    const average_order_value = summedTotals.total_orders > 0 ? summedTotals.total_revenue / summedTotals.total_orders : 0;
    const conversion_rate = summedTotals.total_visits > 0 ? (summedTotals.total_orders / summedTotals.total_visits) * 100 : 0;
    const buyer_return_rate = summedTotals.total_buyers > 0 ? (summedTotals.existing_buyers / summedTotals.total_buyers) * 100 : 0;

    return {
      ...summedTotals,
      average_order_value,
      conversion_rate,
      buyer_return_rate,
    };
  }, [reports]);

  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((o, key) => (o && o[key] != null ? o[key] : 'N/A'), obj);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="reports" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reports">Báo cáo Doanh số</TabsTrigger>
          <TabsTrigger value="shop-management">Quản lý Shop</TabsTrigger>
          <TabsTrigger value="personnel-management" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Quản lý nhân sự
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Báo cáo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ComprehensiveReportUpload />
              <MultiDayReportUpload />
            </CardContent>
          </Card>
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
              <Tabs defaultValue="monthly-overview" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="monthly-overview">Tổng quan tháng</TabsTrigger>
                  <TabsTrigger value="daily-details">Chi tiết theo ngày</TabsTrigger>
                </TabsList>
            <TabsContent value="monthly-overview">
              {isLoading ? <p>Đang tải...</p> : (
                <div className="border rounded-md overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {monthlyColumns.map(col => <TableHead key={col.accessor}>{col.header}</TableHead>)}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {totals ? (
                        <TableRow className="font-bold">
                          <TableCell>{format(new Date(`${selectedMonth}-02`), "M/yyyy")}</TableCell>
                          <TableCell>Tổng cộng</TableCell>
                          <TableCell>N/A</TableCell>
                          <TableCell>N/A</TableCell>
                          {columns.slice(4).map(col => (
                            <TableCell key={col.accessor} className="whitespace-nowrap text-right">
                              {col.format
                                ? col.format(totals[col.accessor as keyof typeof totals] as number)
                                : totals[col.accessor as keyof typeof totals]}
                            </TableCell>
                          ))}
                        </TableRow>
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
            </TabsContent>
            <TabsContent value="daily-details">
              {isLoading ? <p>Đang tải...</p> : (
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
                                    ? col.format(getNestedValue(report, col.accessor) as number) 
                                    : getNestedValue(report, col.accessor)}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={columns.length} className="text-center h-24">
                            Không có dữ liệu chi tiết cho tháng đã chọn.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        </TabsContent>
        
        <TabsContent value="shop-management">
          <ShopManagement />
        </TabsContent>

        <TabsContent value="personnel-management">
          <AdminUserManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComprehensiveReportsPage;