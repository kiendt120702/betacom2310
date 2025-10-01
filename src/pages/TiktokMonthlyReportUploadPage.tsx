import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import TiktokReportUpload from "@/components/admin/TiktokReportUpload";
import AnimatedPage from "@/components/layouts/AnimatedPage";

const TiktokMonthlyReportUploadPage = () => {
  return (
    <AnimatedPage>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload Báo Cáo Tháng TikTok</CardTitle>
            <CardDescription>
              Tải lên file báo cáo tổng hợp hàng tháng từ TikTok Seller Center.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TiktokReportUpload />
          </CardContent>
        </Card>
      </div>
    </AnimatedPage>
  );
};

export default TiktokMonthlyReportUploadPage;