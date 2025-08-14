
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useShops } from "@/hooks/useShops";
import { useShopRevenue } from "@/hooks/useShopRevenue";
import RevenueUpload from "@/components/reports/RevenueUpload";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const ConsolidatedReportPage = () => {
  const { data: shops = [] } = useShops();
  const [selectedShop, setSelectedShop] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7) // Current month in YYYY-MM format
  );

  const { data: revenueData = [], isLoading } = useShopRevenue({
    shopId: selectedShop,
    month: selectedMonth,
  });

  // Prepare chart data
  const chartData = revenueData.map(item => ({
    date: format(new Date(item.revenue_date), "dd/MM", { locale: vi }),
    revenue: item.revenue_amount,
    fullDate: item.revenue_date,
  })).reverse(); // Reverse to show chronological order

  const totalRevenue = revenueData.reduce((sum, item) => sum + Number(item.revenue_amount), 0);
  const averageRevenue = revenueData.length > 0 ? totalRevenue / revenueData.length : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Báo cáo Tổng hợp</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Section */}
        <div className="lg:col-span-1">
          <RevenueUpload />
        </div>

        {/* Filters */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Bộ lọc</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select onValueChange={setSelectedShop} value={selectedShop}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn shop..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tất cả shop</SelectItem>
                    {shops.map(shop => (
                      <SelectItem key={shop.id} value={shop.id}>{shop.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select onValueChange={setSelectedMonth} value={selectedMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn tháng..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => {
                      const date = new Date();
                      date.setMonth(date.getMonth() - i);
                      const value = date.toISOString().slice(0, 7);
                      const label = format(date, "MMMM yyyy", { locale: vi });
                      return (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tổng doanh số</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalRevenue.toLocaleString('vi-VN')} VND
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Doanh số trung bình/ngày</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(averageRevenue).toLocaleString('vi-VN')} VND
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Số ngày có dữ liệu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {revenueData.length} ngày
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Biểu đồ doanh số theo ngày</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis 
                    tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [
                      `${value.toLocaleString('vi-VN')} VND`, 
                      'Doanh số'
                    ]}
                    labelFormatter={(label, payload) => {
                      if (payload && payload[0]) {
                        return format(new Date(payload[0].payload.fullDate), "dd MMMM yyyy", { locale: vi });
                      }
                      return label;
                    }}
                  />
                  <Bar dataKey="revenue" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      {revenueData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Chi tiết doanh số</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left">Ngày</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">Doanh số</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Cập nhật lúc</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">
                        {format(new Date(item.revenue_date), "dd/MM/yyyy", { locale: vi })}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right font-semibold">
                        {Number(item.revenue_amount).toLocaleString('vi-VN')} VND
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {format(new Date(item.created_at), "dd/MM/yyyy HH:mm", { locale: vi })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="text-lg">Đang tải dữ liệu...</div>
        </div>
      )}

      {!isLoading && revenueData.length === 0 && selectedMonth && (
        <div className="text-center py-8">
          <div className="text-lg text-gray-500">
            Chưa có dữ liệu doanh số cho tháng này.
            {selectedShop && " Vui lòng upload file Excel để bắt đầu."}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsolidatedReportPage;
