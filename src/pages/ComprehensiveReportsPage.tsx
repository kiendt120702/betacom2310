import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useComprehensiveReports, useUpdateComprehensiveReport } from "@/hooks/useComprehensiveReports";
import { BarChart3, Calendar, TrendingUp, TrendingDown, ArrowUpDown } from "lucide-react";
import { format, subMonths, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import MultiDayReportUpload from "@/components/admin/MultiDayReportUpload";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { useUserProfile } from "@/hooks/useUserProfile";
import { cn } from "@/lib/utils";
import { useShops } from "@/hooks/useShops";
import { useEmployees } from "@/hooks/useEmployees";
import ComprehensiveReportUpload from "@/components/admin/ComprehensiveReportUpload";
import { Button } from "@/components/ui/button";

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
  const [selectedLeader, setSelectedLeader] = useState("all");
  const [selectedPersonnel, setSelectedPersonnel] = useState("all");
  const [sortConfig, setSortConfig] = useState<{ key: 'total_revenue'; direction: 'asc' | 'desc' } | null>(null);
  const monthOptions = useMemo(() => generateMonthOptions(), []);

  const { data: reports = [], isLoading: reportsLoading } = useComprehensiveReports({ month: selectedMonth });
  const { data: shopsData, isLoading: shopsLoading } = useShops({ page: 1, pageSize: 10000, searchTerm: "" });
  const allShops = shopsData?.shops || [];
  const { data: employeesData, isLoading: employeesLoading } = useEmployees({ page: 1, pageSize: 1000 });
  const leaders = useMemo(() => employeesData?.employees.filter(e => e.role === 'leader') || [], [employeesData]);
  const personnelOptions = useMemo(() => {
    if (!employeesData || selectedLeader === 'all') return [];
    return employeesData.employees.filter(e => e.role === 'personnel' && e.leader_id === selectedLeader);
  }, [employeesData, selectedLeader]);

  // Fetch previous month's data
  const previousMonth = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    return format(subMonths(date, 1), "yyyy-MM");
  }, [selectedMonth]);
  const { data: prevMonthReports = [] } = useComprehensiveReports({ month: previousMonth });

  const { data: currentUserProfile } = useUserProfile();
  const { isAdmin, isLeader } = useUserPermissions(currentUserProfile);

  const isLoading = reportsLoading || shopsLoading || employeesLoading;

  const formatNumber = (num: number | null | undefined) => num != null ? new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(num) : '';

  useEffect(() => {
    setSelectedPersonnel("all");
  }, [selectedLeader]);

  const requestSort = (key: 'total_revenue') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
      setSortConfig(null);
      return;
    }
    setSortConfig({ key, direction });
  };

  const monthlyShopTotals = useMemo(() => {
    if (isLoading) return [];

    let filteredShops = allShops;
    if (selectedLeader !== 'all') {
      filteredShops = filteredShops.filter(shop => shop.leader_id === selectedLeader);
    }
    if (selectedPersonnel !== 'all') {
      filteredShops = filteredShops.filter(shop => shop.personnel_id === selectedPersonnel);
    }

    const reportsMap = new Map<string, any[]>();
    reports.forEach(report => {
      if (!report.shop_id) return;
      if (!reportsMap.has(report.shop_id)) {
        reportsMap.set(report.shop_id, []);
      }
      reportsMap.get(report.shop_id)!.push(report);
    });

    const prevMonthReportsMap = new Map<string, any[]>();
    prevMonthReports.forEach(report => {
      if (!report.shop_id) return;
      if (!prevMonthReportsMap.has(report.shop_id)) {
        prevMonthReportsMap.set(report.shop_id, []);
      }
      prevMonthReportsMap.get(report.shop_id)!.push(report);
    });

    const mappedData = filteredShops.map(shop => {
      const shopReports = reportsMap.get(shop.id) || [];
      const prevMonthShopReports = prevMonthReportsMap.get(shop.id) || [];

      const total_revenue = shopReports.reduce((sum, r) => sum + (r.total_revenue || 0), 0);
      const lastReport = shopReports.sort((a, b) => new Date(b.report_date).getTime() - new Date(a.report_date).getTime())[0];
      
      const feasible_goal = lastReport?.feasible_goal;
      const breakthrough_goal = lastReport?.breakthrough_goal;
      const report_id = lastReport?.id;
      const last_report_date = lastReport?.report_date;

      const total_previous_month_revenue = prevMonthShopReports.reduce((sum, r) => sum + (r.total_revenue || 0), 0);

      let like_for_like_previous_month_revenue = 0;
      if (last_report_date) {
        const lastDay = parseISO(last_report_date).getDate();
        like_for_like_previous_month_revenue = prevMonthShopReports
          .filter(r => parseISO(r.report_date).getDate() <= lastDay)
          .reduce((sum, r) => sum + (r.total_revenue || 0), 0);
      }
      
      const growth = like_for_like_previous_month_revenue > 0
        ? (total_revenue - like_for_like_previous_month_revenue) / like_for_like_previous_month_revenue
        : total_revenue > 0 ? Infinity : 0;

      let projected_revenue = 0;
      if (total_previous_month_revenue > 0 && growth !== 0 && growth !== Infinity) {
        projected_revenue = total_previous_month_revenue * (1 + growth);
      } else if (last_report_date) {
        const lastDay = parseISO(last_report_date).getDate();
        if (lastDay > 0) {
          const dailyAverage = total_revenue / lastDay;
          projected_revenue = dailyAverage * 31;
        } else {
          projected_revenue = total_revenue;
        }
      } else {
        projected_revenue = total_revenue;
      }

      return {
        shop_id: shop.id,
        shop_name: shop.name,
        personnel_name: shop.personnel?.name || 'N/A',
        leader_name: shop.leader?.name || 'N/A',
        total_revenue,
        feasible_goal,
        breakthrough_goal,
        report_id,
        last_report_date,
        total_previous_month_revenue,
        like_for_like_previous_month_revenue,
        projected_revenue,
      };
    });

    let sortedData = [...mappedData];
    if (sortConfig) {
      sortedData.sort((a, b) => {
        const valA = a[sortConfig.key] ?? 0;
        const valB = b[sortConfig.key] ?? 0;
        if (valA < valB) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (valA > valB) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    } else {
      sortedData.sort((a, b) => {
        const aHasRevenue = a.total_revenue > 0;
        const bHasRevenue = b.total_revenue > 0;

        if (aHasRevenue && !bHasRevenue) {
          return -1; // a comes first
        }
        if (!aHasRevenue && bHasRevenue) {
          return 1; // b comes first
        }
        // If both have or don't have revenue, sort by name
        return a.shop_name.localeCompare(b.shop_name);
      });
    }

    return sortedData;
  }, [allShops, reports, prevMonthReports, isLoading, selectedLeader, selectedPersonnel, sortConfig]);

  const getRevenueCellColor = (
    projected: number,
    feasible: number | null | undefined,
    breakthrough: number | null | undefined
  ) => {
    if (feasible == null || breakthrough == null || projected <= 0) {
      return "";
    }

    if (projected > breakthrough) {
      return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"; // Green
    }
    if (projected > feasible) {
      return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200"; // Yellow
    }
    if (projected < feasible * 0.7) {
      return "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200"; // Purple
    }
    if (projected < feasible) {
      return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"; // Red
    }

    return "";
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            <CardTitle className="text-lg font-semibold">Chú thích màu sắc</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-green-100 border-2 border-green-200 flex-shrink-0"></div>
              <div>
                <span className="font-semibold text-green-800 dark:text-green-200">Xanh lá:</span>
                <span className="text-muted-foreground ml-1">Doanh số dự kiến &gt; Mục tiêu đột phá</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-yellow-100 border-2 border-yellow-200 flex-shrink-0"></div>
              <div>
                <span className="font-semibold text-yellow-800 dark:text-yellow-200">Vàng:</span>
                <span className="text-muted-foreground ml-1">Mục tiêu khả thi &lt; Doanh số dự kiến &lt; Mục tiêu đột phá</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-red-100 border-2 border-red-200 flex-shrink-0"></div>
              <div>
                <span className="font-semibold text-red-800 dark:text-red-200">Đỏ:</span>
                <span className="text-muted-foreground ml-1">Doanh số dự kiến &lt; Mục tiêu khả thi</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-purple-100 border-2 border-purple-200 flex-shrink-0"></div>
              <div>
                <span className="font-semibold text-purple-800 dark:text-purple-200">Tím:</span>
                <span className="text-muted-foreground ml-1">Doanh số dự kiến &lt; 70% Mục tiêu khả thi</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2 flex-wrap">
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
              <Select value={selectedLeader} onValueChange={setSelectedLeader} disabled={employeesLoading}>
                <SelectTrigger className="w-full sm:w-[240px]">
                  <SelectValue placeholder="Chọn leader" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả Leader</SelectItem>
                  {leaders.map(leader => (
                    <SelectItem key={leader.id} value={leader.id}>{leader.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedPersonnel} onValueChange={setSelectedPersonnel} disabled={employeesLoading || selectedLeader === 'all'}>
                <SelectTrigger className="w-full sm:w-[240px]">
                  <SelectValue placeholder="Chọn nhân sự" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả nhân sự</SelectItem>
                  {personnelOptions.map(personnel => (
                    <SelectItem key={personnel.id} value={personnel.id}>{personnel.name}</SelectItem>
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
                    <TableHead className="text-right">
                      <Button variant="ghost" onClick={() => requestSort('total_revenue')} className="px-2 py-1 h-auto -mx-2">
                        Doanh số xác nhận
                        {sortConfig?.key === 'total_revenue' ? (
                          sortConfig.direction === 'asc' ? (
                            <TrendingUp className="ml-2 h-4 w-4" />
                          ) : (
                            <TrendingDown className="ml-2 h-4 w-4" />
                          )
                        ) : (
                          <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground/50" />
                        )}
                      </Button>
                    </TableHead>
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
                        
                        const cellColor = getRevenueCellColor(
                          shopTotal.projected_revenue,
                          shopTotal.feasible_goal,
                          shopTotal.breakthrough_goal
                        );

                        return (
                          <TableRow key={shopTotal.shop_id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{shopTotal.shop_name}</TableCell>
                            <TableCell>{shopTotal.personnel_name}</TableCell>
                            <TableCell>{shopTotal.leader_name}</TableCell>
                            <TableCell className="whitespace-nowrap text-right">
                              {shopTotal.feasible_goal != null ? (
                                formatNumber(shopTotal.feasible_goal)
                              ) : (
                                <span className="text-muted-foreground italic">Chưa điền</span>
                              )}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-right">
                              {shopTotal.breakthrough_goal != null ? (
                                formatNumber(shopTotal.breakthrough_goal)
                              ) : (
                                <span className="text-muted-foreground italic">Chưa điền</span>
                              )}
                            </TableCell>
                            <TableCell className={cn("whitespace-nowrap text-right", cellColor)}>
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
                                  {growth.toFixed(2)}%
                                </span>
                              ) : (
                                <span className="text-muted-foreground">0.00%</span>
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