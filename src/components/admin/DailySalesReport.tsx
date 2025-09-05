import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useShops } from "@/hooks/useShops";
import { useComprehensiveReports } from "@/hooks/useComprehensiveReports";
import { Calendar, BarChart3, Search, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { 
  generateMonthOptions, 
  formatCurrency
} from "@/utils/revenueUtils";
import RevenueChart from "@/components/dashboard/RevenueChart";
import { useDebounce } from "@/hooks/useDebounce";

const DailySalesReport = () => {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
  const [selectedShop, setSelectedShop] = useState<string>("");
  const [shopSearchTerm, setShopSearchTerm] = useState("");
  const debouncedShopSearch = useDebounce(shopSearchTerm, 300);
  
  const monthOptions = useMemo(generateMonthOptions, []);
  const { data: shopsData, isLoading: shopsLoading } = useShops({ 
    page: 1, 
    pageSize: 1000, 
    searchTerm: debouncedShopSearch,
    status: "all"
  });
  
  // Filter for active shops only
  const activeShops = useMemo(() => {
    const allShops = shopsData?.shops || [];
    return allShops.filter(shop => 
      shop.status === 'Đang Vận Hành' || shop.status === 'Shop mới'
    );
  }, [shopsData]);

  // Auto-select first shop if none selected
  React.useEffect(() => {
    if (!selectedShop && activeShops.length > 0) {
      setSelectedShop(activeShops[0].id);
    }
  }, [selectedShop, activeShops]);
  
  const { data: reportsData = [], isLoading: reportsLoading, error: reportsError } = useComprehensiveReports({
    month: selectedMonth,
  });

  const isLoading = shopsLoading || reportsLoading;

  // Get selected shop info
  const selectedShopInfo = useMemo(() => {
    return activeShops.find(shop => shop.id === selectedShop);
  }, [activeShops, selectedShop]);

  const processedData = useMemo(() => {
    if (isLoading || !reportsData || !selectedShop) return { tableData: [], chartData: [], stats: null };

    const reportsForSelectedShop = reportsData.filter(r => r.shop_id === selectedShop);

    const sortedReports = reportsForSelectedShop.sort((a, b) => 
      new Date(a.report_date).getTime() - new Date(b.report_date).getTime()
    );

    // Calculate analytics for each day
    const tableData = sortedReports.map(report => ({
      report_date: report.report_date,
      total_revenue: report.total_revenue || 0,
      total_orders: report.total_orders || 0,
      total_visits: report.total_visits || 0,
      total_buyers: report.total_buyers || 0,
      cancelled_orders: report.cancelled_orders || 0,
      returned_orders: report.returned_orders || 0,
      average_order_value: (report.total_orders && report.total_revenue) ? report.total_revenue / report.total_orders : 0,
      conversion_rate: (report.total_visits && report.total_orders) ? (report.total_orders / report.total_visits) * 100 : 0,
    }));

    const chartData = sortedReports.map(report => ({
      date: report.report_date,
      revenue: report.total_revenue || 0,
      traffic: report.total_visits || 0,
      conversion_rate: (report.total_visits && report.total_orders) ? (report.total_orders / report.total_visits) * 100 : 0,
    }));

    // Calculate overall stats
    const totalRevenue = sortedReports.reduce((sum, r) => sum + (r.total_revenue || 0), 0);
    const totalTraffic = sortedReports.reduce((sum, r) => sum + (r.total_visits || 0), 0);
    const totalOrders = sortedReports.reduce((sum, r) => sum + (r.total_orders || 0), 0);
    const avgConversionRate = totalTraffic > 0 ? (totalOrders / totalTraffic) * 100 : 0;

    const stats = {
      totalRevenue,
      totalTraffic, 
      avgConversionRate,
      daysCount: sortedReports.length
    };

    return { tableData, chartData, stats };
  }, [reportsData, selectedShop, isLoading]);

  // Trend analysis function
  const calculateTrend = (data: number[], startIndex: number, endIndex: number) => {
    if (startIndex >= endIndex || startIndex < 0 || endIndex >= data.length) {
      return { trend: "insufficient_data", description: "Không đủ dữ liệu" };
    }

    const firstValue = data[startIndex];
    const lastValue = data[endIndex];
    const average = (firstValue + lastValue) / 2;
    
    let aboveCount = 0;
    let belowCount = 0;

    for (let i = startIndex; i <= endIndex; i++) {
      if (data[i] > average) aboveCount++;
      else if (data[i] < average) belowCount++;
    }

    if (aboveCount > belowCount) {
      return { trend: "increasing", description: "Xu hướng tăng", icon: TrendingUp, color: "text-green-600" };
    } else if (aboveCount < belowCount) {
      return { trend: "decreasing", description: "Xu hướng giảm", icon: TrendingDown, color: "text-red-600" };
    } else {
      return { trend: "stable", description: "Gần như đi ngang", icon: Minus, color: "text-gray-600" };
    }
  };

  // Trend analysis for different metrics
  const trendAnalysis = useMemo(() => {
    if (!processedData.tableData.length || processedData.tableData.length < 3) {
      return null;
    }

    const revenueData = processedData.tableData.map(d => d.total_revenue);
    const trafficData = processedData.tableData.map(d => d.total_visits);
    const conversionData = processedData.tableData.map(d => d.conversion_rate);

    const dataLength = revenueData.length;
    const startIndex = 0;
    const endIndex = dataLength - 1;

    return {
      revenue: calculateTrend(revenueData, startIndex, endIndex),
      traffic: calculateTrend(trafficData, startIndex, endIndex),
      conversion: calculateTrend(conversionData, startIndex, endIndex)
    };
  }, [processedData.tableData]);

  const tableColumns = [
    "Ngày",
    "Doanh số (VND)", 
    "Traffic",
    "Tỷ lệ CĐ (%)"
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {selectedShopInfo ? 
              `Doanh thu theo ngày • Shop ${selectedShopInfo.name}` : 
              "Doanh thu theo ngày"
            }
          </CardTitle>
        </div>

        {/* Shop search and selector */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Tìm kiếm shop..."
              value={shopSearchTerm}
              onChange={(e) => setShopSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedShop} onValueChange={setSelectedShop}>
            <SelectTrigger className="w-full sm:w-[250px]">
              <SelectValue placeholder="Chọn shop để phân tích" />
            </SelectTrigger>
            <SelectContent>
              {activeShops.map(shop => (
                <SelectItem key={shop.id} value={shop.id}>
                  <div className="flex items-center gap-2">
                    <span>{shop.name}</span>
                    <span className="text-xs text-muted-foreground">({shop.status})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full sm:w-[180px]">
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
      
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="text-center py-8">Đang tải báo cáo...</div>
        ) : reportsError ? (
          <div className="text-center py-8 text-red-500">
            <div>❌ Lỗi khi tải dữ liệu: {reportsError.message}</div>
          </div>
        ) : !selectedShop ? (
          <div className="text-center py-8 text-muted-foreground">
            Vui lòng chọn shop để xem báo cáo chi tiết
          </div>
        ) : (
          <>
            {/* Shop Analytics Stats */}
            {processedData.stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Doanh số (VND)</p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(processedData.stats.totalRevenue)}
                        </p>
                      </div>
                      {trendAnalysis?.revenue && (
                        <div className="flex items-center gap-1">
                          <trendAnalysis.revenue.icon className={`h-5 w-5 ${trendAnalysis.revenue.color}`} />
                          <span className={`text-sm ${trendAnalysis.revenue.color}`}>
                            {trendAnalysis.revenue.description}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Traffic</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {processedData.stats.totalTraffic.toLocaleString('vi-VN')}
                        </p>
                      </div>
                      {trendAnalysis?.traffic && (
                        <div className="flex items-center gap-1">
                          <trendAnalysis.traffic.icon className={`h-5 w-5 ${trendAnalysis.traffic.color}`} />
                          <span className={`text-sm ${trendAnalysis.traffic.color}`}>
                            {trendAnalysis.traffic.description}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Tỷ lệ chuyển đổi</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {processedData.stats.avgConversionRate.toFixed(2)}%
                        </p>
                      </div>
                      {trendAnalysis?.conversion && (
                        <div className="flex items-center gap-1">
                          <trendAnalysis.conversion.icon className={`h-5 w-5 ${trendAnalysis.conversion.color}`} />
                          <span className={`text-sm ${trendAnalysis.conversion.color}`}>
                            {trendAnalysis.conversion.description}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Multi-metric Chart */}
            <RevenueChart data={processedData.chartData} />
            
            {/* Daily Data Table */}
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    {tableColumns.map(column => (
                      <TableHead key={column} className={column.includes("(VND)") || column.includes("(%)") ? "text-right" : ""}>
                        {column}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedData.tableData.length > 0 ? (
                    processedData.tableData.map((day) => (
                      <TableRow key={day.report_date}>
                        <TableCell className="font-medium">
                          {format(new Date(day.report_date.replace(/-/g, '/')), "dd/MM/yyyy", { locale: vi })}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(day.total_revenue)}
                        </TableCell>
                        <TableCell className="text-right">
                          {day.total_visits.toLocaleString('vi-VN')}
                        </TableCell>
                        <TableCell className="text-right">
                          {day.conversion_rate.toFixed(2)}%
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={tableColumns.length} className="text-center h-24">
                        <div>Không có dữ liệu cho shop và tháng đã chọn.</div>
                        <div className="text-sm text-muted-foreground mt-2">
                          Hãy kiểm tra xem shop đã có báo cáo cho tháng này chưa.
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DailySalesReport;