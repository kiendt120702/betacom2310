
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useShops } from "@/hooks/useShops";
import { useShopRevenue } from "@/hooks/useShopRevenue";
import { useToast } from "@/hooks/use-toast";
import RevenueChart from "@/components/reports/RevenueChart";
import RevenueStats from "@/components/reports/RevenueStats";
import RevenueUpload from "@/components/reports/RevenueUpload";
import { BarChart3, Calendar, Filter } from "lucide-react";

const RevenueStatisticsPage = () => {
  const { data: shops = [] } = useShops();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedShop, setSelectedShop] = useState<string>("all");
  const { toast } = useToast();

  const { data: revenueData = [], isLoading } = useShopRevenue({
    shopId: selectedShop === "all" ? undefined : selectedShop,
    month: selectedMonth
  });

  // Process data for charts
  const processedData = React.useMemo(() => {
    if (!revenueData.length) return [];
    
    // Group by date and sum revenue
    const dailyRevenue = revenueData.reduce((acc, item) => {
      const date = new Date(item.revenue_date).toLocaleDateString('vi-VN');
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += Number(item.revenue_amount);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(dailyRevenue)
      .map(([date, revenue]) => ({
        date,
        revenue,
        formattedRevenue: new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
        }).format(revenue)
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [revenueData]);

  // Calculate statistics
  const stats = React.useMemo(() => {
    if (!processedData.length) {
      return {
        totalRevenue: 0,
        averageDaily: 0,
        highestDay: { date: "", revenue: 0 },
        totalDays: 0
      };
    }

    const totalRevenue = processedData.reduce((sum, item) => sum + item.revenue, 0);
    const averageDaily = totalRevenue / processedData.length;
    const highestDay = processedData.reduce((max, item) => 
      item.revenue > max.revenue ? item : max, processedData[0]
    );

    return {
      totalRevenue,
      averageDaily,
      highestDay,
      totalDays: processedData.length
    };
  }, [processedData]);

  // Process monthly data
  const monthlyData = React.useMemo(() => {
    if (!revenueData.length) return [];
    
    const monthlyRevenue = revenueData.reduce((acc, item) => {
      const date = new Date(item.revenue_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!acc[monthKey]) {
        acc[monthKey] = 0;
      }
      acc[monthKey] += Number(item.revenue_amount);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(monthlyRevenue)
      .map(([date, revenue]) => ({
        date: `Tháng ${date.split('-')[1]}/${date.split('-')[0]}`,
        revenue,
        formattedRevenue: new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
        }).format(revenue)
      }));
  }, [revenueData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="h-8 w-8" />
          Thống kê Doanh số
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Bộ lọc
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Chọn tháng</label>
                  <Input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Chọn shop</label>
                  <Select value={selectedShop} onValueChange={setSelectedShop}>
                    <SelectTrigger>
                      <SelectValue />
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
            </CardContent>
          </Card>

          {/* Statistics */}
          {processedData.length > 0 && (
            <RevenueStats {...stats} />
          )}

          {/* Daily Chart */}
          {processedData.length > 0 && (
            <RevenueChart 
              data={processedData} 
              title="Doanh số theo ngày" 
              type="bar"
            />
          )}

          {/* Monthly Chart */}
          {monthlyData.length > 0 && (
            <RevenueChart 
              data={monthlyData} 
              title="Doanh số theo tháng" 
              type="line"
            />
          )}

          {/* No data message */}
          {!isLoading && processedData.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Chưa có dữ liệu doanh số</h3>
                <p className="text-muted-foreground">
                  Vui lòng upload file Excel để xem thống kê doanh số
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-1">
          <RevenueUpload />
        </div>
      </div>
    </div>
  );
};

export default RevenueStatisticsPage;
