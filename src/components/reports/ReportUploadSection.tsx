import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MultiDayReportUpload from '@/components/admin/MultiDayReportUpload';

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
        <MultiDayReportUpload />
      </CardContent>
    </Card>
  );
});

ReportUploadSection.displayName = 'ReportUploadSection';

export default ReportUploadSection;