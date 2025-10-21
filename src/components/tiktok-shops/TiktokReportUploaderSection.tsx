import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import TiktokReportUploader from "@/components/admin/TiktokReportUploader";
import { Upload } from 'lucide-react';

const TiktokReportUploaderSection = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Upload className="h-5 w-5" />
          Upload Báo Cáo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Báo Cáo Tháng</CardTitle>
              <CardDescription>
                Tải lên file báo cáo tổng hợp hàng tháng từ TikTok Seller Center.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TiktokReportUploader functionName="upload-tiktok-report" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Upload Doanh Số Hủy</CardTitle>
              <CardDescription>
                Tải lên file báo cáo doanh số hủy để cập nhật dữ liệu.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TiktokReportUploader functionName="upload-tiktok-cancelled-revenue" />
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default TiktokReportUploaderSection;