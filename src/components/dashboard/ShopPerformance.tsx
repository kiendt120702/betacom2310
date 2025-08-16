import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Store, Crown, TrendingUp, TrendingDown } from "lucide-react";

interface ShopPerformanceData {
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
  averageOrderValue: number;
  conversionRate: number;
  avgRevenuePerDay: number;
}

interface ShopPerformanceProps {
  performanceData: ShopPerformanceData[];
  isLoading: boolean;
}

const ShopPerformance: React.FC<ShopPerformanceProps> = React.memo(({ performanceData, isLoading }) => {
  const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(value);

  const formatNumber = (value: number) => new Intl.NumberFormat('vi-VN').format(value);

  const shopPerformance = useMemo(() => {
    return performanceData.sort((a, b) => b.total_revenue - a.total_revenue);
  }, [performanceData]);

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