import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useComprehensiveReports, useUpdateComprehensiveReport } from "@/hooks/useComprehensiveReports"; // Import useUpdateComprehensiveReport
import { BarChart3, Calendar } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import ComprehensiveReportUpload from "@/components/admin/ComprehensiveReportUpload";
import MultiDayReportUpload from "@/components/admin/MultiDayReportUpload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input"; // Import Input component
import { useUserPermissions } from "@/hooks/useUserPermissions"; // Import useUserPermissions
import { useUserProfile } from "@/hooks/useUserProfile"; // Import useUserProfile

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
  const updateReportMutation = useUpdateComprehensiveReport(); // Initialize mutation hook

  const { data: currentUserProfile } = useUserProfile();
  const { isAdmin, isLeader } = useUserPermissions(currentUserProfile);

  // State để quản lý giá trị input cục bộ
  const [editableGoals, setEditableGoals] = useState<Map<string, { feasible_goal: string | null; breakthrough_goal: string | null }>>(new Map());

  // Khởi tạo editableGoals khi reports thay đổi
  useEffect(() => {
    const initialGoals = new Map<string, { feasible_goal: string | null; breakthrough_goal: string | null }>();
    reports.forEach(report => {
      // Chỉ lấy mục tiêu từ báo cáo đầu tiên của mỗi shop trong tháng
      if (report.shop_id && !initialGoals.has(report.shop_id)) {
        initialGoals.set(report.shop_id, {
          feasible_goal: report.feasible_goal != null ? formatNumber(report.feasible_goal) : null,
          breakthrough_goal: report.breakthrough_goal != null ? formatNumber(report.breakthrough_goal) : null,
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
    { header: "Mục tiêu khả thi (VND)", accessor: "feasible_goal", format: formatNumber, editable: true }, // New column
    { header: "Mục tiêu đột phá (VND)", accessor: "breakthrough_goal", format: formatNumber, editable: true }, // New column
  ], []);

  const monthlyShopTotals = useMemo(() => {
    if (!reports || reports.length === 0) return [];

    const shopData = new Map<string, any>();

    reports.forEach(report => {
      if (!report.shop_id) return;

      const key = report.shop_id; // Use shop_id as key for unique shops

      if (!shopData.has(key)) {
        shopData.set(key, {
          shop_id: report.shop_id,
          shop_name: report.shops?.name || 'N/A',
          personnel_name: report.shops?.personnel?.name || 'N/A',
          leader_name: report.shops?.leader?.name || 'N/A',
          total_revenue: 0,
          feasible_goal: report.feasible_goal, 
          breakthrough_goal: report.breakthrough_goal,
          report_id: report.id, // Store report ID for updating
        });
      }

      const shop = shopData.get(key);
      shop.total_revenue += report.total_revenue || 0;
    });

    // Merge with editableGoals for display
    return Array.from(shopData.values()).map(shop => {
      const currentEditable = editableGoals.get(shop.shop_id);
      return {
        ...shop,
        // Ưu tiên giá trị từ editableGoals nếu có, nếu không thì dùng giá trị từ reports
        feasible_goal: currentEditable?.feasible_goal !== undefined ? currentEditable.feasible_goal : shop.feasible_goal,
        breakthrough_goal: currentEditable?.breakthrough_goal !== undefined ? currentEditable.breakthrough_goal : shop.breakthrough_goal,
      };
    });
  }, [reports, editableGoals]); // Thêm editableGoals vào dependencies

  // Hàm xử lý thay đổi input cục bộ
  const handleLocalGoalInputChange = (
    shopId: string,
    field: 'feasible_goal' | 'breakthrough_goal',
    value: string
  ) => {
    setEditableGoals(prev => {
      const newMap = new Map(prev);
      const currentShopGoals = newMap.get(shopId) || { feasible_goal: null, breakthrough_goal: null };
      newMap.set(shopId, { ...currentShopGoals, [field]: value });
      return newMap;
    });
  };

  // Hàm gửi dữ liệu lên Supabase khi blur hoặc Enter
  const handleGoalChange = (
    reportId: string,
    shopId: string, // Cần shopId để lấy giá trị từ editableGoals
    field: 'feasible_goal' | 'breakthrough_goal'
  ) => {
    const valueFromLocalState = editableGoals.get(shopId)?.[field];
    const numericValue = valueFromLocalState === '' || valueFromLocalState === null ? null : parseFloat(String(valueFromLocalState).replace(/\./g, '').replace(',', '.'));
    
    // Chỉ gửi update nếu giá trị thay đổi và là số hợp lệ
    if (isNaN(numericValue as number) && numericValue !== null) return;

    // Tìm báo cáo gốc để so sánh giá trị hiện tại trong DB
    const originalReport = reports.find(r => r.id === reportId);
    const originalValue = originalReport ? originalReport[field] : null;

    // Chuyển đổi originalValue sang cùng định dạng số để so sánh
    const originalNumericValue = originalValue != null ? parseFloat(String(originalValue)) : null;

    // Chỉ gửi update nếu giá trị thực sự thay đổi
    if (numericValue === originalNumericValue) {
      return;
    }

    updateReportMutation.mutate({
      id: reportId,
      [field]: numericValue,
    });
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
                                value={shopTotal.feasible_goal != null ? shopTotal.feasible_goal : ''} // Lấy giá trị từ state cục bộ
                                onChange={(e) => handleLocalGoalInputChange(shopTotal.shop_id, 'feasible_goal', e.target.value)}
                                onBlur={(e) => handleGoalChange(shopTotal.report_id, shopTotal.shop_id, 'feasible_goal')}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.currentTarget.blur(); // Trigger onBlur
                                  }
                                }}
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
                                value={shopTotal.breakthrough_goal != null ? shopTotal.breakthrough_goal : ''} // Lấy giá trị từ state cục bộ
                                onChange={(e) => handleLocalGoalInputChange(shopTotal.shop_id, 'breakthrough_goal', e.target.value)}
                                onBlur={(e) => handleGoalChange(shopTotal.report_id, shopTotal.shop_id, 'breakthrough_goal')}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.currentTarget.blur(); // Trigger onBlur
                                  }
                                }}
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
        </CardContent>
      </Card>
    </div>
  );
};

export default ComprehensiveReportsPage;