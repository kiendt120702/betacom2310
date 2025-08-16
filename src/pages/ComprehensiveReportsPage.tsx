import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useComprehensiveReports, useUpdateComprehensiveReport } from "@/hooks/useComprehensiveReports";
import { BarChart3, Calendar, Loader2, Save } from "lucide-react"; // Import Save icon
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import ComprehensiveReportUpload from "@/components/admin/ComprehensiveReportUpload";
import MultiDayReportUpload from "@/components/admin/MultiDayReportUpload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Button } from "@/components/ui/button"; // Import Button

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
  const updateReportMutation = useUpdateComprehensiveReport();

  const { data: currentUserProfile } = useUserProfile();
  const { isAdmin, isLeader } = useUserPermissions(currentUserProfile);

  const [editableGoals, setEditableGoals] = useState<Map<string, { feasible_goal: string | null; breakthrough_goal: string | null; report_id: string }>>(new Map());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const initialGoals = new Map<string, { feasible_goal: string | null; breakthrough_goal: string | null; report_id: string }>();
    reports.forEach(report => {
      if (report.shop_id && !initialGoals.has(report.shop_id)) {
        initialGoals.set(report.shop_id, {
          feasible_goal: report.feasible_goal != null ? formatNumber(report.feasible_goal) : null,
          breakthrough_goal: report.breakthrough_goal != null ? formatNumber(report.breakthrough_goal) : null,
          report_id: report.id, // Store report_id here
        });
      }
    });
    setEditableGoals(initialGoals);
  }, [reports]);

  const isLoading = reportsLoading;

  const formatNumber = (num: number | null | undefined) => num != null ? new Intl.NumberFormat('vi-VN').format(num) : 'N/A';

  const monthlyColumns = useMemo(() => [
    { header: "Tên Shop", accessor: "shop_name" },
    { header: "Nhân sự", accessor: "personnel_name" },
    { header: "Leader", accessor: "leader_name" },
    { header: "Tổng doanh số (VND)", accessor: "total_revenue", format: formatNumber },
    { header: "Mục tiêu khả thi (VND)", accessor: "feasible_goal", format: formatNumber, editable: true },
    { header: "Mục tiêu đột phá (VND)", accessor: "breakthrough_goal", format: formatNumber, editable: true },
  ], []);

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
  }, [reports, editableGoals]);

  const handleLocalGoalInputChange = (
    shopId: string,
    field: 'feasible_goal' | 'breakthrough_goal',
    value: string
  ) => {
    setEditableGoals(prev => {
      const newMap = new Map(prev);
      const currentShopGoals = newMap.get(shopId) || { feasible_goal: null, breakthrough_goal: null, report_id: '' };
      newMap.set(shopId, { ...currentShopGoals, [field]: value });
      return newMap;
    });
  };

  const handleSaveGoals = async () => {
    setIsSaving(true);
    const updates: Promise<any>[] = [];

    editableGoals.forEach((currentGoals, shopId) => {
      const originalReport = reports.find(r => r.id === currentGoals.report_id);
      if (!originalReport) return;

      const feasibleGoalNum = currentGoals.feasible_goal === '' || currentGoals.feasible_goal === null ? null : parseFloat(String(currentGoals.feasible_goal).replace(/\./g, '').replace(',', '.'));
      const breakthroughGoalNum = currentGoals.breakthrough_goal === '' || currentGoals.breakthrough_goal === null ? null : parseFloat(String(currentGoals.breakthrough_goal).replace(/\./g, '').replace(',', '.'));

      let hasChanged = false;
      const updatePayload: { id: string; feasible_goal?: number | null; breakthrough_goal?: number | null } = { id: currentGoals.report_id };

      if (feasibleGoalNum !== originalReport.feasible_goal) {
        updatePayload.feasible_goal = feasibleGoalNum;
        hasChanged = true;
      }
      if (breakthroughGoalNum !== originalReport.breakthrough_goal) {
        updatePayload.breakthrough_goal = breakthroughGoalNum;
        hasChanged = true;
      }

      if (hasChanged) {
        updates.push(updateReportMutation.mutateAsync(updatePayload));
      }
    });

    try {
      await Promise.all(updates);
      // Success toast is handled by the mutation hook itself for each update
    } catch (error) {
      // Error toast is handled by the mutation hook itself
      console.error("Error saving goals:", error);
    } finally {
      setIsSaving(false);
    }
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
                    {monthlyColumns.map(col => (
                      <TableHead key={col.accessor} className={col.accessor === 'total_revenue' || col.accessor === 'feasible_goal' || col.accessor === 'breakthrough_goal' ? 'text-right' : ''}>
                        {col.header}
                      </TableHead>
                    ))}
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
                          <TableCell className="whitespace-nowrap text-right">
                            {(isAdmin || isLeader) ? (
                              <Input
                                type="text"
                                value={editableGoals.get(shopTotal.shop_id)?.feasible_goal ?? ''}
                                onChange={(e) => handleLocalGoalInputChange(shopTotal.shop_id, 'feasible_goal', e.target.value)}
                                className="w-28 text-right h-8 px-2 py-1"
                              />
                            ) : (
                              formatNumber(shopTotal.feasible_goal)
                            )}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-right">
                            {(isAdmin || isLeader) ? (
                              <Input
                                type="text"
                                value={editableGoals.get(shopTotal.shop_id)?.breakthrough_goal ?? ''}
                                onChange={(e) => handleLocalGoalInputChange(shopTotal.shop_id, 'breakthrough_goal', e.target.value)}
                                className="w-28 text-right h-8 px-2 py-1"
                              />
                            ) : (
                              formatNumber(shopTotal.breakthrough_goal)
                            )}
                          </TableCell>
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
          {(isAdmin || isLeader) && monthlyShopTotals.length > 0 && (
            <div className="flex justify-end mt-4">
              <Button onClick={handleSaveGoals} disabled={isSaving || updateReportMutation.isPending}>
                {isSaving || updateReportMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang cập nhật...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Cập nhật mục tiêu
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ComprehensiveReportsPage;