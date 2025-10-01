import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import TiktokReportUploader from "@/components/admin/TiktokReportUploader";
import AnimatedPage from "@/components/layouts/AnimatedPage";

const TiktokCancelledRevenueUploadPage = () => {
  return (
    <AnimatedPage>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload Doanh Số Hủy TikTok</CardTitle>
            <CardDescription>
              Tải lên file báo cáo doanh số hủy từ TikTok Seller Center để cập nhật dữ liệu.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TiktokReportUploader functionName="upload-tiktok-cancelled-revenue" />
          </CardContent>
        </Card>
      </div>
    </AnimatedPage>
  );
};

export default TiktokCancelledRevenueUploadPage;