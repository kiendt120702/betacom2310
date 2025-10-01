import React, { useState } from "react";
import StatCard from "@/components/dashboard/StatCard";
import UnderperformingShopsDialog from "@/components/dashboard/UnderperformingShopsDialog";
import PersonnelAchievementModal from "@/components/dashboard/PersonnelAchievementModal";
import PerformanceBarChart from "@/components/dashboard/PerformanceBarChart";
import {
  Store,
  Users,
  Target,
  AlertTriangle,
  Award,
  CheckCircle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { UnderperformingShop, PersonnelAchievement } from "@/types/reports";

interface PerformanceData {
  totalShops: number;
  totalEmployees: number;
  personnelBreakthrough: number;
  personnelFeasible: number;
  breakthroughMet: number;
  feasibleOnlyMet: number;
  almostMet: number;
  notMet80Percent: number;
  underperformingShops: UnderperformingShop[];
  pieData: { name: string; value: number }[];
  personnelBreakthroughDetails: PersonnelAchievement[];
  personnelFeasibleDetails: PersonnelAchievement[];
}

interface GenericSalesDashboardProps {
  isLoading: boolean;
  performanceData: PerformanceData;
}

const GenericSalesDashboard: React.FC<GenericSalesDashboardProps> = ({ isLoading, performanceData }) => {
  const [isUnderperformingDialogOpen, setIsUnderperformingDialogOpen] = useState(false);
  const [isBreakthroughModalOpen, setIsBreakthroughModalOpen] = useState(false);
  const [isFeasibleModalOpen, setIsFeasibleModalOpen] = useState(false);

  if (isLoading) {
    return <p>Đang tải dữ liệu...</p>;
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
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
          title="Khả thi gần đạt (80-99%)"
          value={performanceData.almostMet}
          icon={Target}
          className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
        />
        <Card
          className="cursor-pointer hover:bg-muted/50 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800"
          onClick={() => setIsUnderperformingDialogOpen(true)}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Shop khả thi chưa đạt 80%
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {performanceData.notMet80Percent}
            </div>
          </CardContent>
        </Card>
        <StatCard
          title="Nhân viên vận hành"
          value={performanceData.totalEmployees}
          icon={Users}
        />
      </div>

      <PerformanceBarChart
        data={performanceData.pieData}
        title="Phân bố hiệu suất"
        personnelBreakthrough={performanceData.personnelBreakthrough}
        personnelFeasible={performanceData.personnelFeasible}
        totalPersonnel={performanceData.totalEmployees}
        onBreakthroughClick={() => setIsBreakthroughModalOpen(true)}
        onFeasibleClick={() => setIsFeasibleModalOpen(true)}
      />

      <UnderperformingShopsDialog
        isOpen={isUnderperformingDialogOpen}
        onOpenChange={setIsUnderperformingDialogOpen}
        shops={performanceData.underperformingShops}
      />

      <PersonnelAchievementModal
        isOpen={isBreakthroughModalOpen}
        onOpenChange={setIsBreakthroughModalOpen}
        title="Nhân sự đạt đột phá"
        personnelData={performanceData.personnelBreakthroughDetails}
      />

      <PersonnelAchievementModal
        isOpen={isFeasibleModalOpen}
        onOpenChange={setIsFeasibleModalOpen}
        title="Nhân sự đạt khả thi"
        personnelData={performanceData.personnelFeasibleDetails}
      />
    </>
  );
};

export default GenericSalesDashboard;