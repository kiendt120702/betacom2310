import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import MultiDayReportUpload from "@/components/admin/MultiDayReportUpload";
import ReportFilters from "@/components/reports/ReportFilters";
import ReportTable from "@/components/reports/ReportTable";
import { useComprehensiveReportData } from "@/hooks/useComprehensiveReportData";
import { useDebounce } from "@/hooks/useDebounce";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { useEmployees } from "@/hooks/useEmployees";

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
  const { filters, updateFilter, clearFilters } = useUrlFilters();
  const [sortConfig, setSortConfig] = useState<{ key: 'total_revenue'; direction: 'asc' | 'desc' } | null>(null);
  const [openLeaderSelector, setOpenLeaderSelector] = useState(false);
  const [openPersonnelSelector, setOpenPersonnelSelector] = useState(false);
  const debouncedSearchTerm = useDebounce(filters.searchTerm, 300);
  const monthOptions = useMemo(() => generateMonthOptions(), []);

  // Lấy tất cả employees để tìm kiếm trực tiếp
  const { data: allEmployeesData } = useEmployees({ page: 1, pageSize: 1000 });
  const allEmployees = allEmployeesData?.employees || [];

  const { isLoading, monthlyShopTotals, leaders, personnelOptions } = useComprehensiveReportData({
    selectedMonth: filters.selectedMonth,
    selectedLeader: filters.selectedLeader,
    selectedPersonnel: filters.selectedPersonnel,
    debouncedSearchTerm,
    sortConfig,
  });

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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload báo cáo tháng</CardTitle>
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
                <span className="text-muted-foreground ml-1">80% Mục tiêu khả thi &lt; Doanh số dự kiến &lt; 99% Mục tiêu khả thi</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-purple-100 border-2 border-purple-200 flex-shrink-0"></div>
              <div>
                <span className="font-semibold text-purple-800 dark:text-purple-200">Tím:</span>
                <span className="text-muted-foreground ml-1">Doanh số dự kiến &lt; 80% Mục tiêu khả thi</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <ReportFilters
            selectedMonth={filters.selectedMonth}
            onMonthChange={(value) => updateFilter('selectedMonth', value)}
            monthOptions={monthOptions}
            selectedLeader={filters.selectedLeader}
            onLeaderChange={(value) => updateFilter('selectedLeader', value)}
            leaders={leaders}
            isLeaderSelectorOpen={openLeaderSelector}
            onLeaderSelectorOpenChange={setOpenLeaderSelector}
            selectedPersonnel={filters.selectedPersonnel}
            onPersonnelChange={(value) => updateFilter('selectedPersonnel', value)}
            personnelOptions={personnelOptions}
            isPersonnelSelectorOpen={openPersonnelSelector}
            onPersonnelSelectorOpenChange={setOpenPersonnelSelector}
            searchTerm={filters.searchTerm}
            onSearchTermChange={(value) => updateFilter('searchTerm', value)}
            isLoading={isLoading}
            onClearFilters={clearFilters}
            allEmployees={allEmployees}
          />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Đang tải...</p>
          ) : (
            <ReportTable
              data={monthlyShopTotals}
              sortConfig={sortConfig}
              requestSort={requestSort}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ComprehensiveReportsPage;
