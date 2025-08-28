import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useShops } from "@/hooks/useShops";
import { useShopRevenue } from "@/hooks/useShopRevenue";
import { BarChart3, Calendar } from "lucide-react";
import { format } from "date-fns";
import { 
  generateMonthOptions, 
  formatCurrency, 
  groupRevenueByShop,
  sortByRevenue 
} from "@/utils/revenueUtils";

const RevenueReport = () => {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
  const monthOptions = useMemo(generateMonthOptions, []);

  const { data: shopsData, isLoading: shopsLoading } = useShops({ page: 1, pageSize: 1000, searchTerm: "" });
  const shops = shopsData?.shops || [];
  const { data: revenueData = [], isLoading: revenueLoading } = useShopRevenue({ month: selectedMonth });

  const isLoading = shopsLoading || revenueLoading;

  // Process shop revenue data
  const { reportData, totalRevenue } = useMemo(() => {
    if (isLoading) return { reportData: [], totalRevenue: 0 };

    const revenueByShop = groupRevenueByShop(revenueData);

    // Merge with shop info, filter and sort
    const reportData = sortByRevenue(
      shops
        .map(shop => ({
          ...shop,
          total_revenue: revenueByShop[shop.id] || 0,
        }))
        .filter(shop => shop.total_revenue > 0)
    );

    const totalRevenue = reportData.reduce((sum, shop) => sum + shop.total_revenue, 0);

    return { reportData, totalRevenue };
  }, [shops, revenueData, isLoading]);

  const tableColumns = ["Tháng", "Shop", "Nhân sự", "Leader", "Doanh Số (VND)"];
  const monthDisplay = format(new Date(selectedMonth), "MM/yyyy");

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Báo cáo Doanh số theo Shop
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
        {isLoading ? (
          <div className="text-center py-8">Đang tải báo cáo...</div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  {tableColumns.map(column => (
                    <TableHead key={column} className={column.includes("Doanh Số") ? "text-right" : ""}>
                      {column}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.length > 0 ? (
                  <>
                    {reportData.map((shop) => (
                      <TableRow key={shop.id}>
                        <TableCell>{monthDisplay}</TableCell>
                        <TableCell className="font-medium">{shop.name}</TableCell>
                        <TableCell>{shop.profile?.full_name || "N/A"}</TableCell>
                        <TableCell>{shop.profile?.manager?.full_name || "N/A"}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(shop.total_revenue)}
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {/* Total Row */}
                    <TableRow className="bg-muted/50 font-bold border-t-2">
                      <TableCell colSpan={4} className="text-right">
                        Tổng cộng ({reportData.length} shop)
                      </TableCell>
                      <TableCell className="text-right text-lg">
                        {formatCurrency(totalRevenue)}
                      </TableCell>
                    </TableRow>
                  </>
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

export default RevenueReport;