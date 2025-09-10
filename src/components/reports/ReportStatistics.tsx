import React from 'react';
import StatCard from '@/components/dashboard/StatCard';
import { useReportContext } from '@/contexts/ReportContext';
import {
  Store,
  Award,
  CheckCircle,
  AlertTriangle,
  Target,
} from 'lucide-react';

/**
 * Memoized Statistics Component - chỉ re-render khi statistics thay đổi
 */
const ReportStatistics: React.FC = React.memo(() => {
  const { statistics } = useReportContext();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <StatCard
        title="Tổng số shop vận hành"
        value={statistics.total}
        icon={Store}
      />
      <StatCard
        title="Shop đạt đột phá"
        value={statistics.green}
        icon={Award}
        className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
      />
      <StatCard
        title="Shop đạt khả thi"
        value={statistics.yellow}
        icon={CheckCircle}
        className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
      />
      <StatCard
        title="Đỏ"
        value={statistics.red}
        icon={Target}
        className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
      />
      <StatCard
        title="Tím"
        value={statistics.purple}
        icon={AlertTriangle}
        className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800"
      />
    </div>
  );
});

ReportStatistics.displayName = 'ReportStatistics';

export default ReportStatistics;