import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import ShopManagement from "@/components/admin/ShopManagement";
import RevenueUpload from "@/components/admin/RevenueUpload";

const ConsolidatedReportPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Báo cáo tổng hợp</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ShopManagement />
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Báo cáo Doanh số
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Bảng báo cáo chi tiết sẽ được hiển thị ở đây.
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <RevenueUpload />
        </div>
      </div>
    </div>
  );
};

export default ConsolidatedReportPage;