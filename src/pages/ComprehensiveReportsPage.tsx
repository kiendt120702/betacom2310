import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useComprehensiveReports, useUpdateComprehensiveReport } from "@/hooks/useComprehensiveReports";
import { BarChart3, Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { format, subMonths, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import MultiDayReportUpload from "@/components/admin/MultiDayReportUpload";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { useUserProfile } from "@/hooks/useUserProfile";
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
  const monthOptions = useMemo(() => generateMonthOptions(), []);

  const { data: reports = [], isLoading: reportsLoading } = useComprehensiveReports({ month: selectedMonth });

  // Fetch previous month's data
  const previousMonth = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    return format(subMonths(date, 1), "yyyy-MM");
  }, [selectedMonth]);
  const { data: prevMonthReports = [] } = useComprehensiveReports({ month: previousMonth });

  const { data: currentUserProfile } = useUserProfile();
  const { isAdmin, isLeader } = useUserPermissions(currentUserProfile);

  const isLoading = reportsLoading;

  const formatNumber = (num: number | null | undefined) => num != null ? new Intl.NumberFormat('vi-VN').format(num) : 'N/A';

  const monthlyShopTotals = useMemo(() => {
    if (!reports || reports.length === 0) return [];

    const shopData = new Map<string, any>();

    reports.forEach(report => {
      if (!report.shop_id) return;
      const key = report.shop_id;
      if (!shopData.has(key)) {
        shopData.set(key, {
          shop_id: report.shop_id,
          shop_name: report.shops?.name || 'N/A',
          personnel_name: report.shops?.personnel?.name || 'N/A',
          leader_name: report.shops?.leader?.name || 'N/A',
          total_revenue: 0,
          feasible_goal: report.feasible_goal,
          breakthrough_goal: report.breakthrough_goal,
          report_id: report.id,
          last_report_date: null,
        });
      }
      const shop = shopData.get(key);
      shop.total_revenue += report.total_revenue || 0;
      if (!shop.last_report_date || new Date(report.report_date) > new Date(shop.last_report_date)) {
        shop.last_report_date = report.report_date;
      }
    });

    shopData.forEach((shop, shopId) => {
      const prevMonthShopReports = prevMonthReports.filter(r => r.shop_id === shopId);
      shop.total_previous_month_revenue = prevMonthShopReports.reduce((sum, r) => sum + (r.total_revenue || 0), 0);

      let like_for_like_previous_month_revenue = 0;
      if (shop.last_report_date) {
        const lastDay = parseISO(shop.last_report_date).getDate();
        like_for_like_previous_month_revenue = prevMonthShopReports
          .filter(r => parseISO(r.report_date).getDate() <= lastDay)
          .reduce((sum, r) => sum + (r.total_revenue || 0), 0);
      }
      shop.like_for_like_previous_month_revenue = like_for_like_previous_month_revenue;

      const growth = like_for_like_previous_month_revenue > 0
        ? (shop.total_revenue - like_for_like_previous_month_revenue) / like_for_like_previous_month_revenue
        : shop.total_revenue > 0 ? Infinity : 0;

      let projected_revenue = 0;
      if (shop.total_previous_month_revenue > 0 && growth !== 0 && growth !== Infinity) {
        projected_revenue = shop.total_previous_month_revenue * (1 + growth);
      } else if (shop.last_report_date) {
        const lastDay = parseISO(shop.last_report_date).getDate();
        if (lastDay > 0) {
          const dailyAverage = shop.total_revenue / lastDay;
          projected_revenue = dailyAverage * 31;
        } else {
          projected_revenue = shop.total_revenue;
        }
      } else {
        projected_revenue = shop.total_revenue;
      }
      shop.projected_revenue = projected_revenue;
    });

    return Array.from(shopData.values());
  }, [reports, prevMonthReports]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Báo cáo nhiều ngày</CardTitle>
        </CardHeader>
        <CardContent>
          <MultiDayReportUpload />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
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
                    <TableHead>Tên Shop</TableHead>
                    <TableHead>Nhân sự</TableHead>
                    <TableHead>Leader</TableHead>
                    <TableHead className="text-right">Mục tiêu khả thi (VND)</TableHead>
                    <TableHead className="text-right">Mục tiêu đột phá (VND)</TableHead>
                    <TableHead className="text-right">Doanh số xác nhận</TableHead>
                    <TableHead className="text-right">Doanh số tháng trước</TableHead>
                    <TableHead className="text-right">Tăng trưởng</TableHead>
                    <TableHead className="text-right">Doanh số dự kiến</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlyShopTotals.length > 0 ? (
                    <>
                      {monthlyShopTotals.map((shopTotal, index) => {
                        const growth = shopTotal.like_for_like_previous_month_revenue > 0
                          ? ((shopTotal.total_revenue - shopTotal.like_for_like_previous_month_revenue) / shopTotal.like_for_like_previous_month_revenue) * 100
                          : shopTotal.total_revenue > 0 ? Infinity : 0;

                        return (
                          <TableRow key={shopTotal.shop_id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{shopTotal.shop_name}</TableCell>
                            <TableCell>{shopTotal.personnel_name}</TableCell>
                            <TableCell>{shopTotal.leader_name}</TableCell>
                            <TableCell className="whitespace-nowrap text-right">{formatNumber(shopTotal.feasible_goal)}</TableCell>
                            <TableCell className="whitespace-nowrap text-right">{formatNumber(shopTotal.breakthrough_goal)}</TableCell>
                            <TableCell className="whitespace-nowrap text-right">
                              <div>{formatNumber(shopTotal.total_revenue)}</div>
                              {shopTotal.last_report_date && (
                                <div className="text-xs text-muted-foreground">
                                  ({format(parseISO(shopTotal.last_report_date), 'dd/MM/yyyy')})
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-right">{formatNumber(shopTotal.total_previous_month_revenue)}</TableCell>
                            <TableCell className="whitespace-nowrap text-right">
                              {growth === Infinity ? (
                                <span className="text-green-600 flex items-center justify-end gap-1">
                                  <TrendingUp className="h-4 w-4" /> Mới
                                </span>
                              ) : growth !== 0 ? (
                                <span className={cn("flex items-center justify-end gap-1", growth > 0 ? "text-green-600" : "text-red-600")}>
                                  {growth > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                  {growth.toFixed(1)}%
                                </span>
                              ) : (
                                <span className="text-muted-foreground">0.0%</span>
                              )}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-right font-bold">{formatNumber(shopTotal.projected_revenue)}</TableCell>
                          </TableRow>
                        );
                      })}
                    </>
                  ) : (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center h-24">
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