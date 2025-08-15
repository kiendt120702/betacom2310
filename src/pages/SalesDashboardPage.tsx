import React, { useState } from "react";
import { DateRange } from "react-day-picker";
import { startOfMonth, endOfMonth } from "date-fns";
import { useSalesAnalytics } from "@/hooks/useSalesAnalytics";
import { useShops } from "@/hooks/useShops";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import KpiCard from "@/components/KpiCard";
import RevenueChart from "@/components/RevenueChart";
import { DollarSign, ShoppingCart, BarChart, MousePointerClick } from "lucide-react";

const SalesDashboardPage = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [selectedShop, setSelectedShop] = useState("all");

  const { data: shops = [] } = useShops();
  const { data: analyticsData, isLoading } = useSalesAnalytics({
    startDate: dateRange?.from,
    endDate: dateRange?.to,
    shopId: selectedShop,
  });

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Doanh số</h1>
          <p className="text-muted-foreground">Tổng quan hiệu suất kinh doanh</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
          <Select value={selectedShop} onValueChange={setSelectedShop}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Chọn shop" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả Shop</SelectItem>
              {shops.map((shop) => (
                <SelectItem key={shop.id} value={shop.id}>
                  {shop.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <p>Đang tải dữ liệu...</p>
      ) : analyticsData ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              title="Tổng doanh thu"
              value={formatCurrency(analyticsData.kpis.totalRevenue)}
              icon={DollarSign}
            />
            <KpiCard
              title="Tổng đơn hàng"
              value={analyticsData.kpis.totalOrders.toLocaleString("vi-VN")}
              icon={ShoppingCart}
            />
            <KpiCard
              title="Doanh thu TB/đơn"
              value={formatCurrency(analyticsData.kpis.averageOrderValue)}
              icon={BarChart}
            />
            <KpiCard
              title="Tỷ lệ chuyển đổi"
              value={`${analyticsData.kpis.conversionRate.toFixed(2)}%`}
              icon={MousePointerClick}
            />
          </div>
          <RevenueChart data={analyticsData.chartData} />
        </>
      ) : (
        <p>Không có dữ liệu cho khoảng thời gian đã chọn.</p>
      )}
    </div>
  );
};

export default SalesDashboardPage;