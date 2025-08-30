import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useShops } from "@/hooks/useShops";
import { useShopRevenue } from "@/hooks/useShopRevenue";
import { Calendar, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { 
  generateMonthOptions, 
  formatCurrency, 
  groupRevenueByDate,
  calculateRevenueStats 
} from "@/utils/revenueUtils";

const DailySalesReport = () => {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
  const [selectedShop, setSelectedShop] = useState<string>("all");
  
  const monthOptions = useMemo(generateMonthOptions, []);
  const { data: shopsData, isLoading: shopsLoading } = useShops({ page: 1, pageSize: 1000, searchTerm: "" });
  const shops = shopsData?.shops || [];
  const { data: revenueData = [], isLoading: revenueLoading } = useShopRevenue({ 
    month: selectedMonth, 
    shopId: selectedShop 
  });

  const isLoading = shopsLoading || revenueLoading;

  // Process daily revenue data
  const { dailyData, stats } = useMemo(() => {
    if (isLoading) return { dailyData: [], stats: { total: 0, average: 0, daysCount: 0 } };

    const revenueByDate = groupRevenueByDate(revenueData);

    const dailyData = Object.entries(revenueByDate)
      .map(([date, totalRevenue]) => ({
        date,
        totalRevenue,
        formattedDate: format(new Date(date), "dd/MM/yyyy", { locale: vi }),
        dayOfWeek: format(new Date(date), "EEEE", { locale: vi }),
        shopNames: selectedShop === "all" 
          ? [...new Set(revenueData
              .filter(r => r.revenue_date === date)
              .map(r => shops.find(s => s.id === r.shop_id)?.name || "N/A")
            )]
          : []
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const revenueAmounts = dailyData.map(day => day.totalRevenue);
    const { total, average, count } = calculateRevenueStats(revenueAmounts);

    return {
      dailyData,
      stats: { total, average, daysCount: count }
    };
  }, [revenueData, shops, selectedShop, isLoading]);

  // Stats cards config
  const statsCards = [
    { 
      title: "Tổng doanh số tháng", 
      value: `${formatCurrency(stats.total)} VND`, 
      className: "text-green-600" 
    },
    { 
      title: "Doanh số trung bình/ngày", 
      value: `${formatCurrency(stats.average)} VND`, 
      className: "text-blue-600" 
    },
    { 
      title: "Số ngày có doanh số", 
      value: `${stats.daysCount} ngày`, 
      className: "text-purple-600" 
    }
  ];

  const tableColumns = [
    "Ngày", 
    "Thứ", 
    ...(selectedShop === "all" ? ["Shop"] : []), 
    "Doanh số (VND)"
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Doanh số Hàng ngày
          </CardTitle>
          
          <div className="flex items-center gap-4">
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
            
            <Select value={selectedShop} onValueChange={setSelectedShop}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Chọn shop" />
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
      </CardHeader>
      
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {statsCards.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">{stat.title}</div>
                <div className={`text-2xl font-bold ${stat.className}`}>
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Daily Revenue Table */}
        {isLoading ? (
          <div className="text-center py-8">Đang tải báo cáo...</div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  {tableColumns.map(column => (
                    <TableHead key={column} className={column.includes("Doanh số") ? "text-right" : ""}>
                      {column}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {dailyData.length > 0 ? (
                  dailyData.map((day) => (
                    <TableRow key={day.date}>
                      <TableCell className="font-medium">{day.formattedDate}</TableCell>
                      <TableCell>{day.dayOfWeek}</TableCell>
                      {selectedShop === "all" && (
                        <TableCell>{day.shopNames.join(", ")}</TableCell>
                      )}
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(day.totalRevenue)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={tableColumns.length} className="text-center h-24">
                      <div>Không có dữ liệu doanh số cho tháng đã chọn.</div>
                      <div className="text-sm text-muted-foreground mt-2">
                        Hãy kiểm tra xem bạn đã upload file doanh số cho tháng này chưa.
                      </div>
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

export default DailySalesReport;