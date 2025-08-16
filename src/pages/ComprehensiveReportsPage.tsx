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

  const previousMonth = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    return format(subMonths(date, 1), "yyyy-MM");
  }, [selectedMonth]);
  const { data: prevMonthReports = [] } = useComprehensiveReports({ month: previousMonth });

  const { data: currentUserProfile } = useUserProfile();
  const { isAdmin, isLeader } = useUserPermissions(currentUserProfile);

  const isLoading = reportsLoading;

  const formatNumber = (num: number | null | undefined) => num != null ? new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(num) : 'N/A';

  const monthlyLeaderTotals = useMemo(() => {
    if (!reports || reports.length === 0) return [];

    const leaderData = new Map<string, any>();

    reports.forEach(report => {
      const leaderId = report.shops?.leader?.id || 'no-leader';
      const leaderName = report.shops?.leader?.name || 'Không có Leader';

      if (!leaderData.has(leaderId)) {
        leaderData.set(leaderId, {
          leader_id: leaderId,
          leader_name: leaderName,
          total_revenue: 0,
          shops: new Map<string, { last_report_date: string | null }>(),
        });
      }

      const leader = leaderData.get(leaderId);
      leader.total_revenue += report.total_revenue || 0;

      if (report.shop_id) {
        if (!leader.shops.has(report.shop_id)) {
          leader.shops.set(report.shop_id, { last_report_date: null });
        }
        const shop = leader.shops.get(report.shop_id);
        if (!shop.last_report_date || new Date(report.report_date) > new Date(shop.last_report_date)) {
          shop.last_report_date = report.report_date;
        }
      }
    });

    const shopGoals = new Map<string, { feasible_goal: number | null, breakthrough_goal: number | null, leader_id: string | null }>();
    reports.forEach(report => {
        if (report.shop_id && !shopGoals.has(report.shop_id)) {
            shopGoals.set(report.shop_id, {
                feasible_goal: report.feasible_goal || null,
                breakthrough_goal: report.breakthrough_goal || null,
                leader_id: report.shops?.leader?.id || 'no-leader'
            });
        }
    });

    leaderData.forEach(leader => {
        leader.feasible_goal = 0;
        leader.breakthrough_goal = 0;
    });

    shopGoals.forEach(goals => {
        const leader = leaderData.get(goals.leader_id);
        if (leader) {
            leader.feasible_goal += goals.feasible_goal || 0;
            leader.breakthrough_goal += goals.breakthrough_goal || 0;
        }
    });

    leaderData.forEach(leader => {
      let total_previous_month_revenue = 0;
      let like_for_like_previous_month_revenue = 0;

      leader.shops.forEach((shopInfo: { last_report_date: string | null }, shopId: string) => {
        const prevMonthShopReports = prevMonthReports.filter(r => r.shop_id === shopId);
        total_previous_month_revenue += prevMonthShopReports.reduce((sum, r) => sum + (r.total_revenue || 0), 0);

        if (shopInfo.last_report_date) {
          const lastDay = parseISO(shopInfo.last_report_date).getDate();
          like_for_like_previous_month_revenue += prevMonthShopReports
            .filter(r => parseISO(r.report_date).getDate() <= lastDay)
            .reduce((sum, r) => sum + (r.total_revenue || 0), 0);
        }
      });

      leader.total_previous_month_revenue = total_previous_month_revenue;
      leader.like_for_like_previous_month_revenue = like_for_like_previous_month_revenue;
    });

    leaderData.forEach(leader => {
      const growth = leader.like_for_like_previous_month_revenue > 0
        ? (leader.total_revenue - leader.like_for_like_previous_month_revenue) / leader.like_for_like_previous_month_revenue
        : leader.total_revenue > 0 ? Infinity : 0;
      
      leader.growth = growth;

      let projected_revenue = 0;
      if (leader.total_previous_month_revenue > 0 && growth !== 0 && growth !== Infinity) {
        projected_revenue = leader.total_previous_month_revenue * (1 + growth);
      } else {
        let maxLastDay = 0;
        leader.shops.forEach((shopInfo: { last_report_date: string | null }) => {
          if (shopInfo.last_report_date) {
            const day = parseISO(shopInfo.last_report_date).getDate();
            if (day > maxLastDay) {
              maxLastDay = day;
            }
          }
        });

        if (maxLastDay > 0) {
          const dailyAverage = leader.total_revenue / maxLastDay;
          projected_revenue = dailyAverage * 31;
        } else {
          projected_revenue = leader.total_revenue;
        }
      }
      leader.projected_revenue = projected_revenue;
    });

    return Array.from(leaderData.values());
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
                  {monthlyLeaderTotals.length > 0 ? (
                    <>
                      {monthlyLeaderTotals.map((leaderTotal, index) => {
                        const growth = leaderTotal.growth * 100;

                        return (
                          <TableRow key={leaderTotal.leader_id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{leaderTotal.leader_name}</TableCell>
                            <TableCell className="whitespace-nowrap text-right">{formatNumber(leaderTotal.feasible_goal)}</TableCell>
                            <TableCell className="whitespace-nowrap text-right">{formatNumber(leaderTotal.breakthrough_goal)}</TableCell>
                            <TableCell className="whitespace-nowrap text-right">
                              <div>{formatNumber(leaderTotal.total_revenue)}</div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-right">{formatNumber(leaderTotal.total_previous_month_revenue)}</TableCell>
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
                            <TableCell className="whitespace-nowrap text-right font-bold">{formatNumber(leaderTotal.projected_revenue)}</TableCell>
                          </TableRow>
                        );
                      })}
                    </>
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center h-24">
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