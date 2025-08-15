import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useComprehensiveReports } from "@/hooks/useComprehensiveReports";
import { useShops } from "@/hooks/useShops";
import { BarChart3, Calendar, ChevronsUpDown, Check } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import ComprehensiveReportUpload from "@/components/admin/ComprehensiveReportUpload";
import MultiDayReportUpload from "@/components/admin/MultiDayReportUpload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
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

const ComprehensiveReportsPage = () => {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
  const [selectedShop, setSelectedShop] = useState("");
  const [openShopSelector, setOpenShopSelector] = useState(false);
  const monthOptions = useMemo(() => generateMonthOptions(), []);

  const { data: reports = [], isLoading: reportsLoading } = useComprehensiveReports({ month: selectedMonth });
  const { data: shopsData, isLoading: shopsLoading } = useShops({ page: 1, pageSize: 1000, searchTerm: "" });
  const shops = shopsData?.shops || [];

  useEffect(() => {
    if (shops.length > 0 && !selectedShop) {
      setSelectedShop(shops[0].id);
    }
  }, [shops, selectedShop]);

  const isLoading = reportsLoading || shopsLoading;

  const formatNumber = (num: number | null | undefined) => num != null ? new Intl.NumberFormat('vi-VN').format(num) : 'N/A';
  const formatPercentage = (num: number | null | undefined) => num != null ? `${num.toFixed(2)}%` : 'N/A';

  const columns = [
    { header: "Ngày", accessor: "report_date" },
    { header: "Tên Shop", accessor: "shops.name" },
    { header: "Nhân sự", accessor: "shops.personnel.name" },
    { header: "Leader", accessor: "shops.leader.name" },
    { header: "Tổng doanh số (VND)", accessor: "total_revenue", format: formatNumber },
    { header: "Tổng số đơn hàng", accessor: "total_orders", format: formatNumber },
    { header: "Doanh số TB/đơn", accessor: "average_order_value", format: formatNumber },
    { header: "Lượt nhấp SP", accessor: "product_clicks", format: formatNumber },
    { header: "Lượt truy cập", accessor: "total_visits", format: formatNumber },
    { header: "Tỷ lệ chuyển đổi", accessor: "conversion_rate", format: formatPercentage },
    { header: "Đơn đã hủy", accessor: "cancelled_orders", format: formatNumber },
    { header: "Doanh số hủy", accessor: "cancelled_revenue", format: formatNumber },
    { header: "Đơn hoàn trả", accessor: "returned_orders", format: formatNumber },
    { header: "Doanh số hoàn trả", accessor: "returned_revenue", format: formatNumber },
    { header: "Tổng người mua", accessor: "total_buyers", format: formatNumber },
    { header: "Người mua mới", accessor: "new_buyers", format: formatNumber },
    { header: "Người mua hiện tại", accessor: "existing_buyers", format: formatNumber },
    { header: "Người mua tiềm năng", accessor: "potential_buyers", format: formatNumber },
    { header: "Tỷ lệ quay lại", accessor: "buyer_return_rate", format: formatPercentage },
  ];

  const monthlyColumns = useMemo(() => [
    { header: "Tháng", accessor: "report_date" },
    { header: "Tên Shop", accessor: "shop_name" },
    { header: "Nhân sự", accessor: "personnel_name" },
    { header: "Leader", accessor: "leader_name" },
    { header: "Tổng doanh số (VND)", accessor: "total_revenue", format: formatNumber },
  ], []);

  const monthlyShopTotals = useMemo(() => {
    if (!reports || reports.length === 0) return [];

    const shopData = new Map<string, any>();

    reports.forEach(report => {
      if (!report.shop_id) return;

      if (!shopData.has(report.shop_id)) {
        shopData.set(report.shop_id, {
          shop_id: report.shop_id,
          shop_name: report.shops?.name || 'N/A',
          personnel_name: report.shops?.personnel?.name || 'N/A',
          leader_name: report.shops?.leader?.name || 'N/A',
          total_revenue: 0,
          total_orders: 0,
          product_clicks: 0,
          total_visits: 0,
          cancelled_orders: 0,
          cancelled_revenue: 0,
          returned_orders: 0,
          returned_revenue: 0,
          total_buyers: 0,
          new_buyers: 0,
          existing_buyers: 0,
          potential_buyers: 0,
        });
      }

      const shop = shopData.get(report.shop_id);
      shop.total_revenue += report.total_revenue || 0;
      shop.total_orders += report.total_orders || 0;
      shop.product_clicks += report.product_clicks || 0;
      shop.total_visits += report.total_visits || 0;
      shop.cancelled_orders += report.cancelled_orders || 0;
      shop.cancelled_revenue += report.cancelled_revenue || 0;
      shop.returned_orders += report.returned_orders || 0;
      shop.returned_revenue += report.returned_revenue || 0;
      shop.total_buyers += report.total_buyers || 0;
      shop.new_buyers += report.new_buyers || 0;
      shop.existing_buyers += report.existing_buyers || 0;
      shop.potential_buyers += report.potential_buyers || 0;
    });

    const result = Array.from(shopData.values()).map(shop => {
      const average_order_value = shop.total_orders > 0 ? shop.total_revenue / shop.total_orders : 0;
      const conversion_rate = shop.total_visits > 0 ? (shop.total_orders / shop.total_visits) * 100 : 0;
      const buyer_return_rate = shop.total_buyers > 0 ? (shop.existing_buyers / shop.total_buyers) * 100 : 0;
      return { ...shop, average_order_value, conversion_rate, buyer_return_rate };
    });

    return result;
  }, [reports]);

  const filteredDailyReports = useMemo(() => {
    if (!selectedShop) {
      return [];
    }
    return reports.filter(report => report.shop_id === selectedShop);
  }, [reports, selectedShop]);

  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((o, key) => (o && o[key] != null ? o[key] : 'N/A'), obj);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Báo cáo</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="single-day">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single-day">Báo cáo 1 ngày</TabsTrigger>
              <TabsTrigger value="multi-day">Báo cáo nhiều ngày</TabsTrigger>
            </TabsList>
            <TabsContent value="single-day" className="pt-4">
              <ComprehensiveReportUpload />
            </TabsContent>
            <TabsContent value="multi-day" className="pt-4">
              <MultiDayReportUpload />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
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
          <Tabs defaultValue="monthly-overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="monthly-overview">Tổng quan tháng</TabsTrigger>
              <TabsTrigger value="daily-details">Chi tiết theo ngày</TabsTrigger>
            </TabsList>
            <TabsContent value="monthly-overview">
              {isLoading ? <p>Đang tải...</p> : (
                <div className="border rounded-md overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>STT</TableHead>
                        {monthlyColumns.map(col => <TableHead key={col.accessor} className={col.accessor === 'total_revenue' ? 'text-right' : ''}>{col.header}</TableHead>)}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monthlyShopTotals.length > 0 ? (
                        <>
                          {monthlyShopTotals.map((shopTotal, index) => (
                            <TableRow key={shopTotal.shop_id}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>{format(new Date(`${selectedMonth}-02`), "M/yyyy")}</TableCell>
                              <TableCell>{shopTotal.shop_name}</TableCell>
                              <TableCell>{shopTotal.personnel_name}</TableCell>
                              <TableCell>{shopTotal.leader_name}</TableCell>
                              <TableCell className="whitespace-nowrap text-right">{formatNumber(shopTotal.total_revenue)}</TableCell>
                            </TableRow>
                          ))}
                        </>
                      ) : (
                        <TableRow>
                          <TableCell colSpan={monthlyColumns.length + 1} className="text-center h-24">
                            Không có dữ liệu cho tháng đã chọn.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
            <TabsContent value="daily-details">
              <div className="mb-4">
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
              {isLoading ? <p>Đang tải...</p> : (
                <div className="border rounded-md overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>STT</TableHead>
                        {columns.map(col => <TableHead key={col.accessor}>{col.header}</TableHead>)}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDailyReports.length > 0 ? (
                        filteredDailyReports.map((report, index) => (
                          <TableRow key={report.id}>
                            <TableCell>{index + 1}</TableCell>
                            {columns.map(col => (
                              <TableCell key={col.accessor} className="whitespace-nowrap">
                                {col.accessor === 'report_date' 
                                  ? format(new Date(report.report_date), 'dd/MM/yyyy')
                                  : col.format 
                                    ? col.format(getNestedValue(report, col.accessor) as number) 
                                    : getNestedValue(report, col.accessor)}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={columns.length + 1} className="text-center h-24">
                            Không có dữ liệu chi tiết cho bộ lọc đã chọn.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
    </div>
  );
};

export default ComprehensiveReportsPage;