import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useComprehensiveReports } from "@/hooks/useComprehensiveReports";
import { useShops } from "@/hooks/useShops";
import { BarChart3, Store } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import RevenueChart from "@/components/dashboard/RevenueChart";

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

const DailySalesReport = () => {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
  const [selectedShop, setSelectedShop] = useState<string>("");
  const monthOptions = useMemo(() => generateMonthOptions(), []);

  const { data: shopsData, isLoading: shopsLoading } = useShops({ page: 1, pageSize: 1000, searchTerm: "" });
  const shops = shopsData?.shops || [];

  const { data: reports = [], isLoading: reportsLoading } = useComprehensiveReports({ month: selectedMonth });

  const isLoading = shopsLoading || reportsLoading;

  const filteredReports = useMemo(() => {
    if (!selectedShop) return [];
    return reports
      .filter(r => r.shop_id === selectedShop)
      .sort((a, b) => new Date(a.report_date).getTime() - new Date(b.report_date).getTime());
  }, [reports, selectedShop]);

  const chartData = useMemo(() => {
    return filteredReports.map(r => ({
      date: r.report_date,
      revenue: r.total_revenue || 0,
    }));
  }, [filteredReports]);

  const formatCurrency = (value: number | null | undefined) => {
    if (value == null) return "N/A";
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <BarChart3 className="h-5 w-5" />
              <CardTitle className="text-xl font-semibold">Báo cáo Doanh số Hàng ngày</CardTitle>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Chọn tháng" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedShop} onValueChange={setSelectedShop} disabled={shopsLoading}>
                <SelectTrigger className="w-full sm:w-[240px]">
                  <SelectValue placeholder="Chọn shop" />
                </SelectTrigger>
                <SelectContent>
                  {shops.map(shop => (
                    <SelectItem key={shop.id} value={shop.id}>{shop.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Đang tải dữ liệu...</p>
          ) : !selectedShop ? (
            <div className="text-center py-12 text-muted-foreground">
              <Store className="h-12 w-12 mx-auto mb-4" />
              <p>Vui lòng chọn một shop để xem báo cáo.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredReports.length > 0 ? (
                <>
                  <RevenueChart data={chartData} />
                  <div className="border rounded-md overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ngày</TableHead>
                          <TableHead className="text-right">Doanh số (VND)</TableHead>
                          <TableHead className="text-right">Số đơn hàng</TableHead>
                          <TableHead className="text-right">Giá trị TB/Đơn (VND)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredReports.map(report => (
                          <TableRow key={report.id}>
                            <TableCell>{format(new Date(report.report_date), "dd/MM/yyyy", { locale: vi })}</TableCell>
                            <TableCell className="text-right font-medium">{formatCurrency(report.total_revenue)}</TableCell>
                            <TableCell className="text-right">{report.total_orders?.toLocaleString('vi-VN')}</TableCell>
                            <TableCell className="text-right">{formatCurrency(report.average_order_value)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Không có dữ liệu cho shop và tháng đã chọn.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DailySalesReport;