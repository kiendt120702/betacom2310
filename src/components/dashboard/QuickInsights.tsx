import React, { useMemo } from "react";
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

interface QuickInsightsProps {
  reports: ComprehensiveReport[];
  isLoading: boolean;
}

const QuickInsights: React.FC<QuickInsightsProps> = ({ reports, isLoading }) => {
  const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(value);

  const insights = useMemo(() => {
    if (!reports || reports.length === 0) return null;

    // Group data by date
    const dailyData = new Map<string, {
      date: string;
      total_revenue: number;
      total_orders: number;
      total_visits: number;
      shops_count: number;
    }>();

    reports.forEach(report => {
      const date = report.report_date;
      if (!dailyData.has(date)) {
        dailyData.set(date, {
          date,
          total_revenue: 0,
          total_orders: 0,
          total_visits: 0,
          shops_count: 0,
        });
      }

      const day = dailyData.get(date)!;
      day.total_revenue += report.total_revenue || 0;
      day.total_orders += report.total_orders || 0;
      day.total_visits += report.total_visits || 0;
      day.shops_count += 1;
    });

    const dailyArray = Array.from(dailyData.values()).sort((a, b) => a.date.localeCompare(b.date));

    // Find best and worst performing days
    const bestRevenueDay = dailyArray.reduce((max, day) => day.total_revenue > max.total_revenue ? day : max);
    const worstRevenueDay = dailyArray.reduce((min, day) => day.total_revenue < min.total_revenue ? day : min);
    
    // Find weekend vs weekday performance
    const weekendDays = dailyArray.filter(day => isWeekend(parseISO(day.date)));
    const weekdayDays = dailyArray.filter(day => !isWeekend(parseISO(day.date)));
    
    const weekendAvg = weekendDays.length > 0 ? 
      weekendDays.reduce((sum, day) => sum + day.total_revenue, 0) / weekendDays.length : 0;
    const weekdayAvg = weekdayDays.length > 0 ? 
      weekdayDays.reduce((sum, day) => sum + day.total_revenue, 0) / weekdayDays.length : 0;

    // Calculate trends
    const firstHalf = dailyArray.slice(0, Math.floor(dailyArray.length / 2));
    const secondHalf = dailyArray.slice(Math.floor(dailyArray.length / 2));
    
    const firstHalfAvg = firstHalf.reduce((sum, day) => sum + day.total_revenue, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, day) => sum + day.total_revenue, 0) / secondHalf.length;
    const trendPercentage = firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0;

    // Shop performance insights
    const shopData = new Map<string, {
      shop_name: string;
      total_revenue: number;
      total_orders: number;
      days_active: number;
    }>();

    reports.forEach(report => {
      if (!report.shop_id) return;
      
      if (!shopData.has(report.shop_id)) {
        shopData.set(report.shop_id, {
          shop_name: report.shops?.name || 'N/A',
          total_revenue: 0,
          total_orders: 0,
          days_active: 0,
        });
      }

      const shop = shopData.get(report.shop_id)!;
      shop.total_revenue += report.total_revenue || 0;
      shop.total_orders += report.total_orders || 0;
      shop.days_active += 1;
    });

    const shopArray = Array.from(shopData.values()).sort((a, b) => b.total_revenue - a.total_revenue);
    const topShop = shopArray[0];
    const mostConsistentShop = shopArray.reduce((max, shop) => shop.days_active > max.days_active ? shop : max);

    return {
      bestRevenueDay,
      worstRevenueDay,
      weekendAvg,
      weekdayAvg,
      trendPercentage,
      topShop,
      mostConsistentShop,
      totalDays: dailyArray.length,
      avgDailyRevenue: dailyArray.reduce((sum, day) => sum + day.total_revenue, 0) / dailyArray.length,
    };
  }, [reports]);

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
};

export default QuickInsights;