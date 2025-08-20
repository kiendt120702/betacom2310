import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import MultiDayReportUpload from "@/components/admin/MultiDayReportUpload";
import ReportFilters from "@/components/reports/ReportFilters";
import ReportTable from "@/components/reports/ReportTable";
import { useComprehensiveReportData } from "@/hooks/useComprehensiveReportData";
import { useDebounce } from "@/hooks/useDebounce";

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
  const [openLeaderSelector, setOpenLeaderSelector] = useState(false);
  const [openPersonnelSelector, setOpenPersonnelSelector] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const monthOptions = useMemo(() => generateMonthOptions(), []);

  const { isLoading, monthlyShopTotals, leaders, personnelOptions } = useComprehensiveReportData({
    selectedMonth,
    selectedLeader,
    selectedPersonnel,
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

  const handleClearFilters = () => {
    setSelectedMonth(format(new Date(), "yyyy-MM"));
    setSelectedLeader("all");
    setSelectedPersonnel("all");
    setSearchTerm("");
    setSortConfig(null);
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
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            monthOptions={monthOptions}
            selectedLeader={selectedLeader}
            onLeaderChange={setSelectedLeader}
            leaders={leaders}
            isLeaderSelectorOpen={openLeaderSelector}
            onLeaderSelectorOpenChange={setOpenLeaderSelector}
            selectedPersonnel={selectedPersonnel}
            onPersonnelChange={setSelectedPersonnel}
            personnelOptions={personnelOptions}
            isPersonnelSelectorOpen={openPersonnelSelector}
            onPersonnelSelectorOpenChange={setOpenPersonnelSelector}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            isLoading={isLoading}
            onClearFilters={handleClearFilters}
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