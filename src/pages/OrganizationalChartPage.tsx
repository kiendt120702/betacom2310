import React from "react";
import OrganizationalChart from "@/components/OrganizationalChart";
import { Users } from "lucide-react";

const OrganizationalChartPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          Sơ đồ tổ chức
        </h1>
        <p className="text-muted-foreground mt-2">
          Xem và tìm hiểu về cấu trúc tổ chức của công ty.
        </p>
      </div>
      <OrganizationalChart />
    </div>
  );
};

export default OrganizationalChartPage;