import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TiktokComprehensiveReport } from "@/hooks/useTiktokComprehensiveReports";
import { Calendar, BarChart3, Search, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { format, parseISO, endOfMonth } from "date-fns";
import { vi } from "date-fns/locale";
import { generateMonthOptions } from "@/utils/revenueUtils";
import { formatCurrency } from "@/lib/numberUtils";
import RevenueChart from "@/components/dashboard/RevenueChart";
import { useDebounce } from "@/hooks/useDebounce";
import { useTiktokShops } from "@/hooks/useTiktokShops";
import { safeFormatDate } from "@/utils/dateUtils";
import ErrorDisplay from "../ErrorDisplay";

const TiktokDailySalesReport = () => {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [shopSearchTerm, setShopSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(shopSearchTerm, 300);
  const [selectedShop, setSelectedShop] = useState<string>("");

  const monthOptions = useMemo(() => generateMonthOptions(), []);

  const { data: shops = [], isLoading: shopsLoading } = useTiktokShops();

  const { data: reportsData = [], isLoading: reportsLoading, error: reportsError } = useQuery<TiktokComprehensiveReport[]>({
    queryKey: ['tiktok-daily-reports', selectedMonth],
    queryFn: async () => {
        const [year, month] = selectedMonth.split('-').map(Number);
        const monthDate = new Date(Date.UTC(year, month - 1, 1));
        const startDate = format(monthDate, "yyyy-MM-dd");
        const endDate = format(endOfMonth(monthDate), "yyyy-MM-dd");

        const { data, error } = await supabase
            .from('tiktok_comprehensive_reports')
            .select('*')
            .gte('report_date', startDate)
            .lte('report_date', endDate);
        
        if (error) throw error;
        return data as TiktokComprehensiveReport[];
    },
    enabled: !!selectedMonth,
  });

  const isLoading = shopsLoading || reportsLoading;

  const activeShops = useMemo(() => {
    return shops.filter(shop => {
      const matchesSearch = !debouncedSearchTerm || 
        shop.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      return matchesSearch && (shop.status === 'Đang Vận Hành' || shop.status === 'Shop mới');
    });
  }, [shops, debouncedSearchTerm]);

  React.useEffect(() => {
    if (!selectedShop && activeShops.length > 0) {
      setSelectedShop(activeShops[0].id);
    }
  }, [selectedShop, activeShops]);
  
  const selectedShopInfo = useMemo(() => {
    return activeShops.find(shop => shop.id === selectedShop);
  }, [activeShops, selectedShop]);

  const processedData = useMemo(() => {
    if (isLoading || !reportsData || !selectedShop) return { tableData: [], chartData: [], stats: null };

    const reportsForSelectedShop = reportsData.filter(r => r.shop_id === selectedShop);

    const sortedReports = reportsForSelectedShop.sort((a, b) => 
      new Date(a.report_date).getTime() - new Date(b.report_date).getTime()
    );

    const tableData = sortedReports.map(report => ({
      report_date: report.report_date,
      total_revenue: report.total_revenue || 0,
      total_orders: report.total_orders || 0,
      total_visits: report.total_visits || 0,
      total_buyers: report.total_buyers || 0,
      cancelled_orders: report.cancelled_orders || 0,
      average_order_value: (report.total_orders && report.total_revenue) ? report.total_revenue / report.total_orders : 0,
      conversion_rate: (report.total_visits && report.total_orders) ? (report.total_orders / report.total_visits) * 100 : 0,
    }));

    const chartData = sortedReports.map(report => ({
      date: report.report_date,
      revenue: report.total_revenue || 0,
      traffic: report.total_visits || 0,
      conversion_rate: (report.total_visits && report.total_orders) ? (report.total_orders / report.total_visits) * 100 : 0,
    }));

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
          <ErrorDisplay message={`Lỗi tải dữ liệu: ${(reportsError as Error).message}`} />
        ) : !selectedShop ? (
          <div className="text-center py-8 text-muted-foreground">
            Vui lòng chọn shop để xem báo cáo chi tiết
          </div>
        ) : (
          <>
            <RevenueChart data={processedData.chartData} />
            
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
                          {safeFormatDate(day.report_date, "dd/MM/yyyy")}
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

export default TiktokDailySalesReport;