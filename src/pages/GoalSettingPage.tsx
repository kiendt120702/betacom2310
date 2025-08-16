import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useComprehensiveReports, useUpdateComprehensiveReport } from "@/hooks/useComprehensiveReports";
import { BarChart3, Calendar, Edit, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useNavigate } from "react-router-dom";
import { useTeams } from "@/hooks/useTeams";

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
  const [selectedTeam, setSelectedTeam] = useState("all");
  const monthOptions = useMemo(() => generateMonthOptions(), []);
  const navigate = useNavigate();

  const { data: currentUserProfile, isLoading: userProfileLoading } = useUserProfile();
  const { isAdmin, isLeader } = useUserPermissions(currentUserProfile);
  const { data: teamsData, isLoading: teamsLoading } = useTeams();

  // Redirect if not authorized
  useEffect(() => {
    if (!userProfileLoading && (!isAdmin && !isLeader)) {
      navigate("/");
    }
  }, [userProfileLoading, isAdmin, isLeader, navigate]);

  const { data: reports = [], isLoading: reportsLoading } = useComprehensiveReports({ month: selectedMonth });
  const updateReportMutation = useUpdateComprehensiveReport();

  // State to manage local input values for goals
  const [editableGoals, setEditableGoals] = useState<Map<string, { feasible_goal: string | null; breakthrough_goal: string | null }>>(new Map());
  // State to track which row is being edited
  const [editingShopId, setEditingShopId] = useState<string | null>(null);

  const formatNumber = (num: number | null | undefined) => num != null ? new Intl.NumberFormat('vi-VN').format(num) : '';

  // Initialize editableGoals when reports change
  useEffect(() => {
    const initialGoals = new Map<string, { feasible_goal: string | null; breakthrough_goal: string | null }>();
    reports.forEach(report => {
      if (report.shop_id && !initialGoals.has(report.shop_id)) {
        initialGoals.set(report.shop_id, {
          feasible_goal: report.feasible_goal != null ? formatNumber(report.feasible_goal) : null,
          breakthrough_goal: report.breakthrough_goal != null ? formatNumber(report.breakthrough_goal) : null,
        });
      }
    });
    setEditableGoals(initialGoals);
    setEditingShopId(null); // Reset editing state when reports change
  }, [reports]);

  const monthlyShopTotals = useMemo(() => {
    if (!reports || reports.length === 0) return [];

    const filteredReports = selectedTeam === 'all'
      ? reports
      : reports.filter(report => report.shops?.team_id === selectedTeam);

    const shopData = new Map<string, any>();

    filteredReports.forEach(report => {
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
        });
      }

      const shop = shopData.get(key);
      shop.total_revenue += report.total_revenue || 0;
    });

    return Array.from(shopData.values()).map(shop => {
      const currentEditable = editableGoals.get(shop.shop_id);
      return {
        ...shop,
        feasible_goal: currentEditable?.feasible_goal !== undefined ? currentEditable.feasible_goal : shop.feasible_goal,
        breakthrough_goal: currentEditable?.breakthrough_goal !== undefined ? currentEditable.breakthrough_goal : shop.breakthrough_goal,
      };
    });
  }, [reports, editableGoals, selectedTeam]);

  const handleLocalGoalInputChange = (
    shopId: string,
    field: 'feasible_goal' | 'breakthrough_goal',
    value: string
  ) => {
    const numericString = value.replace(/\D/g, '');
    if (numericString === '') {
      setEditableGoals(prev => {
        const newMap = new Map(prev);
        const currentShopGoals = newMap.get(shopId) || { feasible_goal: null, breakthrough_goal: null };
        newMap.set(shopId, { ...currentShopGoals, [field]: '' });
        return newMap;
      });
      return;
    }
    const number = parseInt(numericString, 10);
    const formattedValue = new Intl.NumberFormat('vi-VN').format(number);
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

    const feasibleGoalValue = currentEditable.feasible_goal === '' || currentEditable.feasible_goal === null ? null : parseFloat(String(currentEditable.feasible_goal).replace(/\./g, '').replace(',', '.'));
    const breakthroughGoalValue = currentEditable.breakthrough_goal === '' || currentEditable.breakthrough_goal === null ? null : parseFloat(String(currentEditable.breakthrough_goal).replace(/\./g, '').replace(',', '.'));
    
    if (isNaN(feasibleGoalValue as number) && feasibleGoalValue !== null) return;
    if (isNaN(breakthroughGoalValue as number) && breakthroughGoalValue !== null) return;

    const originalReportForShop = reports.find(r => r.shop_id === shopId);
    const originalFeasible = originalReportForShop ? originalReportForShop.feasible_goal : null;
    const originalBreakthrough = originalReportForShop ? originalReportForShop.breakthrough_goal : null;

    if (feasibleGoalValue === originalFeasible && breakthroughGoalValue === originalBreakthrough) {
      setEditingShopId(null);
      return;
    }

    updateReportMutation.mutate({
      shopId: shopId,
      month: selectedMonth,
      feasible_goal: feasibleGoalValue,
      breakthrough_goal: breakthroughGoalValue,
    }, {
      onSuccess: () => {
        setEditingShopId(null);
      }
    });
  };

  const handleCancelEdit = (shopId: string) => {
    const originalShopData = reports.find(r => r.shop_id === shopId);
    if (originalShopData) {
      setEditableGoals(prev => {
        const newMap = new Map(prev);
        newMap.set(shopId, {
          feasible_goal: originalShopData.feasible_goal != null ? formatNumber(originalShopData.feasible_goal) : null,
          breakthrough_goal: originalShopData.breakthrough_goal != null ? formatNumber(originalShopData.breakthrough_goal) : null,
        });
        return newMap;
      });
    }
    setEditingShopId(null);
  };

  if (userProfileLoading || (!isAdmin && !isLeader)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
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
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedTeam} onValueChange={setSelectedTeam} disabled={teamsLoading}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Chọn team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả Team</SelectItem>
                  {teamsData?.map(team => (
                    <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <CardDescription>
            Cập nhật mục tiêu doanh số khả thi và đột phá cho từng shop trong tháng.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reportsLoading ? <p>Đang tải...</p> : (
            <div className="border rounded-md overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>STT</TableHead>
                    <TableHead>Tên Shop</TableHead>
                    <TableHead>Nhân sự</TableHead>
                    <TableHead>Leader</TableHead>
                    <TableHead className="text-right">Doanh số xác nhận</TableHead>
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
                          <TableCell>{shopTotal.leader_name}</TableCell>
                          <TableCell className="whitespace-nowrap text-right">{new Intl.NumberFormat('vi-VN').format(shopTotal.total_revenue)}</TableCell>
                          <TableCell className="whitespace-nowrap text-right">
                            {editingShopId === shopTotal.shop_id ? (
                              <Input
                                type="text"
                                value={editableGoals.get(shopTotal.shop_id)?.feasible_goal || ''}
                                onChange={(e) => handleLocalGoalInputChange(shopTotal.shop_id, 'feasible_goal', e.target.value)}
                                className="w-28 text-right h-8 px-2 py-1"
                                disabled={updateReportMutation.isPending}
                              />
                            ) : (
                              typeof shopTotal.feasible_goal === 'string' ? shopTotal.feasible_goal : formatNumber(shopTotal.feasible_goal)
                            )}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-right">
                            {editingShopId === shopTotal.shop_id ? (
                              <Input
                                type="text"
                                value={editableGoals.get(shopTotal.shop_id)?.breakthrough_goal || ''}
                                onChange={(e) => handleLocalGoalInputChange(shopTotal.shop_id, 'breakthrough_goal', e.target.value)}
                                className="w-28 text-right h-8 px-2 py-1"
                                disabled={updateReportMutation.isPending}
                              />
                            ) : (
                              typeof shopTotal.breakthrough_goal === 'string' ? shopTotal.breakthrough_goal : formatNumber(shopTotal.breakthrough_goal)
                            )}
                          </TableCell>
                          <TableCell className="text-right">
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