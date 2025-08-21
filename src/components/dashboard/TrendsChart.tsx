import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComprehensiveReport } from "@/hooks/useComprehensiveReports";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";

interface TrendsChartProps {
  reports: ComprehensiveReport[];
  isLoading: boolean;
}

const TrendsChart: React.FC<TrendsChartProps> = React.memo(({ reports, isLoading }) => {
  const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

  const trendData = useMemo(() => {
    if (!reports || reports.length === 0) return [];

    // Optimized data grouping using Record instead of Map
    const dailyData: Record<string, {
      date: string;
      total_revenue: number;
      total_orders: number;
      total_visits: number;
    }> = {};

    // Single pass through reports
    for (const report of reports) {
      const date = report.report_date;
      if (!dailyData[date]) {
        dailyData[date] = {
          date,
          total_revenue: 0,
          total_orders: 0,
          total_visits: 0,
        };
      }

      const day = dailyData[date];
      day.total_revenue += report.total_revenue || 0;
      day.total_orders += report.total_orders || 0;
      day.total_visits += report.total_visits || 0;
    }

    // Convert to array and calculate conversion rates in one pass
    const result = Object.values(dailyData).map(day => ({
      ...day,
      conversion_rate: day.total_visits > 0 ? (day.total_orders / day.total_visits) * 100 : 0,
    }));

    // Sort by date
    return result.sort((a, b) => a.date.localeCompare(b.date));
  }, [reports]);

  const maxRevenue = trendData.length > 0 ? Math.max(...trendData.map(d => d.total_revenue)) : 0;
  const maxOrders = trendData.length > 0 ? Math.max(...trendData.map(d => d.total_orders)) : 0;

  const getBarHeight = (value: number, max: number) => {
    return max > 0 ? Math.max((value / max) * 100, 2) : 0;
  };

  const getTrendDirection = (data: number[], index: number) => {
    if (index === 0 || data.length < 2) return "neutral";
    return data[index] > data[index - 1] ? "up" : data[index] < data[index - 1] ? "down" : "neutral";
  };

  const revenueData = trendData.map(d => d.total_revenue);
  const ordersData = trendData.map(d => d.total_orders);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-48"></div>
            </CardHeader>
            <CardContent>
              <div className="h-40 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (trendData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Xu hướng doanh số
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40 text-muted-foreground">
            Không có dữ liệu để hiển thị
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Revenue Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Xu hướng Doanh thu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-end gap-1 h-32">
              {trendData.map((day, index) => {
                const height = getBarHeight(day.total_revenue, maxRevenue);
                const trend = getTrendDirection(revenueData, index);
                
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center">
                    <div 
                      className={`w-full rounded-t transition-all duration-300 ${
                        trend === "up" ? "bg-green-500" : 
                        trend === "down" ? "bg-red-500" : "bg-gray-400"
                      }`}
                      style={{ height: `${height}%` }}
                      title={`${format(parseISO(day.date), 'dd/MM', { locale: vi })}: ${formatCurrency(day.total_revenue)}`}
                    />
                    <div className="text-xs text-muted-foreground mt-1 rotate-45 origin-bottom-left">
                      {format(parseISO(day.date), 'dd/MM', { locale: vi })}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="text-sm text-muted-foreground text-center">
              Tổng: {formatCurrency(revenueData.reduce((a, b) => a + b, 0))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Xu hướng Đơn hàng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-end gap-1 h-32">
              {trendData.map((day, index) => {
                const height = getBarHeight(day.total_orders, maxOrders);
                const trend = getTrendDirection(ordersData, index);
                
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center">
                    <div 
                      className={`w-full rounded-t transition-all duration-300 ${
                        trend === "up" ? "bg-blue-500" : 
                        trend === "down" ? "bg-orange-500" : "bg-gray-400"
                      }`}
                      style={{ height: `${height}%` }}
                      title={`${format(parseISO(day.date), 'dd/MM', { locale: vi })}: ${day.total_orders.toLocaleString('vi-VN')} đơn`}
                    />
                    <div className="text-xs text-muted-foreground mt-1 rotate-45 origin-bottom-left">
                      {format(parseISO(day.date), 'dd/MM', { locale: vi })}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="text-sm text-muted-foreground text-center">
              Tổng: {ordersData.reduce((a, b) => a + b, 0).toLocaleString('vi-VN')} đơn
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conversion Rate Table */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            Chi tiết theo ngày
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 max-h-64 overflow-y-auto">
            {trendData.map((day, index) => {
              const trend = getTrendDirection(revenueData, index);
              return (
                <div key={day.date} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    {trend === "up" ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : trend === "down" ? (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    ) : (
                      <div className="h-4 w-4 rounded-full bg-gray-400" />
                    )}
                    <span className="font-medium">
                      {format(parseISO(day.date), 'EEEE, dd/MM', { locale: vi })}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-green-600 font-medium">
                      {formatCurrency(day.total_revenue)}
                    </span>
                    <span className="text-blue-600">
                      {day.total_orders} đơn
                    </span>
                    <span className="text-purple-600">
                      {day.conversion_rate.toFixed(1)}% CV
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

TrendsChart.displayName = 'TrendsChart';

export default TrendsChart;