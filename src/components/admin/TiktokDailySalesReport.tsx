import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useTiktokComprehensiveReports, TiktokComprehensiveReport } from "@/hooks/useTiktokComprehensiveReports";
import { Calendar, BarChart3, Search, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { 
  generateMonthOptions
} from "@/utils/revenueUtils";
import { formatCurrency } from "@/lib/numberUtils";
import RevenueChart from "@/components/dashboard/RevenueChart";
import { useDebounce } from "@/hooks/useDebounce";
import { useTiktokShops } from "@/hooks/useTiktokShops";

/**
 * Calculate trend direction based on data points
 * @param data - Array of numeric values
 * @param startIndex - Starting index for trend calculation
 * @param endIndex - Ending index for trend calculation
 * @returns Trend direction: 'up', 'down', or 'stable'
 */
const calculateTrend = (data: number[], startIndex: number, endIndex: number): 'up' | 'down' | 'stable' => {
  if (data.length < 2 || startIndex >= endIndex) return 'stable';
  
  const startValue = data[startIndex] || 0;
  const endValue = data[endIndex] || 0;
  
  if (endValue > startValue) return 'up';
  if (endValue < startValue) return 'down';
  return 'stable';
};

/**
 * TikTok Daily Sales Report Component
 * Displays comprehensive daily sales data for TikTok shops with filtering and analytics
 */
const TiktokDailySalesReport = () => {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Fetch TikTok shops data
  const { data: shops = [], isLoading: shopsLoading } = useTiktokShops();

  // Fetch TikTok comprehensive reports
  const { data: reportsData, isLoading: reportsLoading } = useTiktokComprehensiveReports(0, 10000);
  const reports = reportsData?.data || [];

  const isLoading = shopsLoading || reportsLoading;

  // Filter active shops based on search term
  const activeShops = useMemo(() => {
    return shops.filter(shop => {
      const matchesSearch = !debouncedSearchTerm || 
        shop.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      return matchesSearch && shop.status === 'Đang Vận Hành';
    });
  }, [shops, debouncedSearchTerm]);

  // Process data for the selected month
  const processedData = useMemo(() => {
    if (!reports.length || !activeShops.length) return [];

    // Filter reports by selected month
    const monthlyReports = reports.filter((report: TiktokComprehensiveReport) => {
      const reportMonth = format(new Date(report.report_date), 'yyyy-MM');
      return reportMonth === selectedMonth;
    });

    // Group reports by shop
    const shopTotals = activeShops.map(shop => {
      const shopReports = monthlyReports.filter((report: TiktokComprehensiveReport) => report.shop_id === shop.id);
      
      const totals = shopReports.reduce((acc, report: TiktokComprehensiveReport) => ({
        total_revenue: acc.total_revenue + (report.total_revenue || 0),
        total_orders: acc.total_orders + (report.total_orders || 0),
        total_visits: acc.total_visits + (report.total_visits || 0),
        total_buyers: acc.total_buyers + (report.total_buyers || 0),
        store_visits: acc.store_visits + (report.store_visits || 0),
      }), {
        total_revenue: 0,
        total_orders: 0,
        total_visits: 0,
        total_buyers: 0,
        store_visits: 0,
      });

      const conversion_rate_sum = shopReports.reduce((sum, r) => sum + (r.conversion_rate || 0), 0);
      const conversion_rate = shopReports.length > 0 ? conversion_rate_sum / shopReports.length : 0;

      return {
        shop_id: shop.id,
        shop_name: shop.name,
        personnel_name: shop.profile?.full_name || 'Chưa có tên',
        ...totals,
        conversion_rate,
      };
    });

    return shopTotals.sort((a, b) => (b.total_revenue || 0) - (a.total_revenue || 0));
  }, [reports, activeShops, selectedMonth]);

  // Calculate daily trends for the last 7 days
  const dailyTrends = useMemo(() => {
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      const dayReports = reports.filter((report: TiktokComprehensiveReport) => {
        const reportDate = format(new Date(report.report_date), 'yyyy-MM-dd');
        return reportDate === dateStr;
      });
      
      const dayTotal = dayReports.reduce((sum, report: TiktokComprehensiveReport) => sum + (report.total_revenue || 0), 0);
      
      last7Days.push({
        date: format(date, 'dd/MM'),
        revenue: dayTotal,
        orders: dayReports.reduce((sum, report: TiktokComprehensiveReport) => sum + (report.total_orders || 0), 0),
      });
    }
    
    return last7Days;
  }, [reports]);

  // Calculate overall statistics
  const overallStats = useMemo(() => {
    if (!processedData.length) {
      return {
        totalRevenue: 0,
        totalOrders: 0,
        totalVisits: 0,
        totalBuyers: 0,
        averageConversion: 0,
        totalStoreVisits: 0,
      };
    }

    const totals = processedData.reduce((acc, shop) => ({
      totalRevenue: acc.totalRevenue + (shop.total_revenue || 0),
      totalOrders: acc.totalOrders + (shop.total_orders || 0),
      totalVisits: acc.totalVisits + (shop.total_visits || 0),
      totalBuyers: acc.totalBuyers + (shop.total_buyers || 0),
      totalStoreVisits: acc.totalStoreVisits + (shop.store_visits || 0),
    }), {
      totalRevenue: 0,
      totalOrders: 0,
      totalVisits: 0,
      totalBuyers: 0,
      totalStoreVisits: 0,
    });

    const totalConversionRateSum = processedData.reduce((sum, shop) => sum + (shop.conversion_rate || 0), 0);
    const averageConversion = processedData.length > 0 ? totalConversionRateSum / processedData.length : 0;

    return {
      ...totals,
      averageConversion,
    };
  }, [processedData]);

  const monthOptions = generateMonthOptions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Báo Cáo Doanh Số Hàng Ngày - TikTok
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Chọn tháng" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <Input
              placeholder="Tìm kiếm shop..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
        </div>

        {/* Overall Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-medium text-muted-foreground">Tổng Doanh Thu</div>
              <div className="text-2xl font-bold">{formatCurrency(overallStats.totalRevenue)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-medium text-muted-foreground">Tổng Đơn Hàng</div>
              <div className="text-2xl font-bold">{overallStats.totalOrders.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-medium text-muted-foreground">Tổng Lượt Xem</div>
              <div className="text-2xl font-bold">{overallStats.totalVisits.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-medium text-muted-foreground">Tổng Khách Hàng</div>
              <div className="text-2xl font-bold">{overallStats.totalBuyers.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-medium text-muted-foreground">Tỷ Lệ Chuyển Đổi</div>
              <div className="text-2xl font-bold">{overallStats.averageConversion.toFixed(2)}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart */}
        {dailyTrends.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Xu Hướng Doanh Thu 7 Ngày Qua</CardTitle>
            </CardHeader>
            <CardContent>
              <RevenueChart data={dailyTrends} />
            </CardContent>
          </Card>
        )}

        {/* Shop Performance Table */}
        <Card>
          <CardHeader>
            <CardTitle>Hiệu Suất Theo Shop</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên Shop</TableHead>
                  <TableHead>Nhân Viên</TableHead>
                  <TableHead className="text-right">Doanh Thu</TableHead>
                  <TableHead className="text-right">Đơn Hàng</TableHead>
                  <TableHead className="text-right">Lượt Xem</TableHead>
                  <TableHead className="text-right">Khách Hàng</TableHead>
                  <TableHead className="text-right">Tỷ Lệ Chuyển Đổi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedData.map((shop) => (
                  <TableRow key={shop.shop_id}>
                    <TableCell className="font-medium">{shop.shop_name}</TableCell>
                    <TableCell>{shop.personnel_name}</TableCell>
                    <TableCell className="text-right">{formatCurrency(shop.total_revenue || 0)}</TableCell>
                    <TableCell className="text-right">{(shop.total_orders || 0).toLocaleString()}</TableCell>
                    <TableCell className="text-right">{(shop.total_visits || 0).toLocaleString()}</TableCell>
                    <TableCell className="text-right">{(shop.total_buyers || 0).toLocaleString()}</TableCell>
                    <TableCell className="text-right">{(shop.conversion_rate || 0).toFixed(2)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {processedData.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Không có dữ liệu cho tháng đã chọn
              </div>
            )}
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default TiktokDailySalesReport;