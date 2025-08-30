import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useShops } from "@/hooks/useShops";
import { useComprehensiveReports } from "@/hooks/useComprehensiveReports";
import { Calendar, BarChart3 } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { 
  generateMonthOptions, 
  formatCurrency
} from "@/utils/revenueUtils";
import RevenueChart from "@/components/dashboard/RevenueChart";

const DailySalesReport = () => {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
  const [selectedShop, setSelectedShop] = useState<string>("all");
  
  const monthOptions = useMemo(generateMonthOptions, []);
  const { data: shopsData, isLoading: shopsLoading } = useShops({ page: 1, pageSize: 1000, searchTerm: "" });
  const shops = shopsData?.shops || [];
  
  const { data: reportsData = [], isLoading: reportsLoading, error: reportsError } = useComprehensiveReports({
    month: selectedMonth,
  });

  const isLoading = shopsLoading || reportsLoading;

  const processedData = useMemo(() => {
    if (isLoading || !reportsData) return { tableData: [], chartData: [] };

    const reportsForSelectedShop = selectedShop === 'all' 
      ? reportsData 
      : reportsData.filter(r => r.shop_id === selectedShop);

    const reportsByDate = reportsForSelectedShop.reduce((acc, report) => {
      const date = report.report_date;
      if (!acc[date]) {
        acc[date] = {
          report_date: date,
          total_revenue: 0,
          total_orders: 0,
          total_visits: 0,
          total_buyers: 0,
          cancelled_orders: 0,
          returned_orders: 0,
        };
      }
      acc[date].total_revenue += report.total_revenue || 0;
      acc[date].total_orders += report.total_orders || 0;
      acc[date].total_visits += report.total_visits || 0;
      acc[date].total_buyers += report.total_buyers || 0;
      acc[date].cancelled_orders += report.cancelled_orders || 0;
      acc[date].returned_orders += report.returned_orders || 0;
      return acc;
    }, {} as Record<string, any>);

    const dailyReports = Object.values(reportsByDate);

    const sortedReports = dailyReports.sort((a, b) => new Date(a.report_date).getTime() - new Date(b.report_date).getTime());

    const tableData = sortedReports.map(report => ({
      ...report,
      average_order_value: (report.total_orders && report.total_revenue) ? report.total_revenue / report.total_orders : 0,
      conversion_rate: (report.total_visits && report.total_orders) ? (report.total_orders / report.total_visits) * 100 : 0,
    }));

    const chartData = sortedReports.map(report => ({
      date: report.report_date,
      revenue: report.total_revenue || 0,
    }));

    return { tableData, chartData };
  }, [reportsData, selectedShop, isLoading]);

  const tableColumns = [
    "Ngày",
    "Doanh số (VND)",
    "Số đơn hàng",
    "Giá trị TB/Đơn (VND)",
    "Lượt truy cập",
    "Tỷ lệ CĐ",
    "Người mua",
    "Đơn hủy",
    "Đơn trả hàng",
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Báo cáo Doanh số Hàng ngày
          </CardTitle>
          
          <div className="flex items-center gap-4">
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
            
            <Select value={selectedShop} onValueChange={setSelectedShop}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Chọn shop" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả shop</SelectItem>
                {shops.map(shop => (
                  <SelectItem key={shop.id} value={shop.id}>
                    {shop.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Doanh thu theo ngày</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={processedData.chartData} />
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="text-center py-8">Đang tải báo cáo...</div>
        ) : reportsError ? (
          <div className="text-center py-8 text-red-500">
            <div>❌ Lỗi khi tải dữ liệu: {reportsError.message}</div>
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  {tableColumns.map(column => (
                    <TableHead key={column} className={column.includes("(VND)") ? "text-right" : ""}>
                      {column}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedData.tableData.length > 0 ? (
                  processedData.tableData.map((day) => (
                    <TableRow key={day.report_date}>
                      <TableCell className="font-medium">{format(new Date(day.report_date.replace(/-/g, '/')), "dd/MM/yyyy", { locale: vi })}</TableCell>
                      <TableCell className="text-right">{formatCurrency(day.total_revenue)}</TableCell>
                      <TableCell>{day.total_orders}</TableCell>
                      <TableCell className="text-right">{formatCurrency(day.average_order_value)}</TableCell>
                      <TableCell>{day.total_visits}</TableCell>
                      <TableCell>{day.conversion_rate.toFixed(2)}%</TableCell>
                      <TableCell>{day.total_buyers}</TableCell>
                      <TableCell>{day.cancelled_orders}</TableCell>
                      <TableCell>{day.returned_orders}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={tableColumns.length} className="text-center h-24">
                      <div>Không có dữ liệu doanh số cho bộ lọc đã chọn.</div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DailySalesReport;