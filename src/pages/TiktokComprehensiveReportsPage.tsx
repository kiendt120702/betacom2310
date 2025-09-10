import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatCard from '@/components/dashboard/StatCard';
import ReportFilters from '@/components/reports/ReportFilters';
import ReportTable from '@/components/reports/ReportTable';
import ReportLegend from '@/components/reports/ReportLegend';
import { useReportFilters } from '@/hooks/useReportFilters';
import { useTiktokComprehensiveReportData } from '@/hooks/useTiktokComprehensiveReportData';
import { generateMonthOptions } from '@/utils/revenueUtils';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Store, Award, CheckCircle, AlertTriangle, Target } from 'lucide-react';

/**
 * TikTok Comprehensive Reports Page Component
 * Displays comprehensive reporting data for TikTok shops with filtering and statistics
 */
const TiktokComprehensiveReportsPage = () => {
  const {
    filters,
    sortConfig,
    openStates,
    updateFilter,
    setSortConfig,
    setOpenLeaderSelector,
    setOpenPersonnelSelector,
    clearFilters,
    activeFiltersCount
  } = useReportFilters();

  // Get processed data using the custom hook
  const {
    isLoading,
    monthlyShopTotals,
    leaders,
    personnelOptions,
  } = useTiktokComprehensiveReportData({
    selectedMonth: filters.selectedMonth,
    selectedLeader: filters.selectedLeader,
    selectedPersonnel: filters.selectedPersonnel,
    debouncedSearchTerm: filters.searchTerm,
    sortConfig,
  });

  // Generate month options
  const monthOptions = generateMonthOptions();

  // Handle sorting
  const handleSortRequest = (key: 'total_revenue') => {
    const direction = sortConfig?.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  };

  // Use monthlyShopTotals directly as it's already processed
  const sortedData = monthlyShopTotals || [];

  const getShopStatus = useMemo(() => {
    return (shop: any) => {
      const { total_revenue, feasible_goal, breakthrough_goal } = shop;
      
      if (!feasible_goal && !breakthrough_goal) return 'gray';
      
      if (breakthrough_goal && total_revenue >= breakthrough_goal) {
        return 'purple';
      }
      
      if (feasible_goal && total_revenue >= feasible_goal) {
        return 'green';
      }
      
      if (feasible_goal && total_revenue >= feasible_goal * 0.7) {
        return 'yellow';
      }
      
      return 'red';
    };
  }, []);

  const getShopColor = useMemo(() => {
    return (shop: any) => {
      const status = getShopStatus(shop);
      switch (status) {
        case 'purple': return 'bg-purple-100 text-purple-800';
        case 'green': return 'bg-green-100 text-green-800';
        case 'yellow': return 'bg-yellow-100 text-yellow-800';
        case 'red': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };
  }, [getShopStatus]);

  // Calculate statistics from sortedData
  const displayStatistics = useMemo(() => {
    const totalShops = sortedData.length;
    const greenShops = sortedData.filter((shop: any) => getShopStatus(shop) === 'green').length;
    const yellowShops = sortedData.filter((shop: any) => getShopStatus(shop) === 'yellow').length;
    const redShops = sortedData.filter((shop: any) => getShopStatus(shop) === 'red').length;
    const purpleShops = sortedData.filter((shop: any) => getShopStatus(shop) === 'purple').length;
    
    return {
      totalShops,
      greenShops,
      yellowShops,
      redShops,
      purpleShops,
    };
  }, [sortedData, getShopStatus]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          Báo Cáo Tổng Hợp TikTok - {format(new Date(filters.selectedMonth + '-01'), 'MMMM yyyy', { locale: vi })}
        </h1>
      </div>

      {/* Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Tổng Shops"
          value={displayStatistics.totalShops}
          icon={Store}
          className="bg-blue-50 border-blue-200"
        />
        <StatCard
          title="Shops Xanh"
          value={displayStatistics.greenShops}
          icon={Award}
          className="bg-green-50 border-green-200"
        />
        <StatCard
          title="Shops Vàng"
          value={displayStatistics.yellowShops}
          icon={CheckCircle}
          className="bg-yellow-50 border-yellow-200"
        />
        <StatCard
          title="Shops Đỏ"
          value={displayStatistics.redShops}
          icon={Target}
          className="bg-red-50 border-red-200"
        />
        <StatCard
          title="Shops Tím"
          value={displayStatistics.purpleShops}
          icon={AlertTriangle}
          className="bg-purple-50 border-purple-200"
        />
      </div>

      {/* Upload and Legend Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload Báo Cáo TikTok</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Tính năng upload báo cáo TikTok sẽ được triển khai trong phiên bản tiếp theo.
            </p>
          </CardContent>
        </Card>
        
        <ReportLegend />
      </div>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh Sách Báo Cáo TikTok</CardTitle>
        </CardHeader>
        <CardContent>
          <ReportFilters
            selectedMonth={filters.selectedMonth}
            onMonthChange={(value) => updateFilter('selectedMonth', value)}
            monthOptions={monthOptions}
            selectedLeader={filters.selectedLeader}
            onLeaderChange={(value) => updateFilter('selectedLeader', value)}
            leaders={leaders}
            isLeaderSelectorOpen={openStates.openLeaderSelector}
            onLeaderSelectorOpenChange={setOpenLeaderSelector}
            selectedPersonnel={filters.selectedPersonnel}
            onPersonnelChange={(value) => updateFilter('selectedPersonnel', value)}
            personnelOptions={personnelOptions}
            isPersonnelSelectorOpen={openStates.openPersonnelSelector}
            onPersonnelSelectorOpenChange={setOpenPersonnelSelector}
            searchTerm={filters.searchTerm}
            onSearchTermChange={(value) => updateFilter('searchTerm', value)}
            selectedColorFilter={filters.selectedColorFilter}
            onColorFilterChange={(value) => updateFilter('selectedColorFilter', value)}
            selectedStatusFilter={filters.selectedStatusFilter}
            onStatusFilterChange={(value) => updateFilter('selectedStatusFilter', value)}
            isLoading={isLoading}
            onClearFilters={clearFilters}
          />
          
          <ReportTable
            data={sortedData}
            sortConfig={sortConfig}
            requestSort={handleSortRequest}
            getShopStatus={getShopStatus}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default TiktokComprehensiveReportsPage;