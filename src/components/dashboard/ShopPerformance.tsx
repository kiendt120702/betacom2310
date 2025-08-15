import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ComprehensiveReport } from "@/hooks/useComprehensiveReports";
import { Store, Crown, TrendingUp, TrendingDown } from "lucide-react";

interface ShopPerformanceProps {
  reports: ComprehensiveReport[];
  isLoading: boolean;
}

const ShopPerformance: React.FC<ShopPerformanceProps> = React.memo(({ reports, isLoading }) => {
  const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(value);

  const formatNumber = (value: number) => new Intl.NumberFormat('vi-VN').format(value);

  const shopPerformance = useMemo(() => {
    if (!reports || reports.length === 0) return [];

    // Use Record instead of Map for better performance
    const shopData: Record<string, {
      shop_id: string;
      shop_name: string;
      personnel_name: string;
      leader_name: string;
      total_revenue: number;
      total_orders: number;
      total_visits: number;
      total_buyers: number;
      new_buyers: number;
      days_active: number;
    }> = {};

    // Single pass aggregation
    for (const report of reports) {
      if (!report.shop_id) continue;

      if (!shopData[report.shop_id]) {
        shopData[report.shop_id] = {
          shop_id: report.shop_id,
          shop_name: report.shops?.name || 'N/A',
          personnel_name: report.shops?.personnel?.name || 'N/A',
          leader_name: report.shops?.leader?.name || 'N/A',
          total_revenue: 0,
          total_orders: 0,
          total_visits: 0,
          total_buyers: 0,
          new_buyers: 0,
          days_active: 0,
        };
      }

      const shop = shopData[report.shop_id];
      shop.total_revenue += report.total_revenue || 0;
      shop.total_orders += report.total_orders || 0;
      shop.total_visits += report.total_visits || 0;
      shop.total_buyers += report.total_buyers || 0;
      shop.new_buyers += report.new_buyers || 0;
      shop.days_active += 1;
    }

    // Convert to array and compute derived metrics
    const result = Object.values(shopData).map(shop => ({
      ...shop,
      averageOrderValue: shop.total_orders > 0 ? shop.total_revenue / shop.total_orders : 0,
      conversionRate: shop.total_visits > 0 ? (shop.total_orders / shop.total_visits) * 100 : 0,
      avgRevenuePerDay: shop.days_active > 0 ? shop.total_revenue / shop.days_active : 0,
    }));

    // Sort by total revenue descending
    return result.sort((a, b) => b.total_revenue - a.total_revenue);
  }, [reports]);

  const maxRevenue = shopPerformance.length > 0 ? shopPerformance[0].total_revenue : 1;

  const getRankBadge = (index: number) => {
    if (index === 0) return <Badge className="bg-yellow-500 text-white"><Crown className="w-3 h-3 mr-1" />Top 1</Badge>;
    if (index === 1) return <Badge className="bg-gray-400 text-white">Top 2</Badge>;
    if (index === 2) return <Badge className="bg-amber-600 text-white">Top 3</Badge>;
    return <Badge variant="outline">#{index + 1}</Badge>;
  };

  const getPerformanceTrend = (conversionRate: number) => {
    if (conversionRate >= 5) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (conversionRate >= 2) return <TrendingUp className="w-4 h-4 text-yellow-500" />;
    return <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Hiệu suất Shop
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="h-10 w-10 bg-muted rounded"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted rounded w-[200px]"></div>
                  <div className="h-3 bg-muted rounded w-[150px]"></div>
                </div>
                <div className="h-6 bg-muted rounded w-[80px]"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Top Performers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {shopPerformance.slice(0, 3).map((shop, index) => (
              <Card key={shop.shop_id} className="relative overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getRankBadge(index)}
                      <Store className="h-4 w-4 text-muted-foreground" />
                    </div>
                    {getPerformanceTrend(shop.conversionRate)}
                  </div>
                  <CardTitle className="text-lg">{shop.shop_name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(shop.total_revenue)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatNumber(shop.total_orders)} đơn hàng • {shop.conversionRate.toFixed(1)}% CV
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Leader: {shop.leader_name} • Nhân sự: {shop.personnel_name}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Chi tiết Hiệu suất Shop
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Xếp hạng</TableHead>
                  <TableHead>Shop</TableHead>
                  <TableHead>Nhân sự/Leader</TableHead>
                  <TableHead className="text-right">Doanh thu</TableHead>
                  <TableHead className="text-right">Đơn hàng</TableHead>
                  <TableHead className="text-right">AOV</TableHead>
                  <TableHead className="text-right">Tỷ lệ CV</TableHead>
                  <TableHead className="text-right">TB/Ngày</TableHead>
                  <TableHead>Performance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shopPerformance.map((shop, index) => (
                  <TableRow key={shop.shop_id}>
                    <TableCell>
                      {getRankBadge(index)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {shop.shop_name}
                      <div className="text-xs text-muted-foreground">
                        {shop.days_active} ngày hoạt động
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{shop.personnel_name}</div>
                        <div className="text-muted-foreground">{shop.leader_name}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(shop.total_revenue)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatNumber(shop.total_orders)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(shop.averageOrderValue)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {getPerformanceTrend(shop.conversionRate)}
                        {shop.conversionRate.toFixed(1)}%
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(shop.avgRevenuePerDay)}
                    </TableCell>
                    <TableCell>
                      <div className="w-full space-y-1">
                        <Progress 
                          value={(shop.total_revenue / maxRevenue) * 100} 
                          className="h-2"
                        />
                        <div className="text-xs text-center text-muted-foreground">
                          {((shop.total_revenue / maxRevenue) * 100).toFixed(0)}%
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

ShopPerformance.displayName = 'ShopPerformance';

export default ShopPerformance;