import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MultiDayReportUpload from '@/components/admin/MultiDayReportUpload';
import CancelledRevenueUpload from '@/components/admin/CancelledRevenueUpload';

/**
 * Memoized Upload Section Component - static content
 * Performance: Component này không cần re-render vì nội dung không đổi
 */
const ReportUploadSection: React.FC = React.memo(() => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Báo Cáo</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="monthly_report">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="monthly_report">Báo cáo tháng</TabsTrigger>
            <TabsTrigger value="cancelled_revenue">Doanh số hủy</TabsTrigger>
          </TabsList>
          <TabsContent value="monthly_report" className="mt-4">
            <MultiDayReportUpload />
          </TabsContent>
          <TabsContent value="cancelled_revenue" className="mt-4">
            <CancelledRevenueUpload />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
});

ReportUploadSection.displayName = 'ReportUploadSection';

export default ReportUploadSection;