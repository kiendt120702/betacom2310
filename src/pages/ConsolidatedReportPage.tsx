import React from "react";
import ShopManagement from "@/components/admin/ShopManagement";
import RevenueUpload from "@/components/admin/RevenueUpload";
import RevenueReport from "@/components/admin/RevenueReport";

const ConsolidatedReportPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Báo cáo tổng hợp</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ShopManagement />
          <RevenueReport />
        </div>
        <div className="lg:col-span-1">
          <RevenueUpload />
        </div>
      </div>
    </div>
  );
};

export default ConsolidatedReportPage;