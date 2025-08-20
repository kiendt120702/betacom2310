import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useComprehensiveReports, ComprehensiveReport } from "@/hooks/useComprehensiveReports";
import { useShops } from "@/hooks/useShops";
import { BarChart3, Store, ChevronsUpDown, Check } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import RevenueChart from "@/components/dashboard/RevenueChart";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

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

const DailySalesReport = () => {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
  const [selectedShop, setSelectedShop] = useState<string>("");
  const [openShopSelector, setOpenShopSelector] = useState(false);
  const monthOptions = useMemo(() => generateMonthOptions(), []);

  const { data: shopsData, isLoading: shopsLoading } = useShops({ page: 1, pageSize: 1000, searchTerm: "" });
  const shops = shopsData?.shops || [];

  const { data: reports = [], isLoading: reportsLoading } = useComprehensiveReports({ month: selectedMonth });

  const isLoading = shopsLoading || reportsLoading;

  const allDaysInMonth = useMemo(() => {
    if (!selectedMonth) return [];
    const [year, month] = selectedMonth.split('-').map(Number);
    const start = startOfMonth(new Date(year, month - 1));
    const end = endOfMonth(start);
    return eachDayOfInterval({ start, end });
  }, [selectedMonth]);

  const filteredReports = useMemo(() => {
    if (!selectedShop) return [];

    const reportsByDate = new Map(
      reports
        .filter(r => r.shop_id === selectedShop)
        .map(r => [r.report_date, r])
    );

    return allDaysInMonth.map(day => {
      const dateString = format(day, 'yyyy-MM-dd');
      const report = reportsByDate.get(dateString);
      
      if (report) {
        return report;
      }
      
      // Create a placeholder for days with no data
      return {
        id: dateString,
        report_date: dateString,
        total_revenue: 0,
        total_orders: 0,
        average_order_value: 0,
        shop_id: selectedShop,
        shops: null,
        buyer_return_rate: null,
        cancelled_orders: null,
        cancelled_revenue: null,
        conversion_rate: null,
        created_at: day.toISOString(),
        existing_buyers: null,
        feasible_goal: null,
        breakthrough_goal: null,
        new_buyers: null,
        potential_buyers: null,
        product_clicks: null,
        returned_orders: null,
        returned_revenue: null,
        total_buyers: null,
        total_visits: null,
        updated_at: day.toISOString(),
      } as ComprehensiveReport;
    }).sort((a, b) => a.report_date.localeCompare(b.report_date));
  }, [reports, selectedShop, allDaysInMonth]);

  const chartData = useMemo(() => {
    return filteredReports.map(r => ({
      date: r.report_date,
      revenue: r.total_revenue || 0,
    }));
  }, [filteredReports]);

  const formatCurrency = (value: number | null | undefined) => {
    if (value == null) return "N/A";
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const formatNumber = (value: number | null | undefined) => {
    if (value == null) return "N/A";
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  const formatPercentage = (value: number | null | undefined) => {
    if (value == null) return "N/A";
    return `${value.toFixed(2)}%`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <BarChart3 className="h-5 w-5" />
              <CardTitle className="text-xl font-semibold">Báo cáo Doanh số Hàng ngày</CardTitle>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Chọn tháng" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Popover open={openShopSelector} onOpenChange={setOpenShopSelector}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openShopSelector}
                    className="w-full sm:w-[240px] justify-between"
                    disabled={shopsLoading}
                  >
                    {selectedShop
                      ? shops.find((shop) => shop.id === selectedShop)?.name
                      : "Chọn shop..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[240px] p-0">
                  <Command>
                    <CommandInput placeholder="Tìm kiếm shop..." />
                    <CommandList>
                      <CommandEmpty>Không tìm thấy shop.</CommandEmpty>
                      <CommandGroup>
                        {shops.map((shop) => (
                          <CommandItem
                            key={shop.id}
                            value={shop.name}
                            onSelect={() => {
                              setSelectedShop(shop.id);
                              setOpenShopSelector(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedShop === shop.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {shop.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Đang tải dữ liệu...</p>
          ) : !selectedShop ? (
            <div className="text-center py-12 text-muted-foreground">
              <Store className="h-12 w-12 mx-auto mb-4" />
              <p>Vui lòng chọn một shop để xem báo cáo.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredReports.length > 0 ? (
                <>
                  <RevenueChart data={chartData} />
                  <div className="border rounded-md overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ngày</TableHead>
                          <TableHead className="text-right">Doanh số (VND)</TableHead>
                          <TableHead className="text-right">Số đơn hàng</TableHead>
                          <TableHead className="text-right">Giá trị TB/Đơn (VND)</TableHead>
                          <TableHead className="text-right">Lượt truy cập</TableHead>
                          <TableHead className="text-right">Tỷ lệ CĐ</TableHead>
                          <TableHead className="text-right">Người mua</TableHead>
                          <TableHead className="text-right">Đơn hủy</TableHead>
                          <TableHead className="text-right">Đơn trả hàng</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredReports.map(report => (
                          <TableRow key={report.id}>
                            <TableCell>{format(new Date(report.report_date.replace(/-/g, "/")), "dd/MM/yyyy", { locale: vi })}</TableCell>
                            <TableCell className="text-right font-medium">{formatCurrency(report.total_revenue)}</TableCell>
                            <TableCell className="text-right">{formatNumber(report.total_orders)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(report.average_order_value)}</TableCell>
                            <TableCell className="text-right">{formatNumber(report.total_visits)}</TableCell>
                            <TableCell className="text-right">{formatPercentage(report.conversion_rate)}</TableCell>
                            <TableCell className="text-right">{formatNumber(report.total_buyers)}</TableCell>
                            <TableCell className="text-right">{formatNumber(report.cancelled_orders)}</TableCell>
                            <TableCell className="text-right">{formatNumber(report.returned_orders)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Không có dữ liệu cho shop và tháng đã chọn.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DailySalesReport;