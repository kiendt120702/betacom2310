import React from 'react';
import StatCard from '@/components/dashboard/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Store, Award, CheckCircle, Target, AlertTriangle } from 'lucide-react';

interface PerformanceData {
  totalShops: number;
  breakthroughMet: number;
  feasibleOnlyMet: number;
  almostMet: number;
  notMet80Percent: number;
}

interface TiktokReportStatsProps {
  performanceData: PerformanceData;
  onUnderperformingClick: () => void;
}

const TiktokReportStats: React.FC<TiktokReportStatsProps> = ({ performanceData, onUnderperformingClick }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <StatCard
        title="Tổng số shop vận hành"
        value={performanceData.totalShops}
        icon={Store}
      />
      <StatCard
        title="Shop đạt đột phá"
        value={performanceData.breakthroughMet}
        icon={Award}
        className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
      />
      <StatCard
        title="Shop đạt khả thi"
        value={performanceData.breakthroughMet + performanceData.feasibleOnlyMet}
        icon={CheckCircle}
        className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
      />
      <StatCard
        title="Đỏ"
        value={performanceData.almostMet}
        icon={Target}
        className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
      />
      <Card
        className="cursor-pointer hover:bg-muted/50 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800"
        onClick={onUnderperformingClick}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Tím
          </CardTitle>
          <AlertTriangle className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {performanceData.notMet80Percent}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TiktokReportStats;