import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarIcon, DollarSign, ShoppingCart, Users, TrendingUp, Search } from "lucide-react";
import { useDailyShopMetrics } from "@/hooks/useDailyShopMetrics";
import { useShops } from "@/hooks/useShops";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorDisplay from "@/components/ErrorDisplay";

const DailyMetricsPage: React.FC = () => {
  const [selectedShopId, setSelectedShopId] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 7)), // Last 7 days
    to: new Date(),
  });

  const { data: shops, isLoading: shopsLoading, error: shopsError } = useShops();
  const { data: metrics, isLoading: metricsLoading, error: metricsError } = useDailyShopMetrics({
    shopId: selectedShopId,
    startDate: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
    endDate: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
  });

  const totalSales = useMemo(() => metrics?.reduce((sum, m) => sum + m.total_sales_vnd, 0) || 0, [metrics]);
  const totalOrders = useMemo(() => metrics?.reduce((sum, m) => sum + m.total_orders, 0) || 0, [metrics]);
  const totalBuyers = useMemo(() => metrics?.reduce((sum, m) => sum + m.total_buyers, 0) || 0, [metrics]);
  const avgConversionRate = useMemo(() => {
    const sumRates = metrics?.reduce((sum, m) => sum + m.conversion_rate, 0) || 0;
    return metrics?.length ? (sumRates / metrics.length) * 100 : 0;
  }, [metrics]);

  if (shopsLoading || metricsLoading) {
    return <LoadingSpinner message="Đang tải dữ liệu chỉ số hàng ngày..." />;
  }

  if (shopsError || metricsError) {
    return <ErrorDisplay message="Không thể tải dữ liệu chỉ số hàng ngày." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Chỉ số hiệu suất hàng ngày</h1>
        <p className="text-muted-foreground mt-2">
          Theo dõi các chỉ số quan trọng của shop theo từng ngày.
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <Select value={selectedShopId} onValueChange={setSelectedShopId}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Chọn Shop" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả Shops</SelectItem>
              {shops?.map(shop => (
                <SelectItem key={shop.id} value={shop.id}>{shop.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-full sm:w-[300px] justify-start text-left font-normal",
                  !dateRange?.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "dd/MM/yyyy")} -{" "}
                      {format(dateRange.to, "dd/MM/yyyy")}
                    </>
                  ) : (
                    format(dateRange.from, "dd/MM/yyyy")
                  )
                ) : (
                  <span>Chọn ngày</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Doanh Số</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('vi-VN').format(totalSales)} VND
            </div>
            <p className="text-xs text-muted-foreground">Trong khoảng thời gian đã chọn</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Đơn Hàng</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('vi-VN').format(totalOrders)}
            </div>
            <p className="text-xs text-muted-foreground">Trong khoảng thời gian đã chọn</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Người Mua</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('vi-VN').format(totalBuyers)}
            </div>
            <p className="text-xs text-muted-foreground">Trong khoảng thời gian đã chọn</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tỷ Lệ Chuyển Đổi TB</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {avgConversionRate.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">Trung bình hàng ngày</p>
          </CardContent>
        </Card>
      </div>

      {/* Metrics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Chi tiết chỉ số hàng ngày</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Shop</TableHead>
                  <TableHead className="text-right">Doanh số (VND)</TableHead>
                  <TableHead className="text-right">Đơn hàng</TableHead>
                  <TableHead className="text-right">Tỷ lệ chuyển đổi</TableHead>
                  <TableHead className="text-right">Lượt truy cập</TableHead>
                  <TableHead className="text-right">Người mua</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics?.length ? (
                  metrics.map((metric) => (
                    <TableRow key={metric.id}>
                      <TableCell>{format(new Date(metric.metric_date), "dd/MM/yyyy")}</TableCell>
                      <TableCell>{shops?.find(s => s.id === metric.shop_id)?.name || "N/A"}</TableCell>
                      <TableCell className="text-right">{new Intl.NumberFormat('vi-VN').format(metric.total_sales_vnd)}</TableCell>
                      <TableCell className="text-right">{new Intl.NumberFormat('vi-VN').format(metric.total_orders)}</TableCell>
                      <TableCell className="text-right">{(metric.conversion_rate * 100).toFixed(2)}%</TableCell>
                      <TableCell className="text-right">{new Intl.NumberFormat('vi-VN').format(metric.total_visits)}</TableCell>
                      <TableCell className="text-right">{new Intl.NumberFormat('vi-VN').format(metric.total_buyers)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Không có dữ liệu chỉ số cho khoảng thời gian và shop đã chọn.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyMetricsPage;