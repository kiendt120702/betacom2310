import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useReportContext } from '@/contexts/ReportContext';
import ReportFiltersOptimized from './ReportFiltersOptimized';
import OptimizedReportTable from './OptimizedReportTable';

// Loading component
const LoadingSpinner: React.FC = React.memo(() => (
  <div className="flex items-center justify-center h-32">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    <span className="ml-2">Đang tải...</span>
  </div>
));

LoadingSpinner.displayName = 'LoadingSpinner';

/**
 * Memoized Data Section Component
 * Performance: Chỉ re-render khi isLoading thay đổi
 */
const ReportDataSection: React.FC = React.memo(() => {
  const { isLoading } = useReportContext();

  return (
    <Card>
      <CardHeader>
        <ReportFiltersOptimized />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <OptimizedReportTable />
        )}
      </CardContent>
    </Card>
  );
});

ReportDataSection.displayName = 'ReportDataSection';

export default ReportDataSection;