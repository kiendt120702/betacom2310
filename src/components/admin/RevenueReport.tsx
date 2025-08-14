import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useShops } from "@/hooks/useShops";
import { useShopRevenue } from "@/hooks/useShopRevenue";
import { BarChart3, Calendar } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const generateMonthOptions = () => {
  const options = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    options.push({
      value: format(date, "yyyy-MM"),
      label: format(date, "MMMM yyyy", { locale: vi }),
    });
  }
  return options;
};

const RevenueReport = () => {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
  const monthOptions = useMemo(() => generateMonthOptions(), []);

  const { data: shops = [], isLoading: shopsLoading } = useShops();
  const { data: revenueData = [], isLoading: revenueLoading } = useShopRevenue({ month: selectedMonth });

  const reportData = useMemo(() => {
    if (shopsLoading || revenueLoading) return [];

    const revenueByShop = revenueData.reduce((acc, revenue) => {
      if (!acc[revenue.shop_id]) {
        acc[revenue.shop_id] = 0;
      }
      acc[revenue.shop_id] += revenue.revenue_amount;
      return acc;
    }, {} as Record<string, number>);

    return shops.map(shop => ({
      ...shop,
      total_revenue: revenueByShop[shop.id] || 0,
    })).filter(shop => shop.total_revenue > 0); // Only show shops with revenue for the month

  }, [shops, revenueData, shopsLoading, revenueLoading]);

  const totalMonthlyRevenue = useMemo(() => {
    return reportData.reduce((sum, shop) => sum + shop.total_revenue, 0);
  }, [reportData]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Báo cáo Doanh số
          </CardTitle>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Chọn tháng" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {shopsLoading || revenueLoading ? (
          <p>Đang tải báo cáo...</p>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tháng</TableHead>
                  <TableHead>Shop</TableHead>
                  <TableHead>Nhân sự</TableHead>
                  <TableHead>Leader</TableHead>
                  <TableHead className="text-right">Doanh Số (VND)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.length > 0 ? (
                  <>
                    {reportData.map((shop) => (
                      <TableRow key={shop.id}>
                        <TableCell>{format(new Date(selectedMonth), "MM/yyyy")}</TableCell>
                        <TableCell className="font-medium">{shop.name}</TableCell>
                        <TableCell>{shop.profiles?.full_name || "N/A"}</TableCell>
                        <TableCell>{shop.leader_profile?.full_name || "N/A"}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {new Intl.NumberFormat('vi-VN').format(shop.total_revenue)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/50 font-bold">
                      <TableCell colSpan={4} className="text-right">Tổng cộng</TableCell>
                      <TableCell className="text-right text-lg">
                        {new Intl.NumberFormat('vi-VN').format(totalMonthlyRevenue)}
                      </TableCell>
                    </TableRow>
                  </>
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                      Không có dữ liệu doanh số cho tháng đã chọn.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RevenueReport;