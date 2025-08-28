import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useComprehensiveReports, useUpdateComprehensiveReport, ComprehensiveReport } from "@/hooks/useComprehensiveReports";
import { BarChart3, Calendar, TrendingUp, TrendingDown, ArrowUpDown, ChevronsUpDown, Check, Loader2, Edit } from "lucide-react";
import { format, subMonths, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useNavigate } from "react-router-dom";
import { useShops } from "@/hooks/useShops";
import { cn } from "@/lib/utils";
import { formatCurrency, parseCurrency } from "@/lib/numberUtils";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";

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

const GoalSettingPage: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
  const [selectedLeader, setSelectedLeader] = useState("");
  const monthOptions = useMemo(() => generateMonthOptions(), []);
  const navigate = useNavigate();
  const [openLeaderSelector, setOpenLeaderSelector] = useState(false);
  const [openPersonnelSelector, setOpenPersonnelSelector] = useState(false);

  const { data: currentUserProfile, isLoading: userProfileLoading } = useUserProfile();
  const { isAdmin, isLeader } = useUserPermissions(currentUserProfile);

  const { data: shopsData, isLoading: shopsLoading } = useShops({
    page: 1,
    pageSize: 10000,
    searchTerm: "",
    status: "Đang Vận Hành",
  });
  const allOperationalShops = shopsData?.shops || [];

  const { data: reports = [], isLoading: reportsLoading } = useComprehensiveReports({ month: selectedMonth });
  const updateReportMutation = useUpdateComprehensiveReport();

  const previousMonth = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    return format(subMonths(date, 1), "yyyy-MM");
  }, [selectedMonth]);
  const { data: prevMonthReports = [] } = useComprehensiveReports({ month: previousMonth });

  const [editableGoals, setEditableGoals] = useState<Map<string, { feasible_goal: string | null; breakthrough_goal: string | null }>>(new Map());
  const [editingShopId, setEditingShopId] = useState<string | null>(null);

  const leaders: any[] = [];

  useEffect(() => {
    setSelectedLeader('all');
  }, []);

  const monthlyShopTotals = useMemo(() => {
    if (shopsLoading || reportsLoading) return [];

    const filteredShops = selectedLeader === 'all'
      ? allOperationalShops
      : allOperationalShops.filter(shop => shop.leader_id === selectedLeader);

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
      
      const lastReportWithFeasibleGoal = shopReports
        .filter((r: ComprehensiveReport) => r.feasible_goal != null)
        .sort((a: ComprehensiveReport, b: ComprehensiveReport) => new Date(b.report_date).getTime() - new Date(a.report_date).getTime())[0];
      
      const lastReportWithBreakthroughGoal = shopReports
        .filter((r: ComprehensiveReport) => r.breakthrough_goal != null)
        .sort((a: ComprehensiveReport, b: ComprehensiveReport) => new Date(b.report_date).getTime() - new Date(a.report_date).getTime())[0];

      const feasible_goal = lastReportWithFeasibleGoal?.feasible_goal;
      const breakthrough_goal = lastReportWithBreakthroughGoal?.breakthrough_goal;
      
      const lastReport = shopReports.sort((a, b) => new Date(b.report_date).getTime() - new Date(a.report_date).getTime())[0];
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
        personnel_name: shop.profile?.full_name || 'N/A',
        personnel_account: shop.profile?.email || 'N/A',
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

    return mappedData.sort((a, b) => {
      const aPersonnel = a.personnel_name;
      const bPersonnel = b.personnel_name;

      if (aPersonnel === 'N/A' && bPersonnel !== 'N/A') return 1;
      if (aPersonnel !== 'N/A' && bPersonnel === 'N/A') return -1;

      const personnelComparison = aPersonnel.localeCompare(bPersonnel, 'vi');
      if (personnelComparison !== 0) {
        return personnelComparison;
      }
      
      return a.shop_name.localeCompare(b.shop_name, 'vi');
    });
  }, [allOperationalShops, reports, prevMonthReports, shopsLoading, reportsLoading, selectedLeader]);

  useEffect(() => {
    const initialGoals = new Map<string, { feasible_goal: string | null; breakthrough_goal: string | null }>();
    monthlyShopTotals.forEach(shop => {
      initialGoals.set(shop.shop_id, {
        feasible_goal: formatCurrency(shop.feasible_goal),
        breakthrough_goal: formatCurrency(shop.breakthrough_goal),
      });
    });
    setEditableGoals(initialGoals);
    setEditingShopId(null);
  }, [monthlyShopTotals]);

  const handleLocalGoalInputChange = (
    shopId: string,
    field: 'feasible_goal' | 'breakthrough_goal',
    value: string
  ) => {
    const numericString = value.replace(/\D/g, '');
    const numberValue = numericString ? parseInt(numericString, 10) : null;
    const formattedValue = numberValue !== null ? formatCurrency(numberValue) : '';

    setEditableGoals(prev => {
      const newMap = new Map(prev);
      const currentShopGoals = newMap.get(shopId) || { feasible_goal: null, breakthrough_goal: null };
      newMap.set(shopId, { ...currentShopGoals, [field]: formattedValue });
      return newMap;
    });
  };

  const handleSaveGoals = (shopId: string) => {
    const currentEditable = editableGoals.get(shopId);
    if (!currentEditable) return;

    const feasibleGoalValue = parseCurrency(currentEditable.feasible_goal);
    const breakthroughGoalValue = parseCurrency(currentEditable.breakthrough_goal);

    // Optimistic UI update
    setEditingShopId(null);

    updateReportMutation.mutate({
      shopId: shopId,
      month: selectedMonth,
      feasible_goal: feasibleGoalValue,
      breakthrough_goal: breakthroughGoalValue,
    }, {
      onError: () => {
        // Revert on error
        setEditingShopId(shopId);
      }
    });
  };

  const handleCancelEdit = (shopId: string) => {
    const originalShopData = monthlyShopTotals.find(s => s.shop_id === shopId);
    if (originalShopData) {
      setEditableGoals(prev => {
        const newMap = new Map(prev);
        newMap.set(shopId, {
          feasible_goal: formatCurrency(originalShopData.feasible_goal),
          breakthrough_goal: formatCurrency(originalShopData.breakthrough_goal),
        });
        return newMap;
      });
    }
    setEditingShopId(null);
  };

  // Helper function to format display value safely
  const getDisplayValue = (shopId: string, field: 'feasible_goal' | 'breakthrough_goal'): string => {
    const editableValue = editableGoals.get(shopId)?.[field];
    if (editableValue === null || editableValue === undefined) return '';
    return editableValue;
  };

  if (userProfileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <BarChart3 className="h-5 w-5" />
              <CardTitle className="text-xl font-semibold">
                Quản lý Mục tiêu Doanh số
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground ml-4" />
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Chọn tháng" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Popover open={openLeaderSelector} onOpenChange={setOpenLeaderSelector}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openLeaderSelector}
                    className="w-full sm:w-[240px] justify-between"
                    disabled={false}
                  >
                    {selectedLeader !== 'all'
                      ? leaders.find((leader) => leader.id === selectedLeader)?.name
                      : "Tất cả Leader"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[240px] p-0">
                  <Command>
                    <CommandInput placeholder="Tìm kiếm leader..." />
                    <CommandList>
                      <CommandEmpty>Không tìm thấy leader.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          onSelect={() => {
                            setSelectedLeader("all");
                            setOpenLeaderSelector(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedLeader === "all" ? "opacity-100" : "opacity-0"
                            )}
                          />
                          Tất cả Leader
                        </CommandItem>
                        {leaders.map((leader) => (
                          <CommandItem
                            key={leader.id}
                            value={leader.name}
                            onSelect={() => {
                              setSelectedLeader(leader.id);
                              setOpenLeaderSelector(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedLeader === leader.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {leader.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <CardDescription>
            Cập nhật mục tiêu doanh số khả thi và đột phá cho từng shop trong tháng.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reportsLoading || shopsLoading ? <p>Đang tải...</p> : (
            <div className="border rounded-md overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>STT</TableHead>
                    <TableHead>Tên Shop</TableHead>
                    <TableHead>Nhân sự</TableHead>
                    <TableHead>Nhân sự (Tài khoản)</TableHead>
                    <TableHead>Leader</TableHead>
                    <TableHead className="text-right">Mục tiêu khả thi (VND)</TableHead>
                    <TableHead className="text-right">Mục tiêu đột phá (VND)</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
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
                          <TableCell>{shopTotal.personnel_name}</TableCell>
                          <TableCell>{shopTotal.leader_name}</TableCell>
                          <TableCell className="whitespace-nowrap text-right">
                            {editingShopId === shopTotal.shop_id ? (
                              <Input
                                type="text"
                                inputMode="numeric"
                                value={getDisplayValue(shopTotal.shop_id, 'feasible_goal')}
                                onChange={(e) => handleLocalGoalInputChange(shopTotal.shop_id, 'feasible_goal', e.target.value)}
                                className="w-28 text-right h-8 px-2 py-1"
                                disabled={updateReportMutation.isPending}
                                placeholder="0"
                              />
                            ) : (
                              shopTotal.feasible_goal != null ? (
                                <span>{formatCurrency(shopTotal.feasible_goal)}</span>
                              ) : (
                                <span className="text-muted-foreground italic">Chưa điền</span>
                              )
                            )}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-right">
                            {editingShopId === shopTotal.shop_id ? (
                              <Input
                                type="text"
                                inputMode="numeric"
                                value={getDisplayValue(shopTotal.shop_id, 'breakthrough_goal')}
                                onChange={(e) => handleLocalGoalInputChange(shopTotal.shop_id, 'breakthrough_goal', e.target.value)}
                                className="w-28 text-right h-8 px-2 py-1"
                                disabled={updateReportMutation.isPending}
                                placeholder="0"
                              />
                            ) : (
                              shopTotal.breakthrough_goal != null ? (
                                <span>{formatCurrency(shopTotal.breakthrough_goal)}</span>
                              ) : (
                                <span className="text-muted-foreground italic">Chưa điền</span>
                              )
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <>
                              {editingShopId === shopTotal.shop_id ? (
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCancelEdit(shopTotal.shop_id)}
                                    disabled={updateReportMutation.isPending}
                                  >
                                    Hủy
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleSaveGoals(shopTotal.shop_id)}
                                    disabled={updateReportMutation.isPending}
                                  >
                                    {updateReportMutation.isPending ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Lưu...
                                      </>
                                    ) : (
                                      "Lưu"
                                    )}
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setEditingShopId(shopTotal.shop_id)}
                                  disabled={updateReportMutation.isPending}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                            </>
                          </TableCell>
                        </TableRow>
                      ))}
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

export default GoalSettingPage;