import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useComprehensiveReports } from "@/hooks/useComprehensiveReports";
import { BarChart3, Calendar } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import ComprehensiveReportUpload from "@/components/admin/ComprehensiveReportUpload";
import MultiDayReportUpload from "@/components/admin/MultiDayReportUpload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const monthOptions = useMemo(() => generateMonthOptions(), []);

  const { data: reports = [], isLoading: reportsLoading } = useComprehensiveReports({ month: selectedMonth });

  const isLoading = reportsLoading;

  const formatNumber = (num: number | null | undefined) => num != null ? new Intl.NumberFormat('vi-VN').format(num) : 'N/A';

  const monthlyColumns = useMemo(() => [
    // Removed "Tháng" column
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
        });
      }

      const shop = shopData.get(report.shop_id);
      shop.total_revenue += report.total_revenue || 0;
    });

    return Array.from(shopData.values());
  }, [reports]);

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
            <div className="flex items-center gap-2"> {/* Moved month select here */}
              <BarChart3 className="h-5 w-5" />
              <CardTitle className="text-xl font-semibold">
                Báo cáo Doanh số
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground ml-4" />
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
        </CardContent>
      </Card>
    </div>
  );
};

export default ComprehensiveReportsPage;