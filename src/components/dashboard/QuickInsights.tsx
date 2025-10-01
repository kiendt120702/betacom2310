import React, { useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ComprehensiveReport } from "@/hooks/useComprehensiveReports";
import { 
  TrendingUp, 
  TrendingDown, 
  Crown, 
  AlertTriangle, 
  Target,
  Calendar,
  Clock,
  Award
} from "lucide-react";
import { format, parseISO, isWeekend } from "date-fns";
import { vi } from "date-fns/locale";
import { formatCurrency } from "@/lib/numberUtils";

interface QuickInsightsProps {
  reports: ComprehensiveReport[];
  isLoading: boolean;
}

const QuickInsights: React.FC<QuickInsightsProps> = React.memo(({ reports, isLoading }) => {

  // Optimized data processing with better performance
  const processedData = useMemo(() => {
    if (!reports || reports.length === 0) return null;

    // Pre-allocate objects for better performance
    const dailyData: Record<string, {
      date: string;
      total_revenue: number;
      total_orders: number;
      total_visits: number;
      shops_count: number;
    }> = {};

    const shopData: Record<string, {
      shop_name: string;
      total_revenue: number;
      total_orders: number;
      days_active: number;
    }> = {};

    // Single pass through reports for both daily and shop data
    for (const report of reports) {
      const date = report.report_date;
      
      // Daily data processing
      if (!dailyData[date]) {
        dailyData[date] = {
          date,
          total_revenue: 0,
          total_orders: 0,
          total_visits: 0,
          shops_count: 0,
        };
      }
      
      const day = dailyData[date];
      day.total_revenue += report.total_revenue || 0;
      day.total_orders += report.total_orders || 0;
      day.total_visits += report.total_visits || 0;
      day.shops_count += 1;

      // Shop data processing (in same loop)
      if (report.shop_id) {
        if (!shopData[report.shop_id]) {
          shopData[report.shop_id] = {
            shop_name: report.shops?.name || 'N/A',
            total_revenue: 0,
            total_orders: 0,
            days_active: 0,
          };
        }
        
        const shop = shopData[report.shop_id];
        shop.total_revenue += report.total_revenue || 0;
        shop.total_orders += report.total_orders || 0;
        shop.days_active += 1;
      }
    }

    return { dailyData, shopData };
  }, [reports]);

  // Compute insights from processed data
  const insights = useMemo(() => {
    if (!processedData) return null;

    const { dailyData, shopData } = processedData;
    const dailyArray = Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));
    const shopArray = Object.values(shopData).sort((a, b) => b.total_revenue - a.total_revenue);

    if (dailyArray.length === 0) return null;

    // Fast min/max using single pass
    let bestRevenueDay = dailyArray[0];
    let worstRevenueDay = dailyArray[0];
    let totalRevenue = 0;
    let weekendRevenue = 0;
    let weekdayRevenue = 0;
    let weekendDays = 0;
    let weekdayDays = 0;

    for (const day of dailyArray) {
      if (day.total_revenue > bestRevenueDay.total_revenue) bestRevenueDay = day;
      if (day.total_revenue < worstRevenueDay.total_revenue) worstRevenueDay = day;
      
      totalRevenue += day.total_revenue;
      
      if (isWeekend(parseISO(day.date))) {
        weekendRevenue += day.total_revenue;
        weekendDays++;
      } else {
        weekdayRevenue += day.total_revenue;
        weekdayDays++;
      }
    }

    // Calculate trends using midpoint split
    const midpoint = Math.floor(dailyArray.length / 2);
    let firstHalfSum = 0;
    let secondHalfSum = 0;

    for (let i = 0; i < midpoint; i++) {
      firstHalfSum += dailyArray[i].total_revenue;
    }
    for (let i = midpoint; i < dailyArray.length; i++) {
      secondHalfSum += dailyArray[i].total_revenue;
    }

    const firstHalfAvg = firstHalfSum / midpoint;
    const secondHalfAvg = secondHalfSum / (dailyArray.length - midpoint);
    const trendPercentage = firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0;

    // Shop insights (already sorted)
    const topShop = shopArray[0];
    const mostConsistentShop = shopArray.reduce((max, shop) => shop.days_active > max.days_active ? shop : max);

    return {
      bestRevenueDay,
      worstRevenueDay,
      weekendAvg: weekendDays > 0 ? weekendRevenue / weekendDays : 0,
      weekdayAvg: weekdayDays > 0 ? weekdayRevenue / weekdayDays : 0,
      trendPercentage,
      topShop,
      mostConsistentShop,
      totalDays: dailyArray.length,
      avgDailyRevenue: totalRevenue / dailyArray.length,
    };
  }, [processedData]);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-24"></div>
            </CardHeader>
            <CardContent>
              <div className="h-6 bg-muted rounded w-20"></div>
              <div className="h-3 bg-muted rounded w-16 mt-2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!insights) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quick Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Không có dữ liệu để phân tích</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Best Performance Day */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Ngày bán tốt nhất
          </CardTitle>
          <Crown className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold text-green-600">
            {formatCurrency(insights.bestRevenueDay.total_revenue)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {format(parseISO(insights.bestRevenueDay.date), 'EEEE, dd/MM', { locale: vi })}
          </p>
          <Badge variant="secondary" className="mt-2 text-xs">
            {insights.bestRevenueDay.total_orders} đơn hàng
          </Badge>
        </CardContent>
      </Card>

      {/* Trend Analysis */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Xu hướng tháng
          </CardTitle>
          {insights.trendPercentage >= 0 ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-lg font-bold ${insights.trendPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {insights.trendPercentage >= 0 ? '+' : ''}{insights.trendPercentage.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            So với nửa đầu tháng
          </p>
          <Badge variant={insights.trendPercentage >= 0 ? "default" : "destructive"} className="mt-2 text-xs">
            {insights.trendPercentage >= 0 ? 'Tăng trưởng' : 'Giảm sút'}
          </Badge>
        </CardContent>
      </Card>

      {/* Weekend vs Weekday */}
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Cuối tuần vs Ngày thường
          </CardTitle>
          <Calendar className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold">
            {insights.weekendAvg > insights.weekdayAvg ? 'Cuối tuần' : 'Ngày thường'}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Bán tốt hơn {Math.abs(((insights.weekendAvg - insights.weekdayAvg) / Math.max(insights.weekendAvg, insights.weekdayAvg)) * 100).toFixed(0)}%
          </p>
          <div className="flex gap-1 mt-2">
            <Badge variant="outline" className="text-xs">
              CN: {formatCurrency(insights.weekendAvg).replace(' ₫', 'đ')}
            </Badge>
            <Badge variant="outline" className="text-xs">
              T2-6: {formatCurrency(insights.weekdayAvg).replace(' ₫', 'đ')}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Shop */}
      <Card className="border-l-4 border-l-orange-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Shop xuất sắc nhất
          </CardTitle>
          <Award className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold truncate">
            {insights.topShop.shop_name}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {formatCurrency(insights.topShop.total_revenue)}
          </p>
          <Badge variant="secondary" className="mt-2 text-xs">
            {insights.topShop.total_orders} đơn • {insights.topShop.days_active} ngày
          </Badge>
        </CardContent>
      </Card>

      {/* Performance Alert */}
      {insights.worstRevenueDay.total_revenue < insights.avgDailyRevenue * 0.5 && (
        <Card className="border-l-4 border-l-red-500 md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              ⚠️ Cảnh báo hiệu suất
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              Ngày {format(parseISO(insights.worstRevenueDay.date), 'dd/MM', { locale: vi })} có doanh thu thấp 
              ({formatCurrency(insights.worstRevenueDay.total_revenue)}) - cần xem xét nguyên nhân
            </div>
          </CardContent>
        </Card>
      )}

      {/* Consistency Award */}
      <Card className="border-l-4 border-l-indigo-500 md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            🏆 Shop ổn định nhất
          </CardTitle>
          <Target className="h-4 w-4 text-indigo-500" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-bold">{insights.mostConsistentShop.shop_name}</div>
              <p className="text-xs text-muted-foreground">
                Hoạt động {insights.mostConsistentShop.days_active}/{insights.totalDays} ngày trong tháng
              </p>
            </div>
            <Badge className="bg-indigo-100 text-indigo-800">
              {((insights.mostConsistentShop.days_active / insights.totalDays) * 100).toFixed(0)}% uptime
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

QuickInsights.displayName = 'QuickInsights';

export default QuickInsights;